import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { renderRoute } from '@/test/router';
import { makeAuthSession, makeSurfboard } from '@/test/fixtures';
import { useAuthStore } from '@/stores/authStore';

const API = 'http://localhost:8000';

function envelope(code: string, message: string) {
  return { error: { code, message } };
}

describe('/boards', () => {
  beforeEach(() => {
    useAuthStore.setState({ session: makeAuthSession('user-a'), user: null, initialized: true });
    server.use(
      http.get(`${API}/api/v1/surfboards/`, () =>
        HttpResponse.json([
          makeSurfboard({ id: 'b1', label: 'Daily driver', boardType: 'shortboard' }),
          makeSurfboard({ id: 'b2', label: 'Backup board', boardType: 'longboard' }),
        ]),
      ),
    );
  });

  it('renders the board list from the API', async () => {
    renderRoute('/boards');

    expect(await screen.findByText('Daily driver')).toBeInTheDocument();
    expect(screen.getByText('Backup board')).toBeInTheDocument();
  });

  it('opens a confirmation dialog and removes the card once confirmed', async () => {
    let resolveDelete: () => void = () => {};
    server.use(
      http.delete(`${API}/api/v1/surfboards/:id`, async () => {
        await new Promise<void>((resolve) => {
          resolveDelete = resolve;
        });
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    renderRoute('/boards');
    await screen.findByText('Daily driver');

    const deleteButtons = screen.getAllByRole('button', { name: 'Excluir prancha' });
    await user.click(deleteButtons[0]!);

    expect(await screen.findByText('Excluir prancha?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Excluir' }));

    // Optimistic removal happens before the (still-pending) request resolves.
    await waitFor(() => expect(screen.queryByText('Daily driver')).not.toBeInTheDocument());
    expect(screen.getByText('Backup board')).toBeInTheDocument();

    resolveDelete();
  });

  it('restores the card and toasts a pt-BR error when the delete fails', async () => {
    server.use(
      http.delete(`${API}/api/v1/surfboards/:id`, () =>
        HttpResponse.json(envelope('INTERNAL_ERROR', 'boom'), { status: 500 }),
      ),
    );
    const user = userEvent.setup();
    renderRoute('/boards');
    await screen.findByText('Daily driver');

    const deleteButtons = screen.getAllByRole('button', { name: 'Excluir prancha' });
    await user.click(deleteButtons[0]!);
    await user.click(await screen.findByRole('button', { name: 'Excluir' }));

    await waitFor(() => expect(screen.getByText('Daily driver')).toBeInTheDocument());
    expect(await screen.findByText('Algo deu errado do nosso lado. Tente de novo?')).toBeInTheDocument();
  });
});
