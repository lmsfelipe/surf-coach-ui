import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { ApiError } from './errors';
import { uploadMedia } from './upload';
import type { BatchUploadResult, Media } from '@/types/api';

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
