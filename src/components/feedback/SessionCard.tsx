import { Link } from '@tanstack/react-router';
import type { Session } from '@/types/api';
import { formatShortDate } from '@/utils/dates';
import { formatWaveSize } from '@/utils/units';
import { scoreColor } from '@/utils/score';
import { Badge } from '@/components/ui/badge';
import { ScoreChipSkeleton } from '@/components/skeletons';
import { IconBoard, IconChevronRight, IconWave } from '@/components/icons';

interface SessionCardProps {
  session: Session;
  boardLabel: string | null;
  /** Overall score, or null (no review), or 'loading' while resolving (§4.5). */
  score: number | null | 'loading';
}

/** Whole-card link to the session detail hub. Wave shown in meters. */
export function SessionCard({ session, boardLabel, score }: SessionCardProps) {
  return (
    <Link
      to="/sessions/$sessionId"
      params={{ sessionId: session.id }}
      className="flex items-center gap-3.5 rounded-[18px] bg-card p-[14px_16px] text-left shadow-[var(--shadow-sm)] transition-colors hover:bg-card/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <div className="truncate text-[13px] font-semibold text-foreground">
            {session.location}
          </div>
          <div className="shrink-0 text-[11px] text-muted-foreground">
            {formatShortDate(session.sessionDate)}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {score === 'loading' ? (
            <ScoreChipSkeleton />
          ) : score != null ? (
            <span
              className="font-display text-[32px] font-bold leading-none tabular-nums tracking-[-0.045em]"
              style={{ color: scoreColor(score) }}
            >
              {score.toFixed(1)}
            </span>
          ) : (
            <Badge tone="outline" size="sm">
              Sem análise
            </Badge>
          )}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <IconWave size={17} />
            <span className="text-xs font-medium">{formatWaveSize(session.waveSize)}</span>
          </div>
          <div className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
            <IconBoard size={17} />
            <span className="truncate text-xs font-medium">{boardLabel || '—'}</span>
          </div>
        </div>
      </div>
      <IconChevronRight size={20} className="shrink-0 text-muted-foreground" />
    </Link>
  );
}
