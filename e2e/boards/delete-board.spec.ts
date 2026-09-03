import { test, expect } from '../fixtures';
import { envelope, makeSurfboard } from '../fixtures/api';

test.describe('delete board', () => {
  test('from the list: removes optimistically, then rolls back and toasts on failure', async ({
    page,
    mockApi,
    loginAs,
  }) => {
    await loginAs();
    await mockApi.surfboards([makeSurfboard({ id: 'b1', label: 'Daily driver' })]);
    // A short delay keeps the transient "already removed, not yet rolled
    // back" window wide enough for the assertion below to reliably observe it.
    await mockApi.surfboardDelete(
      'b1',
      [{ status: 500, body: envelope('INTERNAL_ERROR', 'Falhou do nosso lado.') }],
      300,
    );

    await page.goto('/boards');
    await page.getByRole('button', { name: 'Excluir prancha' }).click();

    const dialog = page.getByRole('alertdialog');
    await expect(dialog.getByText('Excluir prancha?')).toBeVisible();
    await dialog.getByRole('button', { name: 'Excluir', exact: true }).click();

    // Optimistic removal happens immediately, before the mocked DELETE resolves.
    await expect(page.getByText('Daily driver')).toBeHidden();

    // Rollback + error toast once the failure response lands.
    await expect(page.getByText('Daily driver')).toBeVisible();
    await expect(page.getByText('Algo deu errado do nosso lado. Tente de novo?')).toBeVisible();
  });

  test('from the edit screen: navigates away before the delete settles, without corrupting /boards', async ({
    page,
    mockApi,
    loginAs,
  }) => {
    await loginAs();
    await mockApi.surfboardDetail('b1', { id: 'b1', label: 'Daily driver' });
    await mockApi.surfboards([makeSurfboard({ id: 'b1', label: 'Daily driver' })]);
    await mockApi.surfboardDelete(
      'b1',
      [{ status: 500, body: envelope('INTERNAL_ERROR', 'Falhou do nosso lado.') }],
      1000,
    );

    await page.goto('/boards/b1/edit');
    await page.getByRole('button', { name: 'Excluir prancha' }).click();

    const dialog = page.getByRole('alertdialog');
    await expect(dialog.getByText('Excluir prancha?')).toBeVisible();
    await dialog.getByRole('button', { name: 'Excluir', exact: true }).click();

    // The mutation is fire-and-forget and the navigate() isn't awaited, so
    // /boards shows up well before the 1s-delayed DELETE response lands.
    await expect(page).toHaveURL('/boards', { timeout: 800 });

    // Once the delayed failure resolves: rollback + error toast, no crash.
    await expect(page.getByText('Daily driver')).toBeVisible();
    await expect(page.getByText('Algo deu errado do nosso lado. Tente de novo?')).toBeVisible();
  });
});
