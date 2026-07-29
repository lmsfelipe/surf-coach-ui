import * as React from 'react';
import {
  createFileRoute,
  useNavigate,
  useRouter,
  type ErrorComponentProps,
} from '@tanstack/react-router';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BOARD_TYPE_OPTIONS } from '@/config/constants';
import { sessionQueryOptions, useSession } from '@/hooks/queries/sessions';
import { mediaQueryOptions, useSessionMedia } from '@/hooks/queries/media';
import { reviewBySessionOptions, useReviewBySession } from '@/hooks/queries/reviews';
import { planByReviewOptions, usePlanByReview } from '@/hooks/queries/trainingPlans';
import { surfboardsQueryOptions, useSurfboards } from '@/hooks/queries/surfboards';
import { useDeleteSession } from '@/hooks/mutations/sessions';
import { useRetryReview } from '@/hooks/mutations/reviews';
import { useRetryTrainingPlan } from '@/hooks/mutations/trainingPlans';
import { useDeleteMedia } from '@/hooks/mutations/media';
import { toUserMessage } from '@/lib/api/errors';
import { formatLongDate } from '@/utils/dates';
import { formatWaveSize } from '@/utils/units';
import { scoreCardBackground } from '@/utils/scoreCardBackground';
import type { Review, Session, Surfboard } from '@/types/api';
import { AppHeader } from '@/components/layout/AppHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Eyebrow } from '@/components/feedback/Eyebrow';
import { ErrorState } from '@/components/feedback/ErrorState';
import { MediaGallery } from '@/components/feedback/MediaGallery';
import { SummaryRow } from '@/components/feedback/SummaryRow';
import { SessionDetailSkeleton } from '@/components/skeletons';
import {
  IconBarbell,
  IconBoard,
  IconImage,
  IconInfo,
  IconSparkle,
  IconTrash,
  IconWave,
} from '@/components/icons';

/**
 * Back always lands on the sessions list. History would walk back into the
 * create flow (new → upload → here), which is a one-way wizard.
 */
function SessionHeader() {
  const navigate = useNavigate();
  return (
    <AppHeader onBack={() => void navigate({ to: '/sessions' })} title="Sessão" hideAvatar />
  );
}

export const Route = createFileRoute('/_app/sessions/$sessionId/')({
  loader: async ({ context, params }) => {
    const { sessionId } = params;
    const [, , review] = await Promise.all([
      context.queryClient.ensureQueryData(sessionQueryOptions(sessionId)),
      context.queryClient.ensureQueryData(mediaQueryOptions(sessionId)),
      context.queryClient.ensureQueryData(reviewBySessionOptions(sessionId)),
      context.queryClient.ensureQueryData(surfboardsQueryOptions()),
    ]);
    if (review) {
      await context.queryClient.ensureQueryData(planByReviewOptions(review.id));
    }
  },
  pendingComponent: () => (
    <>
      <SessionHeader />
      <SessionDetailSkeleton />
    </>
  ),
  errorComponent: SessionDetailError,
  component: SessionDetailScreen,
});

/**
 * Page-level fallback for genuine load failures (the session itself failed to
 * load). Resetting the router boundary alone re-throws, because React Query
 * caches the rejected query — so we also clear the query error boundary and
 * re-run the loader, otherwise "Tentar de novo" is a no-op.
 */
function SessionDetailError({ reset }: ErrorComponentProps) {
  const router = useRouter();
  const queryErrorReset = useQueryErrorResetBoundary();

  React.useEffect(() => {
    queryErrorReset.reset();
  }, [queryErrorReset]);

  return (
    <>
      <SessionHeader />
      <div className="pt-9">
        <ErrorState
          onRetry={() => {
            reset();
            void router.invalidate();
          }}
        />
      </div>
    </>
  );
}

function boardLabelFor(session: Session, boards: Surfboard[]): string | null {
  if (!session.surfboardId) return null;
  const board = boards.find((b) => b.id === session.surfboardId);
  if (!board) return null;
  return (
    board.label || BOARD_TYPE_OPTIONS.find((o) => o.value === board.boardType)?.label || null
  );
}

function HeroCard({
  session,
  boardLabel,
  review,
}: {
  session: Session;
  boardLabel: string | null;
  review: Review | null;
}) {
  const score = review?.overallScore ?? null;
  const backdrop = scoreCardBackground(session.id);
  return (
    <div className="relative overflow-hidden rounded-[18px] border border-border bg-[linear-gradient(160deg,#1A2236_0%,#141B2E_60%,#0B1020_100%)] p-[20px_22px] text-white shadow-[var(--shadow-md)]">
      {backdrop && (
        <>
          <img
            src={backdrop}
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 size-full object-cover"
          />
          {/* Darken the text side (left) and the chip row (bottom) for legibility. */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,rgba(8,12,24,0.92)_0%,rgba(8,12,24,0.55)_46%,rgba(8,12,24,0.2)_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-[linear-gradient(to_top,rgba(8,12,24,0.85)_0%,rgba(8,12,24,0)_100%)]" />
        </>
      )}
      <div className="relative">
        <div className="text-[13.5px] font-semibold text-white/90">{session.location}</div>
        <div className="text-[11px] text-white/55">{formatLongDate(session.sessionDate)}</div>
      </div>
      {score != null && (
        <div className="relative mt-4 flex items-baseline gap-3">
          <div className="font-heading text-[64px] font-bold leading-none tabular-nums tracking-[-0.05em]">
            {Math.floor(score)}
            <span className="text-primary">.</span>
            {Math.round((score - Math.floor(score)) * 10)}
          </div>
          <div className="text-[11px] leading-[15px] text-white/55">nota geral</div>
        </div>
      )}
      <div className="relative mt-4 flex flex-wrap gap-2">
        <Badge tone="muted" className="shrink-0">
          <IconWave size={12} /> {formatWaveSize(session.waveSize)}
        </Badge>
        <Badge tone="muted" className="min-w-0 max-w-full">
          <IconBoard size={12} />
          <span className="truncate">{boardLabel || '—'}</span>
        </Badge>
      </div>
    </div>
  );
}

/**
 * Análise section. Every review status renders inline here — a failed review is
 * a section-level state with its own retry, never a page-level error, so the
 * rest of the session (hero, media, delete) stays usable.
 */
function ReviewSummary({
  review,
  sessionId,
  hasMedia,
}: {
  review: Review | null;
  sessionId: string;
  hasMedia: boolean;
}) {
  const { mutate: retry, isPending: isRetrying } = useRetryReview();

  if (review?.status === 'failed') {
    return (
      <SummaryRow
        icon={<IconSparkle size={18} />}
        title="Análise não concluída"
        sub={review.errorMessage ?? 'A IA falhou ao processar a mídia.'}
        action={
          <Button
            variant="outline"
            size="sm"
            disabled={isRetrying}
            onClick={() =>
              retry(
                { reviewId: review.id },
                { onError: (err) => toast.error(toUserMessage(err)) },
              )
            }
          >
            {isRetrying ? 'Tentando…' : 'Tentar de novo'}
          </Button>
        }
      />
    );
  }

  if (review?.status === 'processing') {
    return (
      <SummaryRow
        icon={<IconSparkle size={18} />}
        title="Analisando sua sessão…"
        sub="A IA está processando sua mídia."
        to="/sessions/$sessionId/review"
        params={{ sessionId }}
      />
    );
  }

  if (review) {
    // completed — tips are only populated on this status.
    return (
      <SummaryRow
        icon={<IconSparkle size={18} />}
        title={`Nota ${review.overallScore?.toFixed(1) ?? '—'} · 6 aspectos`}
        sub={review.improvementTips?.[0]}
        to="/sessions/$sessionId/review"
        params={{ sessionId }}
      />
    );
  }

  if (hasMedia) {
    return (
      <SummaryRow
        icon={<IconSparkle size={18} />}
        title="Gerar análise"
        sub="A IA analisa sua mídia em segundos"
        to="/sessions/$sessionId/review"
        params={{ sessionId }}
      />
    );
  }

  return (
    <div className="flex items-center gap-2.5 rounded-[18px] bg-card p-4 shadow-[var(--shadow-sm)]">
      <IconInfo size={17} className="text-[color:var(--color-text-faint)]" />
      <span className="text-[12.5px] leading-[18px] text-muted-foreground">
        Adicione mídia para analisar com a IA.
      </span>
    </div>
  );
}

/**
 * Treino section — only rendered when a review exists (plan is ensured). Like
 * ReviewSummary, every plan status renders inline: a plan mid-generation has
 * no workouts yet, so counting them would read "0 treinos".
 */
function PlanSummary({ reviewId, sessionId }: { reviewId: string; sessionId: string }) {
  const { data: plan } = usePlanByReview(reviewId);
  const { mutate: retry, isPending: isRetrying } = useRetryTrainingPlan();

  if (plan?.status === 'failed') {
    return (
      <SummaryRow
        icon={<IconBarbell size={18} />}
        title="Treino não concluído"
        sub={plan.errorMessage ?? 'A IA falhou ao montar o plano.'}
        action={
          <Button
            variant="outline"
            size="sm"
            disabled={isRetrying}
            onClick={() =>
              retry({ planId: plan.id }, { onError: (err) => toast.error(toUserMessage(err)) })
            }
          >
            {isRetrying ? 'Tentando…' : 'Tentar de novo'}
          </Button>
        }
      />
    );
  }

  if (plan?.status === 'processing') {
    return (
      <SummaryRow
        icon={<IconBarbell size={18} />}
        title="Montando seu treino…"
        sub="A IA está transformando a análise em exercícios."
        to="/sessions/$sessionId/plan"
        params={{ sessionId }}
      />
    );
  }

  if (plan) {
    // completed — workouts are only populated on this status.
    const exerciseCount = plan.workouts.reduce((n, w) => n + w.exercises.length, 0);
    return (
      <SummaryRow
        icon={<IconBarbell size={18} />}
        title={`${plan.workouts.length} treinos`}
        sub={`${exerciseCount} exercícios`}
        to="/sessions/$sessionId/plan"
        params={{ sessionId }}
      />
    );
  }

  return (
    <SummaryRow
      icon={<IconBarbell size={18} />}
      title="Gerar plano de treino"
      sub="A partir desta análise"
      to="/sessions/$sessionId/plan"
      params={{ sessionId }}
    />
  );
}

function SessionDetailScreen() {
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();
  const { data: session } = useSession(sessionId);
  const { data: media } = useSessionMedia(sessionId);
  const { data: review } = useReviewBySession(sessionId);
  const { data: boards } = useSurfboards();
  const deleteSession = useDeleteSession();
  const deleteMedia = useDeleteMedia(sessionId);
  const boardLabel = boardLabelFor(session, boards);

  async function handleDelete() {
    try {
      await deleteSession.mutateAsync(sessionId);
      toast.success('Sessão excluída.');
      await navigate({ to: '/sessions' });
    } catch (err) {
      toast.error(toUserMessage(err));
    }
  }

  return (
    <>
      <SessionHeader />
      <div className="px-5 pt-1">
        <HeroCard session={session} boardLabel={boardLabel} review={review} />

        <section className="mt-[22px]">
          <Eyebrow>Mídia</Eyebrow>
          {media.length > 0 ? (
            <MediaGallery
              media={media}
              // Once an analysis exists, the media set is locked — no adding more.
              onAdd={
                review
                  ? undefined
                  : () =>
                      navigate({ to: '/sessions/$sessionId/upload', params: { sessionId } })
              }
              onDelete={review ? undefined : (id) => deleteMedia.mutate(id)}
            />
          ) : (
            <button
              type="button"
              onClick={() =>
                navigate({ to: '/sessions/$sessionId/upload', params: { sessionId } })
              }
              className="flex w-full flex-col items-center gap-2 rounded-[18px] bg-card p-4 text-muted-foreground shadow-[var(--shadow-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex w-full flex-col items-center gap-2 rounded-xl border-[1.5px] border-dashed border-border bg-secondary py-[22px]">
                <IconImage size={26} />
                <span className="text-[12.5px] font-semibold text-soft">Adicionar mídia</span>
                <span className="text-[11px] text-muted-foreground">1 vídeo ou até 3 fotos</span>
              </div>
            </button>
          )}
        </section>

        <section className="mt-[22px]">
          <Eyebrow>Análise</Eyebrow>
          <ReviewSummary
            review={review}
            sessionId={sessionId}
            hasMedia={media.length > 0}
          />
        </section>

        {review?.status === 'completed' && (
          <section className="mt-[22px]">
            <Eyebrow>Treino</Eyebrow>
            <PlanSummary reviewId={review.id} sessionId={sessionId} />
          </section>
        )}

        <div className="mt-6 flex justify-center pb-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-danger hover:bg-danger/10">
                <IconTrash size={15} />
                Excluir sessão
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir sessão?</AlertDialogTitle>
                <AlertDialogDescription>
                  Isso remove a mídia e a análise dessa sessão. Não dá pra desfazer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-danger hover:bg-danger/90"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </>
  );
}
