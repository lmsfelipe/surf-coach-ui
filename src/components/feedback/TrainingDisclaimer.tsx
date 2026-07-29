import type { ReactNode } from 'react';
import { IconInfo } from '@/components/icons';
import { cn } from '@/lib/utils';

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
        'flex items-start gap-2.5 rounded-[12px] border border-primary/25 bg-primary/10 px-3.5 py-3 text-[12px] leading-[17px] text-[#9CABFF] [&_svg]:size-4 [&_svg]:shrink-0',
        className,
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
      Estas são sugestões gerais de mobilidade e equilíbrio baseadas na sua sessão,
      não um programa de treino personalizado. Elas não consideram seu histórico de
      lesões ou condição física.{' '}
      <span className="font-semibold text-foreground">
        Mostre este treino ao seu educador físico e faça com o acompanhamento dele
      </span>{' '}
      — especialmente se você tem alguma limitação física ou lesão.
    </Disclaimer>
  );
}
