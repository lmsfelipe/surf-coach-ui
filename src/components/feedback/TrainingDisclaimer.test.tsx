import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrainingDisclaimer } from './TrainingDisclaimer';

describe('TrainingDisclaimer', () => {
  it('renders the safety notice with the professional-guidance reminder', () => {
    render(<TrainingDisclaimer />);
    const note = screen.getByRole('note');
    expect(note).toHaveTextContent(/sugestões gerais de mobilidade e equilíbrio/i);
    expect(note).toHaveTextContent(/Mostre este treino ao seu educador físico/i);
  });

  it('has no dismiss control — it stays visible whenever a plan is shown', () => {
    render(<TrainingDisclaimer />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
