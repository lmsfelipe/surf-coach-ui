import { Card } from '@/components/ui/card';

interface TipListProps {
  tips: string[];
}

/** Numbered improvement tips with electric badges. */
export function TipList({ tips }: TipListProps) {
  return (
    <Card className="p-[4px_16px]">
      {tips.map((tip, i) => (
        <div
          key={i}
          className="flex items-start gap-3 py-[13px] [&:not(:last-child)]:border-b [&:not(:last-child)]:border-white/[0.06]"
        >
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary font-display text-xs font-semibold text-white">
            {i + 1}
          </div>
          <div className="flex-1 text-[13px] leading-[19px] text-soft">{tip}</div>
        </div>
      ))}
    </Card>
  );
}
