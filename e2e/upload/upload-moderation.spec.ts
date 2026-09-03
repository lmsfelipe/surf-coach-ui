import { test, expect } from '../fixtures';
import { envelope } from '../fixtures/api';
import { hasMediaFixtures, IMAGE_FIXTURES } from '../fixtures/media';

test.describe('upload moderation failures', () => {
  test('MEDIA_NOT_SURF_RELATED shows a warning and keeps the selection', async ({
    page,
    mockApi,
    loginAs,
  }) => {
    test.skip(!hasMediaFixtures(), 'Real media fixtures not present — see e2e/fixtures/media/README.md');

    await loginAs();
    await mockApi.media('s1', []);
    await mockApi.mediaUpload('s1', [
      {
        status: 422,
        body: envelope('MEDIA_NOT_SURF_RELATED', 'Uploaded media does not appear to be surf or water sports related.', {
          reason: 'Shows a soccer game.',
        }),
      },
    ]);

    await page.goto('/sessions/s1/upload');
    await page
      .locator('input[type="file"]')
      .setInputFiles([IMAGE_FIXTURES[0], IMAGE_FIXTURES[1], IMAGE_FIXTURES[2]]);
    await expect(page.getByText('Otimizando fotos…')).toBeHidden();
    await page.getByRole('button', { name: 'Enviar' }).click();

    await expect(
      page.getByText('Este conteúdo não parece ser de surfe ou esportes aquáticos.'),
    ).toBeVisible();
    await expect(page.getByText('Selecionados')).toBeVisible();
  });

  test('EXPLICIT_CONTENT shows a danger alert and clears the selection', async ({
    page,
    mockApi,
    loginAs,
  }) => {
    test.skip(!hasMediaFixtures(), 'Real media fixtures not present — see e2e/fixtures/media/README.md');

    await loginAs();
    await mockApi.media('s1', []);
    await mockApi.mediaUpload('s1', [
      {
        status: 422,
        body: envelope('EXPLICIT_CONTENT', 'Uploaded media contains explicit or offensive content.', {
          reason: 'Contains nudity.',
        }),
      },
    ]);

    await page.goto('/sessions/s1/upload');
    await page
      .locator('input[type="file"]')
      .setInputFiles([IMAGE_FIXTURES[2], IMAGE_FIXTURES[3], IMAGE_FIXTURES[4]]);
    await expect(page.getByText('Otimizando fotos…')).toBeHidden();
    await page.getByRole('button', { name: 'Enviar' }).click();

    await expect(
      page.getByText('O arquivo contém conteúdo explícito ou ofensivo e não pode ser enviado.'),
    ).toBeVisible();
    await expect(page.getByText('Selecionados')).toHaveCount(0);
  });
});
