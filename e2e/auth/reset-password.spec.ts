import { test, expect } from '../fixtures';
import {
  makeSupabaseSession,
  mockRecoveryGetUser,
  mockUpdateUserFailure,
  mockUpdateUserSuccess,
  recoveryHash,
} from '../fixtures/auth';

test.describe('reset password', () => {
  test('updates the password and lands on /sessions', async ({ page, mockApi }) => {
    const session = makeSupabaseSession({ userId: 'recovering-user' });
    await mockRecoveryGetUser(page, { userId: 'recovering-user' });
    await mockUpdateUserSuccess(page, { userId: 'recovering-user' });
    await mockApi.profile();
    await mockApi.sessions([]);
    await mockApi.surfboards([]);

    await page.goto(`/reset-password${recoveryHash(session)}`);
    await page.getByLabel('Nova senha').fill('newpassword123');
    await page.getByLabel('Confirmar senha').fill('newpassword123');
    await page.getByRole('button', { name: 'Salvar nova senha' }).click();

    await expect(page.getByText('Senha atualizada.')).toBeVisible();
    await expect(page).toHaveURL('/sessions');
  });

  test('an invalid or expired link shows an inline error', async ({ page }) => {
    const session = makeSupabaseSession({ userId: 'recovering-user' });
    await mockRecoveryGetUser(page, { userId: 'recovering-user' });
    await mockUpdateUserFailure(page);

    await page.goto(`/reset-password${recoveryHash(session)}`);
    await page.getByLabel('Nova senha').fill('newpassword123');
    await page.getByLabel('Confirmar senha').fill('newpassword123');
    await page.getByRole('button', { name: 'Salvar nova senha' }).click();

    await expect(page.getByRole('alert')).toContainText('Esse link não vale mais');
    await expect(page).toHaveURL(/\/reset-password/);
  });
});
