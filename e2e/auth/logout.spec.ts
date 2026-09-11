import { test, expect } from '../fixtures';
import { mockLogout } from '../fixtures/auth';

test('logging out clears the session and blocks re-entry to authenticated routes', async ({
  page,
  loginAs,
}) => {
  await loginAs();
  await mockLogout(page);

  await page.goto('/profile');
  await page.getByRole('button', { name: 'Sair' }).click();
  await expect(page).toHaveURL(/\/login$/);

  // Re-visiting an authenticated route afterward must redirect to the welcome
  // screen (with a ?redirect= back to it) — proves the session was actually
  // cleared, not just navigated away.
  await page.goto('/sessions');
  await expect(page).toHaveURL(/\/\?redirect=/);
});
