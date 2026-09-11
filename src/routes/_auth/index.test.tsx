import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderRoute } from '@/test/router';
import { makeAuthSession } from '@/test/fixtures';
import { useAuthStore } from '@/stores/authStore';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(),
      refreshSession: vi.fn(),
    },
  },
}));

vi.mock('@/lib/analytics', () => ({ trackEvent: vi.fn() }));

import { trackEvent } from '@/lib/analytics';

describe('/ (welcome)', () => {
  beforeEach(() => {
    useAuthStore.setState({ session: null, user: null, initialized: true });
    vi.clearAllMocks();
  });

  it('leads a logged-out visitor to signup, with login as the secondary path', async () => {
    renderRoute('/');

    expect(await screen.findByRole('link', { name: 'Cadastre sua conta' })).toHaveAttribute(
      'href',
      '/signup',
    );
    expect(screen.getByRole('link', { name: 'Acesse sua conta' })).toHaveAttribute(
      'href',
      '/login',
    );
    expect(screen.getByText('Grátis · leva menos de 1 minuto')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Prévia do app/ })).toBeInTheDocument();
  });

  it('forwards ?redirect= to the login link', async () => {
    renderRoute('/?redirect=%2Fboards');

    expect(await screen.findByRole('link', { name: 'Acesse sua conta' })).toHaveAttribute(
      'href',
      '/login?redirect=%2Fboards',
    );
  });

  it('sends a signed-in user on to /sessions', async () => {
    useAuthStore.setState({ session: makeAuthSession('user-a'), user: null, initialized: true });
    const { router } = renderRoute('/');

    await waitFor(() => expect(router.state.location.pathname).toBe('/sessions'));
  });

  it('tracks a GA event when the visitor picks "Cadastre sua conta"', async () => {
    const user = userEvent.setup();
    renderRoute('/');

    await user.click(await screen.findByRole('link', { name: 'Cadastre sua conta' }));

    expect(trackEvent).toHaveBeenCalledWith('welcome_cta_click', { cta: 'signup' });
  });

  it('tracks a GA event when the visitor picks "Acesse sua conta"', async () => {
    const user = userEvent.setup();
    renderRoute('/');

    await user.click(await screen.findByRole('link', { name: 'Acesse sua conta' }));

    expect(trackEvent).toHaveBeenCalledWith('welcome_cta_click', { cta: 'login' });
  });
});
