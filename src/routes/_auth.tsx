import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';

/**
 * Supabase's recovery link is an implicit-flow callback: `detectSessionInUrl`
 * consumes the `#access_token…&type=recovery` hash during `initAuth()`, so the
 * user arrives at /reset-password *already authenticated*. Bouncing signed-in
 * users away from this one route would make the new-password form unreachable.
 */
const ALLOWS_ACTIVE_SESSION = new Set<string>(['/reset-password']);

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ location }) => {
    if (ALLOWS_ACTIVE_SESSION.has(location.pathname)) return;
    if (useAuthStore.getState().session) {
      throw redirect({ to: '/sessions' });
    }
  },
  component: () => <Outlet />,
});
