import logoMark from '@/assets/logo-surfrise-mark.svg';

interface AuthShellProps {
  children: React.ReactNode;
  foot?: React.ReactNode;
}

/** Centered public auth layout: big logo, content column, optional footer. */
export function AuthShell({ children, foot }: AuthShellProps) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col px-7">
      <div className="mb-[30px] mt-10 flex justify-center">
        <div className="flex items-center gap-2.5 leading-none">
          <img src={logoMark} width={34} height={34} alt="" />
          <span className="font-['Pacifico',cursive] text-[28px] leading-none text-foreground">
            Surf<span className="text-primary">Rise</span>
          </span>
        </div>
      </div>
      <div className="flex-1">{children}</div>
      {foot && (
        <div className="py-[20px_30px] text-center text-[13px] text-muted-foreground">
          {foot}
        </div>
      )}
    </div>
  );
}

interface AuthHeadingProps {
  children: React.ReactNode;
  sub?: string;
}

/** Auth screen heading + optional subtitle. */
export function AuthHeading({ children, sub }: AuthHeadingProps) {
  return (
    <div className="mb-[22px]">
      <h1 className="m-0 font-heading text-[28px] font-extrabold tracking-[-0.025em] text-foreground">
        {children}
      </h1>
      {sub && <p className="mt-2 text-[13.5px] leading-5 text-muted-foreground">{sub}</p>}
    </div>
  );
}
