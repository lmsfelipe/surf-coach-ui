import * as React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { QueryClientProvider, type Query } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { makeTestQueryClient } from '@/test/utils';
import { makeSessionListItem } from '@/test/fixtures';
import { qk } from '@/lib/queryKeys';
import { sessionQueryOptions, sessionsQueryOptions, useSessions } from './sessions';
import type { Session, SessionListItem } from '@/types/api';

const API = 'http://localhost:8000';

describe('sessionsQueryOptions', () => {
  it('uses the sessions list key and resolves the list from the API', async () => {
    const options = sessionsQueryOptions();
    expect(options.queryKey).toEqual(qk.sessions.list());

    const result = await (options.queryFn as () => Promise<SessionListItem[]>)();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('sessionQueryOptions', () => {
  it('uses the session detail key and resolves the session by id', async () => {
    const options = sessionQueryOptions('s1');
    expect(options.queryKey).toEqual(qk.sessions.detail('s1'));

    const result = await (options.queryFn as () => Promise<Session>)();
    expect(result.id).toBe('s1');
  });
});

describe('useSessions', () => {
  /** Renders the hook against `rows` and returns the interval it would poll at. */
  async function pollIntervalFor(rows: SessionListItem[]) {
    server.use(http.get(`${API}/api/v1/sessions/`, () => HttpResponse.json(rows)));
    const queryClient = makeTestQueryClient();
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <React.Suspense fallback={<div>loading</div>}>{children}</React.Suspense>
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useSessions(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.data).toHaveLength(rows.length));

    const query = queryClient.getQueryCache().find({ queryKey: qk.sessions.list() })!;
    const { refetchInterval } = query.observers[0]!.options;
    return (refetchInterval as (q: Query) => number | false)(query as Query);
  }

  it('returns each row with its embedded review summary', async () => {
    server.use(
      http.get(`${API}/api/v1/sessions/`, () =>
        HttpResponse.json([makeSessionListItem({ review: null })]),
      ),
    );
    const queryClient = makeTestQueryClient();
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <React.Suspense fallback={<div>loading</div>}>{children}</React.Suspense>
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useSessions(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.data[0]?.review).toBeNull());
  });

  it('polls the whole list while any review is still processing', async () => {
    const interval = await pollIntervalFor([
      makeSessionListItem({ id: 's1', review: { id: 'r1', status: 'completed', overallScore: 7 } }),
      makeSessionListItem({ id: 's2', review: { id: 'r2', status: 'processing', overallScore: null } }),
    ]);
    expect(interval).toBeGreaterThan(0);
  });

  it('does not poll once every review has settled', async () => {
    const interval = await pollIntervalFor([
      makeSessionListItem({ id: 's1', review: { id: 'r1', status: 'completed', overallScore: 7 } }),
      makeSessionListItem({ id: 's2', review: { id: 'r2', status: 'failed', overallScore: null } }),
      makeSessionListItem({ id: 's3', review: null }),
    ]);
    expect(interval).toBe(false);
  });
});
