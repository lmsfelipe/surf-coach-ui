import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { BOARD_TYPE_OPTIONS, LOCATION_MAX, NOTES_MAX } from '@/config/constants';
import { sessionFormSchema, type SessionFormValues } from '@/schemas/session';
import { surfboardsQueryOptions, useSurfboards } from '@/hooks/queries/surfboards';
import { useCreateSession } from '@/hooks/mutations/sessions';
import { handleMutationError } from '@/lib/api/formErrors';
import { todayISODate } from '@/utils/dates';
import { AppHeader } from '@/components/layout/AppHeader';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/forms/TextField';
import { DateField } from '@/components/forms/DateField';
import { WaveSlider } from '@/components/forms/WaveSlider';
import { SelectField } from '@/components/forms/SelectField';
import { TextareaField } from '@/components/forms/TextareaField';
import { DotPulser } from '@/components/feedback/DotPulser';
import { FormSkeleton } from '@/components/skeletons';
import { IconPin } from '@/components/icons';

export const Route = createFileRoute('/_app/sessions/new')({
  loader: ({ context }) => context.queryClient.ensureQueryData(surfboardsQueryOptions()),
  pendingComponent: () => (
    <>
      <AppHeader onBack hideAvatar />
      <FormSkeleton />
    </>
  ),
  component: NewSessionScreen,
});

function NewSessionScreen() {
  const navigate = useNavigate();
  const { data: boards } = useSurfboards();
  const createSession = useCreateSession();
  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: { sessionDate: todayISODate(), location: '', waveSize: 1 },
  });

  const boardOptions = boards.map((b) => ({
    value: b.id,
    label:
      b.label ||
      `${BOARD_TYPE_OPTIONS.find((o) => o.value === b.boardType)?.label ?? b.boardType} ${b.boardSize}'`,
  }));

  async function onSubmit(values: SessionFormValues) {
    try {
      const session = await createSession.mutateAsync(values);
      await navigate({ to: '/sessions/$sessionId/upload', params: { sessionId: session.id } });
    } catch (err) {
      handleMutationError(err, form.setError);
    }
  }

  return (
    <div>
      <AppHeader onBack hideAvatar />
      <div className="px-5">
        <h1 className="mb-1 font-heading text-2xl font-extrabold tracking-[-0.025em] text-foreground">
          Nova sessão
        </h1>
        <p className="m-0 text-[12.5px] text-muted-foreground">
          Conta como foi — a IA cuida do resto.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="px-5 pb-8 pt-4">
            <Card>
              <TextField
                name="location"
                label="Qual foi o pico?"
                placeholder="Ex.: Canal 1 — Santos/SP"
                icon={<IconPin size={16} />}
                maxLength={LOCATION_MAX}
              />
              <DateField name="sessionDate" label="Data" />
              <div className="mb-4">
                <WaveSlider name="waveSize" label="Tamanho da onda" />
              </div>
              {boardOptions.length > 0 ? (
                <SelectField
                  name="surfboardId"
                  label="Prancha usada"
                  optional
                  options={boardOptions}
                  placeholder="Selecione"
                />
              ) : (
                <div className="flex items-center justify-between gap-3 rounded-xl bg-secondary p-[12px_14px]">
                  <span className="text-[12.5px] text-muted-foreground">
                    Você ainda não cadastrou uma prancha
                  </span>
                  <Button asChild variant="outline" size="sm" className="shrink-0">
                    <Link to="/boards/new">Cadastrar prancha</Link>
                  </Button>
                </div>
              )}
              <TextareaField
                name="notes"
                label="Como foi a sessão?"
                optional
                hint="Usado pela IA para contextualizar a análise."
                placeholder="Vento de leste, ondas inconstantes mas com paredes bonitas…"
                maxLength={NOTES_MAX}
              />
            </Card>
            <Button
              type="submit"
              size="lg"
              className="mt-5 w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? <DotPulser /> : 'Salvar e enviar mídia'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
