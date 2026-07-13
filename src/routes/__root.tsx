import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { OfflineBanner } from '@/components/feedback/OfflineBanner';
import { Toaster } from '@/components/ui/sonner';

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <OfflineBanner />
      <Outlet />
      <Toaster />
    </div>
  );
}
