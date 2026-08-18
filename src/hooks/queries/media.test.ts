import { describe, expect, it } from 'vitest';
import { qk } from '@/lib/queryKeys';
import { mediaQueryOptions } from './media';
import type { Media } from '@/types/api';

describe('mediaQueryOptions', () => {
  it('uses the by-session media key and resolves the list from the API', async () => {
    const options = mediaQueryOptions('s1');
    expect(options.queryKey).toEqual(qk.media.bySession('s1'));

    const result = await (options.queryFn as () => Promise<Media[]>)();
    expect(Array.isArray(result)).toBe(true);
  });
});
