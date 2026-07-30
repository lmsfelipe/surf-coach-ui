import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { loginSchema, type LoginValues } from '@/schemas/auth';
import { supabase } from '@/lib/supabase';
import { AuthHeading, AuthShell } from '@/components/layout/AuthShell';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/forms/TextField';
import { PasswordField } from '@/components/forms/PasswordField';
import { Alert } from '@/components/feedback/Alert';
import { DotPulser } from '@/components/feedback/DotPulser';
import { IconLock, IconMail } from '@/components/icons';

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute('/_auth/login')({
  validateSearch: searchSchema,
  component: LoginScreen,
});

function LoginScreen() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [authError, setAuthError] = React.useState<string | null>(null);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginValues) {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
      setAuthError('E-mail ou senha inválidos.');
      return;
    }
    const to = redirect && redirect.startsWith('/') ? redirect : '/sessions';
    await navigate({ to: to as '/sessions' });
  }

  return (
    <AuthShell>
      <AuthHeading>Entrar</AuthHeading>
      {authError && (
        <div className="mb-4">
          <Alert>{authError}</Alert>
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <TextField
            name="email"
            label="E-mail"
            type="email"
            autoComplete="email"
            icon={<IconMail size={17} />}
          />
          <PasswordField
            name="password"
            label="Senha"
            autoComplete="current-password"
            icon={<IconLock size={17} />}
          />
          <div className="-mt-1 mb-5 text-right">
            <Link to="/forgot-password" className="text-[12.5px] font-semibold text-primary">
              Esqueci minha senha
            </Link>
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <DotPulser /> : 'Entrar'}
          </Button>
          <p className="mt-4 text-center text-[15px] text-muted-foreground">
            Não tem conta?{' '}
            <Link to="/signup" className="font-semibold text-primary">
              Criar conta
            </Link>
          </p>
        </form>
      </Form>
    </AuthShell>
  );
}
