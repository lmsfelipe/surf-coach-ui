import { z } from 'zod';
import { GENDERS, HEIGHT_CM, NAME_MAX, SURF_LEVELS, WEIGHT_KG } from '@/config/constants';

export const surfLevelSchema = z.enum(SURF_LEVELS);
export const genderSchema = z.enum(GENDERS);

export const heightCmSchema = z
  .number({ invalid_type_error: 'Informe a altura em cm' })
  .int('A altura deve ser um número inteiro')
  .min(HEIGHT_CM.min, `Mínimo ${HEIGHT_CM.min} cm`)
  .max(HEIGHT_CM.max, `Máximo ${HEIGHT_CM.max} cm`);

export const weightKgSchema = z
  .number({ invalid_type_error: 'Informe o peso em kg' })
  .int('O peso deve ser um número inteiro')
  .min(WEIGHT_KG.min, `Mínimo ${WEIGHT_KG.min} kg`)
  .max(WEIGHT_KG.max, `Máximo ${WEIGHT_KG.max} kg`);

export const nameSchema = z
  .string()
  .trim()
  .min(1, 'Informe seu nome')
  .max(NAME_MAX, `Máximo ${NAME_MAX} caracteres`);

export const birthdaySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida');

/** Profile edit form — all fields optional (mirrors PATCH /me). */
export const profileFormSchema = z.object({
  name: nameSchema.optional(),
  surfLevel: surfLevelSchema.optional(),
  gender: genderSchema.optional(),
  birthday: birthdaySchema.optional(),
  heightCm: heightCmSchema.optional(),
  weightKg: weightKgSchema.optional(),
});
export type ProfileFormValues = z.infer<typeof profileFormSchema>;

/** Onboarding — surfLevel + height + weight are required (Overview §6, decision #9). */
export const onboardingSchema = z.object({
  name: nameSchema,
  surfLevel: surfLevelSchema,
  heightCm: heightCmSchema,
  weightKg: weightKgSchema,
  gender: genderSchema.optional(),
  birthday: birthdaySchema.optional(),
});
export type OnboardingValues = z.infer<typeof onboardingSchema>;
