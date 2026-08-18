import { describe, expect, it } from 'vitest';
import { scoreColor } from './score';

describe('scoreColor — band boundaries (0-4 danger · 4-7 warning · 7-10 success)', () => {
  it('is muted for null', () => {
    expect(scoreColor(null)).toBe('var(--text-muted)');
  });

  it('is danger just below 4', () => {
    expect(scoreColor(3.9)).toBe('var(--danger)');
  });

  it('flips to warning at exactly 4', () => {
    expect(scoreColor(4)).toBe('var(--warning)');
  });

  it('is warning just below 7', () => {
    expect(scoreColor(6.9)).toBe('var(--warning)');
  });

  it('flips to success at exactly 7', () => {
    expect(scoreColor(7)).toBe('var(--success)');
  });

  it('is success above 7', () => {
    expect(scoreColor(9.5)).toBe('var(--success)');
  });
});
