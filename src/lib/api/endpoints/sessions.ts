import { api } from '../client';
import type { CreateSessionPayload, Session, SessionListItem } from '@/types/api';

const BASE = '/api/v1/sessions';

export const sessionsApi = {
  /** Each row embeds its review summary — no per-session review request needed. */
  list: () => api.get<SessionListItem[]>(`${BASE}/`),
  detail: (id: string) => api.get<Session>(`${BASE}/${id}`),
  create: (payload: CreateSessionPayload) => api.post<Session>(`${BASE}/`, payload),
  remove: (id: string) => api.delete(`${BASE}/${id}`),
};
