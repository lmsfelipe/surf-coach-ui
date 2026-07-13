import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { surfboardFormSchema, type SurfboardFormValues } from '@/schemas/surfboard';
import { useCreateSurfboard } from '@/hooks/mutations/surfboards';
import { handleMutationError } from '@/lib/api/formErrors';
import { AppHeader } from '@/components/layout/AppHeader';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { BoardFormFields } from '@/components/forms/BoardFormFields';
import { DotPulser } from '@/components/feedback/DotPulser';

export const Route = createFileRoute('/_app/boards/new')({
  component: NewBoardScreen,
});

function NewBoardScreen() {
  const navigate = useNavigate();
  const createBoard = useCreateSurfboard();
  const form = useForm<SurfboardFormValues>({
    resolver: zodResolver(surfboardFormSchema),
  });

  async function onSubmit(values: SurfboardFormValues) {
    try {
      await createBoard.mutateAsync(values);
      toast.success('Prancha adicionada.');
      await navigate({ to: '/boards' });
    } catch (err) {
      handleMutationError(err, form.setError);
    }
  }

  return (
    <div>
      <AppHeader onBack title="Nova prancha" hideAvatar />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="px-5 pb-8 pt-1.5">
            <BoardFormFields />
            <Button
              type="submit"
              size="lg"
              className="mt-5 w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? <DotPulser /> : 'Salvar'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
