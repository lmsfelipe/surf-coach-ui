import { env } from '@/config/env';

/**
 * Google Analytics 4 (gtag.js) integration. No-op when VITE_GA_MEASUREMENT_ID is
 * unset (local dev, previews) and under test, so nothing is reported without a
 * configured property. Page views are fired manually (SPA — see main.tsx) and the
 * GA user_id is kept in sync with the Supabase session (see authStore.ts).
 */

type GtagArgs =
  | ['js', Date]
  | ['config', string, Record<string, unknown>?]
  | ['set', Record<string, unknown>]
  | ['event', string, Record<string, unknown>?];

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: GtagArgs) => void;
  }
}

/** True only when GA is configured and we're not running the test suite. */
function enabled(): boolean {
  return Boolean(env.gaMeasurementId) && import.meta.env.MODE !== 'test';
}

/**
 * Inject the gtag.js snippet and configure the property. `send_page_view: false`
 * hands page-view control to us so the single-page app reports real navigations
 * instead of only the initial document load. Call once at app bootstrap.
 */
export function initAnalytics(): void {
  if (!enabled() || typeof document === 'undefined') return;

  const id = env.gaMeasurementId as string;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer ?? [];
  // Must push the `arguments` object, not an array. gtag.js only runs a queued
  // entry as a command when `toString.call(entry) === '[object Arguments]'`; a
  // real array is instead read as a legacy dotted method path ('event' -> no
  // such method) and the resulting failure is swallowed by an empty catch, so
  // every js/config/event is silently dropped and no hit is ever sent.
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', id, { send_page_view: false });
}

/** Report a single-page-app navigation as a GA page_view. */
export function trackPageView(path: string, title?: string): void {
  if (!enabled()) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    ...(title ? { page_title: title } : {}),
  });
}

/**
 * Set (or clear) the GA user_id. Pass the Supabase user id on login — a
 * pseudonymous identifier, never email or other PII — and `null` on logout.
 */
export function identifyUser(userId: string | null): void {
  if (!enabled()) return;
  window.gtag('set', { user_id: userId ?? undefined });
}
