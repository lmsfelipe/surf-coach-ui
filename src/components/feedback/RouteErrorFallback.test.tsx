import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { RouteErrorFallback } from './RouteErrorFallback';
import { ApiError, NetworkError } from '@/lib/api/errors';

vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ invalidate: vi.fn() }),
}));

function renderWith(error: unknown) {
  render(
    <RouteErrorFallback
      {...({ error, reset: vi.fn() } as unknown as ErrorComponentProps)}
    />,
  );
}

describe('RouteErrorFallback', () => {
  it('shows the service-outage page for a connection failure', () => {
    renderWith(new NetworkError());
    expect(screen.getByText('Serviços indisponíveis')).toBeInTheDocument();
  });

  it('shows the service-outage page for a 5xx response', () => {
    renderWith(new ApiError('INTERNAL_ERROR', 'boom', 503));
    expect(screen.getByText('Serviços indisponíveis')).toBeInTheDocument();
  });

  it('treats a 4xx as a genuine crash, not an outage', () => {
    renderWith(new ApiError('NOT_FOUND', 'nope', 404));
    expect(screen.queryByText('Serviços indisponíveis')).not.toBeInTheDocument();
    expect(screen.getByText('Ops, algo quebrou.')).toBeInTheDocument();
  });

  it('treats a non-API error as a genuine crash', () => {
    renderWith(new Error('unexpected'));
    expect(screen.queryByText('Serviços indisponíveis')).not.toBeInTheDocument();
    expect(screen.getByText('Ops, algo quebrou.')).toBeInTheDocument();
  });
});
