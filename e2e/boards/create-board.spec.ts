import { test, expect } from '../fixtures';
import { makeSurfboard } from '../fixtures/api';

test('creating a board saves and returns to the list', async ({ page, mockApi, loginAs }) => {
  await loginAs();
  await mockApi.surfboardCreate([{ status: 201, body: makeSurfboard({ id: 'b1' }) }]);
  await mockApi.surfboards([makeSurfboard({ id: 'b1' })]);

  await page.goto('/boards/new');
  await page.getByRole('combobox', { name: 'Tipo' }).click();
  await page.getByRole('option', { name: 'Shortboard' }).click();
  await page.getByLabel('Tamanho (pés)').fill('6.2');
  await page.getByLabel('Volume (L)').fill('28.5');
  await page.getByLabel('Apelido').fill('Daily driver');
  await page.getByRole('button', { name: 'Salvar' }).click();

  await expect(page.getByText('Prancha adicionada.')).toBeVisible();
  await expect(page).toHaveURL('/boards');
});
