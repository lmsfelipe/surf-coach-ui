import { Link } from '@tanstack/react-router';
import logo from '@/assets/logo-surfrise.png';
import { cn } from '@/lib/utils';

/** Intrinsic art size (824×328); width is derived from height so the ratio never drifts. */
const ASPECT = 824 / 328;

interface WordmarkImageProps {
  /** Rendered height in px. Width follows the art's aspect ratio. */
  height?: number;
  /** Empty when an ancestor already labels the logo, so it isn't announced twice. */
  alt?: string;
  className?: string;
}

/**
 * SurfRise wordmark art — includes the lettering, so it needs no adjacent text.
 * Light-on-transparent: only legible on the app's dark surfaces.
 */
export function WordmarkImage({ height = 28, alt = 'SurfRise', className }: WordmarkImageProps) {
  return (
    <img
      src={logo}
      width={Math.round(height * ASPECT)}
      height={height}
      alt={alt}
      className={cn('block', className)}
    />
  );
}

/** SurfRise wordmark that links home. */
export function Wordmark({ height, className }: Omit<WordmarkImageProps, 'alt'>) {
  return (
    <Link
      to="/sessions"
      className={cn('flex items-center leading-none', className)}
      aria-label="SurfRise — início"
    >
      <WordmarkImage height={height} alt="" />
    </Link>
  );
}
