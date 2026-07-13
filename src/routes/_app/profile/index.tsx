import { createFileRoute, Link } from '@tanstack/react-router';
import { SURF_LEVEL_OPTIONS } from '@/config/constants';
import { profileQueryOptions, useProfile } from '@/hooks/queries/profile';
import { initialsFor } from '@/components/layout/ProfileAvatar';
import { AppHeader } from '@/components/layout/AppHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ProfileHeaderSkeleton } from '@/components/skeletons';
import {
  IconBoard,
  IconChevronRight,
  IconPencil,
  IconSettings,
  IconSparkle,
} from '@/components/icons';
import type { LinkProps } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/profile/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQueryOptions()),
  pendingComponent: () => (
    <>
      <AppHeader hideAvatar />
      <ProfileHeaderSkeleton />
    </>
  ),
  errorComponent: ({ reset }) => (
    <>
      <AppHeader hideAvatar />
      <div className="pt-9">
        <ErrorState onRetry={reset} />
      </div>
    </>
  ),
  component: ProfileScreen,
});

function MenuRow({
  icon,
  label,
  to,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  to: LinkProps['to'];
  last?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-[13px] p-[15px_16px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
        last ? '' : 'border-b border-white/[0.06]'
      }`}
    >
      <span className="text-primary">{icon}</span>
      <span className="flex-1 text-sm font-semibold text-foreground">{label}</span>
      <IconChevronRight size={18} className="text-muted-foreground" />
    </Link>
  );
}

function ProfileScreen() {
  const { data: profile } = useProfile();
  const levelLabel = SURF_LEVEL_OPTIONS.find((o) => o.value === profile.surfLevel)?.label;

  return (
    <>
      <AppHeader
        hideAvatar
        action={
          <Link
            to="/settings"
            aria-label="Configurações"
            className="flex size-9 items-center justify-center rounded-full bg-secondary text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <IconSettings size={18} />
          </Link>
        }
      />
      <div className="px-5 pt-1.5">
        <div className="mb-[26px] flex flex-col items-center text-center">
          <Avatar className="size-[76px]">
            {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt="" />}
            <AvatarFallback className="text-2xl">
              {initialsFor(profile.name, profile.email)}
            </AvatarFallback>
          </Avatar>
          <div className="mt-3.5 font-heading text-[21px] font-extrabold tracking-[-0.02em] text-foreground">
            {profile.name ?? 'Surfista'}
          </div>
          {levelLabel && (
            <div className="mt-2">
              <Badge tone="accent">
                <IconSparkle size={12} /> {levelLabel}
              </Badge>
            </div>
          )}
          <div className="mt-3 flex gap-4 text-[12.5px] text-muted-foreground">
            {profile.heightCm != null && (
              <span>
                <b className="font-display font-medium text-soft">{profile.heightCm}</b> cm
              </span>
            )}
            {profile.heightCm != null && profile.weightKg != null && <span>·</span>}
            {profile.weightKg != null && (
              <span>
                <b className="font-display font-medium text-soft">{profile.weightKg}</b> kg
              </span>
            )}
          </div>
        </div>
        <Card className="p-[6px_0]">
          <MenuRow icon={<IconBoard size={19} />} label="Minhas pranchas" to="/boards" />
          <MenuRow icon={<IconPencil size={18} />} label="Editar perfil" to="/profile/edit" />
          <MenuRow icon={<IconSettings size={18} />} label="Configurações" to="/settings" last />
        </Card>
      </div>
    </>
  );
}
