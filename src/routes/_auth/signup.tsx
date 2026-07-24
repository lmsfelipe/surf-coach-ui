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
import { IconCheckCircle, IconLock, IconMail } from '@/components/icons';

export const Route = createFileRoute('/_auth/signup')({
  component: SignupScreen,
});

function SignupScreen() {
  const navigate = useNavigate();
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [confirmSentTo, setConfirmSentTo] = React.useState<string | null>(null);
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  async function onSubmit(values: SignupValues) {
    setAuthError(null);
    const { data, error } = await supabase.auth.signUp({
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
    // With email confirmation enabled in Supabase, signUp succeeds but returns
    // no session — navigating on would just bounce off the _app guard back to
    // /login with no explanation. Tell the user to check their inbox instead.
    if (!data.session) {
      setConfirmSentTo(values.email);
      return;
    }
    // initAuth's onAuthStateChange will populate the session; the _app guard
    // then routes to onboarding (new profile is incomplete).
    await navigate({ to: '/sessions' });
  }

  if (confirmSentTo) {
    return (
      <AuthShell>
        <div className="flex flex-col items-center pt-5 text-center">
          <div className="mb-[18px] flex size-16 items-center justify-center rounded-full bg-success/[0.12] text-success">
            <IconCheckCircle size={30} />
          </div>
          <div className="mb-2 font-heading text-[22px] font-extrabold text-foreground">
            Confirme seu e-mail
          </div>
          <p className="m-0 max-w-[250px] text-[13.5px] leading-5 text-muted-foreground">
            Enviamos um link para <b className="text-soft">{confirmSentTo}</b>. Abra para ativar
            sua conta e entrar.
          </p>
          <div className="mt-6 w-full">
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">Voltar ao login</Link>
            </Button>
          </div>
        </div>
      </AuthShell>
    );
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
