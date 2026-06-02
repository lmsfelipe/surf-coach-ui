import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        // Don't retry auth/validation/not-found; the wrapper handles 401 refresh.
        if (error instanceof ApiError && error.status < 500) return false;
        return failureCount < 2;
      },
    },
  },
});
