import { describe, expect, it } from 'vitest';
import { surfboardFormSchema } from './surfboard';
import { sessionFormSchema } from './session';
import { onboardingSchema } from './profile';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from './auth';
import { EMAIL_MAX, PASSWORD_MAX } from '@/config/constants';

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
      waveSize: 1.4,
    });
    expect(r.success).toBe(true);
  });

  it('rejects a malformed date', () => {
    const r = sessionFormSchema.safeParse({
      sessionDate: '01/06/2026',
      location: 'Maresias',
      waveSize: 1.4,
    });
    expect(r.success).toBe(false);
  });

  it('rejects a non-positive wave size', () => {
    const r = sessionFormSchema.safeParse({
      sessionDate: '2026-06-01',
      location: 'Maresias',
      waveSize: 0,
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

describe('loginSchema', () => {
  it('accepts a valid login', () => {
    expect(loginSchema.safeParse({ email: 'surfer@example.com', password: 'x' }).success).toBe(
      true,
    );
  });

  it('requires an email', () => {
    const r = loginSchema.safeParse({ email: '', password: 'x' });
    expect(r.success).toBe(false);
    expect(!r.success && r.error.issues.some((i) => i.message === 'Informe seu e-mail')).toBe(
      true,
    );
  });

  it('rejects a malformed email', () => {
    const r = loginSchema.safeParse({ email: 'not-an-email', password: 'x' });
    expect(r.success).toBe(false);
    expect(!r.success && r.error.issues.some((i) => i.message === 'E-mail inválido')).toBe(true);
  });

  it('rejects an email over EMAIL_MAX characters', () => {
    const longEmail = `${'a'.repeat(EMAIL_MAX)}@example.com`;
    const r = loginSchema.safeParse({ email: longEmail, password: 'x' });
    expect(r.success).toBe(false);
    expect(
      !r.success && r.error.issues.some((i) => i.message === `Máximo ${EMAIL_MAX} caracteres`),
    ).toBe(true);
  });

  it('requires a password', () => {
    const r = loginSchema.safeParse({ email: 'surfer@example.com', password: '' });
    expect(r.success).toBe(false);
    expect(!r.success && r.error.issues.some((i) => i.message === 'Informe sua senha')).toBe(
      true,
    );
  });

  it('trims a whitespace-only email to empty, rejecting it', () => {
    const r = loginSchema.safeParse({ email: '   ', password: 'x' });
    expect(r.success).toBe(false);
    expect(!r.success && r.error.issues.some((i) => i.message === 'Informe seu e-mail')).toBe(
      true,
    );
  });
});

describe('signupSchema', () => {
  it('accepts a valid signup', () => {
    const r = signupSchema.safeParse({
      name: 'Ana',
      email: 'surfer@example.com',
      password: 'password1',
    });
    expect(r.success).toBe(true);
  });

  it('validates the name via nameSchema', () => {
    const r = signupSchema.safeParse({ name: '', email: 'surfer@example.com', password: 'password1' });
    expect(r.success).toBe(false);
    expect(!r.success && r.error.issues.some((i) => i.message === 'Informe seu nome')).toBe(true);
  });

  it('rejects a password under 8 characters', () => {
    const r = signupSchema.safeParse({ name: 'Ana', email: 'surfer@example.com', password: '1234567' });
    expect(r.success).toBe(false);
  });

  it('accepts a password at exactly 8 characters', () => {
    const r = signupSchema.safeParse({
      name: 'Ana',
      email: 'surfer@example.com',
      password: '12345678',
    });
    expect(r.success).toBe(true);
  });

  it('rejects a password over PASSWORD_MAX characters', () => {
    const r = signupSchema.safeParse({
      name: 'Ana',
      email: 'surfer@example.com',
      password: 'a'.repeat(PASSWORD_MAX + 1),
    });
    expect(r.success).toBe(false);
  });
});

describe('forgotPasswordSchema', () => {
  it('accepts a valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'surfer@example.com' }).success).toBe(true);
  });

  it('rejects an invalid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'nope' }).success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  it('accepts matching passwords', () => {
    const r = resetPasswordSchema.safeParse({ password: '12345678', confirmPassword: '12345678' });
    expect(r.success).toBe(true);
  });

  it('reports a mismatch on the confirmPassword path, not the form root', () => {
    const r = resetPasswordSchema.safeParse({ password: '12345678', confirmPassword: 'different' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0]?.path).toEqual(['confirmPassword']);
      expect(r.error.issues[0]?.message).toBe('As senhas não conferem');
    }
  });
});

describe('changePasswordSchema', () => {
  it('reports a mismatch on the confirmPassword path, not the form root', () => {
    const r = changePasswordSchema.safeParse({ password: '12345678', confirmPassword: 'different' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0]?.path).toEqual(['confirmPassword']);
      expect(r.error.issues[0]?.message).toBe('As senhas não conferem');
    }
  });
});
