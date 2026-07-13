import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  subtitle?: string;
  onRetry?: () => void;
}

/** Generic failure state with a retry affordance (default copy from export). */
export function ErrorState({
  title = 'Algo não carregou.',
  subtitle = 'A culpa é nossa, não sua. Tenta de novo?',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-1 px-8 py-10 text-center">
      <div className="mb-3.5 flex size-16 items-center justify-center rounded-full bg-danger/[0.12] text-danger">
        <TriangleAlert className="size-7" />
      </div>
      <div className="font-heading text-[17px] font-bold text-foreground">{title}</div>
      <div className="mt-0.5 max-w-[250px] text-[13px] leading-tight text-muted-foreground">
        {subtitle}
      </div>
      {onRetry && (
        <div className="mt-[18px]">
          <Button variant="outline" size="sm" onClick={onRetry}>
            Tentar de novo
          </Button>
        </div>
      )}
    </div>
  );
}
