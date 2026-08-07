import { useEffect, useMemo, useState } from "react";
import phrases from "@/assets/surfPhrases.json";
import { cn } from "@/lib/utils";

interface PhraseCarouselProps {
  /** Shown first, before the randomized surf phrases (e.g. the AIState timing hint). */
  lead?: string;
  intervalMs?: number;
  className?: string;
}

function shuffle(arr: readonly string[]): string[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

/** Rotating waiting messages — leads with `lead`, then cycles randomized surf phrases. Decorative. */
export function PhraseCarousel({
  lead,
  intervalMs = 10000,
  className,
}: PhraseCarouselProps) {
  const sequence = useMemo(
    () =>
      lead
        ? [lead, ...shuffle(phrases as string[])]
        : shuffle(phrases as string[]),
    [lead]
  );
  const [i, setI] = useState(0);

  useEffect(() => {
    if (sequence.length <= 1) return;
    const id = setInterval(
      () => setI((n) => (n + 1) % sequence.length),
      intervalMs
    );
    return () => clearInterval(id);
  }, [sequence, intervalMs]);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "mx-auto mt-1.5 min-h-[34px] max-w-[240px] text-[12.5px] text-muted-foreground",
        className
      )}
    >
      <span key={i} className="sr-phrase inline-block">
        {sequence[i]}
      </span>
    </div>
  );
}
