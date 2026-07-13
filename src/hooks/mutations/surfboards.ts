import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { surfboardsApi } from '@/lib/api/endpoints';
import { toUserMessage } from '@/lib/api/errors';
import { qk } from '@/lib/queryKeys';
import type {
  CreateSurfboardPayload,
  Surfboard,
  UpdateSurfboardPayload,
} from '@/types/api';

export function useCreateSurfboard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSurfboardPayload) => surfboardsApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.surfboards.list() }),
  });
}

export function useUpdateSurfboard(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSurfboardPayload) => surfboardsApi.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.surfboards.list() });
      void queryClient.invalidateQueries({ queryKey: qk.surfboards.detail(id) });
    },
  });
}

/**
 * Optimistic delete — remove from the cached list immediately (cheap/reversible),
 * roll back on error, toast the failure (§4.2, decision #10).
 */
export function useDeleteSurfboard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => surfboardsApi.remove(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: qk.surfboards.list() });
      const previous = queryClient.getQueryData<Surfboard[]>(qk.surfboards.list());
      queryClient.setQueryData<Surfboard[]>(qk.surfboards.list(), (old) =>
        (old ?? []).filter((b) => b.id !== id),
      );
      return { previous };
    },
    onError: (err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(qk.surfboards.list(), context.previous);
      }
      toast.error(toUserMessage(err));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: qk.surfboards.list() }),
  });
}
