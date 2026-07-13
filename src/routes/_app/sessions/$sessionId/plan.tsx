import * as React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { reviewBySessionOptions, useReviewBySession } from '@/hooks/queries/reviews';
import { planByReviewOptions, usePlanByReview } from '@/hooks/queries/trainingPlans';
import { useCreateTrainingPlan } from '@/hooks/mutations/trainingPlans';
import { ApiError } from '@/lib/api/errors';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIState } from '@/components/feedback/AIState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { WorkoutAccordion } from '@/components/feedback/WorkoutAccordion';
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
  component: PlanScreen,
});

function PlanScreen() {
  const { sessionId } = Route.useParams();
  const { data: review } = useReviewBySession(sessionId);

  const header = <AppHeader onBack title="Treino" hideAvatar />;

  if (!review) {
    return (
      <>
        {header}
        <div className="pt-9">
          <EmptyState
            icon={<IconSparkle />}
            title="Analise a sessão primeiro"
            subtitle="O treino é montado a partir da análise da IA."
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

  return <PlanContent reviewId={review.id} header={header} />;
}

function PlanContent({ reviewId, header }: { reviewId: string; header: React.ReactNode }) {
  const { data: plan, refetch } = usePlanByReview(reviewId);
  const createPlan = useCreateTrainingPlan(reviewId);
  const [errored, setErrored] = React.useState(false);
  const triggered = React.useRef(false);

  const generate = React.useCallback(() => {
    setErrored(false);
    createPlan.mutate(undefined, {
      onError: (err) => {
        if (err instanceof ApiError && err.code === 'TRAINING_PLAN_ALREADY_EXISTS') {
          void refetch();
          return;
        }
        setErrored(true);
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
    if (errored) {
      return (
        <>
          {header}
          <div className="pt-9">
            <ErrorState
              title="Não conseguimos gerar o treino."
              subtitle="A IA falhou ao montar o plano. Tenta de novo?"
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
        <div className="flex flex-col gap-3">
          {workouts.map((w, i) => (
            <WorkoutAccordion key={w.id} workout={w} defaultOpen={i === 0} />
          ))}
        </div>
      </div>
    </>
  );
}
