import { test, expect } from '../fixtures';
import { makeReview, makeTrainingPlan, makeWorkout } from '../fixtures/api';

test('an immediately-completed plan renders its workouts and the training disclaimer', async ({
  page,
  mockApi,
  loginAs,
}) => {
  await loginAs();
  await mockApi.reviewBySession(
    's1',
    makeReview({ id: 'r1', sessionId: 's1', status: 'completed', overallScore: 8 }),
  );
  await mockApi.trainingPlanByReview('r1', null);
  // useCreateTrainingPlan seeds the query cache straight from the mutation
  // response, so a "completed" body here renders with no real polling wait.
  await mockApi.trainingPlanCreate({
    status: 202,
    body: makeTrainingPlan({
      id: 'plan1',
      reviewId: 'r1',
      status: 'completed',
      workouts: [makeWorkout({ id: 'w1', title: 'Dia 1 — Core & equilíbrio' })],
    }),
  });

  await page.goto('/sessions/s1/plan');

  await expect(page.getByText('Dia 1 — Core & equilíbrio')).toBeVisible();
  await expect(page.getByText('1 treinos · 1 exercícios')).toBeVisible();
  await expect(
    page.getByText(/procure um profissional de educação física\./),
  ).toBeVisible();
});
