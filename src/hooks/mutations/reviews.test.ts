import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { makeCacheInspectionQueryClient, queryWrapper } from '@/test/utils';
import { makeReview } from '@/test/fixtures';
import { qk } from '@/lib/queryKeys';
import { useCreateReview, useRetryReview } from './reviews';

const API = 'http://localhost:8000';

describe('useCreateReview', () => {
  it('seeds both the by-session and detail caches with the processing review', async () => {
    server.use(
      http.post(`${API}/api/v1/reviews/`, () =>
        HttpResponse.json(makeReview({ id: 'r1', sessionId: 's1', status: 'processing' }), {
          status: 202,
        }),
      ),
    );
    const { Wrapper, queryClient } = queryWrapper(makeCacheInspectionQueryClient());

    const { result } = renderHook(() => useCreateReview('s1'), { wrapper: Wrapper });
    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(queryClient.getQueryData(qk.reviews.bySession('s1'))).toMatchObject({
      id: 'r1',
      status: 'processing',
    });
    expect(queryClient.getQueryData(qk.reviews.detail('r1'))).toMatchObject({
      id: 'r1',
      status: 'processing',
    });
  });
});

describe('useRetryReview', () => {
  it('seeds both caches with the re-enqueued review on success', async () => {
    server.use(
      http.post(`${API}/api/v1/reviews/:id/retry`, () =>
        HttpResponse.json(makeReview({ id: 'r1', sessionId: 's1', status: 'processing' })),
      ),
    );
    const { Wrapper, queryClient } = queryWrapper(makeCacheInspectionQueryClient());

    const { result } = renderHook(() => useRetryReview(), { wrapper: Wrapper });
    await act(async () => {
      await result.current.mutateAsync({ reviewId: 'r1' });
    });

    expect(queryClient.getQueryData(qk.reviews.detail('r1'))).toMatchObject({ status: 'processing' });
    expect(queryClient.getQueryData(qk.reviews.bySession('s1'))).toMatchObject({ status: 'processing' });
  });

  it('invalidates every review cache on a 409 REVIEW_NOT_RETRYABLE error', async () => {
    server.use(
      http.post(`${API}/api/v1/reviews/:id/retry`, () =>
        HttpResponse.json(
          { error: { code: 'REVIEW_NOT_RETRYABLE', message: 'not retryable' } },
          { status: 409 },
        ),
      ),
    );
    const { Wrapper, queryClient } = queryWrapper(makeCacheInspectionQueryClient());
    queryClient.setQueryData(qk.reviews.bySession('s1'), makeReview({ id: 'r1', sessionId: 's1' }));

    const { result } = renderHook(() => useRetryReview(), { wrapper: Wrapper });
    await act(async () => {
      await result.current.mutateAsync({ reviewId: 'r1' }).catch(() => {});
    });

    expect(queryClient.getQueryState(qk.reviews.bySession('s1'))?.isInvalidated).toBe(true);
  });
});
