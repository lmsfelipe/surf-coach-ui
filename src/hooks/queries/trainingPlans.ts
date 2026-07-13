import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { trainingPlansApi } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/errors';
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

export const useTrainingPlans = () => useSuspenseQuery(trainingPlansListOptions());
export const usePlanByReview = (reviewId: string) =>
  useSuspenseQuery(planByReviewOptions(reviewId));
export const usePlan = (planId: string) => useSuspenseQuery(planQueryOptions(planId));
