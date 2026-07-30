import { describe, expect, it } from 'vitest';
import {
  classifyMedia,
  resolveMediaBatch,
  validateFileSync,
  validateSelectionRule,
} from './validation';
import { MAX_FILE_SIZE_BYTES } from '@/config/constants';

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

  it('flags an oversized file', () => {
    const big = file('huge.mp4', 'video/mp4', MAX_FILE_SIZE_BYTES + 1);
    expect(validateFileSync(big)?.code).toBe('FILE_TOO_LARGE');
  });
});
