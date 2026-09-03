import type { Page } from '@playwright/test';
import {
  makeExercise,
  makeMedia,
  makeProfile,
  makeReview,
  makeSession,
  makeSurfboard,
  makeTrainingPlan,
  makeWorkout,
} from '@/test/fixtures';
import type {
  BatchUploadResult,
  FailedUpload,
  Media,
  Profile,
  Review,
  Session,
  Surfboard,
  TrainingPlan,
} from '@/types/api';

export {
  makeExercise,
  makeMedia,
  makeProfile,
  makeReview,
  makeSession,
  makeSurfboard,
  makeTrainingPlan,
  makeWorkout,
};

const API = 'http://localhost:8000';

/** Smallest valid 1x1 transparent PNG — stand-in bytes for any media content GET. */
const TRANSPARENT_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

export function envelope(code: string, message: string, details: unknown = null) {
  return { error: { code, message, details } };
}

export interface StatusBody {
  status: number;
  body: unknown;
}

/**
 * Registers a method-scoped handler on `urlGlob`. Multiple mocks can share
 * the same URL (e.g. GET list + POST create both hit the collection path) —
 * a request whose method doesn't match falls through to whatever route was
 * registered before this one, exactly like MSW's per-method handlers.
 */
function route(
  page: Page,
  urlGlob: string,
  method: string,
  handler: (route: import('@playwright/test').Route) => Promise<void> | void,
) {
  return page.route(urlGlob, (r) => {
    if (r.request().method() !== method) return r.fallback();
    return handler(r);
  });
}

function json(
  page: Page,
  urlGlob: string,
  method: string,
  status: number,
  body: unknown,
) {
  return route(page, urlGlob, method, (r) =>
    r.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) }),
  );
}

function empty(page: Page, urlGlob: string, method: string, status = 204) {
  return route(page, urlGlob, method, (r) => r.fulfill({ status }));
}

/** Cycles through `responses` on successive requests; repeats the last once exhausted. */
function sequenced(page: Page, urlGlob: string, method: string, responses: StatusBody[]) {
  let i = 0;
  return route(page, urlGlob, method, (r) => {
    const res = responses[Math.min(i, responses.length - 1)]!;
    i++;
    return r.fulfill({
      status: res.status,
      contentType: 'application/json',
      body: JSON.stringify(res.body),
    });
  });
}

/**
 * REST mocks ported 1:1 from src/test/mocks/handlers.ts (same endpoints,
 * same status codes) — but starting from empty collections rather than MSW's
 * seeded defaults, so each spec seeds exactly what it needs.
 */
export function createMockApi(page: Page) {
  return {
    profile: (profile: Partial<Profile> = {}) =>
      json(page, `${API}/me`, 'GET', 200, makeProfile(profile)),

    surfboards: (boards: Surfboard[]) =>
      json(page, `${API}/api/v1/surfboards/`, 'GET', 200, boards),

    surfboardDetail: (id: string, board: Partial<Surfboard> = {}) =>
      json(page, `${API}/api/v1/surfboards/${id}`, 'GET', 200, makeSurfboard({ id, ...board })),

    surfboardCreate: (responses: StatusBody[]) =>
      sequenced(page, `${API}/api/v1/surfboards/`, 'POST', responses),

    surfboardUpdate: (id: string, board: Partial<Surfboard> = {}) =>
      json(page, `${API}/api/v1/surfboards/${id}`, 'PATCH', 200, makeSurfboard({ id, ...board })),

    surfboardDelete: (
      id: string,
      responses: StatusBody[] = [{ status: 204, body: null }],
      delayMs = 0,
    ) => {
      let i = 0;
      return route(page, `${API}/api/v1/surfboards/${id}`, 'DELETE', async (r) => {
        const res = responses[Math.min(i, responses.length - 1)]!;
        i++;
        if (delayMs > 0) await new Promise((resolve) => setTimeout(resolve, delayMs));
        if (res.status === 204) return r.fulfill({ status: 204 });
        return r.fulfill({
          status: res.status,
          contentType: 'application/json',
          body: JSON.stringify(res.body),
        });
      });
    },

    sessions: (sessions: Session[]) => json(page, `${API}/api/v1/sessions/`, 'GET', 200, sessions),

    sessionDetail: (id: string, responses: StatusBody[]) =>
      sequenced(page, `${API}/api/v1/sessions/${id}`, 'GET', responses),

    sessionCreate: (session: Partial<Session> = {}) =>
      route(page, `${API}/api/v1/sessions/`, 'POST', (r) => {
        const body = r.request().postDataJSON() as Record<string, unknown>;
        return r.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(makeSession({ ...body, ...session } as Partial<Session>)),
        });
      }),

    sessionDelete: (id: string) => empty(page, `${API}/api/v1/sessions/${id}`, 'DELETE'),

    media: (sessionId: string, media: Media[]) =>
      json(page, `${API}/api/v1/sessions/${sessionId}/media/`, 'GET', 200, media),

    /**
     * Wires GET /api/v1/media/*\/content* so the gallery's <img>/<video> tags
     * don't 404 against the network guard. Any spec whose mocked session has
     * media must call this — it's not about pixel-correct playback (a 1x1
     * placeholder is enough), just satisfying the request.
     */
    mediaContent: () =>
      route(page, `${API}/api/v1/media/*/content*`, 'GET', (r) =>
        r.fulfill({ contentType: 'image/png', body: TRANSPARENT_PNG }),
      ),

    mediaUpload: (sessionId: string, responses: StatusBody[]) =>
      sequenced(page, `${API}/api/v1/sessions/${sessionId}/media/`, 'POST', responses),

    mediaDelete: (id: string) => empty(page, `${API}/api/v1/media/${id}`, 'DELETE'),

    reviewBySession: (sessionId: string, review: Review | null) =>
      review
        ? json(page, `${API}/api/v1/sessions/${sessionId}/review`, 'GET', 200, review)
        : json(
            page,
            `${API}/api/v1/sessions/${sessionId}/review`,
            'GET',
            404,
            envelope('REVIEW_NOT_FOUND', 'Review not found.'),
          ),

    reviewCreate: (response: StatusBody) =>
      json(page, `${API}/api/v1/reviews/`, 'POST', response.status, response.body),

    reviewRetry: (reviewId: string, review: Review) =>
      json(page, `${API}/api/v1/reviews/${reviewId}/retry`, 'POST', 200, review),

    trainingPlanByReview: (reviewId: string, plan: TrainingPlan | null) =>
      plan
        ? json(page, `${API}/api/v1/reviews/${reviewId}/training-plan`, 'GET', 200, plan)
        : json(
            page,
            `${API}/api/v1/reviews/${reviewId}/training-plan`,
            'GET',
            404,
            envelope('TRAINING_PLAN_NOT_FOUND', 'Training plan not found.'),
          ),

    trainingPlanCreate: (response: StatusBody) =>
      json(page, `${API}/api/v1/training-plans/`, 'POST', response.status, response.body),

    trainingPlanRetry: (planId: string, plan: TrainingPlan) =>
      json(page, `${API}/api/v1/training-plans/${planId}/retry`, 'POST', 200, plan),

    trainingPlansList: (plans: TrainingPlan[]) =>
      json(page, `${API}/api/v1/training-plans/`, 'GET', 200, {
        items: plans,
        total: plans.length,
      }),
  };
}

export type MockApi = ReturnType<typeof createMockApi>;
export type { BatchUploadResult, FailedUpload };
