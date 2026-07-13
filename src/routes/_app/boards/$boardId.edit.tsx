import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { surfboardFormSchema, type SurfboardFormValues } from '@/schemas/surfboard';
import { surfboardQueryOptions, useSurfboard } from '@/hooks/queries/surfboards';
import { useDeleteSurfboard, useUpdateSurfboard } from '@/hooks/mutations/surfboards';
import { handleMutationError } from '@/lib/api/formErrors';
import { AppHeader } from '@/components/layout/AppHeader';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { BoardFormFields } from '@/components/forms/BoardFormFields';
import { ErrorState } from '@/components/feedback/ErrorState';
import { DotPulser } from '@/components/feedback/DotPulser';
import { IconTrash } from '@/components/icons';

export const Route = createFileRoute('/_app/boards/$boardId/edit')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(surfboardQueryOptions(params.boardId)),
  pendingComponent: () => <AppHeader onBack title="Editar prancha" hideAvatar />,
  errorComponent: ({ reset }) => (
    <>
      <AppHeader onBack title="Editar prancha" hideAvatar />
      <div className="pt-9">
        <ErrorState onRetry={reset} />
      </div>
    </>
  ),
  component: EditBoardScreen,
});

function EditBoardScreen() {
  const { boardId } = Route.useParams();
  const navigate = useNavigate();
  const { data: board } = useSurfboard(boardId);
  const updateBoard = useUpdateSurfboard(boardId);
  const deleteBoard = useDeleteSurfboard();

  const form = useForm<SurfboardFormValues>({
    resolver: zodResolver(surfboardFormSchema),
    defaultValues: {
      boardType: board.boardType,
      boardSize: board.boardSize,
      volume: board.volume ?? undefined,
      label: board.label ?? undefined,
    },
  });

  async function onSubmit(values: SurfboardFormValues) {
    try {
      await updateBoard.mutateAsync(values);
      toast.success('Prancha atualizada.');
      await navigate({ to: '/boards' });
    } catch (err) {
      handleMutationError(err, form.setError);
    }
  }

  return (
    <div>
      <AppHeader onBack title="Editar prancha" hideAvatar />
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
            <div className="mt-4 flex justify-center">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-danger hover:bg-danger/10"
                  >
                    <IconTrash size={15} />
                    Excluir prancha
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir prancha?</AlertDialogTitle>
                    <AlertDialogDescription>
                      As sessões ligadas a ela ficam sem prancha. Não dá pra desfazer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-danger hover:bg-danger/90"
                      onClick={() => {
                        deleteBoard.mutate(boardId);
                        void navigate({ to: '/boards' });
                      }}
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
