import { describe, expect, it } from 'vitest';
import { surfboardFormSchema } from './surfboard';
import { sessionFormSchema } from './session';
import { onboardingSchema } from './profile';

describe('surfboardFormSchema', () => {
  it('accepts a valid board', () => {
    const r = surfboardFormSchema.safeParse({ boardType: 'shortboard', boardSize: 6.2 });
    expect(r.success).toBe(true);
  });

  it('rejects an unknown board type', () => {
    const r = surfboardFormSchema.safeParse({ boardType: 'gun', boardSize: 6.2 });
    expect(r.success).toBe(false);
  });

  it('rejects a non-positive size', () => {
    const r = surfboardFormSchema.safeParse({ boardType: 'longboard', boardSize: 0 });
    expect(r.success).toBe(false);
  });

  it('rejects a size below the minimum (3 ft)', () => {
    const r = surfboardFormSchema.safeParse({ boardType: 'shortboard', boardSize: 2 });
    expect(r.success).toBe(false);
  });

  it('rejects a size above the maximum (15 ft)', () => {
    const r = surfboardFormSchema.safeParse({ boardType: 'longboard', boardSize: 20 });
    expect(r.success).toBe(false);
  });

  it('rejects a volume below the minimum (5 L)', () => {
    const r = surfboardFormSchema.safeParse({
      boardType: 'shortboard',
      boardSize: 6.2,
      volume: 2,
    });
    expect(r.success).toBe(false);
  });

  it('rejects a volume above the maximum (200 L)', () => {
    const r = surfboardFormSchema.safeParse({
      boardType: 'longboard',
      boardSize: 9,
      volume: 300,
    });
    expect(r.success).toBe(false);
  });

  it('accepts an in-range volume', () => {
    const r = surfboardFormSchema.safeParse({
      boardType: 'shortboard',
      boardSize: 6.2,
      volume: 32,
    });
    expect(r.success).toBe(true);
  });
});

describe('sessionFormSchema', () => {
  it('accepts a valid session (meters)', () => {
    const r = sessionFormSchema.safeParse({
      sessionDate: '2026-06-01',
      location: 'Maresias',
      waveSizeMeters: 1.4,
    });
    expect(r.success).toBe(true);
  });

  it('rejects a malformed date', () => {
    const r = sessionFormSchema.safeParse({
      sessionDate: '01/06/2026',
      location: 'Maresias',
      waveSizeMeters: 1.4,
    });
    expect(r.success).toBe(false);
  });

  it('rejects a non-positive wave size', () => {
    const r = sessionFormSchema.safeParse({
      sessionDate: '2026-06-01',
      location: 'Maresias',
      waveSizeMeters: 0,
    });
    expect(r.success).toBe(false);
  });
});

describe('onboardingSchema', () => {
  it('requires surfLevel, height and weight', () => {
    expect(onboardingSchema.safeParse({}).success).toBe(false);
    // missing surfLevel is rejected
    expect(
      onboardingSchema.safeParse({ heightCm: 180, weightKg: 75 }).success,
    ).toBe(false);
    expect(
      onboardingSchema.safeParse({
        surfLevel: 'intermediate',
        heightCm: 180,
        weightKg: 75,
      }).success,
    ).toBe(true);
  });

  it('accepts an optional birthday', () => {
    const r = onboardingSchema.safeParse({
      surfLevel: 'intermediate',
      heightCm: 180,
      weightKg: 75,
      birthday: '1990-02-11',
    });
    expect(r.success).toBe(true);
  });

  it('enforces height bounds', () => {
    const r = onboardingSchema.safeParse({
      surfLevel: 'beginner',
      heightCm: 90,
      weightKg: 75,
    });
    expect(r.success).toBe(false);
  });
});
