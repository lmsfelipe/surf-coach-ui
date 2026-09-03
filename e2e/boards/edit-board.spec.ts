import { test, expect } from '../fixtures';
import { makeSurfboard } from '../fixtures/api';

test('editing a board is pre-filled, saves, and returns to the list', async ({
  page,
  mockApi,
  loginAs,
}) => {
  await loginAs();
  await mockApi.surfboardDetail('b1', {
    id: 'b1',
    boardType: 'shortboard',
    boardSize: 6.2,
    volume: 28.5,
    label: 'Daily driver',
  });
  await mockApi.surfboardUpdate('b1', { id: 'b1', label: 'Weekend cruiser' });
  await mockApi.surfboards([makeSurfboard({ id: 'b1', label: 'Weekend cruiser' })]);

  await page.goto('/boards/b1/edit');
  await expect(page.getByLabel('Tamanho (pés)')).toHaveValue('6.2');
  await expect(page.getByLabel('Apelido')).toHaveValue('Daily driver');

  await page.getByLabel('Apelido').fill('Weekend cruiser');
  await page.getByRole('button', { name: 'Salvar' }).click();

  await expect(page.getByText('Prancha atualizada.')).toBeVisible();
  await expect(page).toHaveURL('/boards');
});
