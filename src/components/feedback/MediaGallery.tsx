import * as React from 'react';
import type { Media } from '@/types/api';
import { mediaContentUrl } from '@/lib/media/url';
import { MediaThumb } from './MediaThumb';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface MediaGalleryProps {
  media: Media[];
  /** Trigger the file picker / upload flow. Omit to hide the add tile. */
  onAdd?: () => void;
  onDelete?: (mediaId: string) => void;
}

/** 3-up grid + dashed add tile; tapping a thumb opens a lightbox (§9 Q2). */
export function MediaGallery({ media, onAdd, onDelete }: MediaGalleryProps) {
  const [active, setActive] = React.useState<Media | null>(null);

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {media.map((m) => (
          <MediaThumb
            key={m.id}
            media={m}
            onClick={() => setActive(m)}
            onDelete={onDelete ? () => onDelete(m.id) : undefined}
          />
        ))}
        {onAdd && <MediaThumb dashed onClick={onAdd} />}
      </div>

      <Dialog open={active != null} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent>
          <DialogTitle>{active?.fileName ?? 'Mídia'}</DialogTitle>
          {active?.mediaType === 'video' ? (
            <video
              src={mediaContentUrl(active)}
              controls
              autoPlay
              muted
              playsInline
              preload="metadata"
              className="max-h-[80vh] w-full rounded-[18px]"
            />
          ) : (
            active && (
              <img
                src={mediaContentUrl(active)}
                alt={active.fileName}
                className="max-h-[80vh] w-full rounded-[18px] object-contain"
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
