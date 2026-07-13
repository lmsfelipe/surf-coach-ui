import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/schemas/auth';
import { supabase } from '@/lib/supabase';
import { AuthHeading, AuthShell } from '@/components/layout/AuthShell';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/forms/TextField';
import { DotPulser } from '@/components/feedback/DotPulser';
import { IconCheckCircle, IconMail } from '@/components/icons';

export const Route = createFileRoute('/_auth/forgot-password')({
  component: ForgotPasswordScreen,
});

function ForgotPasswordScreen() {
  const [sentTo, setSentTo] = React.useState<string | null>(null);
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    // Always confirm — never reveal whether an email exists.
    setSentTo(values.email);
  }

  if (sentTo) {
    return (
      <AuthShell>
        <div className="flex flex-col items-center pt-5 text-center">
          <div className="mb-[18px] flex size-16 items-center justify-center rounded-full bg-success/[0.12] text-success">
            <IconCheckCircle size={30} />
          </div>
          <div className="mb-2 font-heading text-[22px] font-extrabold text-foreground">
            Confira seu e-mail
          </div>
          <p className="m-0 max-w-[250px] text-[13.5px] leading-5 text-muted-foreground">
            Enviamos um link para <b className="text-soft">{sentTo}</b>. Abra para criar uma
            nova senha.
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
        <Link to="/login" className="font-semibold text-primary">
          Voltar ao login
        </Link>
      }
    >
      <AuthHeading sub="Manda seu e-mail e enviamos um link pra redefinir a senha.">
        Esqueci a senha
      </AuthHeading>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <TextField
            name="email"
            label="E-mail"
            type="email"
            autoComplete="email"
            icon={<IconMail size={17} />}
          />
          <div className="mt-1.5">
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? <DotPulser /> : 'Enviar link'}
            </Button>
          </div>
        </form>
      </Form>
    </AuthShell>
  );
}
