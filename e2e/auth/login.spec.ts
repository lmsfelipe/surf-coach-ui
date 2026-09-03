import { test, expect } from '../fixtures';
import { mockLoginFailure, mockLoginSuccess } from '../fixtures/auth';

test.describe('login', () => {
  test('signs in and lands on /sessions', async ({ page, mockApi }) => {
    await mockLoginSuccess(page);
    await mockApi.profile();
    await mockApi.sessions([]);
    await mockApi.surfboards([]);

    await page.goto('/login');
    await page.getByLabel('E-mail').fill('surfer@example.com');
    await page.getByLabel('Senha', { exact: true }).fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL('/sessions');
  });

  test('honors the ?redirect= search param', async ({ page, mockApi }) => {
    await mockLoginSuccess(page);
    await mockApi.profile();
    await mockApi.surfboards([]);

    await page.goto('/login?redirect=%2Fboards');
    await page.getByLabel('E-mail').fill('surfer@example.com');
    await page.getByLabel('Senha', { exact: true }).fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL('/boards');
  });

  test('shows an inline error on invalid credentials and stays on /login', async ({ page }) => {
    await mockLoginFailure(page);

    await page.goto('/login');
    await page.getByLabel('E-mail').fill('surfer@example.com');
    await page.getByLabel('Senha', { exact: true }).fill('wrong-password');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByRole('alert')).toHaveText('E-mail ou senha inválidos.');
    await expect(page).toHaveURL(/\/login$/);
  });
});
