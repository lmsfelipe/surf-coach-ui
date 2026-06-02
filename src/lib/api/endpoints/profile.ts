import { api } from '../client';
import type { Profile, UpdateProfilePayload } from '@/types/api';

export const profileApi = {
  me: () => api.get<Profile>('/me'),
  update: (payload: UpdateProfilePayload) => api.patch<Profile>('/me', payload),
};
