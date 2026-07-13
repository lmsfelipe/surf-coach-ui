import { createFileRoute } from '@tanstack/react-router';
import { planQueryOptions, usePlan } from '@/hooks/queries/trainingPlans';
import { AppHeader } from '@/components/layout/AppHeader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { WorkoutAccordion } from '@/components/feedback/WorkoutAccordion';
import { PlanSkeleton } from '@/components/skeletons';

export const Route = createFileRoute('/_app/training-plans/$planId')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(planQueryOptions(params.planId)),
  pendingComponent: () => (
    <>
      <AppHeader onBack title="Treino" hideAvatar />
      <PlanSkeleton />
    </>
  ),
  errorComponent: ({ reset }) => (
    <>
      <AppHeader onBack title="Treino" hideAvatar />
      <div className="pt-9">
        <ErrorState onRetry={reset} />
      </div>
    </>
  ),
  component: PlanDetailScreen,
});

function PlanDetailScreen() {
  const { planId } = Route.useParams();
  const { data: plan } = usePlan(planId);
  const workouts = [...plan.workouts].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
  const exerciseCount = workouts.reduce((n, w) => n + w.exercises.length, 0);

  return (
    <>
      <AppHeader onBack title="Treino" hideAvatar />
      <div className="px-5 pb-6 pt-1">
        <h1 className="mb-1 font-heading text-[23px] font-extrabold tracking-[-0.025em] text-foreground">
          {workouts[0]?.focusArea ?? 'Plano de treino'}
        </h1>
        <p className="mb-[18px] text-[12.5px] text-muted-foreground">
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
