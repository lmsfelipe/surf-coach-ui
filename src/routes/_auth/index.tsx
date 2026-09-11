import { createFileRoute, Link } from '@tanstack/react-router';
import { z } from 'zod';
import type { ScoreDimension } from '@/config/constants';
import type { Review } from '@/types/api';
import { trackEvent } from '@/lib/analytics';
import { AuthShell } from '@/components/layout/AuthShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eyebrow } from '@/components/feedback/Eyebrow';
import { OverallBand } from '@/components/feedback/OverallBand';
import { ScoreBars } from '@/components/feedback/ScoreBars';
import { IconChevronLeft } from '@/components/icons';

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute('/_auth/')({
  validateSearch: searchSchema,
  component: WelcomeScreen,
});

/** Illustrative scores for the preview (not a real session); they average to SAMPLE_OVERALL. */
const SAMPLE_OVERALL = 8.2;
const SAMPLE_SCORES: Pick<Review, ScoreDimension> = {
  scoreFlow: 8.6,
  scoreDrop: 9.1,
  scoreBalance: 6.8,
  scoreWaveSelection: 8.4,
  scoreManeuvers: 8.1,
  scoreArms: null,
};

/**
 * The mock screen is laid out at a real phone width and scaled down into the
 * bezel, so the preview reads exactly like the actual review screen.
 */
const PHONE_WIDTH = 272;
const BEZEL = 10; // 1px border + 9px padding per side
const MOCK_SCREEN_WIDTH = 375;
const MOCK_SCALE = (PHONE_WIDTH - BEZEL * 2) / MOCK_SCREEN_WIDTH;

/**
 * Public entry point for logged-out visitors: a glimpse of the app's analysis,
 * then signup leads. Returning users take the secondary button — logout and
 * expired sessions skip this screen and land on /login directly.
 */
function WelcomeScreen() {
  const { redirect } = Route.useSearch();

  return (
    <AuthShell>
      <h1 className="sr-only">SurfRise · análise de surf com IA</h1>
      <PhonePreview />
      <div className="pb-8">
        <Button asChild size="lg" className="w-full">
          <Link to="/signup" onClick={() => trackEvent('welcome_cta_click', { cta: 'signup' })}>
            Cadastre sua conta
          </Link>
        </Button>
        <p className="mb-4 mt-2.5 text-center text-[12.5px] text-muted-foreground">
          Grátis · leva menos de 1 minuto
        </p>
        <Button asChild variant="secondary" size="lg" className="w-full">
          <Link
            to="/login"
            search={{ redirect }}
            onClick={() => trackEvent('welcome_cta_click', { cta: 'login' })}
          >
            Acesse sua conta
          </Link>
        </Button>
      </div>
    </AuthShell>
  );
}

/**
 * Top half of a phone showing the review screen, cut off by a fade into the
 * page background. Static markup (no data hooks), exposed as a single image.
 */
function PhonePreview() {
  return (
    <div
      role="img"
      aria-label="Prévia do app: análise de uma sessão com nota geral 8.2"
      className="relative mx-auto h-[320px] overflow-hidden"
      style={{ width: PHONE_WIDTH + 6 }}
    >
      {/* Side buttons */}
      <div className="absolute left-0 top-[96px] h-7 w-[3px] rounded-l-sm bg-white/[0.14]" />
      <div className="absolute left-0 top-[136px] h-12 w-[3px] rounded-l-sm bg-white/[0.14]" />
      <div className="absolute right-0 top-[120px] h-16 w-[3px] rounded-r-sm bg-white/[0.14]" />

      <div
        className="absolute left-[3px] top-0 h-[560px] rounded-[44px] border border-white/[0.14] bg-[#05070d] p-[9px]"
        style={{ width: PHONE_WIDTH }}
      >
        <div className="relative h-full overflow-hidden rounded-[35px] bg-background">
          <div className="absolute left-1/2 top-2 z-10 h-[22px] w-[76px] -translate-x-1/2 rounded-full bg-black" />
          <div
            className="origin-top-left"
            style={{ width: MOCK_SCREEN_WIDTH, transform: `scale(${MOCK_SCALE})` }}
          >
            <MockReviewScreen />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background from-10% to-transparent" />
    </div>
  );
}

/** Static replica of the top of the completed review screen (review.tsx). */
function MockReviewScreen() {
  return (
    <>
      <div className="flex h-[46px] items-end justify-between px-8 pb-1 text-[15px] font-semibold text-foreground">
        <span className="tabular-nums">06:42</span>
        <span className="flex h-[13px] w-[26px] items-center rounded-[4px] border border-white/40 p-[2px]">
          <span className="h-full w-4/5 rounded-[2px] bg-foreground" />
        </span>
      </div>
      <div className="flex min-h-11 items-center justify-between gap-3 px-5 pb-2.5 pt-1.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground shadow-[var(--shadow-sm)]">
          <IconChevronLeft size={20} />
        </div>
        <div className="flex-1 text-center font-heading text-[15px] font-bold tracking-[-0.01em] text-foreground">
          Análise
        </div>
        <div className="size-9 shrink-0" />
      </div>
      <div className="px-5 pt-1">
        <OverallBand value={SAMPLE_OVERALL} sub="Sessão de exemplo" />
        <section className="mt-[22px]">
          <Eyebrow>Pontuação por aspecto</Eyebrow>
          <Card className="p-[14px]">
            <ScoreBars review={SAMPLE_SCORES} />
          </Card>
        </section>
      </div>
    </>
  );
}
