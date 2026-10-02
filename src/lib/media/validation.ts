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
  MAX_VIDEOS_PER_SESSION,
  MIN_IMAGES_PER_SESSION,
  MAX_VIDEO_DURATION_SECONDS,
  VIDEO_LIMIT_PHRASE,
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
 * mixing video with images keeps just the video(s), trimmed to the first
 * MAX_VIDEOS_PER_SESSION; otherwise everything else is kept (images + any
 * stray type, so invalid files still surface their per-file error). Applied
 * to every pick before it reaches {@link mergeMediaSelection}.
 */
export function resolveMediaBatch(picked: File[]): File[] {
  const videos = picked.filter((f) => classifyMedia(f) === 'video');
  if (videos.length > 0) return videos.slice(0, MAX_VIDEOS_PER_SESSION);
  return picked;
}

/**
 * Identity of a pending pick. Used both to dedupe a merge and as the React key
 * of the selected-files list, so the two can never disagree: anything that
 * would collide as a key is dropped as a duplicate instead of rendering twice.
 * Name + size (not lastModified) because compression rebuilds the File, and a
 * rebuild must still match the same photo picked again.
 */
export function mediaFileKey(file: File): string {
  return `${file.name}:${file.size}`;
}

/**
 * Merge a fresh OS-dialog batch into the current pending selection so picks
 * accumulate across several trips to the picker instead of replacing what was
 * already chosen. A video still wins, since a session is never a mix: picking
 * one drops the pending images, and picking images drops a pending video.
 * Files already selected (same name + size) are ignored, so re-picking one is a
 * no-op and the list keeps unique keys.
 */
export function mergeMediaSelection(current: File[], picked: File[]): File[] {
  const batch = resolveMediaBatch(picked);
  if (batch.some((f) => classifyMedia(f) === 'video')) return batch;

  const merged = current.filter((f) => classifyMedia(f) !== 'video');
  const seen = new Set(merged.map(mediaFileKey));
  for (const file of batch) {
    const key = mediaFileKey(file);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(file);
  }
  return merged;
}

/** Context describing media already attached to the session. */
export interface ExistingMedia {
  /** Type of media already on the session, or null when none is attached. */
  type: MediaType | null;
  /** Count of images already attached (0 when the existing media is a video). */
  imageCount: number;
  /** Count of videos already attached (0 when the existing media is images). */
  videoCount: number;
}

const NO_EXISTING_MEDIA: ExistingMedia = { type: null, imageCount: 0, videoCount: 0 };

/** pt-BR copy for a video pick that would exceed MAX_VIDEOS_PER_SESSION. */
const VIDEO_CAP_MESSAGE =
  MAX_VIDEOS_PER_SESSION === 1
    ? 'Esta sessão já tem um vídeo — remova-o para trocar a mídia.'
    : `Esta sessão já atingiu o máximo de ${MAX_VIDEOS_PER_SESSION} vídeos — remova algum para trocar a mídia.`;

/**
 * Selection rule: up to MAX_VIDEOS_PER_SESSION videos, OR up to
 * MAX_IMAGES_PER_SESSION images — never a mix. When the session already has
 * media, the pending selection is validated against it (combined set:
 * attached + pending). Returns a form-level error message, or null when the
 * set is valid.
 */
export function validateSelectionRule(
  files: File[],
  existing: ExistingMedia = NO_EXISTING_MEDIA,
): string | null {
  const videos = files.filter((f) => classifyMedia(f) === 'video');
  const images = files.filter((f) => classifyMedia(f) === 'image');

  // A session with existing video(s) accepts only more video, up to the cap.
  if (existing.type === 'video') {
    if (images.length > 0) return VIDEO_CAP_MESSAGE;
    if (existing.videoCount + videos.length > MAX_VIDEOS_PER_SESSION) {
      return VIDEO_CAP_MESSAGE;
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
    return `Escolha ${VIDEO_LIMIT_PHRASE} ou até ${MAX_IMAGES_PER_SESSION} fotos — não os dois.`;
  }
  if (videos.length > MAX_VIDEOS_PER_SESSION) {
    return MAX_VIDEOS_PER_SESSION === 1
      ? 'Envie apenas 1 vídeo por sessão.'
      : `Máximo de ${MAX_VIDEOS_PER_SESSION} vídeos por sessão.`;
  }
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
  probe: (file: File) => Promise<number> = probeVideoDuration,
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
        const duration = await probe(file);
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
