/**
 * Client-side media pre-validation (§4.6). Fast feedback before upload; the
 * server stays authoritative. Mirrors the API limits in config/constants.
 */
import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_MEDIA_TYPES,
  ACCEPTED_VIDEO_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
  MAX_IMAGES_PER_SESSION,
  MIN_IMAGES_PER_SESSION,
  MAX_VIDEO_DURATION_SECONDS,
} from '@/config/constants';
import type { MediaType } from '@/types/api';

export type MediaErrorCode = 'FILE_TOO_LARGE' | 'VIDEO_TOO_LONG' | 'INVALID_MEDIA_TYPE';

export const MEDIA_ERROR_MESSAGES: Record<MediaErrorCode, string> = {
  FILE_TOO_LARGE: 'Arquivo muito grande',
  VIDEO_TOO_LONG: 'Vídeo acima de 120s',
  INVALID_MEDIA_TYPE: 'Formato não aceito',
};

export interface FileError {
  code: MediaErrorCode;
  message: string;
}

export function classifyMedia(file: File): MediaType | null {
  if ((ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) return 'image';
  if ((ACCEPTED_VIDEO_TYPES as readonly string[]).includes(file.type)) return 'video';
  return null;
}

/**
 * Resolve a single OS-dialog batch to one media kind (video wins): a batch
 * mixing a video with images keeps just the first video; otherwise everything
 * else is kept (images + any stray type, so invalid files still surface their
 * per-file error). Used to enforce the single-picker auto-replace behavior.
 */
export function resolveMediaBatch(picked: File[]): File[] {
  const firstVideo = picked.find((f) => classifyMedia(f) === 'video');
  if (firstVideo) return [firstVideo];
  return picked;
}

/** Context describing media already attached to the session. */
export interface ExistingMedia {
  /** Type of media already on the session, or null when none is attached. */
  type: MediaType | null;
  /** Count of images already attached (0 when the existing media is a video). */
  imageCount: number;
}

const NO_EXISTING_MEDIA: ExistingMedia = { type: null, imageCount: 0 };

/**
 * Selection rule: exactly one video, OR up to MAX_IMAGES_PER_SESSION images —
 * never a mix. When the session already has media, the pending selection is
 * validated against it (combined set: attached + pending). Returns a form-level
 * error message, or null when the set is valid.
 */
export function validateSelectionRule(
  files: File[],
  existing: ExistingMedia = NO_EXISTING_MEDIA,
): string | null {
  const videos = files.filter((f) => classifyMedia(f) === 'video');
  const images = files.filter((f) => classifyMedia(f) === 'image');

  // A session with an existing video is complete/locked — no more media.
  if (existing.type === 'video') {
    if (files.length > 0) {
      return 'Esta sessão já tem um vídeo — remova-o para trocar a mídia.';
    }
    return null;
  }

  // A session with existing images accepts only more images, up to the cap.
  if (existing.type === 'image') {
    if (videos.length > 0) {
      return 'Esta sessão já tem fotos — remova-as para enviar um vídeo.';
    }
    if (existing.imageCount + images.length > MAX_IMAGES_PER_SESSION) {
      return `Máximo de ${MAX_IMAGES_PER_SESSION} fotos por sessão.`;
    }
    return null;
  }

  if (files.length === 0) return null;

  if (videos.length > 0 && images.length > 0) {
    return `Escolha 1 vídeo ou até ${MAX_IMAGES_PER_SESSION} fotos — não os dois.`;
  }
  if (videos.length > 1) return 'Envie apenas 1 vídeo por sessão.';
  if (images.length > MAX_IMAGES_PER_SESSION) {
    return `Máximo de ${MAX_IMAGES_PER_SESSION} fotos por sessão.`;
  }
  if (images.length > 0 && images.length < MIN_IMAGES_PER_SESSION) {
    return `Envie ${MIN_IMAGES_PER_SESSION} fotos para continuar.`;
  }
  return null;
}

/** Synchronous per-file checks (type + size). Duration is probed separately. */
export function validateFileSync(file: File): FileError | null {
  if (!(ACCEPTED_MEDIA_TYPES as readonly string[]).includes(file.type)) {
    return { code: 'INVALID_MEDIA_TYPE', message: MEDIA_ERROR_MESSAGES.INVALID_MEDIA_TYPE };
  }
  const isVideo = classifyMedia(file) === 'video';
  const maxSize = isVideo ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
  if (file.size > maxSize) {
    const message = isVideo ? 'Vídeo muito grande (máx 60MB)' : 'Imagem muito grande (máx 10MB)';
    return { code: 'FILE_TOO_LARGE', message };
  }
  return null;
}

/** Probe a video's duration via a hidden <video> element. */
export function probeVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não foi possível ler o vídeo.'));
    };
    video.src = url;
  });
}

export interface MediaValidationResult {
  /** Per-file errors keyed by the File object. */
  fileErrors: Map<File, FileError>;
  /** Form-level selection-rule violation, if any. */
  selectionError: string | null;
  /** Files that passed all checks. */
  valid: File[];
}

/**
 * Full validation: selection rule + per-file type/size + video duration.
 * When `existing` is passed, the pending selection is validated against media
 * already attached to the session (never a video+image mix, never >3 images).
 */
export async function validateMediaFiles(
  files: File[],
  existing: ExistingMedia = NO_EXISTING_MEDIA,
): Promise<MediaValidationResult> {
  const fileErrors = new Map<File, FileError>();
  const selectionError = validateSelectionRule(files, existing);

  for (const file of files) {
    const syncError = validateFileSync(file);
    if (syncError) {
      fileErrors.set(file, syncError);
      continue;
    }
    if (classifyMedia(file) === 'video') {
      try {
        const duration = await probeVideoDuration(file);
        if (duration > MAX_VIDEO_DURATION_SECONDS) {
          fileErrors.set(file, {
            code: 'VIDEO_TOO_LONG',
            message: MEDIA_ERROR_MESSAGES.VIDEO_TOO_LONG,
          });
        }
      } catch {
        fileErrors.set(file, {
          code: 'INVALID_MEDIA_TYPE',
          message: MEDIA_ERROR_MESSAGES.INVALID_MEDIA_TYPE,
        });
      }
    }
  }

  const valid = files.filter((f) => !fileErrors.has(f));
  return { fileErrors, selectionError, valid };
}
