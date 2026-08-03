import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { GENDER_OPTIONS, SURF_LEVEL_OPTIONS } from '@/config/constants';
import { onboardingSchema, type OnboardingValues } from '@/schemas/profile';
import { profileQueryOptions } from '@/hooks/queries/profile';
import { useUpdateProfile } from '@/hooks/mutations/profile';
import { handleMutationError } from '@/lib/api/formErrors';
import { isProfileComplete } from '@/lib/profile';
import { WordmarkImage } from '@/components/layout/Wordmark';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { SubmitBar } from '@/components/layout/SubmitBar';
import { SelectField } from '@/components/forms/SelectField';
import { NumberField } from '@/components/forms/NumberField';
import { DateField } from '@/components/forms/DateField';
import { DotPulser } from '@/components/feedback/DotPulser';
import { HEIGHT_CM, WEIGHT_KG } from '@/config/constants';

export const Route = createFileRoute('/_app/onboarding')({
  beforeLoad: async ({ context }) => {
    const profile = await context.queryClient.ensureQueryData(profileQueryOptions());
    if (isProfileComplete(profile)) {
      throw redirect({ to: '/sessions' });
    }
  },
  component: OnboardingScreen,
});

function OnboardingScreen() {
  const navigate = useNavigate();
  const updateProfile = useUpdateProfile();
  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
  });

  async function onSubmit(values: OnboardingValues) {
    try {
      await updateProfile.mutateAsync(values);
      await navigate({ to: '/sessions' });
    } catch (err) {
      handleMutationError(err, form.setError);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="px-6 pt-[18px]">
        <WordmarkImage height={30} />
        <h1 className="mb-1 mt-3.5 font-heading text-[28px] font-extrabold tracking-[-0.025em] text-foreground">
          Bem-vindo!
        </h1>
        <p className="m-0 text-[13.5px] leading-5 text-muted-foreground">
          Vamos calibrar suas análises. Leva 30 segundos.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col">
          <div className="flex-1 px-5 pb-6 pt-[18px]">
            <Card>
              <SelectField
                name="surfLevel"
                label="Nível de surf"
                options={SURF_LEVEL_OPTIONS}
              />
              <div className="flex gap-3">
                <div className="flex-1">
                  <NumberField
                    name="heightCm"
                    label="Altura (cm)"
                    suffix="cm"
                    min={HEIGHT_CM.min}
                    max={HEIGHT_CM.max}
                  />
                </div>
                <div className="flex-1">
                  <NumberField
                    name="weightKg"
                    label="Peso (kg)"
                    suffix="kg"
                    min={WEIGHT_KG.min}
                    max={WEIGHT_KG.max}
                  />
                </div>
              </div>
              <div className="my-1 flex items-center gap-2.5">
                <div className="h-px flex-1 bg-white/[0.06]" />
                <span className="t-eyebrow !mb-0 text-[color:var(--color-text-faint)]">
                  Opcionais
                </span>
                <div className="h-px flex-1 bg-white/[0.06]" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <SelectField
                    name="gender"
                    label="Gênero"
                    optional
                    options={GENDER_OPTIONS}
                  />
                </div>
                <div className="flex-1">
                  <DateField name="birthday" label="Nascimento" optional />
                </div>
              </div>
            </Card>
          </div>
          <SubmitBar>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? <DotPulser /> : 'Concluir'}
            </Button>
          </SubmitBar>
        </form>
      </Form>
    </div>
  );
}
