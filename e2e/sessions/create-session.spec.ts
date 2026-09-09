import { test, expect } from '../fixtures';
import { makeSurfboard } from '../fixtures/api';

// surfboardId is validated with z.string().uuid() client-side, so the fixture
// id must be a real UUID here (unlike the short ids used elsewhere).
const BOARD_ID = '11111111-1111-4111-8111-111111111111';

test.describe('create session', () => {
  test('with a board on file: fills the form and lands on the upload screen', async ({
    page,
    mockApi,
    loginAs,
  }) => {
    await loginAs();
    await mockApi.surfboards([makeSurfboard({ id: BOARD_ID, label: 'Daily driver' })]);
    await mockApi.sessionCreate();
    await mockApi.media('s1', []);

    await page.goto('/sessions/new');
    await page.getByLabel('Qual foi o pico?').fill('Canal 1 — Santos/SP');
    await page.getByRole('combobox', { name: 'Prancha usada' }).click();
    await page.getByRole('option', { name: 'Daily driver' }).click();
    await page.getByRole('button', { name: 'Salvar e enviar mídia' }).click();

    await expect(page).toHaveURL('/sessions/s1/upload');
  });

  test('with no boards on file: offers a modal shortcut to register one', async ({
    page,
    mockApi,
    loginAs,
  }) => {
    await loginAs();
    await mockApi.surfboards([]);
    await mockApi.surfboardCreate([{ status: 201, body: makeSurfboard({ id: BOARD_ID, label: 'Daily driver' }) }]);

    await page.goto('/sessions/new');
    await page.getByLabel('Qual foi o pico?').fill('Canal 1 — Santos/SP');
    await expect(page.getByText('Você ainda não cadastrou uma prancha')).toBeVisible();
    await page.getByRole('button', { name: 'Cadastrar prancha' }).click();

    await expect(page.getByRole('dialog', { name: 'Nova prancha' })).toBeVisible();

    // Re-register the list GET so useCreateSurfboard's background invalidate()
    // refetch doesn't stomp the dialog's optimistic cache write with the stale
    // empty list — mirrors the pattern already used in create-board.spec.ts.
    await mockApi.surfboards([makeSurfboard({ id: BOARD_ID, label: 'Daily driver' })]);

    await page.getByRole('combobox', { name: 'Tipo' }).click();
    await page.getByRole('option', { name: 'Shortboard' }).click();
    await page.getByLabel('Tamanho (pés)').fill('6.2');
    await page.getByRole('button', { name: 'Salvar' }).click();

    await expect(page.getByText('Prancha adicionada.')).toBeVisible();
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page.getByRole('combobox', { name: 'Prancha usada' })).toHaveText('Daily driver');

    // Never left the session-creation page, and the earlier field value survived.
    await expect(page).toHaveURL('/sessions/new');
    await expect(page.getByLabel('Qual foi o pico?')).toHaveValue('Canal 1 — Santos/SP');
  });
});
