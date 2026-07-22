import { ErrorState } from '@/components/feedback/ErrorState';

/**
 * Full-page fallback rendered by the top-level Sentry ErrorBoundary when the
 * React tree throws, instead of white-screening. Offers a full reload since the
 * component tree is no longer trustworthy.
 */
export function AppCrashFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <ErrorState
        title="Ops, algo quebrou."
        subtitle="Já fomos avisados. Recarrega a página para continuar."
        onRetry={() => window.location.reload()}
      />
    </div>
  );
}
