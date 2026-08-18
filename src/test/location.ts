import { vi } from 'vitest';

/** Replace window.location with a spy-able stub. Returns the assign spy. */
export function stubLocation(pathname = '/sessions') {
  const assign = vi.fn();
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...window.location, pathname, assign },
  });
  return assign;
}
