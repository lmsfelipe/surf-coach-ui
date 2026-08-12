import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { changePasswordSchema, type ChangePasswordValues } from '@/schemas/auth';
import { PASSWORD_MAX } from '@/config/constants';
import { supabase } from '@/lib/supabase';
import { AppHeader } from '@/components/layout/AppHeader';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { PasswordField } from '@/components/forms/PasswordField';
import { Alert } from '@/components/feedback/Alert';
import { DotPulser } from '@/components/feedback/DotPulser';
import { IconLock } from '@/components/icons';

export const Route = createFileRoute('/_app/profile/change-password')({
  component: ChangePasswordScreen,
});

function ChangePasswordScreen() {
  const navigate = useNavigate();
  const [authError, setAuthError] = React.useState<string | null>(null);

  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  async function onSubmit(values: ChangePasswordValues) {
    setAuthError(null);
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      setAuthError('Não foi possível alterar a senha. Tente novamente.');
      return;
    }
    toast.success('Senha alterada com sucesso!');
    await navigate({ to: '/settings' });
  }

  return (
    <div>
      <AppHeader onBack title="Alterar senha" hideAvatar />
      <div className="px-5 pb-8 pt-1.5">
        {authError && (
          <div className="mb-4">
            <Alert>{authError}</Alert>
          </div>
        )}
        <Form {...form}>
          <form id="change-pw-form" onSubmit={form.handleSubmit(onSubmit)}>
            <PasswordField
              name="password"
              label="Nova senha"
              autoComplete="new-password"
              icon={<IconLock size={17} />}
              maxLength={PASSWORD_MAX}
            />
            <PasswordField
              name="confirmPassword"
              label="Confirmar nova senha"
              autoComplete="new-password"
              icon={<IconLock size={17} />}
              maxLength={PASSWORD_MAX}
            />
          </form>
        </Form>
        <Button
          type="submit"
          form="change-pw-form"
          size="lg"
          className="mt-5 w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? <DotPulser /> : 'Salvar nova senha'}
        </Button>
      </div>
    </div>
  );
}
