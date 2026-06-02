import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  /** false until the initial getSession() resolves — guards block on this. */
  initialized: boolean;
  setSession: (session: Session | null) => void;
  setInitialized: (value: boolean) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  initialized: false,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setInitialized: (value) => set({ initialized: value }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));

/**
 * Non-reactive token read for the fetch wrapper (avoids importing React).
 * Server state never lives here — only the session/token (Overview §2 state split).
 */
export function getAccessToken(): string | null {
  return useAuthStore.getState().session?.access_token ?? null;
}

/**
 * Hydrate the store from the persisted Supabase session and keep it in sync.
 * Call once at app bootstrap (main.tsx) before rendering the router.
 */
export async function initAuth(): Promise<void> {
  const { data } = await supabase.auth.getSession();
  useAuthStore.getState().setSession(data.session);
  useAuthStore.getState().setInitialized(true);

  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.getState().setSession(session);
  });
}
