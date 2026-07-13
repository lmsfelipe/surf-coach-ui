import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { profileApi } from '@/lib/api/endpoints';
import { qk } from '@/lib/queryKeys';

export const profileQueryOptions = () =>
  queryOptions({ queryKey: qk.profile.me(), queryFn: () => profileApi.me() });

export const useProfile = () => useSuspenseQuery(profileQueryOptions());
