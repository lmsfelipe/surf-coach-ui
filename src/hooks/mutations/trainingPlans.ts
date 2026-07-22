import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trainingPlansApi } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/errors';
import { qk } from '@/lib/queryKeys';
import type { TrainingPlan } from '@/types/api';

/**
 * Creates a training plan. Backend returns 202 with status:"processing".
 * Seeds both caches so usePlanByReview starts polling from the right state.
 */
export function useCreateTrainingPlan(reviewId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => trainingPlansApi.create({ reviewId }),
    onSuccess: (plan: TrainingPlan) => {
      queryClient.setQueryData(qk.trainingPlans.byReview(reviewId), plan);
      queryClient.setQueryData(qk.trainingPlans.detail(plan.id), plan);
    },
  });
}

/**
 * Re-enqueues a failed training plan. On success, updates both caches so
 * polling resumes automatically. On 409 (not retryable), invalidates to resync.
 */
export function useRetryTrainingPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId }: { planId: string }) => trainingPlansApi.retry(planId),
    onSuccess: (plan: TrainingPlan) => {
      queryClient.setQueryData(qk.trainingPlans.detail(plan.id), plan);
      queryClient.setQueryData(qk.trainingPlans.byReview(plan.reviewId), plan);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === 'TRAINING_PLAN_NOT_RETRYABLE') {
        // Resync every plan cache — the screens render from the by-review
        // key, not the detail key, so a prefix invalidation covers both.
        void queryClient.invalidateQueries({ queryKey: qk.trainingPlans.all() });
      }
    },
  });
}
