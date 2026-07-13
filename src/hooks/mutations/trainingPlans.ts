import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trainingPlansApi } from '@/lib/api/endpoints';
import { qk } from '@/lib/queryKeys';
import type { TrainingPlan } from '@/types/api';

/**
 * Slow AI mutation (§4.3). On success seed the by-review + detail caches so the
 * plan route renders without a refetch. ALREADY_EXISTS / AI_FAIL handled at the
 * call site.
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
