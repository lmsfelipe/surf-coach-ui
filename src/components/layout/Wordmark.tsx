import { Link } from '@tanstack/react-router';
import logoMark from '@/assets/logo-surfrise-mark.svg';
import { cn } from '@/lib/utils';

interface WordmarkProps {
  /** Wordmark font size in px. */
  size?: number;
  markSize?: number;
  className?: string;
}

/** SurfRise logo: mark + Pacifico wordmark with electric "Rise". Links home. */
export function Wordmark({ size = 21, markSize = 26, className }: WordmarkProps) {
  return (
    <Link
      to="/sessions"
      className={cn('flex items-center gap-1.5 leading-none', className)}
      aria-label="SurfRise — início"
    >
      <img src={logoMark} width={markSize} height={markSize} alt="" />
      <span
        className="font-['Pacifico',cursive] leading-none tracking-[-0.005em] text-foreground"
        style={{ fontSize: size }}
      >
        Surf<span className="text-primary">Rise</span>
      </span>
    </Link>
  );
}
