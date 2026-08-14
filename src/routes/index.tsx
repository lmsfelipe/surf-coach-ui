import { createFileRoute, redirect } from '@tanstack/react-router';
import { OceanHero } from '@/components/landing/OceanHero';
import { useAuthStore } from '@/stores/authStore';

/**
 * Public landing page. Signed-in users skip it entirely and go straight to their
 * sessions, preserving the behavior this route had when it was a bare redirect.
 */
export const Route = createFileRoute('/')({
  beforeLoad: () => {
    if (useAuthStore.getState().session) {
      throw redirect({ to: '/sessions' });
    }
  },
  component: OceanHero,
});
