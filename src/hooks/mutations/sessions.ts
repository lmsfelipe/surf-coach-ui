import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionsApi } from '@/lib/api/endpoints';
import { qk } from '@/lib/queryKeys';
import { metersToFeet, roundTo } from '@/utils/units';
import type { SessionFormValues } from '@/schemas/session';
import type { CreateSessionPayload, Session } from '@/types/api';

/** Map the meters-based form values to the feet-based API payload (§4.2). */
export function sessionFormToPayload(values: SessionFormValues): CreateSessionPayload {
  return {
    sessionDate: values.sessionDate,
    location: values.location,
    waveSize: roundTo(metersToFeet(values.waveSizeMeters), 2),
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
