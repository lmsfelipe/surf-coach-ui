import * as React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { makeTestQueryClient } from '@/test/utils';
import { makeReview } from '@/test/fixtures';
import { reviewBySessionOptions, useReview, useReviewBySession } from './reviews';
import type { Review } from '@/types/api';

const API = 'http://localhost:8000';

function suspenseWrapper(queryClient = makeTestQueryClient()) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <React.Suspense fallback={<div>loading</div>}>{children}</React.Suspense>
    </QueryClientProvider>
  );
  return Wrapper;
}

/** Invoke the queryFn directly — no Suspense plumbing needed. */
function runQueryFn(sessionId: string) {
  const options = reviewBySessionOptions(sessionId);
  return (options.queryFn as () => Promise<Review | null>)();
}

describe('reviewBySessionOptions — 404-tolerant', () => {
  it('resolves to null on a 404 (no review yet)', async () => {
    // Default handler already returns REVIEW_NOT_FOUND (404).
    await expect(runQueryFn('s1')).resolves.toBeNull();
  });

  it('returns the review when present', async () => {
    const review: Partial<Review> = {
      id: 'r1',
      sessionId: 's1',
      overallScore: 6.7,
      narrative: 'Boa sessão.',
      improvementTips: ['a', 'b', 'c'],
    };
    server.use(
      http.get(`${API}/api/v1/sessions/:id/review`, () => HttpResponse.json(review)),
    );
    const result = await runQueryFn('s1');
    expect(result?.overallScore).toBe(6.7);
  });

  it('rethrows non-404 errors', async () => {
    server.use(
      http.get(`${API}/api/v1/sessions/:id/review`, () =>
        HttpResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'boom' } }, { status: 500 }),
      ),
    );
    await expect(runQueryFn('s1')).rejects.toThrow();
  });
});

describe('useReviewBySession', () => {
  it('resolves the review through Suspense', async () => {
    server.use(
      http.get(`${API}/api/v1/sessions/:id/review`, () =>
        HttpResponse.json(makeReview({ id: 'r1', sessionId: 's1', status: 'completed' })),
      ),
    );

    const { result } = renderHook(() => useReviewBySession('s1'), { wrapper: suspenseWrapper() });

    await waitFor(() => expect(result.current.data?.id).toBe('r1'));
    expect(result.current.timedOut).toBe(false);
  });
});

describe('useReview', () => {
  it('resolves the review by id through Suspense', async () => {
    server.use(
      http.get(`${API}/api/v1/reviews/:id`, () =>
        HttpResponse.json(makeReview({ id: 'r2', status: 'completed' })),
      ),
    );

    const { result } = renderHook(() => useReview('r2'), { wrapper: suspenseWrapper() });

    await waitFor(() => expect(result.current.data?.id).toBe('r2'));
  });
});
