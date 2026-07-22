import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { reviewsApi } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/errors';
import { usePollingWindow } from '@/hooks/usePollingWindow';
import { qk } from '@/lib/queryKeys';
import type { Review } from '@/types/api';

/**
 * Review-by-session is 404-tolerant: a missing review resolves to `null` so the
 * "Sem análise" / "Gerar análise" states render without an error boundary
 * (Overview §8a). Real errors still throw.
 *
 * When status is "processing", polls per the schedule in `usePollingWindow`.
 * The window is anchored to the current processing attempt (re-arms after a
 * retry), not to component mount. `timedOut` is true when the window expired
 * but the review is still processing.
 */
export const reviewBySessionOptions = (sessionId: string) =>
  queryOptions({
    queryKey: qk.reviews.bySession(sessionId),
    queryFn: async (): Promise<Review | null> => {
      try {
        return await reviewsApi.bySession(sessionId);
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      }
    },
  });

export const reviewDetailOptions = (reviewId: string) =>
  queryOptions({
    queryKey: qk.reviews.detail(reviewId),
    queryFn: () => reviewsApi.detail(reviewId),
  });

export function useReviewBySession(sessionId: string) {
  const poll = usePollingWindow();

  const query = useSuspenseQuery({
    ...reviewBySessionOptions(sessionId),
    refetchInterval: (q) => poll.interval(q.state.data),
  });

  return { ...query, timedOut: poll.expired(query.data, query.isFetching) };
}

/** Polls the review detail endpoint. Used when navigating directly to a review by ID. */
export function useReview(reviewId: string) {
  const poll = usePollingWindow();

  const query = useSuspenseQuery({
    ...reviewDetailOptions(reviewId),
    refetchInterval: (q) => poll.interval(q.state.data),
  });

  return { ...query, timedOut: poll.expired(query.data, query.isFetching) };
}
