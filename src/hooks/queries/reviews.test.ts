import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { reviewBySessionOptions } from './reviews';
import type { Review } from '@/types/api';

const API = 'http://localhost:8000';

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
