import { WordmarkImage } from '@/components/layout/Wordmark';
import { DotPulser } from './DotPulser';

/**
 * Full-screen boot splash shown while the persisted auth session hydrates,
 * before the router mounts. Keeps the first paint branded instead of blank.
 */
export function AppLoading() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background text-primary">
      <WordmarkImage height={36} />
      <DotPulser size={8} />
    </div>
  );
}
