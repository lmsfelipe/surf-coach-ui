import { Link, type LinkProps } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import { IconChevronRight } from '@/components/icons';

interface PlanCardProps {
  source: string;
  focus: string;
  workouts: number;
  exercises: number;
  to: LinkProps['to'];
  params?: LinkProps['params'];
}

/** Training-plan summary card linking to the plan detail. */
export function PlanCard({ source, focus, workouts, exercises, to, params }: PlanCardProps) {
  return (
    <Link
      to={to}
      params={params}
      className="flex items-center gap-3.5 rounded-[18px] bg-card p-[15px_16px] shadow-[var(--shadow-sm)] transition-colors hover:bg-card/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1 text-[11px] text-muted-foreground">{source}</div>
        <div className="mb-2.5 font-heading text-[15px] font-bold tracking-[-0.01em] text-foreground">
          {focus}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="muted" size="sm">
            {workouts} treinos
          </Badge>
          <Badge tone="muted" size="sm">
            {exercises} exercícios
          </Badge>
        </div>
      </div>
      <IconChevronRight size={20} className="shrink-0 text-muted-foreground" />
    </Link>
  );
}
