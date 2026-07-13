import { cva, type VariantProps } from 'class-variance-authority';
import { CircleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  'flex items-center gap-2.5 rounded-[10px] border px-3.5 py-3 text-[12.5px] leading-snug [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      tone: {
        danger: 'border-danger/25 bg-danger/10 text-[#FF8095]',
        warning: 'border-warning/25 bg-warning/10 text-[#FFC470]',
        info: 'border-primary/25 bg-primary/10 text-[#9CABFF]',
      },
    },
    defaultVariants: { tone: 'danger' },
  },
);

interface AlertProps extends VariantProps<typeof alertVariants> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

/** Inline banner for auth/form errors. */
export function Alert({ children, tone, icon, className }: AlertProps) {
  return (
    <div role="alert" className={cn(alertVariants({ tone }), className)}>
      {icon ?? <CircleAlert />}
      <span>{children}</span>
    </div>
  );
}
