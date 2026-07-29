import { BOARD_TYPE_OPTIONS } from '@/config/constants';
import type { Surfboard } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import { IconPencil, IconTrash } from '@/components/icons';

interface BoardCardProps {
  board: Surfboard;
  onEdit: () => void;
  onDelete: () => void;
}

function boardTypeLabel(value: string): string {
  return BOARD_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

/** Surfboard card — board size stays in FEET (StyleGuide §8). */
export function BoardCard({ board, onEdit, onDelete }: BoardCardProps) {
  return (
    <div className="rounded-[18px] bg-card p-[15px_16px] shadow-[var(--shadow-sm)]">
      <div className="mb-2 flex items-center justify-between">
        <Badge tone="accent" size="sm">
          {boardTypeLabel(board.boardType)}
        </Badge>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={onEdit}
            aria-label="Editar prancha"
            className="flex size-[30px] items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <IconPencil size={15} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Excluir prancha"
            className="flex size-[30px] items-center justify-center rounded-lg bg-secondary text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <IconTrash size={15} />
          </button>
        </div>
      </div>
      <div className="break-words text-[15px] font-semibold text-foreground">
        {board.label || boardTypeLabel(board.boardType)}
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-display font-medium tabular-nums">{board.boardSize}'</span>
        {board.volume != null && (
          <>
            <span>·</span>
            <span>{board.volume}L</span>
          </>
        )}
      </div>
    </div>
  );
}
