import * as Sentry from "@sentry/react";
import { env } from "@/config/env";
import { ApiError } from "@/lib/api/errors";

/**
 * Initialize Sentry error monitoring. No-op when VITE_SENTRY_DSN is unset
 * (local dev, previews) so nothing is reported without a configured project.
 * Errors-only scope: no performance tracing, no session replay.
 * Call once at app bootstrap (main.tsx) before anything else.
 */
export function initSentry(): void {
  if (!env.sentryDsn) return;

  Sentry.init({
    dsn: env.sentryDsn,
    environment: import.meta.env.MODE,
    // Only report from production builds; flip locally to smoke-test the DSN.
    enabled: import.meta.env.PROD,
    beforeSend(event, hint) {
      // Expected UX errors (auth/validation/not-found) are handled in the UI,
      // not bugs — drop them so the dashboard only shows actionable failures.
      const error = hint.originalException;
      if (error instanceof ApiError && error.status < 500) return null;
      return event;
    },
  });
}
