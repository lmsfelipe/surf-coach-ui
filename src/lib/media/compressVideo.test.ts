import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  canEncodeVideo: vi.fn(),
  getPrimaryVideoTrack: vi.fn(),
  conversionInit: vi.fn(),
  execute: vi.fn(),
  isValid: true,
  lastBufferTarget: null as { buffer: ArrayBuffer | null } | null,
}));

vi.mock('mediabunny', () => {
  class BufferTarget {
    buffer: ArrayBuffer | null = null;
    constructor() {
      mocks.lastBufferTarget = this;
    }
  }
  class Input {
    getPrimaryVideoTrack = mocks.getPrimaryVideoTrack;
    dispose = vi.fn();
    constructor(_opts: unknown) {}
  }
  class BlobSource {
    constructor(_file: File) {}
  }
  class Output {
    target: BufferTarget;
    constructor(opts: { target: BufferTarget }) {
      this.target = opts.target;
    }
  }
  class Mp4OutputFormat {}
  return {
    ALL_FORMATS: {},
    BlobSource,
    BufferTarget,
    Conversion: { init: mocks.conversionInit },
    Input,
    Mp4OutputFormat,
    Output,
    Quality: {},
    QUALITY_HIGH: 'high',
    QUALITY_LOW: 'low',
    QUALITY_MEDIUM: 'medium',
    canEncodeVideo: mocks.canEncodeVideo,
  };
});

vi.mock('./webcodecsSafariShim', () => ({ installWebCodecsSafariShim: vi.fn() }));

function videoFile(name: string, size: number): File {
  const f = new File([new Uint8Array(size)], name, { type: 'video/quicktime' });
  Object.defineProperty(f, 'size', { value: size });
  return f;
}

beforeEach(() => {
  vi.resetModules();
  mocks.canEncodeVideo.mockReset();
  mocks.getPrimaryVideoTrack.mockReset().mockResolvedValue({ displayHeight: 1080 });
  mocks.conversionInit.mockReset().mockImplementation(async () => ({
    isValid: mocks.isValid,
    execute: mocks.execute,
  }));
  mocks.execute.mockReset().mockResolvedValue(undefined);
  mocks.isValid = true;
  mocks.lastBufferTarget = null;
  (window as unknown as { VideoEncoder?: unknown }).VideoEncoder = class {};
});

afterEach(() => {
  delete (window as unknown as { VideoEncoder?: unknown }).VideoEncoder;
});

describe('compressVideo — skip path', () => {
  it('returns the original file untouched when WebCodecs cannot encode H.264', async () => {
    mocks.canEncodeVideo.mockResolvedValue(false);
    const { compressVideo } = await import('./compressVideo');
    const file = videoFile('clip.mov', 5000);

    const result = await compressVideo(file);

    expect(result).toBe(file);
    expect(mocks.conversionInit).not.toHaveBeenCalled();
  });
});

describe('compressVideo — success path', () => {
  it('returns a smaller H.264/AAC MP4 File when compression shrinks the source', async () => {
    mocks.canEncodeVideo.mockResolvedValue(true);
    mocks.execute.mockImplementation(async () => {
      mocks.lastBufferTarget!.buffer = new ArrayBuffer(10);
    });
    const { compressVideo } = await import('./compressVideo');
    const file = videoFile('clip.mov', 5000);

    const result = await compressVideo(file);

    expect(result).not.toBe(file);
    expect(result.name).toBe('clip.mp4');
    expect(result.type).toBe('video/mp4');
    expect(result.size).toBeLessThan(file.size);
  });

  it('falls back to the original file when the "compressed" output is not smaller', async () => {
    mocks.canEncodeVideo.mockResolvedValue(true);
    mocks.execute.mockImplementation(async () => {
      mocks.lastBufferTarget!.buffer = new ArrayBuffer(10_000); // bigger than the source
    });
    const { compressVideo } = await import('./compressVideo');
    const file = videoFile('clip.mov', 5000);

    const result = await compressVideo(file);

    expect(result).toBe(file);
  });
});

describe('compressVideo — failure fallback', () => {
  it('falls back to the original file when the conversion pipeline is invalid', async () => {
    mocks.canEncodeVideo.mockResolvedValue(true);
    mocks.isValid = false;
    const { compressVideo } = await import('./compressVideo');
    const file = videoFile('clip.mov', 5000);

    const result = await compressVideo(file);

    expect(result).toBe(file);
    expect(mocks.execute).not.toHaveBeenCalled();
  });

  it('falls back to the original file and calls onError when execute() throws', async () => {
    mocks.canEncodeVideo.mockResolvedValue(true);
    const boom = new Error('encode failed');
    mocks.execute.mockRejectedValue(boom);
    const { compressVideo } = await import('./compressVideo');
    const file = videoFile('clip.mov', 5000);
    const onError = vi.fn();

    const result = await compressVideo(file, { onError });

    expect(result).toBe(file);
    expect(onError).toHaveBeenCalledWith(boom);
  });
});

describe('compressVideo — WebCodecs Safari shim', () => {
  it('installs the shim on module import', async () => {
    const { installWebCodecsSafariShim } = await import('./webcodecsSafariShim');
    await import('./compressVideo');

    expect(installWebCodecsSafariShim).toHaveBeenCalled();
  });
});
