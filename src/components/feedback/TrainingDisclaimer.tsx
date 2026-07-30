import type { ReactNode } from "react";
import { IconInfo } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Shared safety-notice shell for AI-generated content. Intentionally
 * non-dismissible — the reminder must stay visible whenever the AI output it
 * qualifies is on screen.
 */
export function Disclaimer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-2.5 rounded-[12px] border border-primary/25 bg-primary/10 px-3.5 py-3 text-[12px] leading-[17px] text-[#9CABFF] [&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
    >
      <IconInfo className="mt-px" aria-hidden />
      <p>{children}</p>
    </div>
  );
}

/**
 * Persistent safety notice shown on every generated training view. These are
 * general AI suggestions, not a personalized program.
 */
export function TrainingDisclaimer({ className }: { className?: string }) {
  return (
    <Disclaimer className={className}>
      Sugestões gerais de mobilidade e equilíbrio baseadas na sua sessão, não um
      programa personalizado. Este é um treino auxiliar e não considera seu
      histórico ou condição física. Para um plano sob medida — ou se você tem
      alguma lesão ou limitação —
      <span className="font-semibold text-foreground">
        procure um profissional de educação física.
      </span>
    </Disclaimer>
  );
}
