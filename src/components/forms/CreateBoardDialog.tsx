import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { surfboardFormSchema, type SurfboardFormValues } from '@/schemas/surfboard';
import { useCreateSurfboard } from '@/hooks/mutations/surfboards';
import { handleMutationError } from '@/lib/api/formErrors';
import { qk } from '@/lib/queryKeys';
import type { Surfboard } from '@/types/api';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { BoardFormFields } from '@/components/forms/BoardFormFields';
import { DotPulser } from '@/components/feedback/DotPulser';

interface CreateBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fires once the board is persisted, right before the dialog closes. */
  onCreated: (board: Surfboard) => void;
}

const SHEET_CLASS =
  'max-h-[85dvh] overflow-y-auto rounded-t-[20px] border-t border-border bg-background ' +
  'px-5 pb-7 pt-5.5 shadow-[var(--shadow-lg)] sm:inset-x-auto sm:bottom-auto sm:left-1/2 ' +
  'sm:top-1/2 sm:max-w-[420px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[18px] ' +
  'inset-x-0 bottom-0 top-auto translate-x-0 translate-y-0';

/** Hosts the board-create form in a modal so callers (e.g. session creation)
 *  never navigate away and lose in-progress state. */
export function CreateBoardDialog({ open, onOpenChange, onCreated }: CreateBoardDialogProps) {
  // Bump on every open so the inner form (and its mutation) remounts fresh —
  // a cancelled attempt never leaves stale values/errors behind on reopen.
  const [instanceKey, setInstanceKey] = React.useState(0);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (next) setInstanceKey((k) => k + 1);
      }}
    >
      <DialogContent className={SHEET_CLASS}>
        <DialogTitle className="not-sr-only mb-1 font-heading text-[17px] font-bold text-foreground">
          Nova prancha
        </DialogTitle>
        <CreateBoardDialogForm
          key={instanceKey}
          onCreated={(board) => {
            onOpenChange(false);
            onCreated(board);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function CreateBoardDialogForm({ onCreated }: { onCreated: (board: Surfboard) => void }) {
  const queryClient = useQueryClient();
  const createBoard = useCreateSurfboard();
  const form = useForm<SurfboardFormValues>({ resolver: zodResolver(surfboardFormSchema) });

  async function onSubmit(values: SurfboardFormValues) {
    try {
      const board = await createBoard.mutateAsync(values);
      // Prime the cache so the caller's board list flips instantly — no
      // waiting on useCreateSurfboard's background invalidate() refetch.
      // Dedup by id: that background refetch can race this write and land
      // first, so a blind append could otherwise double the new board up.
      queryClient.setQueryData<Surfboard[]>(qk.surfboards.list(), (old) => [
        ...(old ?? []).filter((b) => b.id !== board.id),
        board,
      ]);
      toast.success('Prancha adicionada.');
      onCreated(board);
    } catch (err) {
      handleMutationError(err, form.setError);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <BoardFormFields />
        <Button
          type="submit"
          size="lg"
          className="mt-1 w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? <DotPulser /> : 'Salvar'}
        </Button>
      </form>
    </Form>
  );
}
