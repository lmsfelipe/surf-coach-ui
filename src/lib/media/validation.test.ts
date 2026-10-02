import { describe, expect, it, vi } from 'vitest';
import {
  classifyMedia,
  mergeMediaSelection,
  resolveMediaBatch,
  validateFileSync,
  validateMediaFiles,
  validateSelectionRule,
} from './validation';
import {
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_DURATION_SECONDS,
  MAX_VIDEO_SIZE_BYTES,
  MAX_VIDEOS_PER_SESSION,
} from '@/config/constants';

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
    expect(
      validateSelectionRule([image()], { type: 'video', imageCount: 0, videoCount: 1 }),
    ).toMatch(/já tem um vídeo/i);
  });

  it('blocks adding a video when the session already has a video (default cap of 1)', () => {
    expect(
      validateSelectionRule([video()], { type: 'video', imageCount: 0, videoCount: 1 }),
    ).toMatch(/já tem um vídeo/i);
  });

  it('allows an empty pending selection when the session already has a video', () => {
    expect(validateSelectionRule([], { type: 'video', imageCount: 0, videoCount: 1 })).toBeNull();
  });

  it('blocks adding a video when the session already has photos', () => {
    expect(
      validateSelectionRule([video()], { type: 'image', imageCount: 1, videoCount: 0 }),
    ).toMatch(/já tem fotos/i);
  });

  it('allows a 2nd photo on a session that already has 1', () => {
    expect(
      validateSelectionRule([image()], { type: 'image', imageCount: 1, videoCount: 0 }),
    ).toBeNull();
  });

  it('allows a 3rd photo on a session that already has 2', () => {
    expect(
      validateSelectionRule([image()], { type: 'image', imageCount: 2, videoCount: 0 }),
    ).toBeNull();
  });

  it('blocks a 4th photo (existing 2 + 2 pending)', () => {
    expect(
      validateSelectionRule([image(), image()], { type: 'image', imageCount: 2, videoCount: 0 }),
    ).toMatch(/3 fotos/i);
  });

  it('blocks a 4th photo (existing 3 + 1 pending)', () => {
    expect(
      validateSelectionRule([image()], { type: 'image', imageCount: 3, videoCount: 0 }),
    ).toMatch(
      /3 fotos/i,
    );
  });
});

// MAX_VIDEOS_PER_SESSION is env-configurable (VITE_MAX_VIDEOS_PER_SESSION,
// default 1) — these assert against the imported constant so they hold at
// whatever cap the running env is pinned to, rather than hardcoding 1.
describe('validateSelectionRule — video cap (MAX_VIDEOS_PER_SESSION)', () => {
  it('allows exactly the cap, in one fresh selection', () => {
    const videos = Array.from({ length: MAX_VIDEOS_PER_SESSION }, () => video());
    expect(validateSelectionRule(videos)).toBeNull();
  });

  it('rejects one more than the cap, in one fresh selection', () => {
    const videos = Array.from({ length: MAX_VIDEOS_PER_SESSION + 1 }, () => video());
    expect(validateSelectionRule(videos)).toMatch(/vídeo/i);
  });

  it('rejects a pending video once existing + pending reach the cap', () => {
    expect(
      validateSelectionRule([video()], {
        type: 'video',
        imageCount: 0,
        videoCount: MAX_VIDEOS_PER_SESSION,
      }),
    ).toMatch(/vídeo/i);
  });

  it('allows a pending video when existing + pending stay under the cap', () => {
    if (MAX_VIDEOS_PER_SESSION < 2) return; // nothing under-cap to assert at cap 1
    expect(
      validateSelectionRule([video()], {
        type: 'video',
        imageCount: 0,
        videoCount: MAX_VIDEOS_PER_SESSION - 1,
      }),
    ).toBeNull();
  });
});

describe('mergeMediaSelection — picks accumulate across trips to the picker', () => {
  it('appends a second batch of photos to the first', () => {
    const a = file('a.jpg', 'image/jpeg');
    const b = file('b.jpg', 'image/jpeg');
    const c = file('c.jpg', 'image/jpeg');
    expect(mergeMediaSelection([a], [b, c])).toEqual([a, b, c]);
  });

  it('keeps the selection when the picker is dismissed with nothing', () => {
    const a = file('a.jpg', 'image/jpeg');
    expect(mergeMediaSelection([a], [])).toEqual([a]);
  });

  it('ignores a photo already selected (same name + size)', () => {
    const a = file('a.jpg', 'image/jpeg');
    const again = file('a.jpg', 'image/jpeg');
    const b = file('b.jpg', 'image/jpeg');
    expect(mergeMediaSelection([a], [again, b])).toEqual([a, b]);
  });

  it('accumulates past the cap so the selection rule can flag it', () => {
    const a = file('a.jpg', 'image/jpeg');
    const b = file('b.jpg', 'image/jpeg');
    const c = file('c.jpg', 'image/jpeg');
    const d = file('d.jpg', 'image/jpeg');
    const merged = mergeMediaSelection([a, b], [c, d]);
    expect(merged).toEqual([a, b, c, d]);
    expect(validateSelectionRule(merged)).toMatch(/3 fotos/i);
  });

  it('replaces pending photos when a video is picked', () => {
    const v = video();
    expect(mergeMediaSelection([image(), image()], [v])).toEqual([v]);
  });

  it('replaces a pending video when photos are picked', () => {
    const a = file('a.jpg', 'image/jpeg');
    expect(mergeMediaSelection([video()], [a])).toEqual([a]);
  });

  it('replaces a pending video when another video is picked', () => {
    const v1 = video();
    const v2 = file('other.mp4', 'video/mp4');
    expect(mergeMediaSelection([v1], [v2])).toEqual([v2]);
  });

  it('keeps an unsupported file so its per-file error still surfaces', () => {
    const a = file('a.jpg', 'image/jpeg');
    const pdf = file('doc.pdf', 'application/pdf');
    expect(mergeMediaSelection([a], [pdf])).toEqual([a, pdf]);
  });
});

describe('resolveMediaBatch — single-picker auto-replace (video wins)', () => {
  it('keeps only the video from a mixed batch', () => {
    const v = video();
    expect(resolveMediaBatch([image(), v, image()])).toEqual([v]);
  });

  it('trims a multi-video batch to the first MAX_VIDEOS_PER_SESSION videos', () => {
    const videos = Array.from({ length: MAX_VIDEOS_PER_SESSION + 1 }, () => video());
    expect(resolveMediaBatch(videos)).toEqual(videos.slice(0, MAX_VIDEOS_PER_SESSION));
  });

  it('keeps a video batch at or under the cap intact', () => {
    const videos = Array.from({ length: MAX_VIDEOS_PER_SESSION }, () => video());
    expect(resolveMediaBatch(videos)).toEqual(videos);
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
