import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { reviewsApi } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/errors';
import { qk } from '@/lib/queryKeys';
import type { Review } from '@/types/api';

/**
 * Review-by-session is 404-tolerant: a missing review resolves to `null` so the
 * "Sem análise" / "Gerar análise" states render without an error boundary
 * (Overview §8a). Real errors still throw.
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

export const useReviewBySession = (sessionId: string) =>
  useSuspenseQuery(reviewBySessionOptions(sessionId));
