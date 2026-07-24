import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPollingWindow } from './usePollingWindow';

const processing = { status: 'processing' } as const;
const completed = { status: 'completed' } as const;
const failed = { status: 'failed' } as const;

const MINUTE = 60_000;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-07-17T12:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('createPollingWindow', () => {
  it('does not poll when there is no data or the resource is settled', () => {
    const poll = createPollingWindow();
    expect(poll.interval(null)).toBe(false);
    expect(poll.interval(undefined)).toBe(false);
    expect(poll.interval(completed)).toBe(false);
    expect(poll.interval(failed)).toBe(false);
  });

  it('polls every 3 s for the first 30 s, then every 10 s', () => {
    const poll = createPollingWindow();
    expect(poll.interval(processing)).toBe(3_000);

    vi.advanceTimersByTime(29_000);
    expect(poll.interval(processing)).toBe(3_000);

    vi.advanceTimersByTime(2_000); // 31 s into the attempt
    expect(poll.interval(processing)).toBe(10_000);
  });

  it('stops polling after 5 minutes and reports expired', () => {
    const poll = createPollingWindow();
    expect(poll.interval(processing)).toBe(3_000);

    vi.advanceTimersByTime(6 * MINUTE);
    expect(poll.interval(processing)).toBe(false);
    expect(poll.expired(processing, false)).toBe(true);
    expect(poll.expired(processing, true)).toBe(false); // still fetching → not expired yet
  });

  it('is not expired before the window runs out or once the resource settles', () => {
    const poll = createPollingWindow();
    expect(poll.expired(processing, false)).toBe(false); // never armed

    poll.interval(processing);
    vi.advanceTimersByTime(1 * MINUTE);
    expect(poll.expired(processing, false)).toBe(false);

    vi.advanceTimersByTime(6 * MINUTE);
    poll.interval(completed);
    expect(poll.expired(completed, false)).toBe(false);
  });

  it('polls a list while any item is still processing', () => {
    const poll = createPollingWindow();

    expect(poll.interval([])).toBe(false);
    expect(poll.interval([completed, failed])).toBe(false);

    // One generating plan is enough to arm the window.
    expect(poll.interval([completed, processing, failed])).toBe(3_000);

    vi.advanceTimersByTime(31_000);
    expect(poll.interval([completed, processing])).toBe(10_000);

    // Once everything settles, the list stops polling.
    expect(poll.interval([completed, completed])).toBe(false);
  });

  it('re-arms a fresh window when processing resumes after a retry', () => {
    const poll = createPollingWindow();

    // First attempt exhausts the window while still processing.
    expect(poll.interval(processing)).toBe(3_000);
    vi.advanceTimersByTime(6 * MINUTE);
    expect(poll.interval(processing)).toBe(false);

    // Backend flips to failed; user clicks retry → status back to processing.
    expect(poll.interval(failed)).toBe(false);
    expect(poll.interval(processing)).toBe(3_000); // polling resumes
    expect(poll.expired(processing, false)).toBe(false);

    // And the new attempt gets its own full window.
    vi.advanceTimersByTime(4 * MINUTE);
    expect(poll.interval(processing)).toBe(10_000);
  });
});
