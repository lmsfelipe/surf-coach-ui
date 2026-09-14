import { useEffect, useRef } from 'react';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { reviewsApi } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/errors';
import { usePollingWindow } from '@/hooks/usePollingWindow';
import { trackEvent } from '@/lib/analytics';
import { qk } from '@/lib/queryKeys';
import type { Review } from '@/types/api';

/**
 * Fires a GA event the first time a review settles into 'completed'/'failed'
 * (not on every poll that returns the same status). Keyed by review id so a
 * retry — which re-arms status back to 'processing' under the same id — can
 * report a later completion too.
 */
function useTrackReviewOutcome(review: Review | null | undefined) {
  const firedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!review || (review.status !== 'completed' && review.status !== 'failed')) return;
    const key = `${review.id}:${review.status}`;
    if (firedFor.current === key) return;
    firedFor.current = key;
    if (review.status === 'completed') {
      trackEvent('review_completed', { overallScore: review.overallScore ?? undefined });
    } else {
      trackEvent('review_failed', { stage: 'processing' });
    }
  }, [review]);
}

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

  useTrackReviewOutcome(query.data);

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
