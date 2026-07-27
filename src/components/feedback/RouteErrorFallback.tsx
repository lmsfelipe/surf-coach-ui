import { type ErrorComponentProps, useRouter } from '@tanstack/react-router';
import { ApiError, NetworkError } from '@/lib/api/errors';
import { AppCrashFallback } from '@/components/feedback/AppCrashFallback';
import { ServiceUnavailable } from '@/components/feedback/ServiceUnavailable';

/**
 * A failed request means the API is down, not that the client is broken: a
 * connection failure (NetworkError) or a server-side 5xx. 4xx are handled UX
 * (401 refresh/redirect, validation, not-found) so they never reach here.
 */
function isServiceOutage(error: unknown): boolean {
  return error instanceof NetworkError || (error instanceof ApiError && error.status >= 500);
}

/**
 * Router-wide `defaultErrorComponent`: the fallback for any route whose
 * `beforeLoad`/`loader`/render throws without a closer `errorComponent` — most
 * importantly the `_app` layout's profile fetch, which runs before any screen
 * mounts and would otherwise white-screen when the API is off.
 *
 * Outages get a dedicated "serviços indisponíveis" page with a retry that
 * re-runs the route (via router.invalidate); anything else is a genuine crash.
 */
export function RouteErrorFallback({ error, reset }: ErrorComponentProps) {
  const router = useRouter();

  if (!isServiceOutage(error)) {
    return <AppCrashFallback />;
  }

  const retry = () => {
    // Clear the boundary, then re-run beforeLoad/loaders so the failed request
    // is attempted again instead of replaying the cached rejection.
    reset();
    void router.invalidate();
  };

  return <ServiceUnavailable onRetry={retry} />;
}
