import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import * as Sentry from '@sentry/react';
import { AppCrashFallback } from '@/components/feedback/AppCrashFallback';
import { AppLoading } from '@/components/feedback/AppLoading';
import { initAnalytics, trackPageView } from '@/lib/analytics';
import { queryClient } from '@/lib/queryClient';
import { initSentry } from '@/lib/sentry';
import { router } from '@/router';
import { initAuth, useAuthStore } from '@/stores/authStore';
import './index.css';

/**
 * Gate the router on auth hydration *inside* React so the boot splash paints
 * immediately. Mounting the router only once the session is ready preserves the
 * guarantee that route guards see the correct session (no login-page flash).
 */
function App() {
  const initialized = useAuthStore((state) => state.initialized);
  if (!initialized) return <AppLoading />;
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

function bootstrap() {
  // Initialize crash reporting first so even early bootstrap failures surface.
  initSentry();

  // Report the initial load, then every subsequent client-side navigation.
  initAnalytics();
  router.subscribe('onResolved', () => {
    trackPageView(router.state.location.pathname);
  });

  const rootEl = document.getElementById('root');
  if (!rootEl) throw new Error('Root element #root not found');

  createRoot(rootEl).render(
    <StrictMode>
      <Sentry.ErrorBoundary fallback={<AppCrashFallback />}>
        <App />
      </Sentry.ErrorBoundary>
    </StrictMode>,
  );

  // Hydrate the auth session in the background; <App/> swaps the splash for the
  // router once the store flips `initialized`.
  void initAuth();
}

bootstrap();
