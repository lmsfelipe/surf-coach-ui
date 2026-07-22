import * as Sentry from '@sentry/react';
import { env } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { getAccessToken, useAuthStore } from '@/stores/authStore';
import { ApiError, NetworkError, type ApiErrorEnvelope } from './errors';

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** JSON body (object) or raw body (FormData for multipart). */
  body?: unknown;
  /** Skip the Authorization header (none of our endpoints need this yet). */
  anonymous?: boolean;
}

function buildHeaders(options: RequestOptions, token: string | null): Headers {
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;
  if (!isFormData && options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  if (!options.anonymous && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}

function serializeBody(body: unknown): BodyInit | undefined {
  if (body === undefined) return undefined;
  if (body instanceof FormData) return body;
  return JSON.stringify(body);
}

async function parseError(res: Response): Promise<ApiError> {
  let envelope: ApiErrorEnvelope | undefined;
  try {
    envelope = (await res.json()) as ApiErrorEnvelope;
  } catch {
    // non-JSON error body
  }
  const code = envelope?.error?.code ?? 'HTTP_ERROR';
  const message = envelope?.error?.message ?? res.statusText;
  return new ApiError(code, message, res.status, envelope?.error?.details);
}

async function rawFetch(path: string, options: RequestOptions, token: string | null) {
  const url = path.startsWith('http') ? path : `${env.apiBaseUrl}${path}`;
  return fetch(url, {
    ...options,
    headers: buildHeaders(options, token),
    body: serializeBody(options.body),
  });
}

/** Force-logout path when refresh fails. */
async function forceSignOut(): Promise<void> {
  await useAuthStore.getState().signOut();
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
    window.location.assign('/auth/login');
  }
}

/**
 * Core request. On 401/INVALID_TOKEN it attempts one silent Supabase refresh
 * and retries once; if still 401, it signs out and redirects to login.
 * See Overview §5.1.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let res: Response;
  try {
    res = await rawFetch(path, options, getAccessToken());
  } catch {
    const err = new NetworkError();
    Sentry.captureException(err);
    throw err;
  }

  if (res.status === 401 && !options.anonymous) {
    const { data } = await supabase.auth.refreshSession();
    if (data.session?.access_token) {
      useAuthStore.getState().setSession(data.session);
      try {
        res = await rawFetch(path, options, data.session.access_token);
      } catch {
        const err = new NetworkError();
        Sentry.captureException(err);
        throw err;
      }
    }
    if (res.status === 401) {
      await forceSignOut();
      throw await parseError(res);
    }
  }

  if (!res.ok) {
    const err = await parseError(res);
    // Only report unexpected server failures; 4xx are handled UX, not bugs.
    if (err.status >= 500) Sentry.captureException(err);
    throw err;
  }
  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T = void>(path: string, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'DELETE' }),
};
