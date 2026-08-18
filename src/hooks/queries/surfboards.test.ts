import { describe, expect, it } from 'vitest';
import { qk } from '@/lib/queryKeys';
import { surfboardQueryOptions, surfboardsQueryOptions } from './surfboards';
import type { Surfboard } from '@/types/api';

describe('surfboardsQueryOptions', () => {
  it('uses the surfboards list key and resolves the list from the API', async () => {
    const options = surfboardsQueryOptions();
    expect(options.queryKey).toEqual(qk.surfboards.list());

    const result = await (options.queryFn as () => Promise<Surfboard[]>)();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('surfboardQueryOptions', () => {
  it('uses the surfboard detail key and resolves the board by id', async () => {
    const options = surfboardQueryOptions('b1');
    expect(options.queryKey).toEqual(qk.surfboards.detail('b1'));

    const result = await (options.queryFn as () => Promise<Surfboard>)();
    expect(result.id).toBe('b1');
  });
});
