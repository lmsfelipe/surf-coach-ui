import { http, HttpResponse } from 'msw';
import {
  makeMedia,
  makeProfile,
  makeReview,
  makeSession,
  makeSurfboard,
  makeTrainingPlan,
} from '../fixtures';

const API = 'http://localhost:8000';

function envelope(code: string, message: string, details: unknown = null) {
  return { error: { code, message, details } };
}

const profile = makeProfile();
const surfboards = [makeSurfboard()];
const sessions = [makeSession()];
const media = [makeMedia()];
const trainingPlans = [makeTrainingPlan()];

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

/**
 * Reusable named error scenarios for endpoints commonly re-tested across
 * phases: 401 / 500 / VALIDATION_ERROR / 207. Use with server.use(...).
 * Bespoke one-off scenarios still belong inline in the test that needs them.
 */
export const errorHandlers = {
  sessionsUnauthorized: http.get(`${API}/api/v1/sessions/`, () =>
    HttpResponse.json(envelope('INVALID_TOKEN', 'Token expired.'), { status: 401 }),
  ),
  surfboardsServerError: http.get(`${API}/api/v1/surfboards/`, () =>
    HttpResponse.json(envelope('INTERNAL_ERROR', 'Something broke.'), { status: 500 }),
  ),
  surfboardCreateValidationError: http.post(`${API}/api/v1/surfboards/`, () =>
    HttpResponse.json(
      envelope('VALIDATION_ERROR', 'Confira os campos destacados.', [
        { loc: ['body', 'boardSize'], msg: 'Field required', type: 'missing' },
      ]),
      { status: 422 },
    ),
  ),
  mediaUploadPartial: http.post(`${API}/api/v1/sessions/:sessionId/media/`, () =>
    HttpResponse.json(
      {
        succeeded: [makeMedia({ id: 'm1', fileName: 'a.jpg' })],
        failed: [
          {
            fileName: 'b.jpg',
            code: 'STORAGE_UPLOAD_FAILED',
            message: 'Media upload failed.',
            details: null,
          },
        ],
      },
      { status: 207 },
    ),
  ),
};

/** Default happy-path handlers. Override per-test with server.use(...). */
export const handlers = [
  // Profile
  http.get(`${API}/me`, () => HttpResponse.json(profile)),
  http.patch(`${API}/me`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(makeProfile(body));
  }),

  // Surfboards
  http.get(`${API}/api/v1/surfboards/`, () => HttpResponse.json(surfboards)),
  http.get(`${API}/api/v1/surfboards/:id`, ({ params }) =>
    HttpResponse.json(makeSurfboard({ id: String(params.id) })),
  ),
  http.post(`${API}/api/v1/surfboards/`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(makeSurfboard(body), { status: 201 });
  }),
  http.patch(`${API}/api/v1/surfboards/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(makeSurfboard({ id: String(params.id), ...body }));
  }),
  http.delete(`${API}/api/v1/surfboards/:id`, () => new HttpResponse(null, { status: 204 })),

  // Sessions
  http.get(`${API}/api/v1/sessions/`, () => HttpResponse.json(sessions)),
  http.get(`${API}/api/v1/sessions/:id`, ({ params }) =>
    HttpResponse.json(makeSession({ id: String(params.id) })),
  ),
  http.post(`${API}/api/v1/sessions/`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(makeSession(body), { status: 201 });
  }),
  http.delete(`${API}/api/v1/sessions/:id`, () => new HttpResponse(null, { status: 204 })),

  // Media
  http.get(`${API}/api/v1/sessions/:sessionId/media/`, () => HttpResponse.json(media)),
  http.get(`${API}/api/v1/media/:id`, ({ params }) =>
    HttpResponse.json(makeMedia({ id: String(params.id) })),
  ),
  http.post(`${API}/api/v1/sessions/:sessionId/media/`, () =>
    HttpResponse.json([makeMedia()], { status: 201 }),
  ),
  http.delete(`${API}/api/v1/media/:id`, () => new HttpResponse(null, { status: 204 })),

  // Reviews — bySession is 404-tolerant by default; existing tests rely on this.
  http.get(`${API}/api/v1/sessions/:id/review`, () =>
    HttpResponse.json(envelope('REVIEW_NOT_FOUND', 'Review not found.'), { status: 404 }),
  ),
  http.get(`${API}/api/v1/reviews/:id`, ({ params }) =>
    HttpResponse.json(makeReview({ id: String(params.id) })),
  ),
  http.post(`${API}/api/v1/reviews/`, () =>
    HttpResponse.json(makeReview({ status: 'processing' }), { status: 202 }),
  ),
  http.post(`${API}/api/v1/reviews/:id/retry`, ({ params }) =>
    HttpResponse.json(makeReview({ id: String(params.id), status: 'processing' })),
  ),

  // Training plans
  http.get(`${API}/api/v1/training-plans/`, () =>
    HttpResponse.json({ items: trainingPlans, total: trainingPlans.length }),
  ),
  http.get(`${API}/api/v1/reviews/:reviewId/training-plan`, ({ params }) =>
    HttpResponse.json(makeTrainingPlan({ reviewId: String(params.reviewId) })),
  ),
  http.get(`${API}/api/v1/training-plans/:planId`, ({ params }) =>
    HttpResponse.json(makeTrainingPlan({ id: String(params.planId) })),
  ),
  http.get(`${API}/api/v1/workouts/:workoutId`, ({ params }) =>
    HttpResponse.json({ ...makeTrainingPlan().workouts[0], id: String(params.workoutId) }),
  ),
  http.post(`${API}/api/v1/training-plans/`, () =>
    HttpResponse.json(makeTrainingPlan({ status: 'processing' }), { status: 202 }),
  ),
  http.post(`${API}/api/v1/training-plans/:planId/retry`, ({ params }) =>
    HttpResponse.json(makeTrainingPlan({ id: String(params.planId), status: 'processing' })),
  ),
];
