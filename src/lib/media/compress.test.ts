import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// compressorjs relies on a real <canvas>, which jsdom lacks — mock it and drive
// the success/error callback per test via `compressorImpl`.
let compressorImpl: (file: File, options: Record<string, any>) => void;

vi.mock('compressorjs', () => ({
  default: vi.fn().mockImplementation((file: File, options: Record<string, any>) => {
    compressorImpl(file, options);
  }),
}));

// Videos go through compressVideo (WebCodecs), which jsdom can't run — mock it.
vi.mock('./compressVideo', () => ({
  compressVideo: vi.fn((file: File) => Promise.resolve(file)),
}));

import Compressor from 'compressorjs';
import { compressBatch, compressImage } from './compress';
import { compressVideo } from './compressVideo';

const MockCompressor = vi.mocked(Compressor);
const mockCompressVideo = vi.mocked(compressVideo);

function file(name: string, type: string, size = 1024): File {
  const f = new File(['x'], name, { type });
  Object.defineProperty(f, 'size', { value: size });
  return f;
}

const image = () => file('photo.png', 'image/png', 4000);
const video = () => file('clip.mp4', 'video/mp4', 5000);

beforeEach(() => {
  vi.clearAllMocks();
  // (Re)establish the constructor mock each test — afterEach restore wipes it.
  MockCompressor.mockImplementation(((f: File, options: Record<string, any>) => {
    compressorImpl(f, options);
  }) as any);
  // Default: succeed, standing in a tiny blob for the compressed bytes.
  compressorImpl = (_file, options) => {
    options.success(new Blob(['tiny'], { type: 'image/jpeg' }));
  };
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('compressImage', () => {
  it('re-encodes an image to a .jpg File and requests JPEG output', async () => {
    const out = await compressImage(image());
    expect(out.type).toBe('image/jpeg');
    expect(out.name).toBe('photo.jpg');
    expect(Compressor).toHaveBeenCalledWith(
      expect.any(File),
      expect.objectContaining({ mimeType: 'image/jpeg' }),
    );
  });

  it('falls back to the original file when compression fails', async () => {
    const orig = image();
    compressorImpl = (_file, options) => options.error(new Error('boom'));
    const out = await compressImage(orig);
    expect(out).toBe(orig);
  });
});

describe('compressBatch', () => {
  it('delegates a video to compressVideo (never the image compressor)', async () => {
    const v = video();
    const [out] = await compressBatch([v]);
    expect(mockCompressVideo).toHaveBeenCalledWith(v, expect.anything());
    expect(out).toBe(v); // mock resolves to the same File
    expect(Compressor).not.toHaveBeenCalled();
  });

  it('compresses images and delegates videos within a mixed batch', async () => {
    const v = video();
    const out = await compressBatch([image(), v]);
    expect(out[0]?.type).toBe('image/jpeg');
    expect(out[0]?.name).toBe('photo.jpg');
    expect(out[1]).toBe(v);
    expect(mockCompressVideo).toHaveBeenCalledWith(v, expect.anything());
  });

  it('reports overall progress, ending at 1 when a video finishes', async () => {
    mockCompressVideo.mockImplementationOnce((file, opts) => {
      opts?.onProgress?.(0.5);
      return Promise.resolve(file);
    });
    const seen: number[] = [];
    await compressBatch([video()], (f) => seen.push(f));
    expect(seen).toEqual([0.5, 1]);
  });
});
