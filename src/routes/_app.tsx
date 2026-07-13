import { createFileRoute, redirect } from '@tanstack/react-router';
import { profileQueryOptions } from '@/hooks/queries/profile';
import { isProfileComplete } from '@/lib/profile';
import { useAuthStore } from '@/stores/authStore';
import { AppShell } from '@/components/layout/AppShell';

export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context, location }) => {
    const { session } = useAuthStore.getState();
    if (!session) {
      throw redirect({ to: '/login', search: { redirect: location.href } });
    }
    // GET /me auto-creates the profile; gate incomplete profiles to onboarding.
    const profile = await context.queryClient.ensureQueryData(profileQueryOptions());
    if (!isProfileComplete(profile) && location.pathname !== '/onboarding') {
      throw redirect({ to: '/onboarding' });
    }
  },
  component: AppShell,
});
