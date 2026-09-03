import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Real sample media files the user supplies (see e2e/fixtures/media/README.md)
 * — the upload flow runs real client-side compression (compressorjs /
 * mediabunny), so these can't be synthetic/empty blobs.
 *
 * Five distinct photos so specs needing multiple images (the pinned
 * VITE_MAX_IMAGES_PER_SESSION=3) exercise real, differently-sized files
 * rather than the same path selected three times.
 */
export const IMAGE_FIXTURES = [
  path.join(dirname, 'media', 'sample-photo1.jpg'),
  path.join(dirname, 'media', 'sample-photo2.jpg'),
  path.join(dirname, 'media', 'sample-photo3.jpg'),
  path.join(dirname, 'media', 'sample-photo4.jpg'),
  path.join(dirname, 'media', 'sample-photo5.jpg'),
] as const;

export const VIDEO_FIXTURE = path.join(dirname, 'media', 'sample-video.mp4');

export function hasMediaFixtures(): boolean {
  return IMAGE_FIXTURES.every((f) => fs.existsSync(f)) && fs.existsSync(VIDEO_FIXTURE);
}
