import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { makeCacheInspectionQueryClient, queryWrapper } from '@/test/utils';
import { makeSurfboard } from '@/test/fixtures';
import { qk } from '@/lib/queryKeys';

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

import { toast } from 'sonner';
import { useCreateSurfboard, useDeleteSurfboard, useUpdateSurfboard } from './surfboards';

const API = 'http://localhost:8000';

describe('useCreateSurfboard', () => {
  it('invalidates the surfboards list on success', async () => {
    const { Wrapper, queryClient } = queryWrapper(makeCacheInspectionQueryClient());
    queryClient.setQueryData(qk.surfboards.list(), [makeSurfboard({ id: 'b1' })]);

    const { result } = renderHook(() => useCreateSurfboard(), { wrapper: Wrapper });
    await act(async () => {
      await result.current.mutateAsync({ boardType: 'shortboard', boardSize: 6.0 });
    });

    expect(queryClient.getQueryState(qk.surfboards.list())?.isInvalidated).toBe(true);
  });
});

describe('useUpdateSurfboard', () => {
  it('invalidates both the list and the detail on success', async () => {
    const { Wrapper, queryClient } = queryWrapper(makeCacheInspectionQueryClient());
    queryClient.setQueryData(qk.surfboards.list(), [makeSurfboard({ id: 'b1' })]);
    queryClient.setQueryData(qk.surfboards.detail('b1'), makeSurfboard({ id: 'b1' }));

    const { result } = renderHook(() => useUpdateSurfboard('b1'), { wrapper: Wrapper });
    await act(async () => {
      await result.current.mutateAsync({ label: 'New label' });
    });

    expect(queryClient.getQueryState(qk.surfboards.list())?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(qk.surfboards.detail('b1'))?.isInvalidated).toBe(true);
  });
});

describe('useDeleteSurfboard — optimistic cycle', () => {
  beforeEach(() => vi.clearAllMocks());

  it('removes the board from the cached list immediately in onMutate, before the request resolves', async () => {
    const { Wrapper, queryClient } = queryWrapper(makeCacheInspectionQueryClient());
    queryClient.setQueryData(qk.surfboards.list(), [
      makeSurfboard({ id: 'b1' }),
      makeSurfboard({ id: 'b2' }),
    ]);
    let resolveRequest: () => void = () => {};
    server.use(
      http.delete(`${API}/api/v1/surfboards/:id`, async () => {
        await new Promise<void>((resolve) => {
          resolveRequest = resolve;
        });
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const { result } = renderHook(() => useDeleteSurfboard(), { wrapper: Wrapper });
    act(() => {
      result.current.mutate('b1');
    });

    await waitFor(() =>
      expect(queryClient.getQueryData(qk.surfboards.list())).toEqual([makeSurfboard({ id: 'b2' })]),
    );

    resolveRequest();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('restores the exact previous list on error', async () => {
    const { Wrapper, queryClient } = queryWrapper(makeCacheInspectionQueryClient());
    const previous = [makeSurfboard({ id: 'b1' }), makeSurfboard({ id: 'b2' })];
    queryClient.setQueryData(qk.surfboards.list(), previous);
    server.use(
      http.delete(`${API}/api/v1/surfboards/:id`, () =>
        HttpResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'boom' } }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useDeleteSurfboard(), { wrapper: Wrapper });
    await act(async () => {
      await result.current.mutateAsync('b1').catch(() => {});
    });

    expect(queryClient.getQueryData(qk.surfboards.list())).toEqual(previous);
  });

  it('fires a toast with the mapped pt-BR message on error', async () => {
    const { Wrapper, queryClient } = queryWrapper(makeCacheInspectionQueryClient());
    queryClient.setQueryData(qk.surfboards.list(), [makeSurfboard({ id: 'b1' })]);
    server.use(
      http.delete(`${API}/api/v1/surfboards/:id`, () =>
        HttpResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'boom' } }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useDeleteSurfboard(), { wrapper: Wrapper });
    await act(async () => {
      await result.current.mutateAsync('b1').catch(() => {});
    });

    expect(toast.error).toHaveBeenCalledWith('Algo deu errado do nosso lado. Tente de novo?');
  });

  it('invalidates the list on settle after a successful delete', async () => {
    const { Wrapper, queryClient } = queryWrapper(makeCacheInspectionQueryClient());
    queryClient.setQueryData(qk.surfboards.list(), [makeSurfboard({ id: 'b1' })]);

    const { result } = renderHook(() => useDeleteSurfboard(), { wrapper: Wrapper });
    await act(async () => {
      await result.current.mutateAsync('b1');
    });

    expect(queryClient.getQueryState(qk.surfboards.list())?.isInvalidated).toBe(true);
  });

  it('invalidates the list on settle even after a failed delete', async () => {
    const { Wrapper, queryClient } = queryWrapper(makeCacheInspectionQueryClient());
    queryClient.setQueryData(qk.surfboards.list(), [makeSurfboard({ id: 'b1' })]);
    server.use(
      http.delete(`${API}/api/v1/surfboards/:id`, () =>
        HttpResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'boom' } }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useDeleteSurfboard(), { wrapper: Wrapper });
    await act(async () => {
      await result.current.mutateAsync('b1').catch(() => {});
    });

    expect(queryClient.getQueryState(qk.surfboards.list())?.isInvalidated).toBe(true);
  });
});
