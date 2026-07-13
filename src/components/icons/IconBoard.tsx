interface IconProps {
  size?: number;
  className?: string;
}

/** Brand glyph — ported verbatim from the design export (icons.jsx). */
export function IconBoard({ size = 24, className }: IconProps) {
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
      <path d="M12 2C9 7 9 17 12 22 15 17 15 7 12 2Z" />
    </svg>
  );
}
