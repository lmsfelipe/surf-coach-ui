import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { resetPasswordSchema, type ResetPasswordValues } from '@/schemas/auth';
import { supabase } from '@/lib/supabase';
import { AuthHeading, AuthShell } from '@/components/layout/AuthShell';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/forms/TextField';
import { Alert } from '@/components/feedback/Alert';
import { DotPulser } from '@/components/feedback/DotPulser';
import { IconLock } from '@/components/icons';

export const Route = createFileRoute('/_auth/reset-password')({
  component: ResetPasswordScreen,
});

function ResetPasswordScreen() {
  const navigate = useNavigate();
  const [authError, setAuthError] = React.useState<string | null>(null);
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  async function onSubmit(values: ResetPasswordValues) {
    setAuthError(null);
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      setAuthError('Esse link não vale mais. Peça um novo pra continuar.');
      return;
    }
    toast.success('Senha atualizada.');
    await navigate({ to: '/sessions' });
  }

  return (
    <AuthShell>
      <AuthHeading sub="Escolha uma senha nova pra sua conta.">Nova senha</AuthHeading>
      {authError && (
        <div className="mb-4">
          <Alert>{authError}</Alert>
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <TextField
            name="password"
            label="Nova senha"
            type="password"
            autoComplete="new-password"
            icon={<IconLock size={17} />}
          />
          <TextField
            name="confirmPassword"
            label="Confirmar senha"
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
              {form.formState.isSubmitting ? <DotPulser /> : 'Salvar nova senha'}
            </Button>
          </div>
        </form>
      </Form>
    </AuthShell>
  );
}
