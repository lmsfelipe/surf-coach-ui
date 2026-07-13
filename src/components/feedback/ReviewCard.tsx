import { Card } from '@/components/ui/card';

interface ReviewCardProps {
  narrative: string;
}

/** AI narrative prose block. */
export function ReviewCard({ narrative }: ReviewCardProps) {
  return (
    <Card>
      <p className="m-0 text-[13.5px] leading-[21px] text-soft">{narrative}</p>
    </Card>
  );
}
