import { describe, expect, it } from 'vitest';
import { makeMedia } from '@/test/fixtures';
import { mediaContentUrl } from './url';

describe('mediaContentUrl', () => {
  it('prefixes a relative contentUrl with the API base', () => {
    const media = makeMedia({ contentUrl: '/api/v1/media/m1/content?token=t' });
    expect(mediaContentUrl(media)).toBe('http://localhost:8000/api/v1/media/m1/content?token=t');
  });

  it('passes through an already-absolute URL unchanged', () => {
    const media = makeMedia({ contentUrl: 'https://cdn.example.com/m1.jpg' });
    expect(mediaContentUrl(media)).toBe('https://cdn.example.com/m1.jpg');
  });
});
