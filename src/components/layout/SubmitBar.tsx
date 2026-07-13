interface SubmitBarProps {
  children: React.ReactNode;
}

/** Sticky bottom action bar for forms (single full-width primary). */
export function SubmitBar({ children }: SubmitBarProps) {
  return (
    <div className="sticky bottom-0 z-[15] bg-background px-5 pb-[26px] pt-3.5 shadow-[0_-16px_32px_rgba(0,0,0,0.45)] md:static md:px-0 md:shadow-none">
      {children}
    </div>
  );
}
