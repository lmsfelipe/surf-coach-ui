import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/lib/api/endpoints';
import { qk } from '@/lib/queryKeys';
import type { Profile, UpdateProfilePayload } from '@/types/api';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileApi.update(payload),
    onSuccess: (profile: Profile) => {
      queryClient.setQueryData(qk.profile.me(), profile);
      void queryClient.invalidateQueries({ queryKey: qk.profile.me() });
    },
  });
}
