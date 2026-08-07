/**
 * Client-side image compression (before upload). Re-encodes session photos to a
 * smaller JPEG so uploads are faster and oversized originals fit under the API
 * size cap. Videos and any stray types pass through untouched; the server stays
 * authoritative on validation.
 */
import Compressor from 'compressorjs';
import { IMAGE_COMPRESSION } from '@/config/constants';
import { classifyMedia } from './validation';

/** Swap a filename's extension for `.jpg` (adds one when there's none). */
function toJpegName(name: string): string {
  return `${name.replace(/\.[^./\\]+$/, '')}.jpg`;
}

/**
 * Re-encode a single image to a smaller JPEG. Falls back to the original file on
 * any compression error — a hiccup must never block the upload.
 */
export function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    new Compressor(file, {
      quality: IMAGE_COMPRESSION.quality,
      maxWidth: IMAGE_COMPRESSION.maxDimension,
      maxHeight: IMAGE_COMPRESSION.maxDimension,
      // Force JPEG for every input type (checkOrientation defaults on, so
      // sideways phone photos are auto-rotated).
      mimeType: 'image/jpeg',
      success(result) {
        resolve(
          new File([result], toJpegName(file.name), { type: 'image/jpeg' }),
        );
      },
      error() {
        resolve(file);
      },
    });
  });
}

/**
 * Compress a picked batch before upload. Images are re-encoded to JPEG (in
 * parallel, effectively instant); a video is transcoded to a smaller H.264 MP4
 * via WebCodecs (see {@link compressVideo}), which takes real time — so an
 * optional `onProgress` reports overall 0..1 for a determinate progress bar.
 * Anything that can't be compressed (unsupported browser, error) passes through
 * untouched, and the server stays authoritative on validation.
 *
 * `resolveMediaBatch` guarantees a batch is either images-only or a single
 * video, but a mixed batch is still handled defensively.
 */
export function compressBatch(
  files: File[],
  onProgress?: (fraction: number) => void,
): Promise<File[]> {
  const hasVideo = files.some((f) => classifyMedia(f) === 'video');

  // Fast path: images only — parallel, with no meaningful progress to report.
  if (!hasVideo) {
    return Promise.all(
      files.map((f) =>
        classifyMedia(f) === 'image' ? compressImage(f) : Promise.resolve(f),
      ),
    );
  }

  // A video is present: process sequentially so per-video progress stays
  // coherent and we never run multiple heavy WebCodecs encodes at once. Mediabunny
  // is ~135 kB gzipped, so it's dynamically imported here — photo-only uploads
  // never pay for it.
  return (async () => {
    const { compressVideo } = await import('./compressVideo');
    const videoCount = files.filter((f) => classifyMedia(f) === 'video').length;
    let videosDone = 0;
    const out: File[] = [];
    for (const f of files) {
      const kind = classifyMedia(f);
      if (kind === 'image') {
        out.push(await compressImage(f));
      } else if (kind === 'video') {
        const base = videosDone / videoCount;
        out.push(
          await compressVideo(f, {
            onProgress: (p) => onProgress?.(base + p / videoCount),
          }),
        );
        videosDone += 1;
        onProgress?.(videosDone / videoCount);
      } else {
        out.push(f);
      }
    }
    return out;
  })();
}
