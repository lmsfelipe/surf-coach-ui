import { cn } from '@/lib/utils';

interface DotPulserProps {
  /** dot diameter in px */
  size?: number;
  className?: string;
}

/**
 * Three bouncing dots. Used inside busy buttons (replacing the label) and in
 * <AIState/>. Never a spinner. Color follows `currentColor`.
 */
export function DotPulser({ size = 7, className }: DotPulserProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-[5px]', className)}
      role="status"
      aria-label="Carregando"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="rounded-full bg-current"
          style={{
            width: size,
            height: size,
            animation: `srPulse 1.1s ${i * 0.15}s infinite var(--ease-in-out)`,
          }}
        />
      ))}
    </span>
  );
}
