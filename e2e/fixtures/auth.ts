import type { Page } from '@playwright/test';

/**
 * Auth-flow network mocks + authenticated-state seeding, verified directly
 * against `@supabase/auth-js`'s request/response contract (v2, `flowType:
 * 'implicit'`, which is this app's default — see src/lib/supabase.ts).
 */

const SUPABASE_URL = 'http://localhost:54321';
const AUTH_URL = `${SUPABASE_URL}/auth/v1`;

export interface SeedAuthOptions {
  userId?: string;
  email?: string;
  name?: string;
}

/**
 * supabase-js's default storage key is `sb-${hostname.split('.')[0]}-auth-token`
 * (see SupabaseClient's `defaultStorageKey`). For the pinned
 * VITE_SUPABASE_URL=http://localhost:54321, hostname is "localhost".
 */
export function supabaseStorageKey(url: string = SUPABASE_URL): string {
  return `sb-${new URL(url).hostname.split('.')[0]}-auth-token`;
}

export function makeSupabaseUser(opts: SeedAuthOptions = {}) {
  const id = opts.userId ?? 'e2e-user-1';
  const email = opts.email ?? 'surfer@example.com';
  const now = new Date().toISOString();
  return {
    id,
    aud: 'authenticated',
    role: 'authenticated',
    email,
    email_confirmed_at: now,
    phone: '',
    confirmed_at: now,
    last_sign_in_at: now,
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: opts.name ? { name: opts.name } : {},
    identities: [],
    created_at: now,
    updated_at: now,
  };
}

/**
 * A flat session shaped exactly like a real `POST /auth/v1/token` response —
 * `_sessionResponse`'s `hasSession()` check requires `access_token`,
 * `refresh_token` and `expires_in` truthy at the top level, plus `user`.
 */
export function makeSupabaseSession(opts: SeedAuthOptions = {}) {
  const user = makeSupabaseUser(opts);
  return {
    access_token: `e2e-access-token-${user.id}`,
    token_type: 'bearer',
    expires_in: 3600,
    // Expires ~1 year out so getSession() resolves from localStorage with no
    // network call and autoRefreshToken never fires mid-test.
    expires_at: Math.floor(Date.now() / 1000) + 365 * 24 * 3600,
    refresh_token: `e2e-refresh-token-${user.id}`,
    user,
  };
}

/**
 * Seeds a fully authenticated session into localStorage so
 * `supabase.auth.getSession()` resolves signed-in with zero network calls on
 * the caller's *next* `page.goto(...)`. Use for every spec that isn't
 * exercising the login/signup UI itself.
 *
 * This is a one-time write via `page.evaluate` (after a throwaway navigation
 * to establish the app's origin), not `page.addInitScript` — an init script
 * re-runs on every future navigation in the same test, which would silently
 * re-authenticate a page after a real logout and defeat any test asserting
 * the session was actually cleared.
 */
export async function seedAuthState(page: Page, opts: SeedAuthOptions = {}) {
  const session = makeSupabaseSession(opts);
  await page.goto('/login');
  await page.evaluate(
    ({ key, value }) => window.localStorage.setItem(key, value),
    { key: supabaseStorageKey(), value: JSON.stringify(session) },
  );
  return session;
}

function jsonRoute(page: Page, urlGlob: string, method: string, status: number, body: unknown) {
  return page.route(urlGlob, (route) => {
    if (route.request().method() !== method) return route.fallback();
    return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  });
}

export function mockLoginSuccess(page: Page, opts: SeedAuthOptions = {}) {
  const session = makeSupabaseSession(opts);
  return jsonRoute(page, `${AUTH_URL}/token?grant_type=password`, 'POST', 200, session);
}

export function mockLoginFailure(page: Page) {
  return jsonRoute(page, `${AUTH_URL}/token?grant_type=password`, 'POST', 400, {
    code: 400,
    error_code: 'invalid_credentials',
    msg: 'Invalid login credentials',
  });
}

export function mockSignupWithSession(page: Page, opts: SeedAuthOptions = {}) {
  const session = makeSupabaseSession(opts);
  return jsonRoute(page, `${AUTH_URL}/signup`, 'POST', 200, session);
}

/** Email-confirmation-required signup: bare User body, no access_token key. */
export function mockSignupEmailConfirmationRequired(page: Page, opts: SeedAuthOptions = {}) {
  return jsonRoute(page, `${AUTH_URL}/signup`, 'POST', 200, makeSupabaseUser(opts));
}

export function mockSignupDuplicateEmail(page: Page) {
  return jsonRoute(page, `${AUTH_URL}/signup`, 'POST', 422, {
    code: 422,
    error_code: 'user_already_exists',
    msg: 'User already registered',
  });
}

export function mockForgotPassword(page: Page) {
  // Always called with a redirectTo, which GoTrue appends as ?redirect_to=...
  return jsonRoute(page, `${AUTH_URL}/recover*`, 'POST', 200, {});
}

/**
 * The implicit-grant recovery flow (`/reset-password#access_token=...`) calls
 * GET /auth/v1/user to hydrate the user before the session is considered
 * established — this must be mocked even though the app code never calls
 * `getUser()` directly.
 */
export function mockRecoveryGetUser(page: Page, opts: SeedAuthOptions = {}) {
  return jsonRoute(page, `${AUTH_URL}/user`, 'GET', 200, makeSupabaseUser(opts));
}

export function mockUpdateUserSuccess(page: Page, opts: SeedAuthOptions = {}) {
  return jsonRoute(page, `${AUTH_URL}/user`, 'PUT', 200, { user: makeSupabaseUser(opts) });
}

export function mockUpdateUserFailure(page: Page) {
  return jsonRoute(page, `${AUTH_URL}/user`, 'PUT', 400, {
    code: 400,
    error_code: 'validation_failed',
    msg: 'Link expired',
  });
}

export function mockLogout(page: Page) {
  return page.route(`${AUTH_URL}/logout?scope=global`, (route) =>
    route.fulfill({ status: 204 }),
  );
}

/**
 * Builds the URL hash Supabase's password-recovery email link lands the user
 * on — parsed client-side by `detectSessionInUrl`, no network call needed to
 * establish it (only the subsequent GET/PUT /user calls are mocked).
 */
export function recoveryHash(session: ReturnType<typeof makeSupabaseSession>): string {
  const params = new URLSearchParams({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in: String(session.expires_in),
    expires_at: String(session.expires_at),
    token_type: session.token_type,
    type: 'recovery',
  });
  return `#${params.toString()}`;
}
