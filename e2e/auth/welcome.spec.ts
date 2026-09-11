import { test, expect } from '../fixtures';
import { mockLoginSuccess } from '../fixtures/auth';

test.describe('welcome', () => {
  test('a visitor lands on the signup-first screen and can start signing up', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Grátis · leva menos de 1 minuto')).toBeVisible();

    await page.getByRole('link', { name: 'Cadastre sua conta' }).click();

    await expect(page).toHaveURL('/signup');
  });

  test('"Acesse sua conta" opens the login form', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Acesse sua conta' }).click();

    await expect(page).toHaveURL('/login');
    await expect(page.getByLabel('Senha', { exact: true })).toBeVisible();
  });

  test('a logged-out deep link returns to its page after logging in through the welcome screen', async ({
    page,
    mockApi,
  }) => {
    await mockLoginSuccess(page);
    await mockApi.profile();
    await mockApi.surfboards([]);

    await page.goto('/boards');
    await expect(page).toHaveURL('/?redirect=%2Fboards');

    await page.getByRole('link', { name: 'Acesse sua conta' }).click();
    await expect(page).toHaveURL('/login?redirect=%2Fboards');

    await page.getByLabel('E-mail').fill('surfer@example.com');
    await page.getByLabel('Senha', { exact: true }).fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL('/boards');
  });
});
