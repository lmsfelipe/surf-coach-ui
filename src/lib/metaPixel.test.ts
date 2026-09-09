import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/config/env', () => ({ env: { metaPixelId: '1428121946081158' } }));

describe('metaPixel', () => {
  beforeEach(() => {
    // enabled() is false under MODE=test, which would make every call a no-op.
    vi.stubEnv('MODE', 'production');
    vi.resetModules();
    delete (window as Partial<Window>).fbq;
    delete (window as Partial<Window>)._fbq;
    document.head.replaceChildren();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('loads fbevents.js and queues init + PageView', async () => {
    const { initMetaPixel } = await import('@/lib/metaPixel');

    initMetaPixel();

    const script = document.head.querySelector('script');
    expect(script?.src).toBe('https://connect.facebook.net/en_US/fbevents.js');
    expect(window.fbq.queue).toEqual([
      ['init', '1428121946081158'],
      ['track', 'PageView'],
    ]);
  });

  it('queues a Lead event on trackLead', async () => {
    const { initMetaPixel, trackLead } = await import('@/lib/metaPixel');

    initMetaPixel();
    trackLead();

    expect(window.fbq.queue.at(-1)).toEqual(['track', 'Lead']);
  });
});
