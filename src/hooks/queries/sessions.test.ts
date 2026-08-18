import { describe, expect, it } from 'vitest';
import { qk } from '@/lib/queryKeys';
import { sessionQueryOptions, sessionsQueryOptions } from './sessions';
import type { Session } from '@/types/api';

describe('sessionsQueryOptions', () => {
  it('uses the sessions list key and resolves the list from the API', async () => {
    const options = sessionsQueryOptions();
    expect(options.queryKey).toEqual(qk.sessions.list());

    const result = await (options.queryFn as () => Promise<Session[]>)();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('sessionQueryOptions', () => {
  it('uses the session detail key and resolves the session by id', async () => {
    const options = sessionQueryOptions('s1');
    expect(options.queryKey).toEqual(qk.sessions.detail('s1'));

    const result = await (options.queryFn as () => Promise<Session>)();
    expect(result.id).toBe('s1');
  });
});
