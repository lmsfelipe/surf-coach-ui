import { useRef } from 'react';

const WINDOW_MS = 5 * 60 * 1000;
const FAST_PHASE_MS = 30 * 1000;
const FAST_INTERVAL_MS = 3_000;
const SLOW_INTERVAL_MS = 10_000;

interface Pollable {
  status: 'processing' | 'completed' | 'failed';
}

/**
 * Polling schedule for async AI resources (reviews, training plans): every
 * 3 s for the first 30 s of a processing attempt, then every 10 s, stopping
 * after 5 min.
 *
 * The window is anchored to the current processing attempt, not to hook
 * mount: the anchor arms when the resource is first seen in "processing" and
 * clears when it leaves that state. This way a retry that flips "failed" back
 * to "processing" always gets a fresh window, even if the screen has been
 * open longer than the window (a mount-time anchor would silently never
 * resume polling in that case).
 */
export function createPollingWindow() {
  let anchor: number | null = null;

  return {
    /** TanStack Query `refetchInterval` value for the given data. */
    interval(data: Pollable | null | undefined): number | false {
      if (!data || data.status !== 'processing') {
        anchor = null;
        return false;
      }
      anchor ??= Date.now();
      const elapsed = Date.now() - anchor;
      if (elapsed > WINDOW_MS) return false;
      return elapsed < FAST_PHASE_MS ? FAST_INTERVAL_MS : SLOW_INTERVAL_MS;
    },

    /** True when the window expired while the resource was still processing. */
    expired(data: Pollable | null | undefined, isFetching: boolean): boolean {
      return (
        data?.status === 'processing' &&
        anchor !== null &&
        Date.now() - anchor > WINDOW_MS &&
        !isFetching
      );
    },
  };
}

export function usePollingWindow() {
  const ref = useRef<ReturnType<typeof createPollingWindow> | null>(null);
  ref.current ??= createPollingWindow();
  return ref.current;
}
