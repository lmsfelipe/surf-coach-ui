import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { profileQueryOptions, useProfile } from '@/hooks/queries/profile';
import { useAuthStore } from '@/stores/authStore';
import { AppHeader } from '@/components/layout/AppHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/feedback/Eyebrow';
import { IconChevronRight, IconLock, IconLogout, IconMail } from '@/components/icons';

export const Route = createFileRoute('/_app/settings')({
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQueryOptions()),
  component: SettingsScreen,
});

function SettingsScreen() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const signOut = useAuthStore((s) => s.signOut);

  async function handleLogout() {
    await signOut();
    await navigate({ to: '/login' });
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader onBack title="Configurações" hideAvatar />
      <div className="flex-1 px-5 pt-1.5">
        <Eyebrow>Conta</Eyebrow>
        <Card className="p-[4px_16px]">
          <div className="flex items-center gap-3 border-b border-white/[0.06] py-3.5">
            <IconMail size={18} className="text-primary" />
            <div className="flex-1">
              <div className="text-[11px] text-muted-foreground">E-mail</div>
              <div className="mt-0.5 text-[13.5px] font-semibold text-foreground">
                {profile.email}
              </div>
            </div>
          </div>
          <Link
            to="/profile/change-password"
            className="flex items-center gap-3 py-3.5 focus-visible:outline-none"
          >
            <IconLock size={18} className="text-muted-foreground" />
            <div className="flex-1 text-[13.5px] font-semibold text-foreground">
              Alterar senha
            </div>
            <IconChevronRight size={18} className="text-muted-foreground" />
          </Link>
        </Card>
        <div className="mt-5">
          <Button
            variant="ghost"
            className="w-full bg-danger/[0.12] text-danger hover:bg-danger/20"
            onClick={handleLogout}
          >
            <IconLogout size={17} />
            Sair
          </Button>
        </div>
      </div>
      <div className="pb-[26px] text-center text-[11px] text-[color:var(--color-text-faint)]">
        SurfRise · versão 1.0.0
      </div>
    </div>
  );
}
