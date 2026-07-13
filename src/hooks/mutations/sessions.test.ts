import { describe, expect, it } from 'vitest';
import { sessionFormToPayload } from './sessions';
import type { SessionFormValues } from '@/schemas/session';

describe('sessionFormToPayload — meters → feet at the boundary', () => {
  const base: SessionFormValues = {
    sessionDate: '2026-05-25',
    location: 'Canal 1',
    waveSizeMeters: 1,
  };

  it('converts 1 m to ~3.28 ft (rounded to 2 decimals)', () => {
    expect(sessionFormToPayload(base).waveSize).toBe(3.28);
  });

  it('converts 2 m to ~6.56 ft', () => {
    expect(sessionFormToPayload({ ...base, waveSizeMeters: 2 }).waveSize).toBe(6.56);
  });

  it('passes through the non-converted fields', () => {
    const payload = sessionFormToPayload({
      ...base,
      surfboardId: 'b1',
      notes: 'glassy',
    });
    expect(payload).toMatchObject({
      sessionDate: '2026-05-25',
      location: 'Canal 1',
      surfboardId: 'b1',
      notes: 'glassy',
    });
  });
});
