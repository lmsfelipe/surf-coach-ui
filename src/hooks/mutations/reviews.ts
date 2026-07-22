import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/errors';
import { qk } from '@/lib/queryKeys';
import type { Review } from '@/types/api';

/**
 * Creates a review. Backend now returns 202 with status:"processing" immediately.
 * Seeds both caches so useReviewBySession starts polling from the right state.
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

/**
 * Re-enqueues a failed review. On success, updates both caches so polling
 * resumes automatically. On 409 (not retryable), invalidates to resync state.
 */
export function useRetryReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId }: { reviewId: string }) => reviewsApi.retry(reviewId),
    onSuccess: (review: Review) => {
      queryClient.setQueryData(qk.reviews.detail(review.id), review);
      queryClient.setQueryData(qk.reviews.bySession(review.sessionId), review);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === 'REVIEW_NOT_RETRYABLE') {
        // Resync every review cache — the screens render from the by-session
        // key, not the detail key, so a prefix invalidation covers both.
        void queryClient.invalidateQueries({ queryKey: qk.reviews.all() });
      }
    },
  });
}
