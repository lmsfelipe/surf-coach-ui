import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { sessionsApi } from '@/lib/api/endpoints';
import { qk } from '@/lib/queryKeys';

export const sessionsQueryOptions = () =>
  queryOptions({ queryKey: qk.sessions.list(), queryFn: () => sessionsApi.list() });

export const sessionQueryOptions = (id: string) =>
  queryOptions({ queryKey: qk.sessions.detail(id), queryFn: () => sessionsApi.detail(id) });

export const useSessions = () => useSuspenseQuery(sessionsQueryOptions());
export const useSession = (id: string) => useSuspenseQuery(sessionQueryOptions(id));
