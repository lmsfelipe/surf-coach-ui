import type { Page, Route } from '@playwright/test';

/** The two fake hosts every mocked spec runs against — see playwright.config.ts. */
const GUARDED_HOSTS = ['http://localhost:8000/**', 'http://localhost:54321/**'];

/**
 * Fails the test on any request to the API or Supabase Auth host that no
 * spec-level mock claimed. Playwright routes run LIFO, so registering this
 * first means any later, more specific `page.route()` call wins automatically.
 *
 * This is the e2e equivalent of MSW's `onUnhandledRequest: 'error'`, which the
 * unit-test suite already relies on (src/test/setupTests.ts).
 */
export async function installNetworkGuard(page: Page): Promise<string[]> {
  const unmocked: string[] = [];
  const guard = (route: Route) => {
    const req = route.request();
    unmocked.push(`${req.method()} ${req.url()}`);
    return route.fulfill({
      status: 599,
      contentType: 'application/json',
      body: JSON.stringify({
        error: { code: 'UNMOCKED_REQUEST', message: 'No e2e route handler matched this request.' },
      }),
    });
  };
  for (const host of GUARDED_HOSTS) {
    await page.route(host, guard);
  }
  return unmocked;
}
