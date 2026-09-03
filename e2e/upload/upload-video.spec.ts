import { test, expect } from '../fixtures';
import { makeMedia, makeSession } from '../fixtures/api';
import { hasMediaFixtures, VIDEO_FIXTURE } from '../fixtures/media';

test('uploading a video runs real compression and succeeds', async ({ page, mockApi, loginAs }) => {
  test.skip(!hasMediaFixtures(), 'Real media fixtures not present — see e2e/fixtures/media/README.md');
  // Real WebCodecs transcoding takes real wall-clock time.
  test.setTimeout(60_000);

  await loginAs();
  await mockApi.media('s1', []);
  await mockApi.mediaUpload('s1', [
    { status: 201, body: [makeMedia({ id: 'm1', mediaType: 'video', fileName: 'sample-video.mp4' })] },
  ]);

  await page.goto('/sessions/s1/upload');
  await page.locator('input[type="file"]').setInputFiles([VIDEO_FIXTURE]);

  await expect(page.getByText(/Comprimindo vídeo…/)).toBeVisible();
  // Wait for the determinate progress bar to finish before the file row appears.
  await expect(page.getByText(/Comprimindo vídeo…/)).toBeHidden({ timeout: 45_000 });

  await mockApi.sessionDetail('s1', [{ status: 200, body: makeSession({ id: 's1' }) }]);
  await mockApi.media('s1', [makeMedia({ id: 'm1', mediaType: 'video', fileName: 'sample-video.mp4' })]);
  await mockApi.mediaContent();
  await mockApi.reviewBySession('s1', null);
  await mockApi.surfboards([]);

  await page.getByRole('button', { name: 'Enviar' }).click();

  await expect(page.getByText('Mídia enviada.')).toBeVisible();
  await expect(page).toHaveURL('/sessions/s1');
});
