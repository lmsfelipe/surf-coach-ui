import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderRoute } from '@/test/router';
import { makeAuthSession } from '@/test/fixtures';
import { useAuthStore } from '@/stores/authStore';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(),
      refreshSession: vi.fn(),
    },
  },
}));

import { supabase } from '@/lib/supabase';

describe('/login', () => {
  beforeEach(() => {
    useAuthStore.setState({ session: null, user: null, initialized: true });
    vi.clearAllMocks();
  });

  it('shows the pt-BR validation message for an invalid email and fires no request', async () => {
    const user = userEvent.setup();
    renderRoute('/login');

    await user.type(await screen.findByLabelText('E-mail'), 'not-an-email');
    await user.type(screen.getByLabelText('Senha'), 'whatever');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('E-mail inválido')).toBeInTheDocument();
    expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('renders "E-mail ou senha inválidos." when signInWithPassword fails', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    } as never);
    const user = userEvent.setup();
    renderRoute('/login');

    await user.type(await screen.findByLabelText('E-mail'), 'surfer@example.com');
    await user.type(screen.getByLabelText('Senha'), 'password1');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('E-mail ou senha inválidos.')).toBeInTheDocument();
  });

  it('navigates to /sessions on success', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockImplementation(async () => {
      useAuthStore.setState({ session: makeAuthSession('user-a'), user: null, initialized: true });
      return { data: { user: null, session: makeAuthSession('user-a') }, error: null } as never;
    });
    const user = userEvent.setup();
    const { router } = renderRoute('/login');

    await user.type(await screen.findByLabelText('E-mail'), 'surfer@example.com');
    await user.type(screen.getByLabelText('Senha'), 'password1');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/sessions'));
  });

  it('honours ?redirect= only when it starts with "/" (open-redirect guard)', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockImplementation(async () => {
      useAuthStore.setState({ session: makeAuthSession('user-a'), user: null, initialized: true });
      return { data: { user: null, session: makeAuthSession('user-a') }, error: null } as never;
    });
    const user = userEvent.setup();
    const { router } = renderRoute('/login?redirect=https%3A%2F%2Fevil.example.com');

    await user.type(await screen.findByLabelText('E-mail'), 'surfer@example.com');
    await user.type(screen.getByLabelText('Senha'), 'password1');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    // Malicious absolute-URL redirect is ignored; falls back to /sessions.
    await waitFor(() => expect(router.state.location.pathname).toBe('/sessions'));
  });

  it('honours a same-origin ?redirect= path', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockImplementation(async () => {
      useAuthStore.setState({ session: makeAuthSession('user-a'), user: null, initialized: true });
      return { data: { user: null, session: makeAuthSession('user-a') }, error: null } as never;
    });
    const user = userEvent.setup();
    const { router } = renderRoute('/login?redirect=%2Fboards');

    await user.type(await screen.findByLabelText('E-mail'), 'surfer@example.com');
    await user.type(screen.getByLabelText('Senha'), 'password1');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/boards'));
  });
});
