import * as React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { makeTestQueryClient } from '@/test/utils';
import { makeTrainingPlan } from '@/test/fixtures';
import { qk } from '@/lib/queryKeys';
import {
  planByReviewOptions,
  planQueryOptions,
  trainingPlansListOptions,
  usePlan,
  usePlanByReview,
  useTrainingPlans,
} from './trainingPlans';
import type { TrainingPlan } from '@/types/api';

const API = 'http://localhost:8000';

function suspenseWrapper(queryClient = makeTestQueryClient()) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <React.Suspense fallback={<div>loading</div>}>{children}</React.Suspense>
    </QueryClientProvider>
  );
  return Wrapper;
}

describe('trainingPlansListOptions', () => {
  it('uses the list key and unwraps the paginated { items, total } envelope', async () => {
    const options = trainingPlansListOptions();
    expect(options.queryKey).toEqual(qk.trainingPlans.list());

    const result = await (options.queryFn as () => Promise<TrainingPlan[]>)();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('planByReviewOptions — 404-tolerant', () => {
  function runQueryFn(reviewId: string) {
    const options = planByReviewOptions(reviewId);
    return (options.queryFn as () => Promise<TrainingPlan | null>)();
  }

  it('resolves to null on a 404 (no plan generated yet)', async () => {
    server.use(
      http.get(`${API}/api/v1/reviews/:reviewId/training-plan`, () =>
        HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'not found' } }, { status: 404 }),
      ),
    );
    await expect(runQueryFn('r1')).resolves.toBeNull();
  });

  it('returns the plan when present', async () => {
    const result = await runQueryFn('r1');
    expect(result?.reviewId).toBe('r1');
  });

  it('rethrows non-404 errors', async () => {
    server.use(
      http.get(`${API}/api/v1/reviews/:reviewId/training-plan`, () =>
        HttpResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'boom' } }, { status: 500 }),
      ),
    );
    await expect(runQueryFn('r1')).rejects.toThrow();
  });
});

describe('planQueryOptions', () => {
  it('uses the plan detail key and resolves the plan by id', async () => {
    const options = planQueryOptions('plan1');
    expect(options.queryKey).toEqual(qk.trainingPlans.detail('plan1'));

    const result = await (options.queryFn as () => Promise<TrainingPlan>)();
    expect(result.id).toBe('plan1');
  });
});

describe('useTrainingPlans', () => {
  it('resolves the plan list through Suspense', async () => {
    server.use(
      http.get(`${API}/api/v1/training-plans/`, () =>
        HttpResponse.json({ items: [makeTrainingPlan({ id: 'plan1', status: 'completed' })], total: 1 }),
      ),
    );

    const { result } = renderHook(() => useTrainingPlans(), { wrapper: suspenseWrapper() });

    await waitFor(() => expect(result.current.data).toHaveLength(1));
  });
});

describe('usePlanByReview', () => {
  it('resolves the plan for a review through Suspense', async () => {
    server.use(
      http.get(`${API}/api/v1/reviews/:reviewId/training-plan`, () =>
        HttpResponse.json(makeTrainingPlan({ id: 'plan1', reviewId: 'r1', status: 'completed' })),
      ),
    );

    const { result } = renderHook(() => usePlanByReview('r1'), { wrapper: suspenseWrapper() });

    await waitFor(() => expect(result.current.data?.id).toBe('plan1'));
    expect(result.current.timedOut).toBe(false);
  });
});

describe('usePlan', () => {
  it('resolves the plan by id through Suspense', async () => {
    server.use(
      http.get(`${API}/api/v1/training-plans/:planId`, () =>
        HttpResponse.json(makeTrainingPlan({ id: 'plan2', status: 'completed' })),
      ),
    );

    const { result } = renderHook(() => usePlan('plan2'), { wrapper: suspenseWrapper() });

    await waitFor(() => expect(result.current.data?.id).toBe('plan2'));
  });
});
