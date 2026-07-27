import { SCORE_DIMENSIONS, SCORE_DIMENSION_LABELS } from '@/config/constants';
import type { Review } from '@/types/api';
import { scoreColor } from '@/utils/score';

interface ScoreBarsProps {
  review: Review;
}

/** Per-dimension score rows. Only renders dimensions with a non-null value. */
export function ScoreBars({ review }: ScoreBarsProps) {
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
        // The best row wears the accent; every other row reads by value.
        const color = r.value === highest ? 'var(--accent)' : scoreColor(r.value);
        return (
          <div key={r.dim} className="rounded-xl bg-secondary p-[12px_14px]">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-xs font-semibold text-muted-foreground">{r.label}</span>
              <span
                className="font-heading text-[18px] font-medium tabular-nums tracking-[-0.025em]"
                style={{ color }}
              >
                {r.value.toFixed(1)}
              </span>
            </div>
            <div className="h-[5px] overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full"
                style={{ width: `${r.value * 10}%`, background: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
