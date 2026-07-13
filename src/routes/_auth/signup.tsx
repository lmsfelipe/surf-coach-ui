import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { signupSchema, type SignupValues } from '@/schemas/auth';
import { supabase } from '@/lib/supabase';
import { AuthHeading, AuthShell } from '@/components/layout/AuthShell';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/forms/TextField';
import { Alert } from '@/components/feedback/Alert';
import { DotPulser } from '@/components/feedback/DotPulser';
import { IconLock, IconMail } from '@/components/icons';

export const Route = createFileRoute('/_auth/signup')({
  component: SignupScreen,
});

function SignupScreen() {
  const navigate = useNavigate();
  const [authError, setAuthError] = React.useState<string | null>(null);
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  async function onSubmit(values: SignupValues) {
    setAuthError(null);
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { name: values.name } },
    });
    if (error) {
      if (error.message.toLowerCase().includes('registered')) {
        form.setError('email', { message: 'E-mail já cadastrado.' });
      } else {
        setAuthError('Não conseguimos criar sua conta. Tente de novo?');
      }
      return;
    }
    // initAuth's onAuthStateChange will populate the session; the _app guard
    // then routes to onboarding (new profile is incomplete).
    await navigate({ to: '/sessions' });
  }

  return (
    <AuthShell
      foot={
        <>
          Já tenho conta ·{' '}
          <Link to="/login" className="font-semibold text-primary">
            Entrar
          </Link>
        </>
      }
    >
      <AuthHeading>Criar conta</AuthHeading>
      {authError && (
        <div className="mb-4">
          <Alert>{authError}</Alert>
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <TextField name="name" label="Nome" placeholder="Seu nome" autoComplete="name" />
          <TextField
            name="email"
            label="E-mail"
            type="email"
            autoComplete="email"
            icon={<IconMail size={17} />}
          />
          <TextField
            name="password"
            label="Senha"
            type="password"
            autoComplete="new-password"
            icon={<IconLock size={17} />}
          />
          <div className="mt-1.5">
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? <DotPulser /> : 'Criar conta'}
            </Button>
          </div>
        </form>
      </Form>
    </AuthShell>
  );
}
