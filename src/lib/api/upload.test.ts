import { beforeEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { makeAuthSession } from '@/test/fixtures';
import { ApiError, NetworkError } from './errors';
import { uploadMedia } from './upload';
import type { BatchUploadResult, Media } from '@/types/api';

vi.mock('@/lib/supabase', () => ({
  supabase: { auth: { refreshSession: vi.fn() } },
}));

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

const API = 'http://localhost:8000';
const UPLOAD = `${API}/api/v1/sessions/:sessionId/media/`;

function media(overrides: Partial<Media> = {}): Media {
  return {
    id: 'm1',
    sessionId: 's1',
    mediaType: 'image',
    contentUrl: '/api/v1/media/m1/content?token=t',
    fileName: 'wave1.jpg',
    fileSizeBytes: 1234,
    durationSeconds: null,
    createdAt: '2026-08-03T00:00:00Z',
    ...overrides,
  };
}

function photo(name: string): File {
  return new File(['x'], name, { type: 'image/jpeg' });
}

function envelope(code: string, message: string, details: unknown = null) {
  return { error: { code, message, details } };
}

describe('uploadMedia — status branching (§11.3)', () => {
  it('201 full success → { succeeded, failed: [] }', async () => {
    const rows = [media({ id: 'm1', fileName: 'a.jpg' }), media({ id: 'm2', fileName: 'b.jpg' })];
    server.use(http.post(UPLOAD, () => HttpResponse.json(rows, { status: 201 })));

    const result = await uploadMedia('s1', [photo('a.jpg'), photo('b.jpg')]);

    expect(result.failed).toEqual([]);
    expect(result.succeeded.map((m) => m.id)).toEqual(['m1', 'm2']);
  });

  it('207 partial → succeeded + failed both surfaced, not thrown', async () => {
    const body: BatchUploadResult = {
      succeeded: [media({ id: 'm1', fileName: 'a.jpg' }), media({ id: 'm2', fileName: 'b.jpg' })],
      failed: [
        {
          fileName: 'c.jpg',
          code: 'STORAGE_UPLOAD_FAILED',
          message: 'Media upload failed.',
          details: null,
        },
      ],
    };
    server.use(http.post(UPLOAD, () => HttpResponse.json(body, { status: 207 })));

    const result = await uploadMedia('s1', [photo('a.jpg'), photo('b.jpg'), photo('c.jpg')]);

    expect(result.succeeded).toHaveLength(2);
    expect(result.failed).toHaveLength(1);
    expect(result.failed[0]).toMatchObject({ fileName: 'c.jpg', code: 'STORAGE_UPLOAD_FAILED' });
  });

  it('502 all-failed → throws ApiError with STORAGE_UPLOAD_FAILED', async () => {
    server.use(
      http.post(UPLOAD, () =>
        HttpResponse.json(envelope('STORAGE_UPLOAD_FAILED', 'Media upload failed.'), {
          status: 502,
        }),
      ),
    );

    await expect(uploadMedia('s1', [photo('a.jpg')])).rejects.toMatchObject({
      code: 'STORAGE_UPLOAD_FAILED',
      status: 502,
    });
  });

  it('422 moderation still throws (whole-request, unchanged)', async () => {
    server.use(
      http.post(UPLOAD, () =>
        HttpResponse.json(envelope('EXPLICIT_CONTENT', 'Explicit content.'), { status: 422 }),
      ),
    );

    const err = await uploadMedia('s1', [photo('a.jpg')]).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).code).toBe('EXPLICIT_CONTENT');
  });
});

describe('uploadMedia — 401 refresh & retry', () => {
  beforeEach(() => {
    useAuthStore.setState({ session: makeAuthSession('user-a'), user: null, initialized: true });
    vi.clearAllMocks();
  });

  it('401 → refresh OK → retry 201 resolves, and the retry XHR carries the new token', async () => {
    const seenAuth: (string | null)[] = [];
    let call = 0;
    server.use(
      http.post(UPLOAD, ({ request }) => {
        seenAuth.push(request.headers.get('Authorization'));
        return ++call === 1
          ? HttpResponse.json(envelope('INVALID_TOKEN', 'Token expired.'), { status: 401 })
          : HttpResponse.json([media({ id: 'm1' })], { status: 201 });
      }),
    );
    vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
      data: { session: makeAuthSession('user-a-refreshed') },
      error: null,
    } as never);

    const result = await uploadMedia('s1', [photo('a.jpg')]);

    expect(result.succeeded).toHaveLength(1);
    expect(call).toBe(2);
    expect(seenAuth[0]).toBe('Bearer token-user-a');
    expect(seenAuth[1]).toBe('Bearer token-user-a-refreshed');
  });

  it('401 → refresh returns null throws ApiError and makes no second XHR', async () => {
    let calls = 0;
    server.use(
      http.post(UPLOAD, () => {
        calls += 1;
        return HttpResponse.json(envelope('INVALID_TOKEN', 'Token expired.'), { status: 401 });
      }),
    );
    vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as never);

    await expect(uploadMedia('s1', [photo('a.jpg')])).rejects.toBeInstanceOf(ApiError);
    expect(calls).toBe(1);
  });
});

describe('uploadMedia — network failures', () => {
  it('rejects with NetworkError on xhr.onerror', async () => {
    server.use(http.post(UPLOAD, () => HttpResponse.error()));

    await expect(uploadMedia('s1', [photo('a.jpg')])).rejects.toBeInstanceOf(NetworkError);
  });

  // MSW's Node XHR interceptor doesn't implement `.abort()` propagation, so a
  // real mid-flight abort can't be exercised through it. Use a fully-controlled
  // fake XHR to test upload.ts's own abort wiring (signal → xhr.abort() → onabort).
  it('rejects with NetworkError("Envio cancelado") when aborted mid-flight', async () => {
    class FakeXHR {
      upload: { onprogress: ((e: ProgressEvent) => void) | null } = { onprogress: null };
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      onabort: (() => void) | null = null;
      status = 0;
      responseText = '';
      open = vi.fn();
      setRequestHeader = vi.fn();
      send = vi.fn();
      abort = vi.fn(() => this.onabort?.());
    }
    const OriginalXHR = window.XMLHttpRequest;
    Object.defineProperty(window, 'XMLHttpRequest', { configurable: true, value: FakeXHR });

    try {
      const controller = new AbortController();
      const promise = uploadMedia('s1', [photo('a.jpg')], { signal: controller.signal });
      controller.abort();

      await expect(promise).rejects.toMatchObject({ message: 'Envio cancelado' });
    } finally {
      Object.defineProperty(window, 'XMLHttpRequest', { configurable: true, value: OriginalXHR });
    }
  });
});

describe('uploadMedia — progress', () => {
  it('reports rounded 0–100 percentages via onProgress', async () => {
    server.use(http.post(UPLOAD, () => HttpResponse.json([media()], { status: 201 })));
    const seen: number[] = [];

    await uploadMedia('s1', [photo('a.jpg')], { onProgress: (percent) => seen.push(percent) });

    for (const percent of seen) {
      expect(Number.isInteger(percent)).toBe(true);
      expect(percent).toBeGreaterThanOrEqual(0);
      expect(percent).toBeLessThanOrEqual(100);
    }
  });
});
