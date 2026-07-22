import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import * as Sentry from '@sentry/react';
import { AppCrashFallback } from '@/components/feedback/AppCrashFallback';
import { initAnalytics, trackPageView } from '@/lib/analytics';
import { queryClient } from '@/lib/queryClient';
import { initSentry } from '@/lib/sentry';
import { router } from '@/router';
import { initAuth } from '@/stores/authStore';
import './index.css';

async function bootstrap() {
  // Initialize crash reporting first so even early bootstrap failures surface.
  initSentry();

  // Report the initial load, then every subsequent client-side navigation.
  initAnalytics();
  router.subscribe('onResolved', () => {
    trackPageView(router.state.location.pathname);
  });

  // Hydrate the auth session before the router mounts so guards see it.
  await initAuth();

  const rootEl = document.getElementById('root');
  if (!rootEl) throw new Error('Root element #root not found');

  createRoot(rootEl).render(
    <StrictMode>
      <Sentry.ErrorBoundary fallback={<AppCrashFallback />}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </Sentry.ErrorBoundary>
    </StrictMode>,
  );
}

void bootstrap();
