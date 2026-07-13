import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  GENDER_OPTIONS,
  HEIGHT_CM,
  SURF_LEVEL_OPTIONS,
  WEIGHT_KG,
} from '@/config/constants';
import { profileFormSchema, type ProfileFormValues } from '@/schemas/profile';
import { profileQueryOptions, useProfile } from '@/hooks/queries/profile';
import { useUpdateProfile } from '@/hooks/mutations/profile';
import { handleMutationError } from '@/lib/api/formErrors';
import { initialsFor } from '@/components/layout/ProfileAvatar';
import { AppHeader } from '@/components/layout/AppHeader';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/forms/TextField';
import { SelectField } from '@/components/forms/SelectField';
import { NumberField } from '@/components/forms/NumberField';
import { DateField } from '@/components/forms/DateField';
import { AvatarUploader } from '@/components/forms/AvatarUploader';
import { DotPulser } from '@/components/feedback/DotPulser';

export const Route = createFileRoute('/_app/profile/edit')({
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQueryOptions()),
  component: EditProfileScreen,
});

function EditProfileScreen() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile.name ?? undefined,
      surfLevel: profile.surfLevel ?? undefined,
      gender: profile.gender ?? undefined,
      birthday: profile.birthday ?? undefined,
      heightCm: profile.heightCm ?? undefined,
      weightKg: profile.weightKg ?? undefined,
    },
  });

  async function onSubmit(values: ProfileFormValues) {
    try {
      await updateProfile.mutateAsync(values);
      toast.success('Perfil atualizado.');
      await navigate({ to: '/profile' });
    } catch (err) {
      handleMutationError(err, form.setError);
    }
  }

  function handleAvatar(url: string) {
    updateProfile.mutate({ avatarUrl: url }, { onSuccess: () => toast.success('Foto atualizada.') });
  }

  return (
    <div>
      <AppHeader onBack title="Editar perfil" hideAvatar />
      <div className="px-5 pb-8 pt-1.5">
        <div className="mb-[18px]">
          <AvatarUploader
            value={profile.avatarUrl}
            initials={initialsFor(profile.name, profile.email)}
            onUploaded={handleAvatar}
          />
        </div>
        <Form {...form}>
          <form id="profile-edit" onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <TextField name="name" label="Nome" autoComplete="name" />
              <SelectField name="surfLevel" label="Nível de surf" options={SURF_LEVEL_OPTIONS} />
              <div className="flex gap-3">
                <div className="flex-1">
                  <NumberField
                    name="heightCm"
                    label="Altura (cm)"
                    suffix="cm"
                    min={HEIGHT_CM.min}
                    max={HEIGHT_CM.max}
                  />
                </div>
                <div className="flex-1">
                  <NumberField
                    name="weightKg"
                    label="Peso (kg)"
                    suffix="kg"
                    min={WEIGHT_KG.min}
                    max={WEIGHT_KG.max}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <SelectField name="gender" label="Gênero" optional options={GENDER_OPTIONS} />
                </div>
                <div className="flex-1">
                  <DateField name="birthday" label="Nascimento" optional />
                </div>
              </div>
            </Card>
          </form>
        </Form>
        <Button
          type="submit"
          form="profile-edit"
          size="lg"
          className="mt-5 w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? <DotPulser /> : 'Salvar alterações'}
        </Button>
      </div>
    </div>
  );
}
