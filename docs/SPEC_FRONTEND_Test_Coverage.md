# SPEC — Test Coverage Hardening: Frontend Implementation

> **Feature:** Raise the suite from smoke-level to regression-safe
> **Last updated:** 2026-08-17
> **Companion doc:** `SPEC_FRONTEND_Overview.md` §9 (Testing)
> **Stack:** Vitest 2 + Testing Library + MSW 2 + jsdom

---

## 1. Why This Exists

`SPEC_FRONTEND_Overview.md` §9 already declares the testing doctrine — unit,
component, MSW-mocked API, and **"query/mutation hooks against MSW (invalidation,
optimistic updates, 401-retry)"**. The unit column landed. The rest did not.

### 1.1 Measured baseline (2026-08-17)

Suite is green: 15 files, 85 tests, 2.9 s. Coverage, excluding `routeTree.gen.ts`,
`src/test/`, `src/components/landing/` (3D scene), and `src/dev/`:

| Metric | Value |
|---|---|
| Statements / Lines | **16.19%** (886 / 5471) |
| Functions | **28.57%** (64 / 224) |
| Branches | 57.75% (175 / 303) |

Branches read high only because the handful of covered files are branch-dense
(`validation.ts`, `errors.ts`, the zod schemas). The number is not evidence of health.

### 1.2 The actual risk

A green suite is currently **weak evidence that a change is safe**. The gaps are not
evenly distributed — they cluster in exactly the infrastructure that fails *silently*:

| Area | Coverage | What breaks with no test failing |
|---|---|---|
| `lib/api/client.ts` 401 path | 57% | Every authenticated request. Users get logged out, or trapped in a redirect loop |
| `hooks/mutations/*` | 7.8% | Stale UI after create/update/delete — a renamed query key breaks invalidation invisibly |
| `routes/**` | 0% | Any screen regression at all |
| `schemas/auth.ts` | 0% | Login/signup validation silently accepts or rejects |

### 1.3 Non-goals

- **No percentage gate in CI.** Overview §9 says "meaningful coverage over a
  percentage gate" and that stands. Targets below are direction, not a build failure.
- **No E2E / Playwright.** Route-level integration tests in jsdom are the ceiling here.
- **No tests for the 3D landing scene** (`components/landing/**`). Visual, WebGL, low churn.
- **No snapshot tests.** They encode markup, not behaviour, and rot on every restyle.

---

## 2. Phase Overview

Phases are ordered by risk-reduction per unit of effort. **Phase 0 is a hard
prerequisite**; 1–4 are independent of each other and can land in any order or in
parallel. Phase 5 depends on Phase 0's router helper.

| Phase | Scope | Est. tests | Unlocks |
|---|---|---|---|
| **0** | Test infrastructure & helpers | — | Everything below |
| **1** | API client 401 matrix + auth bootstrap | ~14 | Safe to touch auth |
| **2** | Mutation & query hooks (cache invalidation) | ~22 | Safe to touch query keys |
| **3** | Upload pipeline (207, 401, validation, video) | ~16 | Safe to touch upload |
| **4** | Auth schemas + remaining pure utils | ~20 | Cheap, fast, high certainty |
| **5** | Route integration tests | ~18 | Safe to touch screens |

---

## 3. Phase 0 — Test Infrastructure

**Goal:** every later phase writes assertions, not plumbing.

### 3.1 Add the coverage provider

Currently unmeasurable — no provider is installed.

```jsonc
// package.json
"devDependencies": {
  "@vitest/coverage-v8": "^2.1.9"   // must match the vitest major
},
"scripts": {
  "test:coverage": "vitest run --coverage"
}
```

```ts
// vitest.config.ts — add inside `test`
coverage: {
  provider: 'v8',
  reporter: ['text-summary', 'html'],
  include: ['src/**/*.{ts,tsx}'],
  exclude: [
    'src/routeTree.gen.ts',      // generated
    'src/test/**',
    'src/**/*.test.{ts,tsx}',
    'src/components/landing/**', // 3D scene, out of scope
    'src/dev/**',
    'src/types/**',              // type-only
    'src/vite-env.d.ts',
  ],
},
```

Add `coverage/` to `.gitignore`.

### 3.2 `src/test/utils.tsx` — provider harness

The app's `queryClient` (`src/lib/queryClient.ts`) is a **module singleton**. Hook and
route tests must never share it — retries and cross-test cache bleed make failures
non-deterministic. Always build a fresh one.

```tsx
import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';

/** Fresh client per test: retries off, no GC delay, silent logger. */
export function makeTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function renderWithProviders(
  ui: React.ReactElement,
  { queryClient = makeTestQueryClient(), ...options }: RenderOptions & {
    queryClient?: QueryClient;
  } = {},
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { queryClient, ...render(ui, { wrapper: Wrapper, ...options }) };
}

/** For `renderHook` — same client discipline, no JSX at the call site. */
export function queryWrapper(queryClient = makeTestQueryClient()) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { Wrapper, queryClient };
}
```

### 3.3 `src/test/fixtures.ts` — typed builders

Handlers in `src/test/mocks/handlers.ts` already hold inline `profile`, `surfboards`,
and `sessions` objects. Extract them into overridable builders so tests can vary one
field without restating the whole object.

```ts
import type { Media, Profile, Review, Session, Surfboard } from '@/types/api';

export const makeProfile = (o: Partial<Profile> = {}): Profile => ({ /* … */ ...o });
export const makeSurfboard = (o: Partial<Surfboard> = {}): Surfboard => ({ /* … */ ...o });
export const makeSession = (o: Partial<Session> = {}): Session => ({ /* … */ ...o });
export const makeReview = (o: Partial<Review> = {}): Review => ({ /* … */ ...o });
export const makeMedia = (o: Partial<Media> = {}): Media => ({ /* … */ ...o });

/** Supabase session shaped for the auth store; mirrors authStore.test.ts. */
export const makeAuthSession = (userId = 'user-a') =>
  ({ access_token: `token-${userId}`, user: { id: userId } }) as Session;
```

Re-point `handlers.ts` at these builders. Keep the existing `API` constant
(`http://localhost:8000`) — it must match `vitest.config.ts`'s `VITE_API_BASE_URL`.

### 3.4 jsdom navigation stub

`client.ts` calls `window.location.assign('/login')` on forced sign-out. jsdom throws
`Not implemented: navigation` for that, which will surface as noise or a failure. Provide
an opt-in helper rather than a global stub — tests that *assert* the redirect need to
read it back.

```ts
// src/test/location.ts
import { vi } from 'vitest';

/** Replace window.location with a spy-able stub. Returns the assign spy. */
export function stubLocation(pathname = '/sessions') {
  const assign = vi.fn();
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...window.location, pathname, assign },
  });
  return assign;
}
```

### 3.5 Supabase mocking convention

`src/lib/supabase.ts` is a module singleton created at import time. The established
pattern (see `src/stores/authStore.test.ts`) is a hoisted `vi.mock` at the top of the
file. **Keep that** — do not introduce a second strategy.

```ts
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn().mockResolvedValue({ error: null }),
      refreshSession: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithPassword: vi.fn(),
    },
    storage: { from: vi.fn() },
  },
}));
```

### 3.6 Expand MSW handlers

`handlers.ts` currently covers 4 GETs. Phases 2, 3, and 5 need the write paths.
Add default happy-path handlers for every route in Overview §5.4, plus a named
export block of error scenarios (following the existing `mediaUploadHandlers` shape)
for `401`, `500`, `VALIDATION_ERROR`, and `207` partial upload.

`setupTests.ts` uses `onUnhandledRequest: 'error'` — **leave it on.** An unhandled
request is a real signal that a test is hitting an unmocked endpoint.

### Phase 0 checklist

- [ ] `@vitest/coverage-v8` added as a devDependency, matching the vitest major
- [ ] `test:coverage` script added; `coverage.exclude` list configured
- [ ] `coverage/` added to `.gitignore`
- [ ] `src/test/utils.tsx` exports `makeTestQueryClient`, `renderWithProviders`, `queryWrapper`
- [ ] `src/test/fixtures.ts` exports typed builders; `handlers.ts` re-points at them
- [ ] `src/test/location.ts` exports `stubLocation`
- [ ] MSW handlers cover every endpoint in Overview §5.4 (happy path)
- [ ] Named error-scenario handlers exported for 401 / 500 / VALIDATION_ERROR / 207
- [ ] `onUnhandledRequest: 'error'` still enabled

---

## 4. Phase 1 — API Client & Auth Bootstrap

**Files:** `src/lib/api/client.test.ts` (new), `src/stores/authStore.test.ts` (extend)
**Current:** `client.ts` 57%, `authStore.ts` 65% (`initAuth` at 0%)
**Target:** `client.ts` ≥ 95%, `authStore.ts` ≥ 90%

This is the highest-value file in the whole plan. `apiFetch` ([client.ts:72-109](../src/lib/api/client.ts#L72-L109))
is on the path of every authenticated request, and its most complex branch — the
401 refresh dance — has zero coverage.

### 4.1 The 401 matrix

Contract per Overview §5.1: *one* silent refresh, *one* retry, then sign out + redirect.
Each row is a test.

| # | Scenario | Expected |
|---|---|---|
| 1 | 200 first try | Resolves parsed JSON; `refreshSession` never called |
| 2 | 401 → refresh OK → retry 200 | Resolves; `refreshSession` called **exactly once**; store holds new session |
| 3 | 401 → refresh OK → retry 401 | Throws `ApiError`; `signOut` called; redirect to `/login` |
| 4 | 401 → refresh returns no session | Throws `ApiError`; `signOut` called; **no second fetch** |
| 5 | 401 with `anonymous: true` | Throws immediately; no refresh, no sign-out |
| 6 | 401 while already on `/login` | Signs out but does **not** call `location.assign` (AUTH_PATHS guard) |
| 7 | Retry carries the *new* token | Second request's `Authorization` header is the refreshed token |
| 8 | Network throw on first fetch | Throws `NetworkError`; `Sentry.captureException` called |
| 9 | Network throw on the retry fetch | Throws `NetworkError` (covers the inner catch, [client.ts:88-92](../src/lib/api/client.ts#L88-L92)) |

### 4.2 Response handling

| # | Scenario | Expected |
|---|---|---|
| 10 | `204 No Content` | Resolves `undefined`, does not attempt `res.json()` |
| 11 | Non-JSON error body | `ApiError` with code `HTTP_ERROR`, message from `statusText` |
| 12 | `500` | Throws; `Sentry.captureException` **called** |
| 13 | `422` | Throws; `Sentry.captureException` **not** called (handled UX, not a bug) |
| 14 | `FormData` body | No `Content-Type` header set (browser sets the boundary) |

Rows 12–13 pin a deliberate decision documented at [client.ts:102](../src/lib/api/client.ts#L102) —
it is exactly the kind of intent that gets "cleaned up" by a future refactor.

### 4.3 Sketch

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { stubLocation } from '@/test/location';
import { makeAuthSession } from '@/test/fixtures';

vi.mock('@/lib/supabase', () => ({ /* §3.5 */ }));
vi.mock('@sentry/react', () => ({ captureException: vi.fn(), setUser: vi.fn() }));

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { api } from './client';

const API = 'http://localhost:8000';

describe('apiFetch — 401 refresh & retry', () => {
  beforeEach(() => {
    useAuthStore.setState({ session: makeAuthSession('user-a'), user: null, initialized: true });
    vi.clearAllMocks();
  });

  it('refreshes once and retries with the new token', async () => {
    const seen: string[] = [];
    let call = 0;
    server.use(
      http.get(`${API}/api/v1/sessions/`, ({ request }) => {
        seen.push(request.headers.get('Authorization') ?? '');
        return ++call === 1
          ? HttpResponse.json({ error: { code: 'INVALID_TOKEN' } }, { status: 401 })
          : HttpResponse.json([]);
      }),
    );
    vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
      data: { session: makeAuthSession('user-a-refreshed') },
      error: null,
    } as never);

    await expect(api.get('/api/v1/sessions/')).resolves.toEqual([]);
    expect(supabase.auth.refreshSession).toHaveBeenCalledOnce();
    expect(seen[1]).toBe('Bearer token-user-a-refreshed');
  });

  it('signs out and redirects when the retry still 401s', async () => {
    const assign = stubLocation('/sessions');
    server.use(
      http.get(`${API}/api/v1/sessions/`, () =>
        HttpResponse.json({ error: { code: 'INVALID_TOKEN' } }, { status: 401 }),
      ),
    );
    vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
      data: { session: makeAuthSession('user-a') },
      error: null,
    } as never);

    await expect(api.get('/api/v1/sessions/')).rejects.toThrow();
    expect(supabase.auth.signOut).toHaveBeenCalledOnce();
    expect(assign).toHaveBeenCalledWith('/login');
  });
});
```

### 4.4 `initAuth` ([authStore.ts:56-71](../src/stores/authStore.ts#L56-L71))

| # | Scenario | Expected |
|---|---|---|
| 15 | `getSession` resolves a session | Store hydrated; `initialized === true` |
| 16 | `getSession` **rejects** | `initialized === true` anyway, user null, Sentry called |
| 17 | `onAuthStateChange` fires with a new session | Store updated via `setSession` |

Row 16 guards the comment at [authStore.ts:60-62](../src/stores/authStore.ts#L60-L62):
a failed session read must never trap the app on the boot splash. That is a
user-facing hard-lock and there is currently nothing stopping a refactor from
reintroducing it.

> The existing cross-user cache-isolation tests in `authStore.test.ts` are good and
> stay as-is. Add `initAuth` coverage as a **new `describe` block** in the same file.

### Phase 1 checklist

- [ ] `client.test.ts` covers all 14 rows in §4.1 / §4.2
- [ ] Refresh is asserted to happen **exactly once** (not "at least once")
- [ ] Retry request is asserted to carry the refreshed token, not the stale one
- [ ] `anonymous: true` is asserted to skip both refresh and sign-out
- [ ] AUTH_PATHS guard asserted: no redirect when already on an auth screen
- [ ] Sentry called for ≥500, not called for 4xx
- [ ] `initAuth` sets `initialized` even when `getSession` rejects
- [ ] `client.ts` ≥ 95% statements; `authStore.ts` ≥ 90%

---

## 5. Phase 2 — Mutation & Query Hooks

**Files:** `src/hooks/mutations/*.test.ts` (5 new), `src/hooks/queries/*.test.ts` (extend)
**Current:** mutations 7.8%, queries 14.5%
**Target:** both ≥ 80% statements

Overview §5.3 mandates: *"invalidate the affected keys on success; optimistic updates
only for cheap, reversible actions."* Nothing verifies either half today.

### 5.1 What to assert

Assert the **effect**, not the call. Spying on `invalidateQueries` and checking the
argument is brittle and passes even when the key is wrong in a way that matches. Instead:
seed the cache, run the mutation, assert the entry is invalidated or replaced.

```ts
const { Wrapper, queryClient } = queryWrapper();
queryClient.setQueryData(qk.surfboards.list(), [makeSurfboard({ id: 'b1' })]);

const { result } = renderHook(() => useCreateSurfboard(), { wrapper: Wrapper });
await act(() => result.current.mutateAsync(payload));

expect(queryClient.getQueryState(qk.surfboards.list())?.isInvalidated).toBe(true);
```

### 5.2 Coverage table

| Hook | Assertion |
|---|---|
| `useCreateSurfboard` | Invalidates `qk.surfboards.list()` |
| `useUpdateSurfboard(id)` | Invalidates **both** `list()` and `detail(id)` |
| `useDeleteSurfboard` | See §5.3 — full optimistic cycle |
| `useCreateSession` / `useDeleteSession` | Invalidates `qk.sessions.list()` |
| `useUploadMedia` | Invalidates `qk.media.bySession(id)` **only when `succeeded.length > 0`** |
| `useDeleteMedia` | Invalidates `qk.media.bySession(id)` |
| `useCreateReview` | Seeds **both** `qk.reviews.bySession(id)` and `qk.reviews.detail(review.id)` via `setQueryData` |
| `useRetryReview` | Seeds both keys with the returned `processing` state |
| `useUpdateProfile` | Invalidates `qk.profile.me()` |
| Training plan mutations | Per `SPEC_FRONTEND_Async_Review_Processing.md` §4 |

The `useUploadMedia` row is subtle and worth two tests: the guard at
[media.ts:22](../src/hooks/mutations/media.ts#L22) skips invalidation on an
all-failed batch. Assert both branches.

### 5.3 `useDeleteSurfboard` — the optimistic cycle

[surfboards.ts:36-55](../src/hooks/mutations/surfboards.ts#L36-L55) is the only
optimistic mutation in the codebase and the most intricate untested logic in it.
Four tests:

1. **`onMutate` removes the board from the cached list immediately** — assert
   *before* the request resolves, not after.
2. **`onError` restores the exact previous list** from `context.previous`.
3. **`onError` fires a toast** with the mapped pt-BR message (`toUserMessage`).
   Mock `sonner`: `vi.mock('sonner', () => ({ toast: { error: vi.fn() } }))`.
4. **`onSettled` invalidates the list** on both success and failure paths.

Test 2 is the one that matters: a rollback bug leaves the user staring at a board
they think they deleted, with no error anywhere.

### 5.4 Query hooks

`reviews.test.ts` already covers the 404-tolerant `reviewBySessionOptions` well —
extend the same direct-`queryFn` pattern (no Suspense plumbing) to:

- `trainingPlans.ts` (74 lines, 0%) — including its polling/refetch predicate
- `sessions.ts`, `surfboards.ts`, `media.ts`, `profile.ts` — key shape + parse

### Phase 2 checklist

- [ ] Every mutation hook has a test asserting the exact keys it invalidates
- [ ] Assertions read cache state; they do not spy on `invalidateQueries`
- [ ] Each test builds a fresh `QueryClient` via `makeTestQueryClient()`
- [ ] `useUploadMedia` asserted on **both** sides of the `succeeded.length` guard
- [ ] `useDeleteSurfboard`: optimistic removal, rollback, toast, settle-invalidate
- [ ] `useCreateReview` / `useRetryReview` assert `setQueryData` on both keys
- [ ] Query hooks: `queryFn` invoked directly against MSW, no Suspense wrapper
- [ ] `hooks/mutations` and `hooks/queries` ≥ 80% statements

---

## 6. Phase 3 — Upload Pipeline

**Files:** `src/lib/api/upload.test.ts` (extend), `src/lib/media/validation.test.ts`
(extend), `src/lib/media/compressVideo.test.ts` (new)
**Current:** `upload.ts` 72%, `validation.ts` 54%, `compressVideo.ts` 0%
**Target:** `upload.ts` ≥ 90%, `validation.ts` ≥ 85%, `compressVideo.ts` ≥ 70%

### 6.1 `upload.ts` — uncovered branches

MSW 2 intercepts `XMLHttpRequest`, so the XHR uploader can be tested against the
same handler set as `fetch`.

| # | Scenario | Expected |
|---|---|---|
| 1 | `201` | `{ succeeded: Media[], failed: [] }` |
| 2 | **`207` partial** | Both lists populated; **does not throw** |
| 3 | `207` where every file failed storage | Still resolves; `succeeded` empty |
| 4 | `401` → refresh OK → retry `201` | Resolves; second XHR carries the new token |
| 5 | `401` → refresh returns null | Throws `ApiError`; **no second XHR** |
| 6 | `422 MEDIA_NOT_SURF_RELATED` | Throws `ApiError` with `details.reason` intact |
| 7 | `xhr.onerror` | Rejects `NetworkError` |
| 8 | `signal` aborted mid-flight | Rejects `NetworkError('Envio cancelado')` |
| 9 | Progress events | `onProgress` receives rounded 0–100 percentages |

Row 2 is the priority. The `207` contract is documented at
[upload.ts:66-70](../src/lib/api/upload.ts#L66-L70) and is genuinely
counter-intuitive — a non-2xx-looking status that must resolve rather than throw.
It is a prime candidate for an accidental "fix".

### 6.2 `validateMediaFiles` — the untested orchestrator

The 22 existing tests cover the pure helpers (`validateSelectionRule`,
`validateFileSync`). The composed function the UI actually calls
([validation.ts:152-184](../src/lib/media/validation.ts#L152-L184)) has **no tests**.

`probeVideoDuration` uses a real `<video>` element, which jsdom cannot decode — stub it:

```ts
vi.mock('./validation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./validation')>();
  return { ...actual, probeVideoDuration: vi.fn() };
});
```

> If partial self-mocking proves awkward, the cleaner refactor is to accept the
> prober as an optional injected parameter:
> `validateMediaFiles(files, existing, probe = probeVideoDuration)`. Prefer this —
> it is a smaller change than it looks and removes the mock entirely.

Cases: mixed valid/invalid batch (per-file errors keyed correctly, `valid` excludes
them); a selection-rule violation surfacing in `selectionError` while per-file checks
still run; a video over `MAX_VIDEO_DURATION_SECONDS` → `VIDEO_TOO_LONG`; a probe
rejection → `INVALID_MEDIA_TYPE`; sync-failed files skipping the probe entirely.

### 6.3 `compressVideo.ts`

151 lines, 0%, added recently with `mediabunny` — the newest and least-exercised code
in the repo. Mock the `mediabunny` module boundary; do not attempt real transcoding
in jsdom. Cover: the below-threshold skip path, the success path, a compression
failure falling back to the original file, and the `webcodecsSafariShim` branch.

### Phase 3 checklist

- [ ] `207` partial success resolves with both lists — explicitly asserted not to throw
- [ ] 401 → refresh → retry asserted to send exactly two XHRs with different tokens
- [ ] 401 → refresh-null asserted to send exactly one XHR
- [ ] Abort path rejects with `NetworkError('Envio cancelado')`
- [ ] `onProgress` receives rounded integers
- [ ] Moderation `422` preserves `details.reason`
- [ ] `validateMediaFiles` covered end-to-end (prefer injected prober over module mock)
- [ ] `compressVideo` covers skip / success / failure-fallback / Safari shim
- [ ] Targets met: upload ≥ 90%, validation ≥ 85%, compressVideo ≥ 70%

---

## 7. Phase 4 — Auth Schemas & Pure Utils

**Files:** `src/schemas/schemas.test.ts` (extend), `src/utils/dates.test.ts` (new),
plus small files below
**Current:** `schemas/auth.ts` 0%, `utils/dates.ts` 0%, `lib/storage/avatar.ts` 0%
**Target:** ≥ 90% each

Cheapest phase by a wide margin — pure functions, no mocking, milliseconds to run.
`schemas/auth.ts` sitting at 0% is conspicuous when `profile.ts`, `session.ts`, and
`surfboard.ts` are all at 100%; auth was simply skipped.

### 7.1 `schemas/auth.ts`

| Schema | Cases |
|---|---|
| `loginSchema` | Empty email → "Informe seu e-mail"; malformed → "E-mail inválido"; `EMAIL_MAX + 1` → max message; empty password → "Informe sua senha"; **whitespace-only email trims to empty** |
| `signupSchema` | Name via `nameSchema`; password < 8 rejected; password at exactly 8 accepted; `PASSWORD_MAX + 1` rejected |
| `forgotPasswordSchema` | Valid / invalid email |
| `resetPasswordSchema` | Mismatch → error on **`confirmPassword`** path, not the form root |
| `changePasswordSchema` | Same mismatch-path assertion |

The `path: ['confirmPassword']` assertion matters: RHF renders the message under that
field, so a wrong path means a silently invisible error.

Boundary cases (exactly 8, exactly `EMAIL_MAX`) belong here — off-by-one in a
`.min`/`.max` is the classic silent schema regression.

### 7.2 Remaining utils

| File | Cases |
|---|---|
| `utils/dates.ts` | `formatShortDate('2026-05-25')` → `'25 mai'`; `formatLongDate` → `'25 mai 2026'`; pt-BR locale applied; **malformed input returns the input unchanged** (both `catch` blocks); `todayISODate()` matches `/^\d{4}-\d{2}-\d{2}$/` |
| `utils/scoreCardBackground.ts` | Band boundaries — the exact score where the background changes |
| `lib/media/url.ts` | URL construction, null/undefined handling |
| `lib/profile.ts` | `isProfileComplete` — each of the three fields missing in turn (drives the onboarding gate) |
| `lib/storage/avatar.ts` | Path is `${userId}/avatar.${ext}`; extension lowercased; missing extension falls back to `jpg`; upload error → pt-BR `Error`; returned URL carries the `?t=` cache-buster |

Mock `supabase.storage.from()` for the avatar tests per §3.5.

### Phase 4 checklist

- [ ] All five auth schemas covered incl. `EMAIL_MAX` / `PASSWORD_MAX` boundaries
- [ ] Password-mismatch errors asserted on the `confirmPassword` **path**
- [ ] `dates.ts` covers both `catch` fallbacks and asserts pt-BR output
- [ ] `avatar.ts` covers path shape, extension fallback, error message, cache-buster
- [ ] `profile.ts`, `url.ts`, `scoreCardBackground.ts` covered
- [ ] No new files left at 0% in `src/utils/` or `src/schemas/`

---

## 8. Phase 5 — Route Integration Tests

**Files:** `src/routes/**/*.test.tsx` (4 new)
**Current:** 0% across ~3,000 statements
**Target:** ≥ 60% on the four selected screens (not all routes)

### 8.1 Rendering approach

Route components are **module-private** — only `Route` is exported
(`export const Route = createFileRoute(...)`, with `function LoginScreen()` unexported).
Do **not** export the components just to test them; that changes source to suit tests
and skips the loader, `pendingComponent`, and search-param parsing.

Instead render through a real memory router built from the generated tree:

```tsx
// src/test/router.tsx
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router';
import { render } from '@testing-library/react';
import { routeTree } from '@/routeTree.gen';
import { makeTestQueryClient } from './utils';

export function renderRoute(initialPath: string, queryClient = makeTestQueryClient()) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
    context: { queryClient },
  });
  return { router, queryClient, ...render(<RouterProvider router={router} />) };
}
```

Auth-guarded routes need the store seeded **before** render:
`useAuthStore.setState({ session: makeAuthSession(), initialized: true })`.

> Expect this helper to take the longest of anything in this spec to get right —
> loaders, `initialized` guards, and Suspense boundaries all interact. Budget for it,
> and build it against `/login` first (no loader, no guard) before the harder screens.

### 8.2 The four screens

Chosen for blast radius, not for coverage percentage.

**1. `/login`** — the simplest guarded-adjacent screen; proves the harness.
- Invalid email shows the pt-BR validation message, no request fires
- `signInWithPassword` failure renders "E-mail ou senha inválidos."
- Success navigates to `/sessions`
- `?redirect=` is honoured **only when it starts with `/`** — this is an open-redirect
  guard at [login.tsx:41](../src/routes/_auth/login.tsx#L41) and deserves an explicit test

**2. `/sessions/$sessionId/upload`** (364 lines) — the highest-risk screen.
- Selection-rule violation renders the error and disables submit
- Successful upload renders the new thumbnails
- `MEDIA_NOT_SURF_RELATED` renders `UploadErrorAlert` with the reason
- `207` partial success shows both the stored items and the per-file failures
- Delete media prompts for confirmation, then removes the thumb

**3. `/sessions/$sessionId`** (441 lines) — largest route file.
- Session detail renders; media gallery renders
- Review `processing` → skeleton; `completed` → `ScoreBars`; `failed` → retry button
  (mirrors `SPEC_FRONTEND_Async_Review_Processing.md` §5.1)
- Empty state when the session has no media

**4. `/boards`** — the CRUD reference case.
- List renders from MSW
- Delete opens the confirmation dialog; confirming removes the card optimistically
- A failed delete restores the card **and** toasts — the UI-level counterpart to §5.3

### 8.3 Explicitly deferred

`/onboarding`, `/profile/*`, `/training-plans/*`, `/settings`, `/signup`,
`/forgot-password`, `/reset-password`. Add them opportunistically when touched. The
four above establish every pattern the rest would reuse.

### Phase 5 checklist

- [ ] `src/test/router.tsx` renders any route by path with a test `QueryClient`
- [ ] Auth-guarded routes render with a seeded, `initialized: true` store
- [ ] `/login`: validation, auth failure, success navigation, **open-redirect guard**
- [ ] `/upload`: selection rule, success, moderation error, 207 partial, delete
- [ ] `/sessions/$sessionId`: detail, all three review states, empty media
- [ ] `/boards`: list, optimistic delete, rollback + toast on failure
- [ ] Queries assert on user-visible pt-BR text, not `data-testid`
- [ ] Selected screens ≥ 60% statements

---

## 9. Coverage Targets

Per-file targets are the real contract — the global number is dominated by
`src/routes/**` (~55% of all statements), so Phases 1–4 move it only modestly while
removing most of the actual risk. **Do not judge phases 1–4 by the global figure.**

| After phase | Global statements (est.) | Meaningful gate |
|---|---|---|
| Baseline | 16% | — |
| 1 | ~19% | `client.ts` ≥ 95%, `authStore.ts` ≥ 90% |
| 2 | ~24% | `hooks/**` ≥ 80% |
| 3 | ~28% | `upload.ts` ≥ 90%, `validation.ts` ≥ 85% |
| 4 | ~31% | `schemas/**` ≥ 95%, `utils/**` ≥ 90% |
| 5 | ~50% | 4 target screens ≥ 60% |

Global figures are estimates from the 2026-08-17 baseline; per-file targets are exact
and verifiable via `npm run test:coverage`.

---

## 10. Conventions

Extends Overview §9. All of these are already followed by the existing suite — this
section exists so they survive the roughly 90 new tests.

**Do**
- Co-locate as `*.test.ts(x)` next to the source.
- Name the `describe` after the contract, not the file: `'apiFetch — 401 refresh & retry'`.
- Assert on user-visible pt-BR copy in component and route tests.
- Build a fresh `QueryClient` per test.
- Prefer MSW over mocking `fetch`; mock only true module boundaries (`supabase`,
  `sonner`, `@sentry/react`, `mediabunny`).
- Pin any `VITE_*` a test depends on in `vitest.config.ts`'s `test.env` block — never
  rely on a developer's local `.env`. (This was a real past failure; that block exists
  because of it.)

**Don't**
- Don't add snapshot tests.
- Don't share the app's singleton `queryClient` across tests.
- Don't relax `onUnhandledRequest: 'error'` — an unhandled request is a finding.
- Don't spy on `invalidateQueries`; assert cache state.
- Don't export route components solely to make them testable.
- Don't test `components/ui/**` (shadcn primitives, vendored, upstream-tested).

---

## 11. Sequencing Notes

- **Phase 0 blocks everything.** Land it alone, first.
- **Phases 1–4 are mutually independent** and can be parallelised across branches.
- **Phase 5 needs Phase 0's `renderRoute`**, and is best attempted after Phase 2 —
  route tests lean on mutation hooks behaving correctly, and debugging both at once
  is miserable.
- If effort has to be cut, **Phase 1 alone** removes the single largest risk in the
  codebase. **Phase 4 alone** is the best effort-to-certainty ratio. Cut Phase 5 first;
  it is the most expensive and the least likely to catch a silent failure.
