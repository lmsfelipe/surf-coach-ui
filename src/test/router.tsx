import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router';
import { render } from '@testing-library/react';
import { routeTree } from '@/routeTree.gen';
import { makeTestQueryClient } from './utils';

/**
 * `router.context.queryClient` only reaches route *loaders* — components call
 * query hooks (useSuspenseQuery et al.) through React context, so the render
 * tree still needs its own `<QueryClientProvider>`, exactly like main.tsx.
 */
export function renderRoute(initialPath: string, queryClient = makeTestQueryClient()) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
    context: { queryClient },
  });
  return {
    router,
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    ),
  };
}
