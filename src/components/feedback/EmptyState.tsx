interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  cta?: React.ReactNode;
}

/** Centered empty placeholder with electric icon halo. */
export function EmptyState({ icon, title, subtitle, cta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-1 px-8 py-10 text-center">
      <div className="mb-3.5 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary [&_svg]:size-7">
        {icon}
      </div>
      <div className="font-heading text-[17px] font-bold tracking-[-0.01em] text-foreground">
        {title}
      </div>
      {subtitle && (
        <div className="mt-0.5 max-w-[260px] text-[13px] leading-tight text-muted-foreground">
          {subtitle}
        </div>
      )}
      {cta && <div className="mt-[18px]">{cta}</div>}
    </div>
  );
}
