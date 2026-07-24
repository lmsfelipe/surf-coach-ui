import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { trainingPlansApi } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/errors';
import { usePollingWindow } from '@/hooks/usePollingWindow';
import { qk } from '@/lib/queryKeys';
import type { TrainingPlan } from '@/types/api';

/** All training plans for the current profile (Treinos tab). */
export const trainingPlansListOptions = () =>
  queryOptions({
    queryKey: qk.trainingPlans.list(),
    queryFn: () => trainingPlansApi.list(),
  });

/** 404-tolerant: no plan yet for the review → `null` (Overview §8a). */
export const planByReviewOptions = (reviewId: string) =>
  queryOptions({
    queryKey: qk.trainingPlans.byReview(reviewId),
    queryFn: async (): Promise<TrainingPlan | null> => {
      try {
        return await trainingPlansApi.byReview(reviewId);
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      }
    },
  });

export const planQueryOptions = (planId: string) =>
  queryOptions({
    queryKey: qk.trainingPlans.detail(planId),
    queryFn: () => trainingPlansApi.detail(planId),
  });

/**
 * Treinos tab. Polls while any plan in the list is still generating — the
 * cards render a "Gerando…" badge, so the list has to be able to leave that
 * state without a manual reload.
 */
export function useTrainingPlans() {
  const poll = usePollingWindow();

  return useSuspenseQuery({
    ...trainingPlansListOptions(),
    refetchInterval: (q) => poll.interval(q.state.data),
  });
}

/**
 * Polls when status is "processing" (schedule in `usePollingWindow`; the
 * window re-arms after a retry). `timedOut` signals the window expired.
 */
export function usePlanByReview(reviewId: string) {
  const poll = usePollingWindow();

  const query = useSuspenseQuery({
    ...planByReviewOptions(reviewId),
    refetchInterval: (q) => poll.interval(q.state.data),
  });

  return { ...query, timedOut: poll.expired(query.data, query.isFetching) };
}

/** Polls the plan detail endpoint when status is "processing". */
export function usePlan(planId: string) {
  const poll = usePollingWindow();

  const query = useSuspenseQuery({
    ...planQueryOptions(planId),
    refetchInterval: (q) => poll.interval(q.state.data),
  });

  return { ...query, timedOut: poll.expired(query.data, query.isFetching) };
}
