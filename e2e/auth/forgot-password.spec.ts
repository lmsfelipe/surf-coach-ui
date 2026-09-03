import { test, expect } from '../fixtures';
import { mockForgotPassword } from '../fixtures/auth';

test('always shows the same confirmation panel, regardless of whether the account exists', async ({
  page,
}) => {
  await mockForgotPassword(page);

  await page.goto('/forgot-password');
  await page.getByLabel('E-mail').fill('maybe-not-a-real-account@example.com');
  await page.getByRole('button', { name: 'Enviar link' }).click();

  await expect(page.getByText('Confira seu e-mail')).toBeVisible();
  await page.getByRole('link', { name: 'Voltar ao login' }).click();
  await expect(page).toHaveURL(/\/login$/);
});
