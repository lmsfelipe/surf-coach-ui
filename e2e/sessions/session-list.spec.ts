import { test, expect } from '../fixtures';
import { makeReview, makeSession } from '../fixtures/api';

test.describe('sessions list', () => {
  test('empty state offers a CTA to create the first session', async ({
    page,
    mockApi,
    loginAs,
  }) => {
    await loginAs();
    await mockApi.sessions([]);
    await mockApi.surfboards([]);

    await page.goto('/sessions');
    await expect(page.getByText('Nenhuma sessão ainda')).toBeVisible();
    await page.getByRole('link', { name: 'Registrar primeira sessão' }).click();

    await expect(page).toHaveURL('/sessions/new');
  });

  test('a populated card shows its score and navigates to the detail screen', async ({
    page,
    mockApi,
    loginAs,
  }) => {
    await loginAs();
    await mockApi.sessions([makeSession({ id: 's1', location: 'Maresias' })]);
    await mockApi.surfboards([]);
    await mockApi.reviewBySession('s1', makeReview({ id: 'r1', sessionId: 's1', overallScore: 7 }));

    await page.goto('/sessions');
    const card = page.getByRole('link', { name: /Maresias/ });
    await expect(card.getByText('7.0')).toBeVisible();

    // Following the card into the detail screen exercises its own loader —
    // wire up everything it needs so the strict network guard stays satisfied.
    await mockApi.sessionDetail('s1', [{ status: 200, body: makeSession({ id: 's1', location: 'Maresias' }) }]);
    await mockApi.media('s1', []);
    await mockApi.trainingPlanByReview('r1', null);

    await card.click();
    await expect(page).toHaveURL('/sessions/s1');
  });
});
