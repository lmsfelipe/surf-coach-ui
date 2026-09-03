import { test, expect } from '../fixtures';
import { hasMediaFixtures, IMAGE_FIXTURES, VIDEO_FIXTURE } from '../fixtures/media';

test('picking a video + photos in one batch keeps only the video (video wins)', async ({
  page,
  mockApi,
  loginAs,
}) => {
  test.skip(!hasMediaFixtures(), 'Real media fixtures not present — see e2e/fixtures/media/README.md');
  test.setTimeout(60_000);

  await loginAs();
  await mockApi.media('s1', []);

  await page.goto('/sessions/s1/upload');
  await page
    .locator('input[type="file"]')
    .setInputFiles([VIDEO_FIXTURE, IMAGE_FIXTURES[3], IMAGE_FIXTURES[4]]);

  await expect(page.getByText(/Comprimindo vídeo…/)).toBeHidden({ timeout: 45_000 });

  await expect(page.getByText('sample-video.mp4')).toBeVisible();
  await expect(page.getByText('sample-photo4.jpg')).toHaveCount(0);
  await expect(page.getByText('sample-photo5.jpg')).toHaveCount(0);
});
