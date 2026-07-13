import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreBars } from './ScoreBars';
import type { Review } from '@/types/api';

function review(overrides: Partial<Review>): Review {
  return {
    id: 'r1',
    sessionId: 's1',
    profileId: 'p1',
    narrative: '',
    improvementTips: ['a', 'b', 'c'],
    scoreFlow: 6.8,
    scoreDrop: 7.5,
    scoreBalance: 6.2,
    scoreWaveSelection: 8.1,
    scoreManeuvers: 5.4,
    scoreArms: null,
    overallScore: 6.7,
    aiModelVersion: 'gemini-2.0',
    createdAt: '2026-05-25T00:00:00Z',
    ...overrides,
  };
}

describe('ScoreBars', () => {
  it('renders only non-null dimensions', () => {
    render(<ScoreBars review={review({})} />);
    // scoreArms is null → "Braços" label must not appear.
    expect(screen.queryByText('Braços')).toBeNull();
    expect(screen.getByText('Escolha da onda')).toBeInTheDocument();
    expect(screen.getByText('8.1')).toBeInTheDocument();
  });

  it('accents the highest-scoring row (kit default)', () => {
    render(<ScoreBars review={review({})} />);
    const highest = screen.getByText('8.1');
    expect(highest).toHaveStyle({ color: 'var(--accent)' });
    // a lower row carries no inline accent color
    expect(screen.getByText('6.2').getAttribute('style') ?? '').not.toContain('--accent');
  });

  it('renders nothing when all dimensions are null', () => {
    const { container } = render(
      <ScoreBars
        review={review({
          scoreFlow: null,
          scoreDrop: null,
          scoreBalance: null,
          scoreWaveSelection: null,
          scoreManeuvers: null,
          scoreArms: null,
        })}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
