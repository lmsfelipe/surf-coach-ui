import { test, expect } from '../fixtures';
import { envelope, makeMedia, makeReview, makeSession, makeTrainingPlan } from '../fixtures/api';

test.describe('session detail', () => {
  test('renders the hero, media, análise, and treino sections', async ({
    page,
    mockApi,
    loginAs,
  }) => {
    await loginAs();
    await mockApi.sessionDetail('s1', [
      { status: 200, body: makeSession({ id: 's1', location: 'Maresias' }) },
    ]);
    await mockApi.media('s1', [makeMedia({ id: 'm1' })]);
    await mockApi.mediaContent();
    const review = makeReview({ id: 'r1', sessionId: 's1', status: 'completed', overallScore: 7 });
    await mockApi.reviewBySession('s1', review);
    await mockApi.trainingPlanByReview('r1', makeTrainingPlan({ id: 'plan1', reviewId: 'r1' }));
    await mockApi.surfboards([]);

    await page.goto('/sessions/s1');

    await expect(page.getByText('Maresias')).toBeVisible();
    await expect(page.getByText('Nota 7.0 · 6 aspectos')).toBeVisible();
    await expect(page.getByText('1 treinos')).toBeVisible();
  });

  test('deleting a session confirms, then navigates back to the list', async ({
    page,
    mockApi,
    loginAs,
  }) => {
    await loginAs();
    await mockApi.sessionDetail('s1', [
      { status: 200, body: makeSession({ id: 's1', location: 'Maresias' }) },
    ]);
    await mockApi.media('s1', []);
    await mockApi.reviewBySession('s1', null);
    await mockApi.surfboards([]);
    await mockApi.sessionDelete('s1');
    await mockApi.sessions([]);

    await page.goto('/sessions/s1');
    await page.getByRole('button', { name: 'Excluir sessão' }).click();

    const dialog = page.getByRole('alertdialog');
    await expect(dialog.getByText('Excluir sessão?')).toBeVisible();
    await expect(
      dialog.getByText('Isso remove a mídia e a análise dessa sessão. Não dá pra desfazer.'),
    ).toBeVisible();
    await dialog.getByRole('button', { name: 'Excluir', exact: true }).click();

    await expect(page.getByText('Sessão excluída.')).toBeVisible();
    await expect(page).toHaveURL('/sessions');
  });

  test('the error boundary retry re-fires the loader instead of re-throwing the cached rejection', async ({
    page,
    mockApi,
    loginAs,
  }) => {
    // Known bug, reproduced in both `vite dev` and a production build (so
    // it isn't a StrictMode double-invoke artifact): clicking "Tentar de
    // novo" after a genuine load failure crashes to the top-level
    // AppCrashFallback ("Ops, algo quebrou...") instead of recovering into
    // the session detail view, even though the retried request succeeds.
    // SessionDetailError's effect (`queryErrorReset.reset()` on every
    // mount) combined with the router CatchBoundary's "recreate the tree
    // from scratch" recovery looks like the trigger. Remove this
    // `test.fail()` once the underlying bug is fixed — the assertions
    // below already describe the intended, correct behavior.
    test.fail();

    await loginAs();
    // A 4xx isn't retried by the query client (queryClient.ts only retries
    // 5xx), so this reaches the error boundary after exactly one request —
    // the second (fired by the manual "Tentar de novo" click) succeeds.
    await mockApi.sessionDetail('s1', [
      { status: 403, body: envelope('FORBIDDEN', 'Você não tem acesso a esse recurso.') },
      { status: 200, body: makeSession({ id: 's1', location: 'Maresias' }) },
    ]);
    await mockApi.media('s1', []);
    await mockApi.reviewBySession('s1', null);
    await mockApi.surfboards([]);

    await page.goto('/sessions/s1');
    const retryButton = page.getByRole('button', { name: 'Tentar de novo' });
    await expect(retryButton).toBeVisible();
    await retryButton.click();

    await expect(page.getByText('Maresias')).toBeVisible();
  });
});
