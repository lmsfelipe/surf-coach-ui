import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { makeCacheInspectionQueryClient, queryWrapper } from '@/test/utils';
import { makeTrainingPlan } from '@/test/fixtures';
import { qk } from '@/lib/queryKeys';
import { useCreateTrainingPlan, useRetryTrainingPlan } from './trainingPlans';

const API = 'http://localhost:8000';

describe('useCreateTrainingPlan', () => {
  it('seeds both caches and invalidates the list', async () => {
    server.use(
      http.post(`${API}/api/v1/training-plans/`, () =>
        HttpResponse.json(makeTrainingPlan({ id: 'plan1', reviewId: 'r1', status: 'processing' }), {
          status: 202,
        }),
      ),
    );
    const { Wrapper, queryClient } = queryWrapper(makeCacheInspectionQueryClient());
    queryClient.setQueryData(qk.trainingPlans.list(), []);

    const { result } = renderHook(() => useCreateTrainingPlan('r1'), { wrapper: Wrapper });
    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(queryClient.getQueryData(qk.trainingPlans.byReview('r1'))).toMatchObject({
      id: 'plan1',
      status: 'processing',
    });
    expect(queryClient.getQueryData(qk.trainingPlans.detail('plan1'))).toMatchObject({
      status: 'processing',
    });
    expect(queryClient.getQueryState(qk.trainingPlans.list())?.isInvalidated).toBe(true);
  });
});

describe('useRetryTrainingPlan', () => {
  it('seeds both caches and invalidates the list on success', async () => {
    server.use(
      http.post(`${API}/api/v1/training-plans/:planId/retry`, () =>
        HttpResponse.json(makeTrainingPlan({ id: 'plan1', reviewId: 'r1', status: 'processing' })),
      ),
    );
    const { Wrapper, queryClient } = queryWrapper(makeCacheInspectionQueryClient());
    queryClient.setQueryData(qk.trainingPlans.list(), []);

    const { result } = renderHook(() => useRetryTrainingPlan(), { wrapper: Wrapper });
    await act(async () => {
      await result.current.mutateAsync({ planId: 'plan1' });
    });

    expect(queryClient.getQueryData(qk.trainingPlans.detail('plan1'))).toMatchObject({
      status: 'processing',
    });
    expect(queryClient.getQueryData(qk.trainingPlans.byReview('r1'))).toMatchObject({
      status: 'processing',
    });
    expect(queryClient.getQueryState(qk.trainingPlans.list())?.isInvalidated).toBe(true);
  });

  it('invalidates every plan cache on a 409 TRAINING_PLAN_NOT_RETRYABLE error', async () => {
    server.use(
      http.post(`${API}/api/v1/training-plans/:planId/retry`, () =>
        HttpResponse.json(
          { error: { code: 'TRAINING_PLAN_NOT_RETRYABLE', message: 'not retryable' } },
          { status: 409 },
        ),
      ),
    );
    const { Wrapper, queryClient } = queryWrapper(makeCacheInspectionQueryClient());
    queryClient.setQueryData(
      qk.trainingPlans.byReview('r1'),
      makeTrainingPlan({ id: 'plan1', reviewId: 'r1' }),
    );

    const { result } = renderHook(() => useRetryTrainingPlan(), { wrapper: Wrapper });
    await act(async () => {
      await result.current.mutateAsync({ planId: 'plan1' }).catch(() => {});
    });

    expect(queryClient.getQueryState(qk.trainingPlans.byReview('r1'))?.isInvalidated).toBe(true);
  });
});
