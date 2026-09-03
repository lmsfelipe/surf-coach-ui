import { test as base, expect } from '@playwright/test';
import { installNetworkGuard } from './networkGuard';
import { createMockApi, type MockApi } from './api';
import { seedAuthState, type SeedAuthOptions } from './auth';

interface Fixtures {
  mockApi: MockApi;
  /**
   * Seeds an authenticated session (localStorage, no network call) and a
   * complete default profile (GET /me) — every `/_app/*` route's `beforeLoad`
   * guard requires both. Call `mockApi.profile(...)` again afterward to
   * override (e.g. an incomplete profile to exercise the onboarding redirect).
   */
  loginAs: (opts?: SeedAuthOptions) => Promise<void>;
}

export const test = base.extend<Fixtures>({
  // Overriding the built-in `page` fixture guarantees the network guard is
  // installed for every test with zero per-spec boilerplate, and — because
  // `mockApi`/`loginAs` both depend on `page` — before any specific route.
  page: async ({ page }, use) => {
    const unmocked = await installNetworkGuard(page);
    await use(page);
    expect(unmocked, `Unmocked network request(s):\n${unmocked.join('\n')}`).toEqual([]);
  },

  mockApi: async ({ page }, use) => {
    await use(createMockApi(page));
  },

  loginAs: async ({ page, mockApi }, use) => {
    await use(async (opts) => {
      await seedAuthState(page, opts);
      await mockApi.profile();
    });
  },
});

export { expect };
