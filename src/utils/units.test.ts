import { describe, expect, it } from 'vitest';
import {
  FEET_PER_METER,
  feetToMeters,
  feetToMetersDisplay,
  formatWaveSize,
  metersToFeet,
  roundTo,
} from './units';

describe('units', () => {
  it('converts meters to feet', () => {
    expect(metersToFeet(1)).toBeCloseTo(3.28084, 4);
    expect(metersToFeet(0)).toBe(0);
  });

  it('converts feet to meters', () => {
    expect(feetToMeters(1)).toBeCloseTo(0.3048, 4);
    expect(feetToMeters(3.28084)).toBeCloseTo(1, 4);
  });

  it('round-trips meters → feet → meters', () => {
    const meters = 1.4;
    expect(feetToMeters(metersToFeet(meters))).toBeCloseTo(meters, 6);
  });

  it('uses the canonical 0.3048 factor', () => {
    expect(FEET_PER_METER).toBe(0.3048);
  });

  it('rounds to a given precision', () => {
    expect(roundTo(1.2345, 1)).toBe(1.2);
    expect(roundTo(1.2345, 2)).toBe(1.23);
    expect(roundTo(1.25, 1)).toBe(1.3);
  });

  it('produces a rounded meter display from feet', () => {
    expect(feetToMetersDisplay(4.5)).toBe(1.4);
  });

  it('formats a pt-BR meter label with comma decimal', () => {
    expect(formatWaveSize(4.5)).toBe('1,4 m');
  });
});
