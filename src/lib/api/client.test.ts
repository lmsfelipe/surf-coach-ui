import { beforeEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { stubLocation } from '@/test/location';
import { makeAuthSession } from '@/test/fixtures';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn().mockResolvedValue({ error: null }),
      refreshSession: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithPassword: vi.fn(),
    },
    storage: { from: vi.fn() },
  },
}));
vi.mock('@sentry/react', () => ({ captureException: vi.fn(), setUser: vi.fn() }));

import * as Sentry from '@sentry/react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { api, apiFetch } from './client';
import { ApiError, NetworkError } from './errors';

const API = 'http://localhost:8000';

describe('apiFetch — 401 refresh & retry', () => {
  beforeEach(() => {
    useAuthStore.setState({ session: makeAuthSession('user-a'), user: null, initialized: true });
    vi.clearAllMocks();
  });

  it('resolves parsed JSON on a 200 first try; refreshSession is never called', async () => {
    await expect(api.get('/api/v1/sessions/')).resolves.toBeInstanceOf(Array);
    expect(supabase.auth.refreshSession).not.toHaveBeenCalled();
  });

  it('401 → refresh OK → retry 200 resolves; refreshSession called exactly once; store holds new session', async () => {
    let call = 0;
    server.use(
      http.get(`${API}/api/v1/sessions/`, () =>
        ++call === 1
          ? HttpResponse.json({ error: { code: 'INVALID_TOKEN' } }, { status: 401 })
          : HttpResponse.json([]),
      ),
    );
    vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
      data: { session: makeAuthSession('user-a-refreshed') },
      error: null,
    } as never);

    await expect(api.get('/api/v1/sessions/')).resolves.toEqual([]);

    expect(supabase.auth.refreshSession).toHaveBeenCalledOnce();
    expect(useAuthStore.getState().session?.access_token).toBe('token-user-a-refreshed');
  });

  it('401 → refresh OK → retry still 401 throws, signs out, and redirects to /login', async () => {
    const assign = stubLocation('/sessions');
    server.use(
      http.get(`${API}/api/v1/sessions/`, () =>
        HttpResponse.json({ error: { code: 'INVALID_TOKEN' } }, { status: 401 }),
      ),
    );
    vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
      data: { session: makeAuthSession('user-a-refreshed') },
      error: null,
    } as never);

    await expect(api.get('/api/v1/sessions/')).rejects.toBeInstanceOf(ApiError);

    expect(supabase.auth.signOut).toHaveBeenCalledOnce();
    expect(assign).toHaveBeenCalledWith('/login');
  });

  it('401 → refresh returns no session throws, signs out, and makes no second fetch', async () => {
    let calls = 0;
    stubLocation('/sessions');
    server.use(
      http.get(`${API}/api/v1/sessions/`, () => {
        calls += 1;
        return HttpResponse.json({ error: { code: 'INVALID_TOKEN' } }, { status: 401 });
      }),
    );
    vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as never);

    await expect(api.get('/api/v1/sessions/')).rejects.toBeInstanceOf(ApiError);

    expect(supabase.auth.signOut).toHaveBeenCalledOnce();
    expect(calls).toBe(1);
  });

  it('401 with anonymous:true throws immediately — no refresh, no sign-out', async () => {
    server.use(
      http.get(`${API}/api/v1/sessions/`, () =>
        HttpResponse.json({ error: { code: 'INVALID_TOKEN' } }, { status: 401 }),
      ),
    );

    await expect(api.get('/api/v1/sessions/', { anonymous: true })).rejects.toBeInstanceOf(
      ApiError,
    );

    expect(supabase.auth.refreshSession).not.toHaveBeenCalled();
    expect(supabase.auth.signOut).not.toHaveBeenCalled();
  });

  it('401 while already on /login signs out but does not redirect (AUTH_PATHS guard)', async () => {
    const assign = stubLocation('/login');
    server.use(
      http.get(`${API}/api/v1/sessions/`, () =>
        HttpResponse.json({ error: { code: 'INVALID_TOKEN' } }, { status: 401 }),
      ),
    );
    vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as never);

    await expect(api.get('/api/v1/sessions/')).rejects.toBeInstanceOf(ApiError);

    expect(supabase.auth.signOut).toHaveBeenCalledOnce();
    expect(assign).not.toHaveBeenCalled();
  });

  it('the retry request carries the refreshed token, not the stale one', async () => {
    const seenAuth: (string | null)[] = [];
    let call = 0;
    server.use(
      http.get(`${API}/api/v1/sessions/`, ({ request }) => {
        seenAuth.push(request.headers.get('Authorization'));
        return ++call === 1
          ? HttpResponse.json({ error: { code: 'INVALID_TOKEN' } }, { status: 401 })
          : HttpResponse.json([]);
      }),
    );
    vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
      data: { session: makeAuthSession('user-a-refreshed') },
      error: null,
    } as never);

    await api.get('/api/v1/sessions/');

    expect(seenAuth[0]).toBe('Bearer token-user-a');
    expect(seenAuth[1]).toBe('Bearer token-user-a-refreshed');
  });

  it('a network throw on the first fetch surfaces as NetworkError and reports to Sentry', async () => {
    server.use(http.get(`${API}/api/v1/sessions/`, () => HttpResponse.error()));

    await expect(api.get('/api/v1/sessions/')).rejects.toBeInstanceOf(NetworkError);
    expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(NetworkError));
  });

  it('a network throw on the retry fetch surfaces as NetworkError (inner catch)', async () => {
    let call = 0;
    server.use(
      http.get(`${API}/api/v1/sessions/`, () => {
        call += 1;
        if (call === 1) {
          return HttpResponse.json({ error: { code: 'INVALID_TOKEN' } }, { status: 401 });
        }
        return HttpResponse.error();
      }),
    );
    vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
      data: { session: makeAuthSession('user-a-refreshed') },
      error: null,
    } as never);

    await expect(api.get('/api/v1/sessions/')).rejects.toBeInstanceOf(NetworkError);
    expect(call).toBe(2);
  });
});

describe('apiFetch — response handling', () => {
  beforeEach(() => {
    useAuthStore.setState({ session: makeAuthSession('user-a'), user: null, initialized: true });
    vi.clearAllMocks();
  });

  it('204 No Content resolves undefined without attempting res.json()', async () => {
    server.use(http.delete(`${API}/api/v1/surfboards/:id`, () => new HttpResponse(null, { status: 204 })));

    await expect(api.delete('/api/v1/surfboards/b1')).resolves.toBeUndefined();
  });

  it('a non-JSON error body maps to ApiError with code HTTP_ERROR and the statusText message', async () => {
    server.use(
      http.get(
        `${API}/api/v1/sessions/`,
        () =>
          new HttpResponse('not json', {
            status: 400,
            statusText: 'Bad Request',
            headers: { 'Content-Type': 'text/plain' },
          }),
      ),
    );

    const err = await api.get('/api/v1/sessions/').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).code).toBe('HTTP_ERROR');
    expect((err as ApiError).message).toBe('Bad Request');
  });

  it('reports 500s to Sentry', async () => {
    server.use(
      http.get(`${API}/api/v1/sessions/`, () =>
        HttpResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'boom' } }, { status: 500 }),
      ),
    );

    await expect(api.get('/api/v1/sessions/')).rejects.toBeInstanceOf(ApiError);
    expect(Sentry.captureException).toHaveBeenCalledOnce();
  });

  it('does not report 422s to Sentry (handled UX, not a bug)', async () => {
    server.use(
      http.get(`${API}/api/v1/sessions/`, () =>
        HttpResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'bad' } }, { status: 422 }),
      ),
    );

    await expect(api.get('/api/v1/sessions/')).rejects.toBeInstanceOf(ApiError);
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('does not set a JSON Content-Type for a FormData body — the runtime sets the multipart boundary', async () => {
    let seenContentType: string | null = null;
    server.use(
      http.post(`${API}/api/v1/test-formdata`, ({ request }) => {
        seenContentType = request.headers.get('Content-Type');
        return HttpResponse.json({ ok: true });
      }),
    );
    const form = new FormData();
    form.append('file', new File(['x'], 'a.jpg', { type: 'image/jpeg' }));

    await apiFetch('/api/v1/test-formdata', { method: 'POST', body: form });

    expect(seenContentType).not.toBe('application/json');
    expect(seenContentType).toMatch(/^multipart\/form-data/);
  });

  it('api.post serializes a JSON body and sets Content-Type: application/json', async () => {
    let seenContentType: string | null = null;
    let seenBody: unknown;
    server.use(
      http.post(`${API}/api/v1/test-json`, async ({ request }) => {
        seenContentType = request.headers.get('Content-Type');
        seenBody = await request.json();
        return HttpResponse.json({ ok: true });
      }),
    );

    await api.post('/api/v1/test-json', { hello: 'world' });

    expect(seenContentType).toBe('application/json');
    expect(seenBody).toEqual({ hello: 'world' });
  });

  it('api.patch sends a PATCH request with a JSON body', async () => {
    server.use(
      http.patch(`${API}/api/v1/test-json`, async ({ request }) => {
        expect(request.method).toBe('PATCH');
        return HttpResponse.json({ ok: true });
      }),
    );

    await expect(api.patch('/api/v1/test-json', { a: 1 })).resolves.toEqual({ ok: true });
  });

  it('accepts an already-absolute URL without re-prefixing the API base', async () => {
    server.use(http.get(`${API}/api/v1/absolute-test`, () => HttpResponse.json({ ok: true })));

    await expect(apiFetch(`${API}/api/v1/absolute-test`)).resolves.toEqual({ ok: true });
  });
});
