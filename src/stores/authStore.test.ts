import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Session, User } from '@supabase/supabase-js';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}));
vi.mock('@sentry/react', () => ({ captureException: vi.fn(), setUser: vi.fn() }));

import * as Sentry from '@sentry/react';
import { queryClient } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import { initAuth, useAuthStore } from './authStore';

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

/**
 * A failed session read must never trap the app on the boot splash — the
 * `finally` in initAuth has to set `initialized` regardless of outcome, or
 * the router's `initialized` guards hard-lock the user on first load.
 */
describe('authStore — initAuth', () => {
  beforeEach(() => {
    useAuthStore.setState({ session: null, user: null, initialized: false });
    queryClient.clear();
    vi.clearAllMocks();
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    } as never);
  });

  it('hydrates the store from getSession and sets initialized', async () => {
    const session = sessionFor('user-a');
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session },
      error: null,
    } as never);

    await initAuth();

    expect(useAuthStore.getState().session).toEqual(session);
    expect(useAuthStore.getState().initialized).toBe(true);
  });

  it('sets initialized even when getSession rejects, leaving the user signed out', async () => {
    vi.mocked(supabase.auth.getSession).mockRejectedValue(new Error('boom'));

    await initAuth();

    expect(useAuthStore.getState().initialized).toBe(true);
    expect(useAuthStore.getState().user).toBeNull();
    expect(Sentry.captureException).toHaveBeenCalledOnce();
  });

  it('updates the store when onAuthStateChange fires with a new session', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as never);
    let capturedCallback: ((event: string, session: Session | null) => void) | undefined;
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((cb) => {
      capturedCallback = cb as never;
      return { data: { subscription: { unsubscribe: vi.fn() } } } as never;
    });

    await initAuth();
    const newSession = sessionFor('user-b');
    capturedCallback?.('SIGNED_IN', newSession);

    expect(useAuthStore.getState().session).toEqual(newSession);
  });
});
