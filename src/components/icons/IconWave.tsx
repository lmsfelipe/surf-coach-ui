interface IconProps {
  size?: number;
  className?: string;
}

/** Brand glyph — ported verbatim from the design export (icons.jsx). */
export function IconWave({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M2 14c2 0 3-2 5-2s3 2 5 2 3-2 5-2 3 2 5 2" />
      <path d="M2 18c2 0 3-2 5-2s3 2 5 2 3-2 5-2 3 2 5 2" />
    </svg>
  );
}
