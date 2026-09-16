import { env } from '@/config/env';

/**
 * Meta (Facebook) Pixel integration. No-op when VITE_META_PIXEL_ID is unset
 * (local dev, previews) and under test, so nothing is reported without a
 * configured pixel. Base code loads at bootstrap (main.tsx, same pixel id as
 * the LP); `trackPageView` fires on every SPA route resolution (see main.tsx,
 * same wiring as GA) since — unlike a static site — a client-side route
 * change never re-runs the base code's own PageView. Other event calls live
 * where the event happens (e.g. `Lead` in signup.tsx).
 */

interface FbqFunction {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: FbqFunction;
  loaded: boolean;
  version: string;
}

declare global {
  interface Window {
    fbq: FbqFunction;
    _fbq: FbqFunction;
  }
}

/** True only when the pixel is configured and we're not running the test suite. */
function enabled(): boolean {
  return Boolean(env.metaPixelId) && import.meta.env.MODE !== 'test';
}

/**
 * Inject fbevents.js. Mirrors Meta's standard base code: calls made before
 * the script loads queue on `fbq.queue` and are replayed once it's ready.
 * Call once at app bootstrap, before the router's first `onResolved` fires
 * the initial PageView (see trackPageView / main.tsx).
 */
export function initMetaPixel(): void {
  if (!enabled() || typeof document === 'undefined' || window.fbq !== undefined) return;

  const id = env.metaPixelId as string;

  const stub = function (...args: unknown[]) {
    if (stub.callMethod) {
      stub.callMethod(...args);
    } else {
      stub.queue.push(args);
    }
  } as FbqFunction;
  stub.push = stub;
  stub.loaded = true;
  stub.version = '2.0';
  stub.queue = [];
  window._fbq = stub;
  window.fbq = stub;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  window.fbq('init', id);
}

/** Report a single-page-app navigation as a Pixel PageView. */
export function trackPageView(): void {
  if (!enabled()) return;
  window.fbq('track', 'PageView');
}

/** Report a completed signup. Call right after the signup API call succeeds. */
export function trackLead(): void {
  if (!enabled()) return;
  window.fbq('track', 'Lead');
}
