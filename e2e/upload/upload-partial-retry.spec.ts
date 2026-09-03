import fs from 'node:fs';
import { failedUploadMessage } from '@/lib/api/errors';
import { test, expect } from '../fixtures';
import { makeMedia, makeSession } from '../fixtures/api';
import { hasMediaFixtures, IMAGE_FIXTURES } from '../fixtures/media';

test('a 207 partial upload keeps only the failed file selected, and retry succeeds', async ({
  page,
  mockApi,
  loginAs,
}) => {
  test.skip(!hasMediaFixtures(), 'Real media fixtures not present — see e2e/fixtures/media/README.md');

  await loginAs();
  await mockApi.media('s1', []);
  // VITE_MIN/MAX_IMAGES_PER_SESSION are pinned to 3 — a.jpg/b.jpg succeed
  // storage, c.jpg fails; retrying re-submits only c.jpg (below the pinned
  // minimum on its own, which the retry path deliberately allows).
  await mockApi.mediaUpload('s1', [
    {
      status: 207,
      body: {
        succeeded: [
          makeMedia({ id: 'm1', fileName: 'a.jpg' }),
          makeMedia({ id: 'm2', fileName: 'b.jpg' }),
        ],
        failed: [
          { fileName: 'c.jpg', code: 'STORAGE_UPLOAD_FAILED', message: 'Media upload failed.', details: null },
        ],
      },
    },
    { status: 201, body: [makeMedia({ id: 'm3', fileName: 'c.jpg' })] },
  ]);

  await page.goto('/sessions/s1/upload');

  // Real bytes from three distinct photos, re-wrapped with the fileNames the
  // mocked 207/201 responses key off of.
  await page.locator('input[type="file"]').setInputFiles([
    { name: 'a.jpg', mimeType: 'image/jpeg', buffer: fs.readFileSync(IMAGE_FIXTURES[2]) },
    { name: 'b.jpg', mimeType: 'image/jpeg', buffer: fs.readFileSync(IMAGE_FIXTURES[3]) },
    { name: 'c.jpg', mimeType: 'image/jpeg', buffer: fs.readFileSync(IMAGE_FIXTURES[4]) },
  ]);
  await expect(page.getByText('Otimizando fotos…')).toBeHidden();

  await page.getByRole('button', { name: 'Enviar' }).click();

  await expect(page.getByText(/2 enviada\(s\), 1 falhou\(aram\)/)).toBeVisible();
  await expect(page.getByText('a.jpg')).toHaveCount(0);
  await expect(page.getByText('b.jpg')).toHaveCount(0);
  await expect(page.getByText('c.jpg', { exact: true })).toBeVisible();
  await expect(page.getByText(failedUploadMessage('c.jpg'))).toBeVisible();

  const retryButton = page.getByRole('button', { name: 'Tentar de novo' });
  await expect(retryButton).toBeVisible();

  await mockApi.sessionDetail('s1', [{ status: 200, body: makeSession({ id: 's1' }) }]);
  await mockApi.media('s1', [
    makeMedia({ id: 'm1', fileName: 'a.jpg' }),
    makeMedia({ id: 'm2', fileName: 'b.jpg' }),
    makeMedia({ id: 'm3', fileName: 'c.jpg' }),
  ]);
  await mockApi.mediaContent();
  await mockApi.reviewBySession('s1', null);
  await mockApi.surfboards([]);

  await retryButton.click();

  await expect(page.getByText('Mídia enviada.')).toBeVisible();
  await expect(page).toHaveURL('/sessions/s1');
});
