import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { makeCacheInspectionQueryClient, queryWrapper } from '@/test/utils';
import { makeSession } from '@/test/fixtures';
import { qk } from '@/lib/queryKeys';
import { sessionFormToPayload, useCreateSession, useDeleteSession } from './sessions';
import type { SessionFormValues } from '@/schemas/session';

describe('sessionFormToPayload — meters end-to-end', () => {
  const base: SessionFormValues = {
    sessionDate: '2026-05-25',
    location: 'Canal 1',
    waveSize: 1,
  };

  it('passes wave size through unchanged', () => {
    expect(sessionFormToPayload(base).waveSize).toBe(1);
  });

  it('passes through a different wave size unchanged', () => {
    expect(sessionFormToPayload({ ...base, waveSize: 2 }).waveSize).toBe(2);
  });

  it('passes through the other fields', () => {
    const payload = sessionFormToPayload({
      ...base,
      surfboardId: 'b1',
      notes: 'glassy',
    });
    expect(payload).toMatchObject({
      sessionDate: '2026-05-25',
      location: 'Canal 1',
      surfboardId: 'b1',
      notes: 'glassy',
    });
  });
});

describe('useCreateSession', () => {
  it('seeds the session detail cache and invalidates the list', async () => {
    const { Wrapper, queryClient } = queryWrapper(makeCacheInspectionQueryClient());
    queryClient.setQueryData(qk.sessions.list(), [makeSession({ id: 's1' })]);

    const { result } = renderHook(() => useCreateSession(), { wrapper: Wrapper });
    await act(async () => {
      await result.current.mutateAsync({
        sessionDate: '2026-06-01',
        location: 'Maresias',
        waveSize: 1.2,
      });
    });

    expect(queryClient.getQueryData(qk.sessions.detail('s1'))).toBeTruthy();
    expect(queryClient.getQueryState(qk.sessions.list())?.isInvalidated).toBe(true);
  });
});

describe('useDeleteSession', () => {
  it('invalidates the sessions list on success', async () => {
    const { Wrapper, queryClient } = queryWrapper(makeCacheInspectionQueryClient());
    queryClient.setQueryData(qk.sessions.list(), [makeSession({ id: 's1' })]);

    const { result } = renderHook(() => useDeleteSession(), { wrapper: Wrapper });
    await act(async () => {
      await result.current.mutateAsync('s1');
    });

    expect(queryClient.getQueryState(qk.sessions.list())?.isInvalidated).toBe(true);
  });
});
