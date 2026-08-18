import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { makeCacheInspectionQueryClient, queryWrapper } from '@/test/utils';
import { makeProfile } from '@/test/fixtures';
import { qk } from '@/lib/queryKeys';
import { useUpdateProfile } from './profile';

describe('useUpdateProfile', () => {
  it('updates and invalidates the profile cache on success', async () => {
    const { Wrapper, queryClient } = queryWrapper(makeCacheInspectionQueryClient());
    queryClient.setQueryData(qk.profile.me(), makeProfile({ name: 'Old Name' }));

    const { result } = renderHook(() => useUpdateProfile(), { wrapper: Wrapper });
    await act(async () => {
      await result.current.mutateAsync({ name: 'New Name' });
    });

    expect(queryClient.getQueryData(qk.profile.me())).toMatchObject({ name: 'New Name' });
    expect(queryClient.getQueryState(qk.profile.me())?.isInvalidated).toBe(true);
  });
});
