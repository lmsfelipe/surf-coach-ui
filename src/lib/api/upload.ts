import { env } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { getAccessToken, useAuthStore } from '@/stores/authStore';
import { ApiError, NetworkError, type ApiErrorEnvelope } from './errors';
import type { BatchUploadResult, FailedUpload, Media } from '@/types/api';

/**
 * Single silent Supabase refresh, shared by the fetch wrapper's retry path and
 * this XHR uploader (§4.6). Returns the new access token, or null on failure.
 */
export async function refreshAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.refreshSession();
  if (data.session?.access_token) {
    useAuthStore.getState().setSession(data.session);
    return data.session.access_token;
  }
  return null;
}

export interface UploadOptions {
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

function parseEnvelopeError(status: number, responseText: string): ApiError {
  let envelope: ApiErrorEnvelope | undefined;
  try {
    envelope = JSON.parse(responseText) as ApiErrorEnvelope;
  } catch {
    // non-JSON body
  }
  const code = envelope?.error?.code ?? 'HTTP_ERROR';
  const message = envelope?.error?.message ?? `HTTP ${status}`;
  return new ApiError(code, message, status, envelope?.error?.details);
}

function xhrUpload(
  sessionId: string,
  files: File[],
  token: string | null,
  options: UploadOptions,
): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    for (const file of files) form.append('file', file);

    xhr.open('POST', `${env.apiBaseUrl}/api/v1/sessions/${sessionId}/media/`);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && options.onProgress) {
        options.onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => resolve({ status: xhr.status, body: xhr.responseText });
    xhr.onerror = () => reject(new NetworkError());
    xhr.onabort = () => reject(new NetworkError('Envio cancelado'));

    if (options.signal) {
      options.signal.addEventListener('abort', () => xhr.abort(), { once: true });
    }
    xhr.send(form);
  });
}

/**
 * Normalized upload result. `201` full success yields an empty `failed`; `207`
 * partial success (some files hit STORAGE_UPLOAD_FAILED) carries both lists.
 * Callers drive UI off `failed.length` — both are resolved, not thrown.
 */
export interface UploadOutcome {
  succeeded: Media[];
  failed: FailedUpload[];
}

/**
 * Upload media with per-file progress. Mirrors the fetch wrapper's contracts:
 * Bearer auth, single 401→refresh→retry, envelope→ApiError.
 *
 * Success has two shapes (SPEC_BACKEND_Media_Upload_Optimization §11.3):
 * `201` → `Media[]`, `207` → `BatchUploadResult`. Both resolve to an
 * `UploadOutcome`; only `4xx`/`502` throw an `ApiError`.
 */
export async function uploadMedia(
  sessionId: string,
  files: File[],
  options: UploadOptions = {},
): Promise<UploadOutcome> {
  let { status, body } = await xhrUpload(sessionId, files, getAccessToken(), options);

  if (status === 401) {
    const token = await refreshAccessToken();
    if (token) {
      ({ status, body } = await xhrUpload(sessionId, files, token, options));
    }
  }

  // 207 must NOT be treated as an error: some files stored, some failed storage.
  if (status === 207) {
    const result = JSON.parse(body) as BatchUploadResult;
    return { succeeded: result.succeeded, failed: result.failed };
  }
  if (status < 200 || status >= 300) throw parseEnvelopeError(status, body);
  return { succeeded: JSON.parse(body) as Media[], failed: [] };
}
