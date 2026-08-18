import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { renderRoute } from '@/test/router';
import { makeAuthSession, makeMedia } from '@/test/fixtures';
import { useAuthStore } from '@/stores/authStore';
import type { Media } from '@/types/api';

// compressorjs relies on a real <canvas>, which jsdom lacks — mock it and drive
// the success callback synchronously (mirrors src/lib/media/compress.test.ts).
let compressorImpl: (file: File, options: Record<string, any>) => void = (_file, options) => {
  options.success(new Blob(['tiny'], { type: 'image/jpeg' }));
};
vi.mock('compressorjs', () => ({
  default: vi.fn().mockImplementation((file: File, options: Record<string, any>) => {
    compressorImpl(file, options);
  }),
}));
// Video goes through WebCodecs, which jsdom can't run — pass the file through.
vi.mock('@/lib/media/compressVideo', () => ({
  compressVideo: vi.fn((file: File) => Promise.resolve(file)),
}));

const API = 'http://localhost:8000';

function envelope(code: string, message: string, details: unknown = null) {
  return { error: { code, message, details } };
}

function image(name: string): File {
  return new File(['x'], name, { type: 'image/png' });
}

describe('/sessions/$sessionId/upload', () => {
  beforeEach(() => {
    useAuthStore.setState({ session: makeAuthSession('user-a'), user: null, initialized: true });
    compressorImpl = (_file, options) => options.success(new Blob(['tiny'], { type: 'image/jpeg' }));
  });

  it('renders a selection-rule violation and disables submit', async () => {
    server.use(http.get(`${API}/api/v1/sessions/:sessionId/media/`, () => HttpResponse.json([])));
    const user = userEvent.setup();
    renderRoute('/sessions/s1/upload');
    await screen.findByText('Toque pra escolher');

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, [image('a.png'), image('b.png'), image('c.png'), image('d.png')]);

    expect(await screen.findByText('Máximo de 3 fotos por sessão.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Corrija os arquivos' })).toBeDisabled();
  });

  it('uploads successfully and navigates to the session, where the new thumbnails appear', async () => {
    // The pinned test env requires exactly 3 photos per session (min === max).
    let mediaState: Media[] = [];
    server.use(
      http.get(`${API}/api/v1/sessions/:sessionId/media/`, () => HttpResponse.json(mediaState)),
      http.post(`${API}/api/v1/sessions/:sessionId/media/`, () => {
        const created = [
          makeMedia({ id: 'm-a', fileName: 'a.jpg' }),
          makeMedia({ id: 'm-b', fileName: 'b.jpg' }),
          makeMedia({ id: 'm-c', fileName: 'c.jpg' }),
        ];
        mediaState = created;
        return HttpResponse.json(created, { status: 201 });
      }),
      http.get(`${API}/api/v1/sessions/:id/review`, () =>
        HttpResponse.json(envelope('REVIEW_NOT_FOUND', 'not found'), { status: 404 }),
      ),
    );
    const user = userEvent.setup();
    const { router } = renderRoute('/sessions/s1/upload');
    await screen.findByText('Toque pra escolher');

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, [image('a.png'), image('b.png'), image('c.png')]);

    const submit = await screen.findByRole('button', { name: 'Enviar' });
    await waitFor(() => expect(submit).toBeEnabled());
    await user.click(submit);

    await waitFor(() => expect(router.state.location.pathname).toBe('/sessions/s1'));
    expect(await screen.findByAltText('a.jpg')).toBeInTheDocument();
    expect(screen.getByAltText('b.jpg')).toBeInTheDocument();
    expect(screen.getByAltText('c.jpg')).toBeInTheDocument();
  });

  it('renders UploadErrorAlert for a MEDIA_NOT_SURF_RELATED moderation rejection', async () => {
    server.use(
      http.get(`${API}/api/v1/sessions/:sessionId/media/`, () => HttpResponse.json([])),
      http.post(`${API}/api/v1/sessions/:sessionId/media/`, () =>
        HttpResponse.json(
          envelope('MEDIA_NOT_SURF_RELATED', 'Not surf related.', { reason: 'Shows a soccer game.' }),
          { status: 422 },
        ),
      ),
    );
    const user = userEvent.setup();
    renderRoute('/sessions/s1/upload');
    await screen.findByText('Toque pra escolher');

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, [image('a.png'), image('b.png'), image('c.png')]);
    const submit = await screen.findByRole('button', { name: 'Enviar' });
    await waitFor(() => expect(submit).toBeEnabled());
    await user.click(submit);

    expect(
      await screen.findByText('Este conteúdo não parece ser de surfe ou esportes aquáticos.'),
    ).toBeInTheDocument();
  });

  it('shows both the stored items and the per-file failures on a 207 partial success', async () => {
    // Start with no attached media, so a fresh 3-photo selection validates clean.
    let mediaState: Media[] = [];
    server.use(
      http.get(`${API}/api/v1/sessions/:sessionId/media/`, () => HttpResponse.json(mediaState)),
      http.post(`${API}/api/v1/sessions/:sessionId/media/`, () => {
        const succeeded = [makeMedia({ id: 'm-a', fileName: 'a.jpg' })];
        mediaState = succeeded;
        return HttpResponse.json(
          {
            succeeded,
            failed: [
              { fileName: 'b.jpg', code: 'STORAGE_UPLOAD_FAILED', message: 'failed', details: null },
              { fileName: 'c.jpg', code: 'STORAGE_UPLOAD_FAILED', message: 'failed', details: null },
            ],
          },
          { status: 207 },
        );
      }),
    );
    const user = userEvent.setup();
    renderRoute('/sessions/s1/upload');
    await screen.findByText('Toque pra escolher');

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, [image('a.png'), image('b.png'), image('c.png')]);
    const submit = await screen.findByRole('button', { name: 'Enviar' });
    await waitFor(() => expect(submit).toBeEnabled());
    await user.click(submit);

    expect(
      await screen.findByText('Não foi possível enviar b.jpg. Tente novamente.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Não foi possível enviar c.jpg. Tente novamente.')).toBeInTheDocument();
    expect(screen.getByText(/Só as que falharam ficam aqui/)).toBeInTheDocument();
    expect(screen.getByAltText('a.jpg')).toBeInTheDocument();
  });

  it('removes the thumb once a media item is deleted', async () => {
    let mediaState: Media[] = [makeMedia({ id: 'm1', fileName: 'existing.jpg' })];
    server.use(
      http.get(`${API}/api/v1/sessions/:sessionId/media/`, () => HttpResponse.json(mediaState)),
      http.delete(`${API}/api/v1/media/:id`, ({ params }) => {
        mediaState = mediaState.filter((m) => m.id !== params.id);
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    renderRoute('/sessions/s1/upload');

    expect(await screen.findByAltText('existing.jpg')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remover mídia' }));

    await waitFor(() => expect(screen.queryByAltText('existing.jpg')).not.toBeInTheDocument());
  });
});
