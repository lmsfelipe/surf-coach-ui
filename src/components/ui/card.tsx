import * as React from 'react';
import { cn } from '@/lib/utils';

/** Signature SurfRise card: 18px radius, surface bg, soft elevation. */
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-[18px] bg-card p-[18px] shadow-[var(--shadow-sm)]', className)}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

export { Card };
