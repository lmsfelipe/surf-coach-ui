import { test, expect } from '../fixtures';
import { makeMedia, makeSession } from '../fixtures/api';
import { hasMediaFixtures, IMAGE_FIXTURES } from '../fixtures/media';

test('uploading exactly the pinned photo count succeeds', async ({ page, mockApi, loginAs }) => {
  test.skip(!hasMediaFixtures(), 'Real media fixtures not present — see e2e/fixtures/media/README.md');

  await loginAs();
  await mockApi.media('s1', []);
  // VITE_MIN/MAX_IMAGES_PER_SESSION are both pinned to 3 for this suite.
  await mockApi.mediaUpload('s1', [
    {
      status: 201,
      body: [makeMedia({ id: 'm1' }), makeMedia({ id: 'm2' }), makeMedia({ id: 'm3' })],
    },
  ]);

  await page.goto('/sessions/s1/upload');
  await page
    .locator('input[type="file"]')
    .setInputFiles([IMAGE_FIXTURES[0], IMAGE_FIXTURES[1], IMAGE_FIXTURES[2]]);

  // Real compressorjs compression runs here — wait for the transient label to
  // clear rather than assuming it's instant.
  await expect(page.getByText('Otimizando fotos…')).toBeHidden();

  // Destination screen after a successful upload.
  await mockApi.sessionDetail('s1', [{ status: 200, body: makeSession({ id: 's1' }) }]);
  await mockApi.media('s1', [makeMedia({ id: 'm1' }), makeMedia({ id: 'm2' }), makeMedia({ id: 'm3' })]);
  await mockApi.mediaContent();
  await mockApi.reviewBySession('s1', null);
  await mockApi.surfboards([]);

  await page.getByRole('button', { name: 'Enviar' }).click();

  await expect(page.getByText('Mídia enviada.')).toBeVisible();
  await expect(page).toHaveURL('/sessions/s1');
});
