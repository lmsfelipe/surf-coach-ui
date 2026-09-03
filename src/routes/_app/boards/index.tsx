import * as React from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { surfboardsQueryOptions, useSurfboards } from '@/hooks/queries/surfboards';
import { useDeleteSurfboard } from '@/hooks/mutations/surfboards';
import { AppHeader } from '@/components/layout/AppHeader';
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
} from '@/components/ui/alert-dialog';
import { BoardCard } from '@/components/feedback/BoardCard';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { BoardListSkeleton } from '@/components/skeletons';
import { IconBoard, IconPlus } from '@/components/icons';

export const Route = createFileRoute('/_app/boards/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(surfboardsQueryOptions()),
  pendingComponent: () => (
    <>
      <AppHeader onBack title="Pranchas" hideAvatar />
      <BoardListSkeleton />
    </>
  ),
  errorComponent: ({ reset }) => (
    <>
      <AppHeader onBack title="Pranchas" hideAvatar />
      <div className="pt-9">
        <ErrorState onRetry={reset} />
      </div>
    </>
  ),
  component: BoardsScreen,
});

function BoardsScreen() {
  const navigate = useNavigate();
  const { data: boards } = useSurfboards();
  const deleteBoard = useDeleteSurfboard();
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  return (
    <>
      <AppHeader onBack title="Pranchas" />
      {boards.length === 0 ? (
        <div className="pt-[30px]">
          <EmptyState
            icon={<IconBoard />}
            title="Nenhuma prancha cadastrada"
            subtitle="Cadastre suas pranchas pra ligar cada sessão ao equipamento certo."
            cta={
              <Button asChild>
                <Link to="/boards/new">
                  <IconPlus size={16} />
                  Adicionar prancha
                </Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-5 pt-1.5">
          <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2">
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onEdit={() =>
                  navigate({ to: '/boards/$boardId/edit', params: { boardId: board.id } })
                }
                onDelete={() => setDeleteId(board.id)}
              />
            ))}
          </div>
          <Button asChild className="w-full">
            <Link to="/boards/new">
              <IconPlus size={16} />
              Adicionar
            </Link>
          </Button>
        </div>
      )}

      <AlertDialog open={deleteId != null} onOpenChange={(o) => !o && setDeleteId(null)}>
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
                if (deleteId) deleteBoard.mutate(deleteId);
                setDeleteId(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
