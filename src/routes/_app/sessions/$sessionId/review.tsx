import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  reviewBySessionOptions,
  useReviewBySession,
} from "@/hooks/queries/reviews";
import {
  planByReviewOptions,
  usePlanByReview,
} from "@/hooks/queries/trainingPlans";
import { useCreateReview } from "@/hooks/mutations/reviews";
import { useRetryReview } from "@/hooks/mutations/reviews";
import { ApiError } from "@/lib/api/errors";
import type { PlanStatus } from "@/types/api";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/feedback/Eyebrow";
import { AIState } from "@/components/feedback/AIState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { OverallBand } from "@/components/feedback/OverallBand";
import { ScoreBars } from "@/components/feedback/ScoreBars";
import { ReviewCard } from "@/components/feedback/ReviewCard";
import { TipList } from "@/components/feedback/TipList";
import { Disclaimer } from "@/components/feedback/TrainingDisclaimer";
import { Link } from "@tanstack/react-router";
import { IconBarbell, IconImage } from "@/components/icons";
import { Alert } from "@/components/feedback/Alert";
import { ScorePanelSkeleton } from "@/components/skeletons";

export const Route = createFileRoute("/_app/sessions/$sessionId/review")({
  loader: async ({ context, params }) => {
    const review = await context.queryClient.ensureQueryData(
      reviewBySessionOptions(params.sessionId)
    );
    if (review) {
      await context.queryClient.ensureQueryData(planByReviewOptions(review.id));
    }
  },
  pendingComponent: () => (
    <>
      <AppHeader onBack title="Análise" hideAvatar />
      <ScorePanelSkeleton />
    </>
  ),
  component: ReviewScreen,
});

/** Label tracks plan status — a failed plan must not read "Acessar". */
function planCtaLabel(status: PlanStatus | undefined): string {
  switch (status) {
    case "processing":
      return "Acompanhar seu treino";
    case "failed":
      return "Tentar gerar o treino de novo";
    case "completed":
      return "Acessar plano de treino";
    default:
      return "Gerar plano de treino";
  }
}

function PlanCta({
  reviewId,
  sessionId,
}: {
  reviewId: string;
  sessionId: string;
}) {
  const navigate = useNavigate();
  const { data: plan } = usePlanByReview(reviewId);
  return (
    <Button
      size="lg"
      className="w-full"
      onClick={() =>
        navigate({ to: "/sessions/$sessionId/plan", params: { sessionId } })
      }
    >
      <IconBarbell size={18} />
      {planCtaLabel(plan?.status)}
    </Button>
  );
}

function ReviewScreen() {
  const { sessionId } = Route.useParams();
  const { data: review, refetch, timedOut } = useReviewBySession(sessionId);
  const createReview = useCreateReview(sessionId);
  const { mutate: retry, isPending: isRetrying } = useRetryReview();
  const [errorCode, setErrorCode] = React.useState<string | null>(null);
  const triggered = React.useRef(false);

  const generate = React.useCallback(() => {
    setErrorCode(null);
    createReview.mutate(undefined, {
      onError: (err) => {
        if (err instanceof ApiError && err.code === "REVIEW_ALREADY_EXISTS") {
          void refetch();
          return;
        }
        setErrorCode(
          err instanceof ApiError ? err.code : "AI_GENERATION_FAILED"
        );
      },
    });
  }, [createReview, refetch]);

  // Auto-generate when arriving without an existing review.
  React.useEffect(() => {
    if (!review && !triggered.current) {
      triggered.current = true;
      generate();
    }
  }, [review, generate]);

  const header = <AppHeader onBack title="Análise" hideAvatar />;

  // No review yet — either still creating (202 in flight) or create errored
  if (!review) {
    if (errorCode === "NO_MEDIA_FOR_SESSION") {
      return (
        <>
          {header}
          <div className="pt-9">
            <EmptyState
              icon={<IconImage />}
              title="Sem mídia pra analisar"
              subtitle="Mande um vídeo curto e a gente analisa em menos de 30s."
              cta={
                <Button asChild>
                  <Link to="/sessions/$sessionId/upload" params={{ sessionId }}>
                    <IconImage size={16} />
                    Adicionar mídia
                  </Link>
                </Button>
              }
            />
          </div>
        </>
      );
    }
    if (errorCode) {
      return (
        <>
          {header}
          <div className="pt-9">
            <ErrorState
              title="Não conseguimos analisar agora."
              subtitle="A IA falhou ao processar a mídia. Tenta de novo?"
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
            title="Analisando sua sessão…"
            subtitle="A IA está assistindo seus take-offs. Leva menos de 30s."
          />
        </div>
      </>
    );
  }

  // Review exists but AI is still generating
  if (review.status === "processing") {
    return (
      <>
        {header}
        <div className="pt-[30px]">
          <AIState
            title="Analisando sua sessão…"
            subtitle="A IA está assistindo seus take-offs. Leva menos de 30s."
          />
          {timedOut && (
            <div className="px-5 pt-4">
              <Alert tone="warning">
                A análise está demorando mais que o esperado. Tente recarregar a
                página em alguns instantes.
              </Alert>
            </div>
          )}
        </div>
      </>
    );
  }

  // Review failed — show error with retry
  if (review.status === "failed") {
    return (
      <>
        {header}
        <div className="pt-9">
          <ErrorState
            title="Análise não concluída"
            subtitle={
              review.errorMessage ?? "Não foi possível gerar a análise."
            }
            onRetry={
              isRetrying ? undefined : () => retry({ reviewId: review.id })
            }
          />
        </div>
      </>
    );
  }

  // status === "completed"
  return (
    <>
      {header}
      <div className="px-5 pt-1">
        {review.overallScore != null && (
          <OverallBand value={review.overallScore} />
        )}

        <section className="mt-[22px]">
          <Disclaimer className="my-3">
            Esta análise não substitui a avaliação de um profissional.
          </Disclaimer>
          <Eyebrow>Pontuação por aspecto</Eyebrow>
          <Card className="p-[14px]">
            <ScoreBars review={review} />
          </Card>
        </section>

        {review.narrative && (
          <section className="mt-[22px]">
            <Eyebrow>Análise feita por IA</Eyebrow>
            <ReviewCard narrative={review.narrative} />
          </section>
        )}

        {review.improvementTips && review.improvementTips.length > 0 && (
          <section className="mt-[22px]">
            <Eyebrow>
              {review.improvementTips.length} ajustes pra próxima
            </Eyebrow>
            <TipList tips={review.improvementTips} />
          </section>
        )}

        <div className="mt-[22px] pb-6">
          <PlanCta reviewId={review.id} sessionId={sessionId} />
        </div>
      </div>
    </>
  );
}
