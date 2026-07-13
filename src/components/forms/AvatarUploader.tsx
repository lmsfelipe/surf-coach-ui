import * as React from 'react';
import { toast } from 'sonner';
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE_BYTES } from '@/config/constants';
import { uploadAvatar } from '@/lib/storage/avatar';
import { useAuthStore } from '@/stores/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DotPulser } from '@/components/feedback/DotPulser';
import { IconUpload } from '@/components/icons';

interface AvatarUploaderProps {
  /** Current avatar URL (controlled). */
  value: string | null;
  /** Initials shown when there's no image. */
  initials: string;
  /** Called with the new public URL after a successful upload. */
  onUploaded: (url: string) => void;
  size?: number;
}

/** Avatar preview + client-direct upload to Supabase Storage (§4.4). */
export function AvatarUploader({ value, initials, onUploaded, size = 64 }: AvatarUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);
  const userId = useAuthStore((s) => s.user?.id);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      toast.error('Formato não aceito. Use JPG, PNG ou WebP.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error('Arquivo muito grande (máx 100MB)');
      return;
    }
    if (!userId) {
      toast.error('Sua sessão expirou. Entre novamente.');
      return;
    }

    setBusy(true);
    try {
      const url = await uploadAvatar(userId, file);
      onUploaded(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não conseguimos enviar a foto.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <Avatar style={{ width: size, height: size }}>
          {value && <AvatarImage src={value} alt="" />}
          <AvatarFallback style={{ fontSize: size * 0.34 }}>{initials}</AvatarFallback>
        </Avatar>
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55 text-white">
            <DotPulser size={6} />
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        className="hidden"
        onChange={handleFile}
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        <IconUpload className="size-4" />
        {value ? 'Trocar foto' : 'Enviar foto'}
      </Button>
    </div>
  );
}
