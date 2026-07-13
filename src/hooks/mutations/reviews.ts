import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '@/lib/api/endpoints';
import { qk } from '@/lib/queryKeys';
import type { Review } from '@/types/api';

/**
 * Slow AI mutation (§4.3). Drive with <AIState/>, not a skeleton. Business
 * outcomes (ALREADY_EXISTS / NO_MEDIA / AI_FAIL) are handled at the call site.
 * On success, seed the 404-tolerant read so the review route shows instantly.
 */
export function useCreateReview(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => reviewsApi.create({ sessionId }),
    onSuccess: (review: Review) => {
      queryClient.setQueryData(qk.reviews.bySession(sessionId), review);
      queryClient.setQueryData(qk.reviews.detail(review.id), review);
    },
  });
}
