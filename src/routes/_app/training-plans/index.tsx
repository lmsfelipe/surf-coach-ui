import { createFileRoute, Link } from '@tanstack/react-router';
import {
  trainingPlansListOptions,
  useTrainingPlans,
} from '@/hooks/queries/trainingPlans';
import type { TrainingPlan } from '@/types/api';
import { formatLongDate } from '@/utils/dates';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/feedback/Eyebrow';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { PlanCard } from '@/components/feedback/PlanCard';
import { SessionListSkeleton } from '@/components/skeletons';
import { IconBarbell } from '@/components/icons';

/** Treinos tab — every plan generated from a session analysis. */
export const Route = createFileRoute('/_app/training-plans/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(trainingPlansListOptions()),
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
  component: TrainingPlansScreen,
});

function exerciseCount(plan: TrainingPlan): number {
  return plan.workouts.reduce((n, w) => n + w.exercises.length, 0);
}

function TrainingPlansScreen() {
  const { data: plans } = useTrainingPlans();

  return (
    <>
      <AppHeader />
      <div className="px-5 pb-3.5 pt-0.5">
        <h1 className="m-0 font-heading text-[26px] font-extrabold tracking-[-0.025em] text-foreground">
          Treinos
        </h1>
      </div>

      {plans.length === 0 ? (
        <div className="pt-[30px]">
          <EmptyState
            icon={<IconBarbell />}
            title="Nenhum treino gerado ainda"
            subtitle="Gere um treino a partir da análise de uma sessão e ele aparece aqui."
            cta={
              <Button asChild variant="outline" size="sm">
                <Link to="/sessions">Ver minhas sessões</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="px-5">
            <Eyebrow className="!mb-0">Seus treinos · {plans.length}</Eyebrow>
          </div>
          <div className="flex flex-col gap-3 px-5 pt-3.5 lg:grid lg:grid-cols-2">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                source={formatLongDate(plan.createdAt)}
                focus={plan.workouts[0]?.focusArea ?? 'Plano de treino'}
                workouts={plan.workouts.length}
                exercises={exerciseCount(plan)}
                status={plan.status}
                to="/training-plans/$planId"
                params={{ planId: plan.id }}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
