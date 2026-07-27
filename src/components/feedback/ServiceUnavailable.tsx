import { ServerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ServiceUnavailableProps {
  onRetry?: () => void;
}

/**
 * Full-page state for when the backend API is unreachable (network failure or a
 * 5xx response). Deliberately distinct from AppCrashFallback (the client tree
 * threw) and NotFound (bad route): nothing is broken on our side, the service is
 * just down — so we invite a retry rather than a hard reload.
 */
export function ServiceUnavailable({ onRetry }: ServiceUnavailableProps) {
  return (
    <div
      role="alert"
      className="flex min-h-dvh flex-col items-center justify-center px-8 py-10 text-center"
    >
      <div className="mb-4 flex size-[68px] items-center justify-center rounded-full bg-warning/[0.12] text-warning">
        <ServerOff className="size-8" />
      </div>
      <h1 className="font-heading text-xl font-bold tracking-[-0.01em] text-foreground">
        Serviços indisponíveis
      </h1>
      <p className="mt-1.5 max-w-[300px] text-sm leading-snug text-muted-foreground">
        Nossos serviços estão fora do ar no momento. Não é você — já estamos cuidando disso.
        Tente de novo em instantes.
      </p>
      {onRetry && (
        <div className="mt-6">
          <Button size="sm" onClick={onRetry}>
            Tentar de novo
          </Button>
        </div>
      )}
    </div>
  );
}
