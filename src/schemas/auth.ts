import { z } from 'zod';
import { nameSchema } from './profile';

const emailSchema = z.string().trim().min(1, 'Informe seu e-mail').email('E-mail inválido');
const passwordSchema = z.string().min(8, 'A senha precisa ter ao menos 8 caracteres');

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
