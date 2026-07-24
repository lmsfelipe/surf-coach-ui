/**
 * Score → color ramp, shared by every surface that shows a 0–10 score.
 * See docs/design/components-rich.jsx.
 */

/** 0–4 danger · 4–7 warning · 7–10 success · null muted. */
export function scoreColor(value: number | null): string {
  if (value == null) return 'var(--text-muted)';
  if (value < 4) return 'var(--danger)';
  if (value < 7) return 'var(--warning)';
  return 'var(--success)';
}
