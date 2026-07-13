import { SCORE_DIMENSIONS, SCORE_DIMENSION_LABELS } from '@/config/constants';
import type { Review } from '@/types/api';
import { cn } from '@/lib/utils';

/** Value ramp (opt-in): 0–4 danger · 4–7 warning · 7–10 success. */
function scoreColor(v: number): string {
  if (v < 4) return 'var(--danger)';
  if (v < 7) return 'var(--warning)';
  return 'var(--success)';
}

interface ScoreBarsProps {
  review: Review;
  /** 'kit' (default): white bars + accent on highest. 'value': color ramp. */
  tone?: 'kit' | 'value';
}

/** Per-dimension score rows. Only renders dimensions with a non-null value. */
export function ScoreBars({ review, tone = 'kit' }: ScoreBarsProps) {
  const rows = SCORE_DIMENSIONS.map((dim) => ({
    dim,
    label: SCORE_DIMENSION_LABELS[dim],
    value: review[dim],
  })).filter((r): r is { dim: typeof r.dim; label: string; value: number } => r.value != null);

  if (rows.length === 0) return null;

  const highest = Math.max(...rows.map((r) => r.value));

  return (
    <div className="flex flex-col gap-2">
      {rows.map((r) => {
        const isBest = r.value === highest;
        const valueColor =
          tone === 'value' ? scoreColor(r.value) : isBest ? 'var(--accent)' : undefined;
        const barColor =
          tone === 'value'
            ? scoreColor(r.value)
            : isBest
              ? 'var(--accent)'
              : 'rgba(255,255,255,0.55)';
        return (
          <div key={r.dim} className="rounded-xl bg-secondary p-[12px_14px]">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-xs font-semibold text-muted-foreground">{r.label}</span>
              <span
                className={cn(
                  'font-display text-[18px] font-medium tabular-nums tracking-[-0.025em]',
                  !valueColor && 'text-foreground',
                )}
                style={valueColor ? { color: valueColor } : undefined}
              >
                {r.value.toFixed(1)}
              </span>
            </div>
            <div className="h-[5px] overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full"
                style={{ width: `${r.value * 10}%`, background: barColor }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
