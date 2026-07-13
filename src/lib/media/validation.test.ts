import { describe, expect, it } from 'vitest';
import {
  classifyMedia,
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
