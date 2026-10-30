import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { sessionsApi } from '@/lib/api/endpoints';
import { usePollingWindow } from '@/hooks/usePollingWindow';
import { qk } from '@/lib/queryKeys';
import type { SessionListItem, SessionReviewSummary } from '@/types/api';

export const sessionsQueryOptions = () =>
  queryOptions({ queryKey: qk.sessions.list(), queryFn: () => sessionsApi.list() });

export const sessionQueryOptions = (id: string) =>
  queryOptions({ queryKey: qk.sessions.detail(id), queryFn: () => sessionsApi.detail(id) });

function reviewsOf(sessions: SessionListItem[] | undefined): SessionReviewSummary[] {
  return sessions?.flatMap((s) => (s.review ? [s.review] : [])) ?? [];
}

/**
 * The sessions list. Each row carries its review summary, so the list costs one
 * request however many sessions there are; while any review is still
 * processing, the whole list polls (one request per tick, not one per row).
 */
export function useSessions() {
  const poll = usePollingWindow();

  return useSuspenseQuery({
    ...sessionsQueryOptions(),
    refetchInterval: (q) => poll.interval(reviewsOf(q.state.data)),
  });
}

export const useSession = (id: string) => useSuspenseQuery(sessionQueryOptions(id));
