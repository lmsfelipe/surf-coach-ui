import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionsApi } from '@/lib/api/endpoints';
import { qk } from '@/lib/queryKeys';
import type { SessionFormValues } from '@/schemas/session';
import type { CreateSessionPayload, Session } from '@/types/api';

/** Maps form values to the API payload — wave size is meters end-to-end. */
export function sessionFormToPayload(values: SessionFormValues): CreateSessionPayload {
  return {
    sessionDate: values.sessionDate,
    location: values.location,
    waveSize: values.waveSize,
    surfboardId: values.surfboardId,
    notes: values.notes,
  };
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: SessionFormValues) =>
      sessionsApi.create(sessionFormToPayload(values)),
    onSuccess: (session: Session) => {
      queryClient.setQueryData(qk.sessions.detail(session.id), session);
      void queryClient.invalidateQueries({ queryKey: qk.sessions.list() });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sessionsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.sessions.list() }),
  });
}
