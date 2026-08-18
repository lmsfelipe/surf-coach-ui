import { describe, expect, it } from 'vitest';
import { qk } from '@/lib/queryKeys';
import { profileQueryOptions } from './profile';
import type { Profile } from '@/types/api';

describe('profileQueryOptions', () => {
  it('uses the profile key and resolves the current profile from the API', async () => {
    const options = profileQueryOptions();
    expect(options.queryKey).toEqual(qk.profile.me());

    const result = await (options.queryFn as () => Promise<Profile>)();
    expect(result.id).toBe('p1');
  });
});
