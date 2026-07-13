import { useRouter } from '@tanstack/react-router';
import { IconChevronLeft } from '@/components/icons';
import { Wordmark } from './Wordmark';
import { ProfileAvatar } from './ProfileAvatar';

interface AppHeaderProps {
  title?: string;
  /** Show a back button. `true` uses router history; a function overrides it. */
  onBack?: true | (() => void);
  /** Right-side custom action (replaces the avatar). */
  action?: React.ReactNode;
  /** Hide the avatar without supplying an action (keeps layout balanced). */
  hideAvatar?: boolean;
}

/** Top app bar: logo (tabs) or back button (sub-screens) + title + right slot. */
export function AppHeader({ title, onBack, action, hideAvatar }: AppHeaderProps) {
  const router = useRouter();
  const handleBack = () => {
    if (typeof onBack === 'function') onBack();
    else router.history.back();
  };

  return (
    <header className="flex min-h-11 items-center justify-between gap-3 px-5 pb-2.5 pt-1.5">
      {onBack ? (
        <button
          type="button"
          onClick={handleBack}
          aria-label="Voltar"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground shadow-[var(--shadow-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <IconChevronLeft size={20} />
        </button>
      ) : (
        <Wordmark />
      )}

      {title && (
        <div className="flex-1 text-center font-heading text-[15px] font-bold tracking-[-0.01em] text-foreground">
          {title}
        </div>
      )}

      {action ? (
        action
      ) : hideAvatar ? (
        <div className="size-9 shrink-0" />
      ) : (
        <ProfileAvatar />
      )}
    </header>
  );
}
