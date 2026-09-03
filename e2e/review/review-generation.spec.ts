import { test, expect } from '../fixtures';
import { makeReview } from '../fixtures/api';

test.describe('review generation', () => {
  test('an immediately-completed review renders score, narrative, tips, and the plan CTA', async ({
    page,
    mockApi,
    loginAs,
  }) => {
    await loginAs();
    await mockApi.reviewBySession('s1', null);
    // useCreateReview seeds the query cache straight from the mutation
    // response, so a "completed" body here renders with no real polling wait.
    await mockApi.reviewCreate({
      status: 202,
      body: makeReview({
        id: 'r1',
        sessionId: 's1',
        status: 'completed',
        overallScore: 8,
        narrative: 'Ótima sessão, bom fluxo nas manobras.',
        improvementTips: ['Abaixe o centro de gravidade', 'Olhe para onde quer ir'],
      }),
    });
    // The completed state's PlanCta reads the plan status to pick its label.
    await mockApi.trainingPlanByReview('r1', null);

    await page.goto('/sessions/s1/review');

    await expect(page.getByText('Nota geral')).toBeVisible();
    await expect(page.getByText('Pontuação por aspecto')).toBeVisible();
    await expect(page.getByText('Ótima sessão, bom fluxo nas manobras.')).toBeVisible();
    await expect(page.getByText('2 ajustes pra próxima')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Gerar plano de treino' })).toBeVisible();
  });

  test('a failed review shows an error with retry, which then renders the completed state', async ({
    page,
    mockApi,
    loginAs,
  }) => {
    await loginAs();
    await mockApi.reviewBySession('s1', null);
    await mockApi.reviewCreate({
      status: 202,
      body: makeReview({
        id: 'r1',
        sessionId: 's1',
        status: 'failed',
        errorMessage: 'A IA falhou ao processar a mídia.',
      }),
    });

    await page.goto('/sessions/s1/review');
    await expect(page.getByText('Análise não concluída')).toBeVisible();
    const retryButton = page.getByRole('button', { name: 'Tentar de novo' });
    await expect(retryButton).toBeVisible();

    await mockApi.reviewRetry(
      'r1',
      makeReview({ id: 'r1', sessionId: 's1', status: 'completed', overallScore: 8 }),
    );
    await mockApi.trainingPlanByReview('r1', null);
    await retryButton.click();

    await expect(page.getByText('Nota geral')).toBeVisible();
  });
});
