import { cn } from '@/lib/utils';

interface SkelProps {
  className?: string;
  style?: React.CSSProperties;
}

/** Shimmer block matching the design export. */
export function Skel({ className, style }: SkelProps) {
  return <div className={cn('sr-shimmer rounded-md', className)} style={style} />;
}

/** Session-card-shaped placeholder. */
export function SkelCard({ className }: SkelProps) {
  return (
    <div className={cn('rounded-[18px] bg-card p-4 shadow-[var(--shadow-sm)]', className)}>
      <Skel className="mb-3 h-3 w-[55%]" />
      <div className="flex items-center gap-3.5">
        <Skel className="h-7 w-11 rounded-lg" />
        <Skel className="h-3 w-12" />
        <Skel className="h-3 w-16" />
      </div>
    </div>
  );
}
