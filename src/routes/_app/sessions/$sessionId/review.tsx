import * as React from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { reviewBySessionOptions, useReviewBySession } from '@/hooks/queries/reviews';
import { planByReviewOptions, usePlanByReview } from '@/hooks/queries/trainingPlans';
import { useCreateReview } from '@/hooks/mutations/reviews';
import { ApiError } from '@/lib/api/errors';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eyebrow } from '@/components/feedback/Eyebrow';
import { AIState } from '@/components/feedback/AIState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { OverallBand } from '@/components/feedback/OverallBand';
import { ScoreBars } from '@/components/feedback/ScoreBars';
import { ReviewCard } from '@/components/feedback/ReviewCard';
import { TipList } from '@/components/feedback/TipList';
import { Link } from '@tanstack/react-router';
import { IconBarbell, IconImage } from '@/components/icons';

export const Route = createFileRoute('/_app/sessions/$sessionId/review')({
  loader: async ({ context, params }) => {
    const review = await context.queryClient.ensureQueryData(
      reviewBySessionOptions(params.sessionId),
    );
    if (review) {
      await context.queryClient.ensureQueryData(planByReviewOptions(review.id));
    }
  },
  component: ReviewScreen,
});

function PlanCta({ reviewId, sessionId }: { reviewId: string; sessionId: string }) {
  const navigate = useNavigate();
  const { data: plan } = usePlanByReview(reviewId);
  return (
    <Button
      size="lg"
      className="w-full"
      onClick={() => navigate({ to: '/sessions/$sessionId/plan', params: { sessionId } })}
    >
      <IconBarbell size={18} />
      {plan ? 'Acessar plano de treino' : 'Gerar plano de treino'}
    </Button>
  );
}

function ReviewScreen() {
  const { sessionId } = Route.useParams();
  const { data: review, refetch } = useReviewBySession(sessionId);
  const createReview = useCreateReview(sessionId);
  const [errorCode, setErrorCode] = React.useState<string | null>(null);
  const triggered = React.useRef(false);

  const generate = React.useCallback(() => {
    setErrorCode(null);
    createReview.mutate(undefined, {
      onError: (err) => {
        if (err instanceof ApiError && err.code === 'REVIEW_ALREADY_EXISTS') {
          void refetch();
          return;
        }
        setErrorCode(err instanceof ApiError ? err.code : 'AI_GENERATION_FAILED');
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

  if (!review) {
    if (errorCode === 'NO_MEDIA_FOR_SESSION') {
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

  return (
    <>
      {header}
      <div className="px-5 pt-1">
        {review.overallScore != null && <OverallBand value={review.overallScore} />}

        <section className="mt-[22px]">
          <Eyebrow>Pontuação por aspecto</Eyebrow>
          <Card className="p-[14px]">
            <ScoreBars review={review} />
          </Card>
        </section>

        <section className="mt-[22px]">
          <Eyebrow>Análise da IA{review.aiModelVersion ? ` · ${review.aiModelVersion}` : ''}</Eyebrow>
          <ReviewCard narrative={review.narrative} />
        </section>

        {review.improvementTips.length > 0 && (
          <section className="mt-[22px]">
            <Eyebrow>{review.improvementTips.length} ajustes pra próxima</Eyebrow>
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
