import { cn } from '@/lib/utils';

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
}

/** Uppercase tracked label above sections. */
export function Eyebrow({ children, className }: EyebrowProps) {
  return <div className={cn('t-eyebrow mb-3', className)}>{children}</div>;
}
