import * as React from 'react';
import type { Workout } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import { IconBarbell, IconChevronDown, IconPlay } from '@/components/icons';
import { cn } from '@/lib/utils';

interface WorkoutAccordionProps {
  workout: Workout;
  defaultOpen?: boolean;
}

/** Collapsible workout with ordered exercises (sets/reps pills + video tile). */
export function WorkoutAccordion({ workout, defaultOpen = false }: WorkoutAccordionProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const panelId = `workout-${workout.id}`;
  const exercises = [...workout.exercises].sort(
    (a, b) => a.sequenceNumber - b.sequenceNumber,
  );

  return (
    <div className="overflow-hidden rounded-[18px] bg-card shadow-[var(--shadow-sm)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-3 p-[15px_16px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <div className="flex size-[26px] shrink-0 items-center justify-center rounded-lg bg-secondary font-display text-[13px] font-semibold text-primary">
          {workout.sequenceNumber}
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-foreground">{workout.title}</div>
          <div className="mt-px text-[11px] text-muted-foreground">{workout.focusArea}</div>
        </div>
        <IconChevronDown
          size={18}
          className={cn('text-muted-foreground transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div id={panelId} className="flex flex-col gap-2.5 p-[0_12px_12px]">
          {exercises.map((ex, i) => (
            <div key={ex.id} className="flex gap-3 rounded-xl bg-secondary p-3">
              <div className="relative flex size-14 shrink-0 items-center justify-center rounded-[10px] border border-primary/20 bg-[#0F1525] text-primary">
                {ex.videoUrl ? <IconPlay size={20} /> : <IconBarbell size={20} />}
                <div className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-primary font-display text-[10px] font-semibold text-white">
                  {i + 1}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 text-[13.5px] font-semibold text-foreground">
                  {ex.name}
                </div>
                <div className="mb-1.5 flex gap-1.5">
                  <Badge tone="muted" size="sm">
                    {ex.sets} séries
                  </Badge>
                  <Badge tone="muted" size="sm">
                    {ex.reps}
                  </Badge>
                </div>
                <div className="text-xs leading-[17px] text-muted-foreground">
                  {ex.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
