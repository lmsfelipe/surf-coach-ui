/**
 * SPIKE — client-side video compression via Mediabunny (WebCodecs under the hood).
 *
 * Mirrors the image path in compress.ts: on any failure — or when the browser
 * lacks WebCodecs H.264 encoding — the original File is returned untouched, so a
 * hiccup never blocks the upload. The server stays authoritative on validation.
 *
 * Output is always H.264/AAC in an MP4 container, which is what the API accepts
 * (video/mp4). This deliberately avoids MediaRecorder, whose Chrome output is
 * WebM and would be rejected by the server.
 */
import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  Input,
  Mp4OutputFormat,
  Output,
  Quality,
  QUALITY_HIGH,
  QUALITY_LOW,
  QUALITY_MEDIUM,
  canEncodeVideo,
} from 'mediabunny';
import { installWebCodecsSafariShim } from './webcodecsSafariShim';

// Patch Safari's spec-violating VideoEncoder.isConfigSupported before any
// WebCodecs negotiation runs (Mediabunny #456). Idempotent; no-op elsewhere.
installWebCodecsSafariShim();

export type VideoQuality = 'low' | 'medium' | 'high';

export interface VideoCompressionOptions {
  /** Cap on output height in px; never upscales. Default 720. */
  maxHeight?: number;
  /** Encoder quality preset. Default 'medium'. */
  quality?: VideoQuality;
  /**
   * Keep the audio track (re-encoded to AAC) vs strip it. Default false —
   * surf-review footage doesn't need audio and dropping it shrinks the file.
   */
  keepAudio?: boolean;
  /** 0..1 progress callback, fired during encoding. */
  onProgress?: (progress: number) => void;
  /**
   * Called with the caught exception when compression throws and we fall back to
   * the original. Diagnostic hook — production leaves it unset (silent fallback).
   */
  onError?: (error: unknown) => void;
}

const QUALITY_MAP: Record<VideoQuality, Quality> = {
  low: QUALITY_LOW,
  medium: QUALITY_MEDIUM,
  high: QUALITY_HIGH,
};

let _canCompress: Promise<boolean> | null = null;

/**
 * Whether this browser can H.264-encode via WebCodecs. Memoized after the first
 * call (the underlying probe is async and stable for the session).
 *
 * Note: WebCodecs requires a *secure context* (https or localhost). Over plain
 * http on a LAN IP the `VideoEncoder` global is absent, so this returns false and
 * callers fall back to the original file.
 */
export function canCompressVideo(): Promise<boolean> {
  if (_canCompress) return _canCompress;
  _canCompress = (async () => {
    if (typeof window === 'undefined' || !('VideoEncoder' in window)) return false;
    try {
      return await canEncodeVideo('avc');
    } catch {
      return false;
    }
  })();
  return _canCompress;
}

/** H.264 requires even dimensions; round a target down to the nearest even px. */
function evenDown(n: number): number {
  return Math.max(2, Math.floor(n / 2) * 2);
}

/** Swap a filename's extension for `.mp4` (adds one when there's none). */
function toMp4Name(name: string): string {
  return `${name.replace(/\.[^./\\]+$/, '')}.mp4`;
}

/**
 * Re-encode a video to a smaller H.264/AAC MP4. Only ever downscales (height
 * capped at `maxHeight`, aspect preserved). Falls back to the original File on
 * any error, when WebCodecs is unavailable, or when the result isn't smaller.
 */
export async function compressVideo(
  file: File,
  options: VideoCompressionOptions = {},
): Promise<File> {
  const { maxHeight = 720, quality = 'medium', keepAudio = false, onProgress, onError } = options;

  if (!(await canCompressVideo())) return file;

  let input: Input | undefined;
  try {
    input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) });

    const videoTrack = await input.getPrimaryVideoTrack();
    if (!videoTrack) return file; // audio-only / unreadable → leave as-is

    // Downscale only; never upscale a small source.
    const targetHeight = evenDown(Math.min(maxHeight, videoTrack.displayHeight));

    const output = new Output({
      format: new Mp4OutputFormat(),
      target: new BufferTarget(),
    });

    const conversion = await Conversion.init({
      input,
      output,
      video: {
        codec: 'avc',
        height: targetHeight,
        fit: 'contain', // width auto-derived from aspect ratio
        quality: QUALITY_MAP[quality],
      },
      audio: keepAudio ? { codec: 'aac' } : { discard: true },
    });

    // A pipeline the browser can't satisfy (e.g. no encodable codec) → fall back
    // rather than throwing mid-upload.
    if (!conversion.isValid) return file;

    if (onProgress) conversion.onProgress = onProgress;
    await conversion.execute();

    const buffer = output.target.buffer;
    if (!buffer) return file;

    const compressed = new File([buffer], toMp4Name(file.name), { type: 'video/mp4' });
    // Never ship a "compression" that grew the file.
    return compressed.size < file.size ? compressed : file;
  } catch (err) {
    onError?.(err);
    return file;
  } finally {
    input?.dispose();
  }
}
