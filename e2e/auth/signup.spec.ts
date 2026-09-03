import { test, expect } from '../fixtures';
import {
  mockSignupDuplicateEmail,
  mockSignupEmailConfirmationRequired,
  mockSignupWithSession,
} from '../fixtures/auth';

test.describe('signup', () => {
  test('autoconfirm with session bounces an incomplete profile to /onboarding', async ({
    page,
    mockApi,
  }) => {
    await mockSignupWithSession(page, { email: 'new-surfer@example.com', name: 'Nova' });
    await mockApi.profile({ surfLevel: null, heightCm: null, weightKg: null });

    await page.goto('/signup');
    await page.getByLabel('Nome').fill('Nova');
    await page.getByLabel('E-mail').fill('new-surfer@example.com');
    await page.getByLabel('Senha', { exact: true }).fill('password123');
    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(page).toHaveURL('/onboarding');
  });

  test('email confirmation required shows the check-your-inbox panel', async ({ page }) => {
    await mockSignupEmailConfirmationRequired(page, { email: 'pending@example.com' });

    await page.goto('/signup');
    await page.getByLabel('Nome').fill('Pendente');
    await page.getByLabel('E-mail').fill('pending@example.com');
    await page.getByLabel('Senha', { exact: true }).fill('password123');
    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(page.getByText('Confirme seu e-mail')).toBeVisible();
    await page.getByRole('link', { name: 'Voltar ao login' }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('duplicate email surfaces a field-level error', async ({ page }) => {
    await mockSignupDuplicateEmail(page);

    await page.goto('/signup');
    await page.getByLabel('Nome').fill('Existente');
    await page.getByLabel('E-mail').fill('existing@example.com');
    await page.getByLabel('Senha', { exact: true }).fill('password123');
    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(page.getByText('E-mail já cadastrado.')).toBeVisible();
    await expect(page).toHaveURL(/\/signup$/);
  });
});
