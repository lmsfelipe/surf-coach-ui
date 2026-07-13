import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Pill / chip. The 6 SurfRise tones from the export's `Pill` component
 * (components-base.jsx) plus the kit's `outline`.
 */
const badgeVariants = cva(
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-semibold tracking-[-0.005em] [&_svg]:size-3 [&_svg]:shrink-0',
  {
    variants: {
      tone: {
        brand: 'bg-primary text-white',
        accent: 'bg-primary/[0.16] text-[#9CABFF]',
        action: 'bg-primary/[0.14] text-[#9CABFF]',
        success: 'bg-success/[0.14] text-success',
        warning: 'bg-warning/[0.16] text-warning',
        danger: 'bg-danger/[0.14] text-danger',
        muted: 'bg-secondary text-[color:var(--color-text-soft)]',
        outline: 'border border-border bg-transparent text-muted-foreground',
      },
      size: {
        sm: 'px-2 py-[3px] text-[10px]',
        md: 'px-2.5 py-[5px] text-[11px]',
      },
    },
    defaultVariants: { tone: 'muted', size: 'md' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, tone, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
