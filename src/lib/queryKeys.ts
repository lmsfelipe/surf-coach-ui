/**
 * Centralized query-key factory. Use these everywhere — never inline arrays.
 * Overview §5.3.
 */
export const qk = {
  profile: {
    me: () => ['profile', 'me'] as const,
  },
  surfboards: {
    all: () => ['surfboards'] as const,
    list: () => ['surfboards', 'list'] as const,
    detail: (id: string) => ['surfboards', 'detail', id] as const,
  },
  sessions: {
    all: () => ['sessions'] as const,
    list: () => ['sessions', 'list'] as const,
    detail: (id: string) => ['sessions', 'detail', id] as const,
  },
  media: {
    bySession: (sessionId: string) => ['media', 'session', sessionId] as const,
    detail: (id: string) => ['media', 'detail', id] as const,
  },
  reviews: {
    all: () => ['reviews'] as const,
    bySession: (sessionId: string) => ['reviews', 'session', sessionId] as const,
    detail: (id: string) => ['reviews', 'detail', id] as const,
  },
  trainingPlans: {
    all: () => ['trainingPlans'] as const,
    list: () => ['trainingPlans', 'list'] as const,
    byReview: (reviewId: string) => ['trainingPlans', 'review', reviewId] as const,
    detail: (planId: string) => ['trainingPlans', 'detail', planId] as const,
  },
} as const;
