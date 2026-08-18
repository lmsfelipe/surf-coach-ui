import { describe, expect, it } from 'vitest';
import { formatLongDate, formatShortDate, todayISODate } from './dates';

describe('formatShortDate', () => {
  it('formats an ISO date in pt-BR short form', () => {
    expect(formatShortDate('2026-05-25')).toBe('25 mai');
  });

  it('returns the input unchanged for a malformed date', () => {
    expect(formatShortDate('not-a-date')).toBe('not-a-date');
  });
});

describe('formatLongDate', () => {
  it('formats an ISO date in pt-BR long form', () => {
    expect(formatLongDate('2026-05-25')).toBe('25 mai 2026');
  });

  it('returns the input unchanged for a malformed date', () => {
    expect(formatLongDate('not-a-date')).toBe('not-a-date');
  });
});

describe('todayISODate', () => {
  it('returns today in YYYY-MM-DD format', () => {
    expect(todayISODate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
