import { test, expect } from '../fixtures';
import { makeSurfboard } from '../fixtures/api';

test.describe('boards list', () => {
  test('empty state offers a CTA to add the first board', async ({ page, mockApi, loginAs }) => {
    await loginAs();
    await mockApi.surfboards([]);

    await page.goto('/boards');
    await expect(page.getByText('Nenhuma prancha cadastrada')).toBeVisible();
    // The header also has an icon-only "Adicionar prancha" link — .last()
    // targets the empty state's own text CTA, rendered after it in the DOM.
    await page.getByRole('link', { name: 'Adicionar prancha' }).last().click();

    await expect(page).toHaveURL('/boards/new');
  });

  test('a populated card links to the edit screen', async ({ page, mockApi, loginAs }) => {
    await loginAs();
    await mockApi.surfboards([makeSurfboard({ id: 'b1', label: 'Daily driver' })]);
    await mockApi.surfboardDetail('b1', { id: 'b1', label: 'Daily driver' });

    await page.goto('/boards');
    await expect(page.getByText('Daily driver')).toBeVisible();
    await page.getByRole('button', { name: 'Editar prancha' }).click();

    await expect(page).toHaveURL('/boards/b1/edit');
  });
});
