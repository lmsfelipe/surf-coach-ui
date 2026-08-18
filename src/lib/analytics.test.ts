import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/config/env', () => ({ env: { gaMeasurementId: 'G-TEST0000' } }));

/**
 * The exact discriminator gtag.js applies to every dataLayer entry. Entries that
 * fail it are not run as commands — they are read as a legacy dotted method path
 * and their failure is swallowed, so a broken queue reports no error anywhere.
 */
function isExecutableCommand(entry: unknown): boolean {
  return Object.prototype.toString.call(entry) === '[object Arguments]';
}

describe('analytics', () => {
  beforeEach(() => {
    // enabled() is false under MODE=test, which would make every call a no-op.
    vi.stubEnv('MODE', 'production');
    vi.resetModules();
    delete (window as Partial<Window>).dataLayer;
    document.head.replaceChildren();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('queues every command in the only form gtag.js executes', async () => {
    const { initAnalytics, trackPageView, identifyUser } = await import('@/lib/analytics');

    initAnalytics();
    trackPageView('/sessions');
    identifyUser('user-123');

    // js + config + page_view + set — a regression drops these silently, so
    // assert the queue is non-empty before asserting the shape of its entries.
    expect(window.dataLayer).toHaveLength(4);
    expect(window.dataLayer.every(isExecutableCommand)).toBe(true);
  });

  it('loads gtag.js for the configured measurement id', async () => {
    const { initAnalytics } = await import('@/lib/analytics');

    initAnalytics();

    const script = document.head.querySelector('script');
    expect(script?.src).toBe('https://www.googletagmanager.com/gtag/js?id=G-TEST0000');
  });
});
