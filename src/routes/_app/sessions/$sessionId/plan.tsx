import * as React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { reviewBySessionOptions, useReviewBySession } from '@/hooks/queries/reviews';
import { planByReviewOptions, usePlanByReview } from '@/hooks/queries/trainingPlans';
import { useCreateTrainingPlan, useRetryTrainingPlan } from '@/hooks/mutations/trainingPlans';
import { ApiError, errorMessage } from '@/lib/api/errors';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIState } from '@/components/feedback/AIState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { WorkoutAccordion } from '@/components/feedback/WorkoutAccordion';
import { TrainingDisclaimer } from '@/components/feedback/TrainingDisclaimer';
import { Alert } from '@/components/feedback/Alert';
import { PlanSkeleton } from '@/components/skeletons';
import { IconSparkle } from '@/components/icons';

export const Route = createFileRoute('/_app/sessions/$sessionId/plan')({
  loader: async ({ context, params }) => {
    const review = await context.queryClient.ensureQueryData(
      reviewBySessionOptions(params.sessionId),
    );
    if (review) {
      await context.queryClient.ensureQueryData(planByReviewOptions(review.id));
    }
  },
  pendingComponent: () => (
    <>
      <AppHeader onBack title="Treino" hideAvatar />
      <PlanSkeleton />
    </>
  ),
  component: PlanScreen,
});

/** Sends the user back to the analysis — the plan is derived from it. */
function NeedsReview({
  sessionId,
  title,
  subtitle,
  header,
}: {
  sessionId: string;
  title: string;
  subtitle: string;
  header: React.ReactNode;
}) {
  return (
    <>
      {header}
      <div className="pt-9">
        <EmptyState
          icon={<IconSparkle />}
          title={title}
          subtitle={subtitle}
          cta={
            <Button asChild>
              <Link to="/sessions/$sessionId/review" params={{ sessionId }}>
                Ver análise
              </Link>
            </Button>
          }
        />
      </div>
    </>
  );
}

function PlanScreen() {
  const { sessionId } = Route.useParams();
  const { data: review } = useReviewBySession(sessionId);

  const header = <AppHeader onBack title="Treino" hideAvatar />;

  if (!review) {
    return (
      <NeedsReview
        sessionId={sessionId}
        header={header}
        title="Analise a sessão primeiro"
        subtitle="O treino é montado a partir da análise da IA."
      />
    );
  }

  // The backend rejects a plan built on an unfinished analysis, so don't let
  // PlanContent auto-fire the create and surface that as a generic failure.
  // useReviewBySession is polling here, so this resolves on its own.
  if (review.status === 'processing') {
    return (
      <NeedsReview
        sessionId={sessionId}
        header={header}
        title="Aguardando a análise"
        subtitle="Assim que a IA terminar de analisar a sessão, dá pra montar o treino."
      />
    );
  }

  if (review.status === 'failed') {
    return (
      <NeedsReview
        sessionId={sessionId}
        header={header}
        title="A análise não foi concluída"
        subtitle="O treino sai da análise. Tente gerar a análise de novo primeiro."
      />
    );
  }

  // No score means the analysis didn't rate a surf session (e.g. off-topic
  // media), so there's nothing to build a plan from. Guard the direct route
  // too, not just the review CTA — otherwise a malicious upload could keep
  // firing AI plan generation here. Revisit once content moderation gates
  // this upstream.
  if (review.overallScore == null) {
    return (
      <NeedsReview
        sessionId={sessionId}
        header={header}
        title="Sem treino pra essa sessão"
        subtitle="Essa análise não gerou pontuação, então não dá pra montar um treino."
      />
    );
  }

  return <PlanContent reviewId={review.id} header={header} />;
}

function PlanContent({ reviewId, header }: { reviewId: string; header: React.ReactNode }) {
  const { data: plan, refetch, timedOut } = usePlanByReview(reviewId);
  const createPlan = useCreateTrainingPlan(reviewId);
  const { mutate: retryPlan, isPending: isRetrying } = useRetryTrainingPlan();
  const [errorCode, setErrorCode] = React.useState<string | null>(null);
  const triggered = React.useRef(false);

  const generate = React.useCallback(() => {
    setErrorCode(null);
    createPlan.mutate(undefined, {
      onError: (err) => {
        if (err instanceof ApiError && err.code === 'TRAINING_PLAN_ALREADY_EXISTS') {
          void refetch();
          return;
        }
        setErrorCode(err instanceof ApiError ? err.code : 'AI_GENERATION_FAILED');
      },
    });
  }, [createPlan, refetch]);

  React.useEffect(() => {
    if (!plan && !triggered.current) {
      triggered.current = true;
      generate();
    }
  }, [plan, generate]);

  if (!plan) {
    if (errorCode) {
      return (
        <>
          {header}
          <div className="pt-9">
            <ErrorState
              title="Não conseguimos gerar o treino."
              subtitle={errorMessage(errorCode)}
              onRetry={generate}
            />
          </div>
        </>
      );
    }
    return (
      <>
        {header}
        <div className="pt-[30px]">
          <AIState
            title="Montando seu treino…"
            subtitle="Transformando os ajustes da análise em exercícios. Leva ~20s."
          />
        </div>
      </>
    );
  }

  // Plan row exists but the AI is still generating the workouts
  if (plan.status === 'processing') {
    return (
      <>
        {header}
        <div className="pt-[30px]">
          <AIState
            title="Montando seu treino…"
            subtitle="Transformando os ajustes da análise em exercícios. Leva ~20s."
          />
          {timedOut && (
            <div className="px-5 pt-4">
              <Alert tone="warning">
                O treino está demorando mais que o esperado. Tente recarregar a página em alguns instantes.
              </Alert>
            </div>
          )}
        </div>
      </>
    );
  }

  // Generation failed — show error with retry (polling resumes automatically)
  if (plan.status === 'failed') {
    return (
      <>
        {header}
        <div className="pt-9">
          <ErrorState
            title="Treino não concluído"
            subtitle={plan.errorMessage ?? 'Não foi possível gerar o plano.'}
            onRetry={isRetrying ? undefined : () => retryPlan({ planId: plan.id })}
          />
        </div>
      </>
    );
  }

  // status === "completed"
  const workouts = [...plan.workouts].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
  const exerciseCount = workouts.reduce((n, w) => n + w.exercises.length, 0);
  const headline = workouts[0]?.focusArea ?? 'Plano de treino';

  return (
    <>
      {header}
      <div className="px-5 pb-6 pt-1">
        <Badge tone="action">
          <IconSparkle size={12} /> Gerado pela IA da sessão
        </Badge>
        <h1 className="mb-1 mt-3 font-heading text-[23px] font-extrabold tracking-[-0.025em] text-foreground">
          {headline}
        </h1>
        <p className="mb-[18px] text-[12.5px] leading-[18px] text-muted-foreground">
          {workouts.length} treinos · {exerciseCount} exercícios
        </p>
        <TrainingDisclaimer className="mb-[18px]" />
        <div className="flex flex-col gap-3">
          {workouts.map((w, i) => (
            <WorkoutAccordion key={w.id} workout={w} defaultOpen={i === 0} />
          ))}
        </div>
      </div>
    </>
  );
}
