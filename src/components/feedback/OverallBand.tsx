import { OVERALL_SCORE_LABEL } from '@/config/constants';

interface OverallBandProps {
  value: number;
  sub?: string;
}

/** Big overall score with an electric decimal point. */
export function OverallBand({ value, sub }: OverallBandProps) {
  const whole = Math.floor(value);
  const decimal = Math.round((value - whole) * 10);
  return (
    <div className="flex items-center gap-4 rounded-[18px] bg-card p-[18px_20px] shadow-[var(--shadow-sm)]">
      <div className="font-heading text-[56px] font-bold leading-none tabular-nums tracking-[-0.05em] text-foreground">
        {whole}
        <span className="text-primary">.</span>
        {decimal}
      </div>
      <div>
        <div className="text-[13px] font-bold text-foreground">{OVERALL_SCORE_LABEL}</div>
        {sub && <div className="mt-0.5 text-[11.5px] text-muted-foreground">{sub}</div>}
      </div>
    </div>
  );
}
