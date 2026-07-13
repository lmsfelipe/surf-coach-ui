import { DotPulser } from './DotPulser';

interface AIStateProps {
  title?: string;
  subtitle?: string;
}

/** Slow-AI pending UI — radial halo + electric dot pulser. Never a spinner. */
export function AIState({ title = 'Analisando sua sessão…', subtitle }: AIStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 px-8 py-[52px] text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-[radial-gradient(circle,rgba(61,91,255,0.22),rgba(61,91,255,0.04)_70%)] text-primary">
        <DotPulser size={9} />
      </div>
      <div>
        <div className="font-heading text-base font-bold text-foreground">{title}</div>
        {subtitle && (
          <div className="mx-auto mt-1.5 max-w-[240px] text-[12.5px] text-muted-foreground">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
