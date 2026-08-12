import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Session, User } from '@supabase/supabase-js';

vi.mock('@/lib/supabase', () => ({
  supabase: { auth: { signOut: vi.fn().mockResolvedValue({ error: null }) } },
}));

import { queryClient } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './authStore';

const PROFILE_KEY = ['profile', 'me'];

function sessionFor(userId: string): Session {
  return { access_token: `token-${userId}`, user: { id: userId } as User } as Session;
}

/**
 * Regression coverage for the cross-account cache leak: signing out (or a
 * session swap to a different user) must drop cached server state so the
 * next signed-in user never sees the previous user's data.
 */
describe('authStore — cross-user cache isolation', () => {
  beforeEach(() => {
    useAuthStore.setState({ session: null, user: null, initialized: false });
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('does not clear the cache on initial hydration (no previous user)', () => {
    queryClient.setQueryData(PROFILE_KEY, { id: 'kept' });

    useAuthStore.getState().setSession(sessionFor('user-a'));

    expect(queryClient.getQueryData(PROFILE_KEY)).toEqual({ id: 'kept' });
  });

  it('clears the query cache when a different user session replaces the current one', () => {
    useAuthStore.getState().setSession(sessionFor('user-a'));
    queryClient.setQueryData(PROFILE_KEY, { id: 'user-a-profile' });

    useAuthStore.getState().setSession(sessionFor('user-b'));

    expect(queryClient.getQueryData(PROFILE_KEY)).toBeUndefined();
  });

  it('clears the query cache on sign out', async () => {
    useAuthStore.getState().setSession(sessionFor('user-a'));
    queryClient.setQueryData(PROFILE_KEY, { id: 'user-a-profile' });

    await useAuthStore.getState().signOut();

    expect(supabase.auth.signOut).toHaveBeenCalledOnce();
    expect(queryClient.getQueryData(PROFILE_KEY)).toBeUndefined();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('leaves the cache alone when the same user session is refreshed', () => {
    useAuthStore.getState().setSession(sessionFor('user-a'));
    queryClient.setQueryData(PROFILE_KEY, { id: 'user-a-profile' });

    useAuthStore.getState().setSession(sessionFor('user-a'));

    expect(queryClient.getQueryData(PROFILE_KEY)).toEqual({ id: 'user-a-profile' });
  });
});
