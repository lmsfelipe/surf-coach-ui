import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';

/** Fresh client per test: retries off, no GC delay, silent logger. */
export function makeTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function renderWithProviders(
  ui: React.ReactElement,
  { queryClient = makeTestQueryClient(), ...options }: RenderOptions & {
    queryClient?: QueryClient;
  } = {},
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { queryClient, ...render(ui, { wrapper: Wrapper, ...options }) };
}

/** For `renderHook` — same client discipline, no JSX at the call site. */
export function queryWrapper(queryClient = makeTestQueryClient()) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { Wrapper, queryClient };
}

/**
 * Mutation-hook tests seed a query with `setQueryData` and, after the mutation
 * resolves through an MSW-intercepted fetch, read it back to assert on the
 * post-mutation cache state. That query has no active observer, so
 * `makeTestQueryClient`'s `gcTime: 0` schedules it for collection the instant
 * it's set — which races the assertion once the mutation crosses the real
 * async boundary MSW introduces. Use this in place of `queryWrapper()` for
 * tests that call `getQueryData`/`getQueryState` after an `await mutateAsync`.
 */
export function makeCacheInspectionQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 60_000, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}
