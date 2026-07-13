import { Link } from '@tanstack/react-router';
import { useProfile } from '@/hooks/queries/profile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

/** Returns up to two uppercase initials from a name or email. */
export function initialsFor(name: string | null, email: string): string {
  const src = name?.trim() || email;
  const parts = src.split(/[\s@.]+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]);
  return (letters.join('') || src[0] || '?').toUpperCase();
}

/** Header avatar linking to the profile tab. Reads the cached profile. */
export function ProfileAvatar() {
  const { data: profile } = useProfile();
  return (
    <Link
      to="/profile"
      aria-label="Perfil"
      className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Avatar className="size-9">
        {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt="" />}
        <AvatarFallback className="text-xs">
          {initialsFor(profile.name, profile.email)}
        </AvatarFallback>
      </Avatar>
    </Link>
  );
}
