import { api } from '../client';
import type { CreateReviewPayload, Review } from '@/types/api';

export const reviewsApi = {
  /** May 404 when no review exists yet — call sites tolerate it (Overview §8a). */
  bySession: (sessionId: string) =>
    api.get<Review>(`/api/v1/sessions/${sessionId}/review`),
  detail: (id: string) => api.get<Review>(`/api/v1/reviews/${id}`),
  /** Returns 202 with status:"processing" — seed cache and poll via detail. */
  create: (payload: CreateReviewPayload) => api.post<Review>('/api/v1/reviews/', payload),
  /** Re-enqueues a failed review. Returns 409 if not in "failed" state. */
  retry: (reviewId: string) => api.post<Review>(`/api/v1/reviews/${reviewId}/retry`, {}),
};
