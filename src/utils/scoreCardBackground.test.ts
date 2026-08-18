import { describe, expect, it } from 'vitest';
import { scoreCardBackground } from './scoreCardBackground';

describe('scoreCardBackground', () => {
  it('is deterministic for the same key across calls', () => {
    expect(scoreCardBackground('session-1')).toBe(scoreCardBackground('session-1'));
  });

  it('returns a bundled background URL', () => {
    const result = scoreCardBackground('session-2');
    expect(typeof result).toBe('string');
    expect(result).toBeTruthy();
  });

  it('is stable per-key even when different keys are interleaved', () => {
    const a1 = scoreCardBackground('session-a');
    const b1 = scoreCardBackground('session-b');
    const a2 = scoreCardBackground('session-a');
    const b2 = scoreCardBackground('session-b');

    expect(a1).toBe(a2);
    expect(b1).toBe(b2);
  });
});
