import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';

export const Route = createFileRoute('/_auth')({
  beforeLoad: () => {
    if (useAuthStore.getState().session) {
      throw redirect({ to: '/sessions' });
    }
  },
  component: () => <Outlet />,
});
