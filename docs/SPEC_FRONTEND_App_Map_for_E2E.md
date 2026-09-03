# App Map for E2E (Playwright) Planning

Structural map of every route, section, and interaction in the app, produced ahead of adding Playwright end-to-end tests. Purpose: agree on scope/priorities before writing specs. No Playwright config exists yet in this repo — this is greenfield.

Stack notes: TanStack Router (file-based routes, generated `routeTree.gen.ts`), TanStack Query (suspense queries + route loaders), React Hook Form + Zod, Supabase (auth + storage), Sonner (toasts), Radix primitives. All UI copy is pt-BR.

---

## 1. Routing structure

`/` (`src/routes/index.tsx`) has no component — `beforeLoad` always redirects to `/sessions`.

**`_auth` layout** (`src/routes/_auth.tsx`) — public screens, mounted at root paths (e.g. `/login`, not `/auth/login`). `beforeLoad`: if a session exists, redirect to `/sessions` — **except** `/reset-password`, which is exempted because Supabase's password-recovery link lands the user there already authenticated via the URL hash.

**`_app` layout** (`src/routes/_app.tsx`) — authenticated screens. `beforeLoad`: no session → redirect to `/login?redirect=<original url>`. Otherwise ensures the profile is loaded (`GET /me`, auto-creates server-side), backfills `name` from signup metadata via `PATCH /me` once if missing, and redirects to `/onboarding` if the profile isn't complete (unless already there). Renders `AppShell`.

| Path | File |
|---|---|
| `/` | `src/routes/index.tsx` (redirect only) |
| `/login` | `src/routes/_auth/login.tsx` |
| `/signup` | `src/routes/_auth/signup.tsx` |
| `/forgot-password` | `src/routes/_auth/forgot-password.tsx` |
| `/reset-password` | `src/routes/_auth/reset-password.tsx` |
| `/onboarding` | `src/routes/_app/onboarding.tsx` |
| `/settings` | `src/routes/_app/settings.tsx` |
| `/sessions` | `src/routes/_app/sessions/index.tsx` |
| `/sessions/new` | `src/routes/_app/sessions/new.tsx` |
| `/sessions/:sessionId` | `src/routes/_app/sessions/$sessionId/index.tsx` |
| `/sessions/:sessionId/upload` | `src/routes/_app/sessions/$sessionId/upload.tsx` |
| `/sessions/:sessionId/review` | `src/routes/_app/sessions/$sessionId/review.tsx` |
| `/sessions/:sessionId/plan` | `src/routes/_app/sessions/$sessionId/plan.tsx` |
| `/boards` | `src/routes/_app/boards/index.tsx` |
| `/boards/new` | `src/routes/_app/boards/new.tsx` |
| `/boards/:boardId/edit` | `src/routes/_app/boards/$boardId.edit.tsx` |
| `/training-plans` | `src/routes/_app/training-plans/index.tsx` |
| `/training-plans/:planId` | `src/routes/_app/training-plans/$planId.tsx` |
| `/profile` | `src/routes/_app/profile/index.tsx` |
| `/profile/edit` | `src/routes/_app/profile/edit.tsx` |
| `/profile/change-password` | `src/routes/_app/profile/change-password.tsx` |

Router config (`src/router.tsx`): `defaultPreload: 'intent'`, `scrollRestoration: true`, `defaultNotFoundComponent: NotFound`, `defaultErrorComponent: RouteErrorFallback`. Root (`__root.tsx`) renders `<OfflineBanner/>` + `<Outlet/>` + `<Toaster/>` around everything.

`src/main.tsx` gates mounting the router on `useAuthStore.initialized` (shows an `AppLoading` splash until `initAuth()` resolves), wraps the app in a Sentry `ErrorBoundary` (`AppCrashFallback`), and fires `trackPageView` on every router navigation.

---

## 2. Global / shared UI

**`AppShell`** — authenticated shell for all `/_app` routes.
- `/onboarding`: bare, no nav, centered narrow column.
- Everything else: desktop side rail (`NavRail`, ≥md) + centered content + mobile `FloatingNav` (bottom nav) — **except** the "one-way wizard" routes `/sessions/new` and `/sessions/:id/upload`, where nav is hidden on both desktop and mobile.

**`NavRail`** (desktop): logo, 4 links — Sessões `/sessions`, Pranchas `/boards`, Treinos `/training-plans`, Perfil `/profile` — plus a "Nova sessão" button → `/sessions/new`.

**`FloatingNav`** (mobile): bottom pill bar, same 4 icon tabs (active = colored dot) + raised center FAB "Nova sessão" → `/sessions/new`.

**`AppHeader`**: top bar on nearly every screen — `title`, optional back button ("Voltar", router history or custom handler), optional right-side action, `Wordmark` on tab-root screens (mobile only) or `ProfileAvatar` (→ `/profile`) by default.

**`AuthShell`**: centered public layout for all `/_auth/*` screens (logo + content + optional footer).

**Theme**: no toggle found in the UI — dark theme appears hardcoded via CSS vars, even though `next-themes` is a dependency.

**`OfflineBanner`**: sticky top banner shown whenever `navigator.onLine` is false; rendered globally.

---

## 3. Auth flow

State lives in `useAuthStore` (zustand): `session`, `user`, `initialized`. `initAuth()` calls `supabase.auth.getSession()` then subscribes to `onAuthStateChange`. On user-id change (including sign-out), `queryClient.clear()` wipes cached server state to prevent cross-user data leakage.

| Route | Fields | Validation | Submit | Success | Failure |
|---|---|---|---|---|---|
| `/login` | email, password | required, valid email, max 254 | `signInWithPassword` | redirect to `?redirect=` (if starts with `/`) or `/sessions` | inline Alert "E-mail ou senha inválidos." |
| `/signup` | name (max 200), email, password (min 8/max 128) | zod schema | `signUp` w/ name in metadata | session returned → `/sessions` (then bounced to `/onboarding` since incomplete); no session (email confirmation required) → success panel "Confirme seu e-mail" | "registered" in error → field error on email ("E-mail já cadastrado."); else generic Alert |
| `/forgot-password` | email | required | `resetPasswordForEmail` | always shows the same success panel (doesn't leak account existence) | — |
| `/reset-password` | password, confirmPassword | min 8/max 128, must match | `updateUser({ password })` | toast "Senha atualizada." → `/sessions` | inline Alert "Esse link não vale mais…" |
| `/profile/change-password` | password, confirmPassword | same shape as reset | `updateUser` | toast → `/settings` | inline Alert |

Links: login → "Esqueci minha senha" (`/forgot-password`), "Criar conta" (`/signup`).

**Logout**: "Sair" button on `/profile` (danger-styled) → `signOut()` → `/login`.

**Token refresh**: `apiFetch` and the upload client both silently attempt one `refreshSession()` + retry on 401; if still 401, force sign-out + redirect to `/login`.

**Shared password UX**: `PasswordField` adds a show/hide eye toggle (aria-label "Mostrar senha"/"Ocultar senha") — used on login, signup, reset-password, change-password.

---

## 4. Screen-by-screen map

### `/sessions` — Sessions list
Greeting header + list of sessions with inline resolving score per card.
- **Data**: `sessionsQueryOptions` + `surfboardsQueryOptions` (loader), per-card `useReviewBySession` in its own `Suspense`.
- **States**: `SessionListSkeleton` (loading); `ErrorState` w/ retry; `EmptyState` "Nenhuma sessão ainda" → CTA "Registrar primeira sessão" (`/sessions/new`); score chip is `loading | number | "Sem análise"`.
- **Interactions**: whole card → `/sessions/:id`; header avatar → `/profile`.

### `/sessions/new` — New session (nav hidden)
- **Fields** (`sessionFormSchema`): `location` (required, max 200), `sessionDate` (date, defaults today), `waveSize` (`WaveSlider`, 0–4m step 0.1, must be > 0), `surfboardId` (optional select; if no boards exist, shows prompt + "Cadastrar prancha" → `/boards/new`), `notes` (optional textarea, max 1000).
- **Submit**: "Salvar e enviar mídia" → creates session → navigates to `/sessions/:id/upload`.
- **States**: `FormSkeleton` pending.

### `/sessions/:sessionId` — Session detail hub
Hero card (location/date/score/wave/board) + media gallery + análise summary + treino summary + delete.
- **Data**: parallel loader for session, media, review, surfboards; plan too if a review exists.
- **Media section**: `MediaGallery` grid, tap → lightbox `Dialog`; "add" tile and per-item delete **only shown if no review exists yet**; empty state → dashed button to upload route.
- **Análise section** branches on review status: none+hasMedia → "Gerar análise"; none+noMedia → static hint; `processing` → "Analisando…"; `failed` → inline "Tentar de novo" (`useRetryReview`); `completed` → "Nota X.X · 6 aspectos". All link to `/sessions/:id/review`.
- **Treino section**: only rendered once review is `completed`; same processing/failed/completed branching → `/sessions/:id/plan`.
- **Destructive**: "Excluir sessão" → `AlertDialog` ("Isso remove a mídia e a análise… Não dá pra desfazer.") → confirm → delete → toast → `/sessions`.
- **Note for testing**: the error boundary here resets both the router error boundary and React Query's error boundary, then calls `router.invalidate()` — worth a dedicated retry-flow test given this double-reset.
- **States**: `SessionDetailSkeleton`.

### `/sessions/:sessionId/upload` — Media upload (nav hidden)
The core upload flow.
1. Hidden `<input type=file multiple>` behind a dashed dropzone (no drag-and-drop; tap/click only). Disabled if session already locked to a video, or while processing.
2. Mixed batch auto-resolves to "video wins" (keeps first video, drops the rest).
3. Client-side compression before validation: images via `compressorjs` (JPEG, quality 0.6, max 1920px, auto-rotate); a video via dynamically-imported `mediabunny` (H.264/AAC MP4, ≤720p, audio stripped). Both fall back silently to the original file on error/unsupported browser.
4. Progress UI: video shows a real percentage bar; images show an indeterminate "Otimizando fotos…" label.
5. Validation rule: exactly 1 video OR up to `MAX_IMAGES_PER_SESSION` (env, default 3) images — never mixed; respects media already attached; requires `MIN_IMAGES_PER_SESSION` (default 3) when starting fresh with images. Accepted images: JPEG/PNG/WebP ≤10MB. Accepted video: MP4/QuickTime/x-m4v ≤60MB, ≤120s (probed client-side).
6. Submit label is state-dependent: "Corrija os arquivos" / "Tentar de novo" (partial 207 pending) / "Enviar".
7. Outcomes: full success → toast + navigate to detail; **partial success (207)** keeps only failed files selected + warning alert/toast; **moderation failure** (`MEDIA_NOT_SURF_RELATED` / `EXPLICIT_CONTENT`) → `UploadErrorAlert`, `EXPLICIT_CONTENT` also clears selection; other errors → generic toast.
8. Already-attached media shown below with individual delete.
- **States**: `MediaGridSkeleton`.

### `/sessions/:sessionId/review` — AI analysis
Auto-triggers generation on mount if no review exists (guarded to fire once).
- **States**: no media → `EmptyState` + "Adicionar mídia"; other error → `ErrorState` w/ retry; in-flight/`processing` → `AIState` (rotating phrase carousel; after a 5-minute polling window, shows a timeout warning suggesting reload); `failed` → `ErrorState` + "Tentar de novo"; `completed` → score band, 6 dimension bars (only non-null render), AI narrative, tip list, and (only if `overallScore != null`) a `PlanCta` → `/sessions/:id/plan`.
- **Polling**: 3s interval for the first 30s, then 10s, gives up after 5 minutes — relevant to e2e timing/mocking.
- **States**: `ScorePanelSkeleton`.

### `/sessions/:sessionId/plan` — Training plan for a session
Guards (rendered as `NeedsReview` empty states → "Ver análise"): no review yet, review `processing`, review `failed`, or review has no score. Otherwise mirrors the review screen's generation flow ("Montando seu treino…" → `WorkoutAccordion` list, first one open by default, each with exercises/sets/reps/description). Persistent, non-dismissible `TrainingDisclaimer`.
- **States**: `PlanSkeleton`.

### `/boards` — Surfboards list
- Header "+" → `/boards/new`; `EmptyState` w/ CTA; each `BoardCard` has edit (→ `/boards/:id/edit`) and delete (`AlertDialog` "Excluir prancha?").
- Delete mutation is **optimistic** (removes from cache immediately, rolls back + toasts on error) — a good target for a network-failure test.
- **States**: `BoardListSkeleton`, `ErrorState`.

### `/boards/new` and `/boards/:boardId/edit`
Shared `BoardFormFields`: `boardType` (select, required), `boardSize` (number, ft, 3–15), `volume` (optional, litres, 5–200), `label` (optional, max 20 — tighter than the server's 200-char cap).
- New: "Salvar" → toast "Prancha adicionada." → `/boards`.
- Edit: pre-filled; "Salvar" → toast "Prancha atualizada." → `/boards`. Also has "Excluir prancha" → same confirm dialog → deletes and **navigates immediately without awaiting the mutation** — worth a test to confirm this doesn't race/flash an error.

### `/training-plans` — Treinos tab
Lists every plan across all sessions; polls while any listed plan is `processing`. Empty state → "Ver minhas sessões" (`/sessions`). Each card → `/training-plans/:id`.

### `/training-plans/:planId` — Plan detail
Same processing/failed/completed rendering as the session-scoped plan screen, addressed directly by plan ID (no "needs review" guard, since the plan already exists).

### `/profile` — Profile screen
Avatar (image or initials fallback), name, level badge, height/weight chips. Menu rows: "Minhas pranchas" → `/boards`, "Editar perfil" → `/profile/edit`, "Conta" → `/settings`. "Sair" → logout → `/login`.

### `/profile/edit` — Edit profile
Fields (all optional): `name` (max 200), `surfLevel` (select), `heightCm` (100–250), `weightKg` (30–200), `gender` (optional select), `birthday` (optional date). Submit is outside the `<form>` tag but wired via `form="profile-edit"`. → toast "Perfil atualizado." → `/profile`.

> **Flag for review**: `AvatarUploader` component and `uploadAvatar()` lib function exist (direct-to-Supabase-Storage, bucket `profile-media`) but are **not wired into any route** — there is currently no way to change your avatar from the UI. Decide whether e2e should skip this or whether it should be flagged as a product gap.

### `/onboarding` — Post-signup gate
One-time required completion. `beforeLoad` redirects away if profile already complete. Required: `surfLevel`, `heightCm` (100–250), `weightKg` (30–200); optional: `gender`, `birthday`. Submit "Concluir" → `/sessions`.

### `/settings` — Account settings
Read-only email row; "Alterar senha" → `/profile/change-password`. Footer hardcodes "SurfRise · versão 1.0.0" — note the product name "SurfRise" differs from the repo name `surf-coach-ui`.

---

## 5. Reused form components (`src/components/forms/`)

| Component | Used on |
|---|---|
| `TextField` | login, signup, forgot-password, session-new (location), board forms (label), profile-edit (name) |
| `PasswordField` | login, signup, reset-password, change-password |
| `NumberField` | onboarding, profile-edit (height/weight), board forms (size/volume) |
| `SelectField` | onboarding, profile-edit (level/gender), session-new (board), board forms (type) |
| `DateField` | onboarding, profile-edit (birthday), session-new (date) |
| `TextareaField` | session-new (notes) only |
| `WaveSlider` | session-new only |
| `BoardFormFields` | boards/new, boards/:id/edit |
| `AvatarUploader` | **orphaned — unused** |
| `UploadErrorAlert` | upload screen only |

All fields share `Form`/`FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormMessage` primitives, so error-text assertions can use one consistent selector strategy across every form.

---

## 6. Feedback / state components (`src/components/feedback/`)

- `EmptyState`, `ErrorState` (route-level `errorComponent` almost everywhere, + inline retry for review/plan generation)
- `Alert` (danger/warning/info — auth errors, upload warnings, polling timeouts)
- `AIState` (dot pulser + rotating phrase carousel — review & plan generation, never a generic spinner)
- `ServiceUnavailable` vs `AppCrashFallback`: `RouteErrorFallback` picks based on whether the thrown error is a `NetworkError`/5xx `ApiError` (→ retry via `router.invalidate()`) or anything else (→ full reload)
- `NotFound` (bad URLs)
- `OfflineBanner` (global, `navigator.onLine`)
- `MediaGallery` / `MediaThumb` (grid + lightbox, shared between session detail and upload)
- `WorkoutAccordion`, `TrainingDisclaimer` (shared between both plan routes)
- One skeleton per route, 1:1 (`SessionListSkeleton`, `SessionDetailSkeleton`, `ScorePanelSkeleton`, `ProfileHeaderSkeleton`, `BoardListSkeleton`, `PlanSkeleton`, `MediaGridSkeleton`, `FormSkeleton`, `ScoreChipSkeleton`)

---

## 7. Data dependencies (for e2e mocking/seeding)

REST API under `VITE_API_BASE_URL` (default `http://localhost:8000`) plus Supabase Auth/Storage directly. `src/test/mocks/handlers.ts` (MSW) already documents every endpoint shape and is a ready-made reference for Playwright route interception:

- `GET/PATCH /me`
- `GET/POST/PATCH/DELETE /api/v1/surfboards/[:id]`
- `GET/POST/DELETE /api/v1/sessions/[:id]`
- `GET /api/v1/sessions/:sessionId/media/`, `POST .../media/` (multipart, 201 full / 207 partial), `GET/DELETE /api/v1/media/:id`
- `GET /api/v1/sessions/:id/review` (404-tolerant → null), `GET/POST /api/v1/reviews/[:id]`, `POST /api/v1/reviews/:id/retry`
- `GET /api/v1/training-plans/`, `GET /api/v1/reviews/:reviewId/training-plan` (404-tolerant), `GET/POST /api/v1/training-plans/[:id]`, `POST /api/v1/training-plans/:id/retry`, `GET /api/v1/workouts/:id`
- Supabase Auth: `signInWithPassword`, `signUp`, `resetPasswordForEmail`, `updateUser`, `refreshSession`, `signOut`, `getSession`, `onAuthStateChange` — needs either a real Supabase test project or route-level interception.
- Supabase Storage: avatar bucket (currently unreachable from the UI, see §4 flag).

**Timing gotcha**: most detail/list queries are `useSuspenseQuery` fed by route loaders, so Playwright will usually see the `pendingComponent` skeleton only briefly (or a full page-level fallback on direct navigation under throttling). Reviews and training plans **poll** while `status === 'processing'` (3s for 30s, then 10s, stop after 5 min) — e2e tests should mock these as `completed` immediately rather than waiting out real polling, to avoid slow/flaky specs.

---

## 8. Open questions for review

1. **Auth strategy for e2e**: real Supabase test project + seeded test users, or intercept Supabase Auth calls at the network layer?
2. **Avatar upload**: in scope for e2e, or skip since it's unreachable from any route?
3. **Media/AI flows** (upload → review → plan): given real compression (mediabunny/compressorjs) and real backend AI generation are slow and non-deterministic, confirm we mock the API layer (per `src/test/mocks/handlers.ts`) rather than exercise real generation in e2e.
4. **Priority order**: suggest starting with auth (login/signup/logout) → sessions CRUD → boards CRUD, then layering in upload/review/plan once the mocking strategy is settled, since those three have the most branching state.
