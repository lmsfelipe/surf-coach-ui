import { describe, expect, it } from 'vitest';
import { sessionFormToPayload } from './sessions';
import type { SessionFormValues } from '@/schemas/session';

describe('sessionFormToPayload — meters end-to-end', () => {
  const base: SessionFormValues = {
    sessionDate: '2026-05-25',
    location: 'Canal 1',
    waveSize: 1,
  };

  it('passes wave size through unchanged', () => {
    expect(sessionFormToPayload(base).waveSize).toBe(1);
  });

  it('passes through a different wave size unchanged', () => {
    expect(sessionFormToPayload({ ...base, waveSize: 2 }).waveSize).toBe(2);
  });

  it('passes through the other fields', () => {
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
