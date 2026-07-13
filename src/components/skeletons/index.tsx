import { Skel, SkelCard } from './Skel';

/** Sessions list — a stack of card placeholders. */
export function SessionListSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-5 pt-3.5">
      {[0, 1, 2, 3].map((i) => (
        <SkelCard key={i} />
      ))}
    </div>
  );
}

/** Score chip placeholder inside a session card (per-card review resolve). */
export function ScoreChipSkeleton() {
  return <Skel className="h-8 w-10" />;
}

/** Session detail — hero block + media grid + two summary rows. */
export function SessionDetailSkeleton() {
  return (
    <div className="px-5 pt-1">
      <Skel className="mb-[22px] h-[150px] rounded-[18px]" />
      <Skel className="mb-3 h-2.5 w-[30%]" />
      <div className="mb-[22px] grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <Skel key={i} className="h-[74px] rounded-xl" />
        ))}
      </div>
      <Skel className="mb-3 h-2.5 w-[30%]" />
      <Skel className="mb-[22px] h-16 rounded-[18px]" />
      <Skel className="mb-3 h-2.5 w-[30%]" />
      <Skel className="h-16 rounded-[18px]" />
    </div>
  );
}

/** Review score panel — 6 bar rows. */
export function ScorePanelSkeleton() {
  return (
    <div className="px-5 pt-1">
      <Skel className="mb-[22px] h-20 rounded-[18px]" />
      <Skel className="mb-3 h-2.5 w-[40%]" />
      <div className="flex flex-col gap-2 rounded-[18px] bg-card p-3.5 shadow-[var(--shadow-sm)]">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skel key={i} className="h-[52px] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/** Profile header — avatar + name + meta + menu card. */
export function ProfileHeaderSkeleton() {
  return (
    <div className="flex flex-col items-center px-5 pt-2.5">
      <Skel className="mb-3.5 size-[72px] rounded-full" />
      <Skel className="mb-2.5 h-4 w-36" />
      <Skel className="mb-7 h-3 w-24" />
      <Skel className="h-[150px] w-full rounded-[18px]" />
    </div>
  );
}

/** Boards list placeholder. */
export function BoardListSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-5 pt-1.5">
      {[0, 1, 2].map((i) => (
        <Skel key={i} className="h-[92px] rounded-[18px]" />
      ))}
    </div>
  );
}

/** Training plan placeholder. */
export function PlanSkeleton() {
  return (
    <div className="px-5 pt-1">
      <Skel className="mb-3 h-5 w-32" />
      <Skel className="mb-[18px] h-3 w-[70%]" />
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <Skel key={i} className="h-16 rounded-[18px]" />
        ))}
      </div>
    </div>
  );
}

export { Skel, SkelCard };
