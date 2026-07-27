import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { NotFound } from '@/components/feedback/NotFound';
import { RouteErrorFallback } from '@/components/feedback/RouteErrorFallback';
import { queryClient } from '@/lib/queryClient';

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultNotFoundComponent: NotFound,
  defaultErrorComponent: RouteErrorFallback,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
