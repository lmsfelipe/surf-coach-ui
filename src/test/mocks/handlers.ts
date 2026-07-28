import { http, HttpResponse } from 'msw';
import type { Profile, Session, Surfboard } from '@/types/api';

const API = 'http://localhost:8000';

function envelope(code: string, message: string, details: unknown = null) {
  return { error: { code, message, details } };
}

const profile: Profile = {
  id: 'p1',
  email: 'surfer@example.com',
  surfLevel: 'intermediate',
  heightCm: 180,
  weightKg: 75,
  name: 'Surfista',
  gender: 'male',
  birthday: '1995-06-15',
  avatarUrl: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const surfboards: Surfboard[] = [
  {
    id: 'b1',
    profileId: 'p1',
    boardType: 'shortboard',
    boardSize: 6.2,
    volume: 28.5,
    label: 'Daily driver',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

const sessions: Session[] = [
  {
    id: 's1',
    profileId: 'p1',
    sessionDate: '2026-05-20',
    location: 'Maresias',
    waveSize: 4.5,
    surfboardId: 'b1',
    notes: null,
    createdAt: '2026-05-20T14:00:00Z',
    updatedAt: '2026-05-20T14:00:00Z',
  },
];

/** Per-test overrides for media upload error scenarios. Use with server.use(...). */
export const mediaUploadHandlers = {
  notSurfRelated: http.post(`${API}/api/v1/sessions/:sessionId/media/`, () =>
    HttpResponse.json(
      envelope('MEDIA_NOT_SURF_RELATED', 'Uploaded media does not appear to be surf or water sports related.', {
        reason: 'Shows a soccer game.',
      }),
      { status: 422 },
    ),
  ),
  explicitContent: http.post(`${API}/api/v1/sessions/:sessionId/media/`, () =>
    HttpResponse.json(
      envelope('EXPLICIT_CONTENT', 'Uploaded media contains explicit or offensive content.', {
        reason: 'Contains nudity.',
      }),
      { status: 422 },
    ),
  ),
};

/** Default happy-path handlers. Override per-test with server.use(...). */
export const handlers = [
  http.get(`${API}/me`, () => HttpResponse.json(profile)),
  http.get(`${API}/api/v1/surfboards/`, () => HttpResponse.json(surfboards)),
  http.get(`${API}/api/v1/sessions/`, () => HttpResponse.json(sessions)),
  http.get(`${API}/api/v1/sessions/:id/review`, () =>
    HttpResponse.json(envelope('REVIEW_NOT_FOUND', 'Review not found.'), { status: 404 }),
  ),
];
