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
 * Compress the image members of a picked batch; videos (and anything that isn't
 * a recognized image) are returned unchanged.
 */
export function compressBatch(files: File[]): Promise<File[]> {
  return Promise.all(
    files.map((f) =>
      classifyMedia(f) === 'image' ? compressImage(f) : Promise.resolve(f),
    ),
  );
}
