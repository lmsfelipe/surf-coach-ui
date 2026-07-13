import { Link, type LinkProps } from '@tanstack/react-router';
import { IconChevronRight } from '@/components/icons';

interface SummaryRowProps {
  icon?: React.ReactNode;
  title: string;
  sub?: string;
  action?: React.ReactNode;
  /** When provided, the whole row links here. */
  to?: LinkProps['to'];
  params?: LinkProps['params'];
}

/** Detail-hub link row: icon tile + title/sub + trailing chevron or action. */
export function SummaryRow({ icon, title, sub, action, to, params }: SummaryRowProps) {
  const inner = (
    <>
      {icon && (
        <div className="flex size-[38px] shrink-0 items-center justify-center rounded-[11px] bg-secondary text-primary">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] font-semibold text-foreground">{title}</div>
        {sub && <div className="mt-0.5 text-[11.5px] text-muted-foreground">{sub}</div>}
      </div>
      {action ?? <IconChevronRight size={20} className="text-muted-foreground" />}
    </>
  );

  const className =
    'flex items-center gap-[13px] rounded-[18px] bg-card p-[14px_16px] shadow-[var(--shadow-sm)]';

  if (to) {
    return (
      <Link
        to={to}
        params={params}
        className={`${className} transition-colors hover:bg-card/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
      >
        {inner}
      </Link>
    );
  }
  return <div className={className}>{inner}</div>;
}
