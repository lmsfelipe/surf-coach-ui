import type { Media } from '@/types/api';
import { mediaContentUrl } from '@/lib/media/url';
import { Badge } from '@/components/ui/badge';
import { IconPlay, IconPlus, IconX } from '@/components/icons';

interface MediaThumbProps {
  media?: Media;
  /** Upload progress 0–100; shows an overlay bar when set. */
  progress?: number;
  /** Dashed "add" tile variant. */
  dashed?: boolean;
  label?: string;
  onDelete?: () => void;
  onClick?: () => void;
}

/** Square media tile: image/video preview, add tile, delete, or progress. */
export function MediaThumb({ media, progress, dashed, label, onDelete, onClick }: MediaThumbProps) {
  if (dashed) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-dashed border-border bg-secondary text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <IconPlus size={20} />
        <span className="text-[10px] font-semibold">{label || 'Adicionar'}</span>
      </button>
    );
  }

  const isVideo = media?.mediaType === 'video';

  return (
    <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-[linear-gradient(150deg,#243049,#161d30)]">
      <button
        type="button"
        onClick={onClick}
        className="absolute inset-0 size-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        aria-label={isVideo ? 'Ver vídeo' : 'Ver foto'}
      >
        {media && !isVideo && (
          <img src={mediaContentUrl(media)} alt={media.fileName} className="size-full object-cover" />
        )}
        {isVideo && media && (
          <>
            {/* First frame as a poster — `#t` nudges decoding so Safari paints it. */}
            <video
              src={`${mediaContentUrl(media)}#t=0.1`}
              muted
              playsInline
              preload="metadata"
              className="size-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center text-white/85">
              <span className="flex size-[30px] items-center justify-center rounded-full bg-black/40">
                <IconPlay size={14} />
              </span>
            </span>
          </>
        )}
      </button>
      {isVideo && (
        <div className="pointer-events-none absolute bottom-1.5 left-1.5">
          <Badge tone="muted" size="sm">
            vídeo
          </Badge>
        </div>
      )}
      {onDelete && progress == null && (
        <button
          type="button"
          onClick={onDelete}
          aria-label="Remover mídia"
          className="absolute right-1.5 top-1.5 flex size-[22px] items-center justify-center rounded-full bg-black/55 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <IconX size={13} />
        </button>
      )}
      {progress != null && (
        <div className="absolute inset-0 flex items-end bg-[rgba(11,16,32,0.55)]">
          <div className="w-full p-2">
            <div className="h-1 overflow-hidden rounded-full bg-white/20">
              <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
