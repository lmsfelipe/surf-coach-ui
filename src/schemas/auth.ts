import { z } from 'zod';
import { EMAIL_MAX, PASSWORD_MAX } from '@/config/constants';
import { nameSchema } from './profile';

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Informe seu e-mail')
  .max(EMAIL_MAX, `Máximo ${EMAIL_MAX} caracteres`)
  .email('E-mail inválido');
const passwordSchema = z
  .string()
  .min(8, 'A senha precisa ter ao menos 8 caracteres')
  .max(PASSWORD_MAX, `Máximo ${PASSWORD_MAX} caracteres`);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Informe sua senha'),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});
export type SignupValues = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({ email: emailSchema });
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
