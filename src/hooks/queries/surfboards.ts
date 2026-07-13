import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { surfboardsApi } from '@/lib/api/endpoints';
import { qk } from '@/lib/queryKeys';

export const surfboardsQueryOptions = () =>
  queryOptions({ queryKey: qk.surfboards.list(), queryFn: () => surfboardsApi.list() });

export const surfboardQueryOptions = (id: string) =>
  queryOptions({
    queryKey: qk.surfboards.detail(id),
    queryFn: () => surfboardsApi.detail(id),
  });

export const useSurfboards = () => useSuspenseQuery(surfboardsQueryOptions());
export const useSurfboard = (id: string) => useSuspenseQuery(surfboardQueryOptions(id));
