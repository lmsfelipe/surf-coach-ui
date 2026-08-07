import { describe, expect, it } from 'vitest';
import { formatWaveSize, roundTo } from './units';

describe('units', () => {
  it('rounds to a given precision', () => {
    expect(roundTo(1.2345, 1)).toBe(1.2);
    expect(roundTo(1.2345, 2)).toBe(1.23);
    expect(roundTo(1.25, 1)).toBe(1.3);
  });

  it('formats a pt-BR meter label with comma decimal', () => {
    expect(formatWaveSize(1.44)).toBe('1,4 m');
  });
});
