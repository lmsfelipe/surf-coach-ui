import { describe, expect, it } from 'vitest';
import { makeProfile } from '@/test/fixtures';
import { isProfileComplete } from './profile';

describe('isProfileComplete', () => {
  it('is complete when surfLevel, heightCm, and weightKg are all set', () => {
    expect(isProfileComplete(makeProfile())).toBe(true);
  });

  it('is incomplete when surfLevel is missing', () => {
    expect(isProfileComplete(makeProfile({ surfLevel: null }))).toBe(false);
  });

  it('is incomplete when heightCm is missing', () => {
    expect(isProfileComplete(makeProfile({ heightCm: null }))).toBe(false);
  });

  it('is incomplete when weightKg is missing', () => {
    expect(isProfileComplete(makeProfile({ weightKg: null }))).toBe(false);
  });
});
