import { api } from '../client';
import type { CreateSessionPayload, Session } from '@/types/api';

const BASE = '/api/v1/sessions';

export const sessionsApi = {
  list: () => api.get<Session[]>(BASE),
  detail: (id: string) => api.get<Session>(`${BASE}/${id}`),
  create: (payload: CreateSessionPayload) => api.post<Session>(BASE, payload),
  remove: (id: string) => api.delete(`${BASE}/${id}`),
};
