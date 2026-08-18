import { beforeEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { renderRoute } from '@/test/router';
import { makeAuthSession, makeMedia, makeReview, makeSession, makeSurfboard } from '@/test/fixtures';
import { useAuthStore } from '@/stores/authStore';

const API = 'http://localhost:8000';

function envelope(code: string, message: string) {
  return { error: { code, message } };
}

function seedSession() {
  server.use(
    http.get(`${API}/api/v1/sessions/:id`, () =>
      HttpResponse.json(makeSession({ id: 's1', location: 'Maresias', waveSize: 1.4, surfboardId: 'b1' })),
    ),
    http.get(`${API}/api/v1/surfboards/`, () =>
      HttpResponse.json([makeSurfboard({ id: 'b1', label: 'Daily driver' })]),
    ),
  );
}

describe('/sessions/$sessionId', () => {
  beforeEach(() => {
    useAuthStore.setState({ session: makeAuthSession('user-a'), user: null, initialized: true });
    seedSession();
  });

  it('renders the session detail and the media gallery when media exists', async () => {
    server.use(
      http.get(`${API}/api/v1/sessions/:sessionId/media/`, () =>
        HttpResponse.json([makeMedia({ id: 'm1', fileName: 'wave1.jpg' })]),
      ),
      http.get(`${API}/api/v1/sessions/:id/review`, () =>
        HttpResponse.json(envelope('REVIEW_NOT_FOUND', 'not found'), { status: 404 }),
      ),
    );

    renderRoute('/sessions/s1');

    expect(await screen.findByText('Maresias')).toBeInTheDocument();
    expect(screen.getByText('1,4 m')).toBeInTheDocument();
    expect(screen.getByText('Daily driver')).toBeInTheDocument();
    expect(screen.getByAltText('wave1.jpg')).toBeInTheDocument();
  });

  it('shows the "add media" prompt when the session has no media', async () => {
    server.use(
      http.get(`${API}/api/v1/sessions/:sessionId/media/`, () => HttpResponse.json([])),
      http.get(`${API}/api/v1/sessions/:id/review`, () =>
        HttpResponse.json(envelope('REVIEW_NOT_FOUND', 'not found'), { status: 404 }),
      ),
    );

    renderRoute('/sessions/s1');

    expect(await screen.findByText('Adicionar mídia')).toBeInTheDocument();
    expect(screen.getByText('Adicione mídia para analisar com a IA.')).toBeInTheDocument();
  });

  it('shows the processing state for a review still generating', async () => {
    server.use(
      http.get(`${API}/api/v1/sessions/:sessionId/media/`, () =>
        HttpResponse.json([makeMedia({ id: 'm1' })]),
      ),
      http.get(`${API}/api/v1/sessions/:id/review`, () =>
        HttpResponse.json(makeReview({ id: 'r1', sessionId: 's1', status: 'processing' })),
      ),
    );

    renderRoute('/sessions/s1');

    expect(await screen.findByText('Analisando sua sessão…')).toBeInTheDocument();
  });

  it('shows the score summary and a retry-free plan link for a completed review', async () => {
    server.use(
      http.get(`${API}/api/v1/sessions/:sessionId/media/`, () =>
        HttpResponse.json([makeMedia({ id: 'm1' })]),
      ),
      http.get(`${API}/api/v1/sessions/:id/review`, () =>
        HttpResponse.json(
          makeReview({
            id: 'r1',
            sessionId: 's1',
            status: 'completed',
            overallScore: 7.2,
            improvementTips: ['Abaixe o centro de gravidade'],
          }),
        ),
      ),
      http.get(`${API}/api/v1/reviews/:reviewId/training-plan`, () =>
        HttpResponse.json(envelope('NOT_FOUND', 'not found'), { status: 404 }),
      ),
    );

    renderRoute('/sessions/s1');

    expect(await screen.findByText('Nota 7.2 · 6 aspectos')).toBeInTheDocument();
    expect(screen.getByText('Abaixe o centro de gravidade')).toBeInTheDocument();
  });

  it('shows the failed state with a retry action for a failed review', async () => {
    server.use(
      http.get(`${API}/api/v1/sessions/:sessionId/media/`, () =>
        HttpResponse.json([makeMedia({ id: 'm1' })]),
      ),
      http.get(`${API}/api/v1/sessions/:id/review`, () =>
        HttpResponse.json(
          makeReview({ id: 'r1', sessionId: 's1', status: 'failed', errorMessage: 'Falha ao processar.' }),
        ),
      ),
    );

    renderRoute('/sessions/s1');

    expect(await screen.findByText('Análise não concluída')).toBeInTheDocument();
    expect(screen.getByText('Falha ao processar.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
  });
});
