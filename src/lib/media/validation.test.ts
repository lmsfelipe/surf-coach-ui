import { describe, expect, it, vi } from 'vitest';
import {
  classifyMedia,
  resolveMediaBatch,
  validateFileSync,
  validateMediaFiles,
  validateSelectionRule,
} from './validation';
import { MAX_IMAGE_SIZE_BYTES, MAX_VIDEO_DURATION_SECONDS, MAX_VIDEO_SIZE_BYTES } from '@/config/constants';

function file(name: string, type: string, size = 1024): File {
  const f = new File(['x'], name, { type });
  Object.defineProperty(f, 'size', { value: size });
  return f;
}

const image = () => file('photo.jpg', 'image/jpeg');
const video = () => file('clip.mp4', 'video/mp4');

describe('classifyMedia', () => {
  it('classifies images and videos, rejects others', () => {
    expect(classifyMedia(image())).toBe('image');
    expect(classifyMedia(video())).toBe('video');
    expect(classifyMedia(file('doc.pdf', 'application/pdf'))).toBeNull();
  });
});

describe('validateSelectionRule — 1 video XOR ≤3 images', () => {
  it('allows an empty selection', () => {
    expect(validateSelectionRule([])).toBeNull();
  });

  it('allows a single video', () => {
    expect(validateSelectionRule([video()])).toBeNull();
  });

  it('allows up to 3 images', () => {
    expect(validateSelectionRule([image(), image(), image()])).toBeNull();
  });

  it('rejects more than 3 images', () => {
    expect(validateSelectionRule([image(), image(), image(), image()])).toMatch(/3 fotos/i);
  });

  it('rejects more than 1 video', () => {
    expect(validateSelectionRule([video(), video()])).toMatch(/1 vídeo/i);
  });

  it('rejects a mix of video and images', () => {
    expect(validateSelectionRule([video(), image()])).toMatch(/não os dois/i);
  });
});

describe('validateSelectionRule — against media already on the session', () => {
  it('blocks adding a photo when the session already has a video', () => {
    expect(validateSelectionRule([image()], { type: 'video', imageCount: 0 })).toMatch(
      /já tem um vídeo/i,
    );
  });

  it('blocks adding a video when the session already has a video', () => {
    expect(validateSelectionRule([video()], { type: 'video', imageCount: 0 })).toMatch(
      /já tem um vídeo/i,
    );
  });

  it('allows an empty pending selection when the session already has a video', () => {
    expect(validateSelectionRule([], { type: 'video', imageCount: 0 })).toBeNull();
  });

  it('blocks adding a video when the session already has photos', () => {
    expect(validateSelectionRule([video()], { type: 'image', imageCount: 1 })).toMatch(
      /já tem fotos/i,
    );
  });

  it('allows a 2nd photo on a session that already has 1', () => {
    expect(validateSelectionRule([image()], { type: 'image', imageCount: 1 })).toBeNull();
  });

  it('allows a 3rd photo on a session that already has 2', () => {
    expect(validateSelectionRule([image()], { type: 'image', imageCount: 2 })).toBeNull();
  });

  it('blocks a 4th photo (existing 2 + 2 pending)', () => {
    expect(
      validateSelectionRule([image(), image()], { type: 'image', imageCount: 2 }),
    ).toMatch(/3 fotos/i);
  });

  it('blocks a 4th photo (existing 3 + 1 pending)', () => {
    expect(validateSelectionRule([image()], { type: 'image', imageCount: 3 })).toMatch(
      /3 fotos/i,
    );
  });
});

describe('resolveMediaBatch — single-picker auto-replace (video wins)', () => {
  it('keeps only the video from a mixed batch', () => {
    const v = video();
    expect(resolveMediaBatch([image(), v, image()])).toEqual([v]);
  });

  it('keeps only the first video from a multi-video batch', () => {
    const v1 = video();
    const v2 = video();
    expect(resolveMediaBatch([v1, v2])).toEqual([v1]);
  });

  it('keeps all images when no video is present', () => {
    const a = image();
    const b = image();
    expect(resolveMediaBatch([a, b])).toEqual([a, b]);
  });
});

describe('validateFileSync', () => {
  it('passes a valid image', () => {
    expect(validateFileSync(image())).toBeNull();
  });

  it('flags an unsupported type', () => {
    expect(validateFileSync(file('a.gif', 'image/gif'))?.code).toBe('INVALID_MEDIA_TYPE');
  });

  it('flags an oversized video', () => {
    const big = file('huge.mp4', 'video/mp4', MAX_VIDEO_SIZE_BYTES + 1);
    expect(validateFileSync(big)?.code).toBe('FILE_TOO_LARGE');
  });

  it('flags an oversized image', () => {
    const big = file('huge.jpg', 'image/jpeg', MAX_IMAGE_SIZE_BYTES + 1);
    expect(validateFileSync(big)?.code).toBe('FILE_TOO_LARGE');
  });

  it('allows a video just under the video cap even though it exceeds the image cap', () => {
    const ok = file('clip.mp4', 'video/mp4', MAX_IMAGE_SIZE_BYTES + 1);
    expect(validateFileSync(ok)).toBeNull();
  });
});

describe('validateMediaFiles — orchestrator (injected prober, no module mocking)', () => {
  const okProbe = async () => 10; // seconds, well under the cap

  it('separates valid files from per-file errors, keyed by the exact File object', async () => {
    const goodA = image();
    const goodB = image();
    const bad = file('doc.pdf', 'application/pdf');

    const result = await validateMediaFiles([goodA, goodB, bad], undefined, okProbe);

    expect(result.valid).toEqual([goodA, goodB]);
    expect(result.fileErrors.get(bad)?.code).toBe('INVALID_MEDIA_TYPE');
    expect(result.fileErrors.has(goodA)).toBe(false);
    expect(result.fileErrors.has(goodB)).toBe(false);
  });

  it('surfaces a selection-rule violation in selectionError while per-file checks still run', async () => {
    const bad = file('doc.pdf', 'application/pdf');

    const result = await validateMediaFiles(
      [image(), image(), image(), image(), bad],
      undefined,
      okProbe,
    );

    expect(result.selectionError).toMatch(/3 fotos/i);
    expect(result.fileErrors.get(bad)?.code).toBe('INVALID_MEDIA_TYPE');
  });

  it('flags a video over the duration cap as VIDEO_TOO_LONG', async () => {
    const longProbe = async () => MAX_VIDEO_DURATION_SECONDS + 1;
    const v = video();

    const result = await validateMediaFiles([v], undefined, longProbe);

    expect(result.fileErrors.get(v)?.code).toBe('VIDEO_TOO_LONG');
    expect(result.valid).toEqual([]);
  });

  it('maps a probe rejection to INVALID_MEDIA_TYPE', async () => {
    const failingProbe = async () => {
      throw new Error('Não foi possível ler o vídeo.');
    };
    const v = video();

    const result = await validateMediaFiles([v], undefined, failingProbe);

    expect(result.fileErrors.get(v)?.code).toBe('INVALID_MEDIA_TYPE');
  });

  it('skips the duration probe entirely for a file that already failed sync validation', async () => {
    const probe = vi.fn(async () => 10);
    const oversized = file('huge.mp4', 'video/mp4', MAX_VIDEO_SIZE_BYTES + 1);

    const result = await validateMediaFiles([oversized], undefined, probe);

    expect(result.fileErrors.get(oversized)?.code).toBe('FILE_TOO_LARGE');
    expect(probe).not.toHaveBeenCalled();
  });
});
