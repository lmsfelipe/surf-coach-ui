import { api } from '../client';
import type { Media } from '@/types/api';

export const mediaApi = {
  bySession: (sessionId: string) =>
    api.get<Media[]>(`/api/v1/sessions/${sessionId}/media`),
  detail: (id: string) => api.get<Media>(`/api/v1/media/${id}`),
  /** Multipart upload — one or more `file` fields. Server → surf-media bucket. */
  upload: (sessionId: string, files: File[]) => {
    const form = new FormData();
    for (const file of files) form.append('file', file);
    return api.post<Media[]>(`/api/v1/sessions/${sessionId}/media`, form);
  },
  remove: (id: string) => api.delete(`/api/v1/media/${id}`),
};
