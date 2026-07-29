import { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { BOARD_TYPE_OPTIONS } from '@/config/constants';
import { sessionsQueryOptions, useSessions } from '@/hooks/queries/sessions';
import { surfboardsQueryOptions, useSurfboards } from '@/hooks/queries/surfboards';
import { useReviewBySession } from '@/hooks/queries/reviews';
import type { Session, Surfboard } from '@/types/api';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/feedback/Eyebrow';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { SessionCard } from '@/components/feedback/SessionCard';
import { SessionListSkeleton } from '@/components/skeletons';
import { useProfile } from '@/hooks/queries/profile';
import { IconPlus, IconWave } from '@/components/icons';
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/sessions/')({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(sessionsQueryOptions()),
      context.queryClient.ensureQueryData(surfboardsQueryOptions()),
    ]),
  pendingComponent: () => (
    <>
      <AppHeader />
      <SessionListSkeleton />
    </>
  ),
  errorComponent: ({ reset }) => (
    <>
      <AppHeader />
      <div className="pt-10">
        <ErrorState onRetry={reset} />
      </div>
    </>
  ),
  component: SessionsScreen,
});

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function boardLabelFor(session: Session, boards: Surfboard[]): string | null {
  if (!session.surfboardId) return null;
  const board = boards.find((b) => b.id === session.surfboardId);
  if (!board) return null;
  return (
    board.label ||
    BOARD_TYPE_OPTIONS.find((o) => o.value === board.boardType)?.label ||
    null
  );
}

/** Resolves a card's score independently so a slow review can't block the list. */
function SessionCardWithScore({
  session,
  boardLabel,
}: {
  session: Session;
  boardLabel: string | null;
}) {
  return (
    <Suspense
      fallback={<SessionCard session={session} boardLabel={boardLabel} score="loading" />}
    >
      <ResolvedScoreCard session={session} boardLabel={boardLabel} />
    </Suspense>
  );
}

function ResolvedScoreCard({
  session,
  boardLabel,
}: {
  session: Session;
  boardLabel: string | null;
}) {
  const { data: review } = useReviewBySession(session.id);
  return (
    <SessionCard
      session={session}
      boardLabel={boardLabel}
      score={review?.overallScore ?? null}
    />
  );
}

function SessionsScreen() {
  const { data: sessions } = useSessions();
  const { data: boards } = useSurfboards();
  const { data: profile } = useProfile();
  const firstName = profile.name?.split(' ')[0] ?? '';

  return (
    <>
      <AppHeader />
      <div className="px-5 pb-3 pt-0.5">
        <h1 className="t-greeting m-0">
          {greeting()}, {firstName ? `${firstName}.` : 'surfista.'}
        </h1>
      </div>

      {sessions.length === 0 ? (
        <div className="pt-10">
          <EmptyState
            icon={<IconWave />}
            title="Nenhuma sessão ainda"
            subtitle="Sua primeira sessão é só um botão de distância."
            cta={
              <Button asChild>
                <Link to="/sessions/new">
                  <IconPlus size={17} />
                  Registrar primeira sessão
                </Link>
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="px-5 pt-1">
            <Eyebrow className="!mb-0">Suas sessões · {sessions.length}</Eyebrow>
          </div>
          <div className="flex max-w-[100vw] flex-col gap-3 px-5 pt-3.5 lg:grid lg:grid-cols-2">
            {sessions.map((session) => (
              <SessionCardWithScore
                key={session.id}
                session={session}
                boardLabel={boardLabelFor(session, boards)}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
