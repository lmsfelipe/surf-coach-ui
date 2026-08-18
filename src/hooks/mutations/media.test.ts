import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { makeCacheInspectionQueryClient, queryWrapper } from '@/test/utils';
import { makeMedia } from '@/test/fixtures';
import { qk } from '@/lib/queryKeys';
import { useDeleteMedia, useUploadMedia } from './media';

const API = 'http://localhost:8000';

function photo(name: string): File {
  return new File(['x'], name, { type: 'image/jpeg' });
}

describe('useUploadMedia', () => {
  it('invalidates the session media cache when at least one file succeeds', async () => {
    server.use(
      http.post(`${API}/api/v1/sessions/:sessionId/media/`, () =>
        HttpResponse.json([makeMedia({ id: 'm1' })], { status: 201 }),
      ),
    );
    const { Wrapper, queryClient } = queryWrapper(makeCacheInspectionQueryClient());
    queryClient.setQueryData(qk.media.bySession('s1'), []);

    const { result } = renderHook(() => useUploadMedia('s1'), { wrapper: Wrapper });
    await act(async () => {
      await result.current.mutateAsync({ files: [photo('a.jpg')] });
    });

    expect(queryClient.getQueryState(qk.media.bySession('s1'))?.isInvalidated).toBe(true);
  });

  it('does not invalidate when every file fails storage (empty succeeded, 207)', async () => {
    server.use(
      http.post(`${API}/api/v1/sessions/:sessionId/media/`, () =>
        HttpResponse.json(
          {
            succeeded: [],
            failed: [
              { fileName: 'a.jpg', code: 'STORAGE_UPLOAD_FAILED', message: 'failed', details: null },
            ],
          },
          { status: 207 },
        ),
      ),
    );
    const { Wrapper, queryClient } = queryWrapper(makeCacheInspectionQueryClient());
    queryClient.setQueryData(qk.media.bySession('s1'), []);

    const { result } = renderHook(() => useUploadMedia('s1'), { wrapper: Wrapper });
    await act(async () => {
      await result.current.mutateAsync({ files: [photo('a.jpg')] });
    });

    expect(queryClient.getQueryState(qk.media.bySession('s1'))?.isInvalidated).toBe(false);
  });
});

describe('useDeleteMedia', () => {
  it('invalidates the session media cache on success', async () => {
    const { Wrapper, queryClient } = queryWrapper(makeCacheInspectionQueryClient());
    queryClient.setQueryData(qk.media.bySession('s1'), [makeMedia({ id: 'm1' })]);

    const { result } = renderHook(() => useDeleteMedia('s1'), { wrapper: Wrapper });
    await act(async () => {
      await result.current.mutateAsync('m1');
    });

    expect(queryClient.getQueryState(qk.media.bySession('s1'))?.isInvalidated).toBe(true);
  });
});
