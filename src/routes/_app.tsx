import { createFileRoute, redirect } from '@tanstack/react-router';
import { profileApi } from '@/lib/api/endpoints';
import { profileQueryOptions } from '@/hooks/queries/profile';
import { qk } from '@/lib/queryKeys';
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
    let profile = await context.queryClient.ensureQueryData(profileQueryOptions());

    // The name is captured at signup into Supabase user_metadata; the freshly
    // created backend profile has no name yet. Backfill it once, right after the
    // first GET /me (DESIGN_Pages_and_Elements §Signup).
    const signupName = String(session.user.user_metadata?.name ?? '').trim();
    if (!profile.name && signupName) {
      profile = await profileApi.update({ name: signupName });
      context.queryClient.setQueryData(qk.profile.me(), profile);
    }

    if (!isProfileComplete(profile) && location.pathname !== '/onboarding') {
      throw redirect({ to: '/onboarding' });
    }
  },
  component: AppShell,
});
