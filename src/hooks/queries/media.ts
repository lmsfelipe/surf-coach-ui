import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { mediaApi } from '@/lib/api/endpoints';
import { qk } from '@/lib/queryKeys';

export const mediaQueryOptions = (sessionId: string) =>
  queryOptions({
    queryKey: qk.media.bySession(sessionId),
    queryFn: () => mediaApi.bySession(sessionId),
    // contentUrl tokens expire in ~15min — refetch fresh ones before then.
    staleTime: 10 * 60 * 1000,
  });

export const useSessionMedia = (sessionId: string) =>
  useSuspenseQuery(mediaQueryOptions(sessionId));
