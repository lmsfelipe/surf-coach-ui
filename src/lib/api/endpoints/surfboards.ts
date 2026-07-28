import { api } from '../client';
import type {
  CreateSurfboardPayload,
  Surfboard,
  UpdateSurfboardPayload,
} from '@/types/api';

const BASE = '/api/v1/surfboards';

export const surfboardsApi = {
  list: () => api.get<Surfboard[]>(`${BASE}/`),
  detail: (id: string) => api.get<Surfboard>(`${BASE}/${id}`),
  create: (payload: CreateSurfboardPayload) => api.post<Surfboard>(`${BASE}/`, payload),
  update: (id: string, payload: UpdateSurfboardPayload) =>
    api.patch<Surfboard>(`${BASE}/${id}`, payload),
  remove: (id: string) => api.delete(`${BASE}/${id}`),
};
