import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { MAX_IMAGES_PER_SESSION, MEDIA_ACCEPT_ATTR } from "@/config/constants";
import { mediaQueryOptions, useSessionMedia } from "@/hooks/queries/media";
import { useDeleteMedia, useUploadMedia } from "@/hooks/mutations/media";
import {
  resolveMediaBatch,
  validateMediaFiles,
  type ExistingMedia,
  type FileError,
} from "@/lib/media/validation";
import { ApiError, failedUploadMessage, toUserMessage } from "@/lib/api/errors";
import type { FailedUpload } from "@/types/api";
import {
  isModerationError,
  UploadErrorAlert,
} from "@/components/forms/UploadErrorAlert";
import { AppHeader } from "@/components/layout/AppHeader";
import { SubmitBar } from "@/components/layout/SubmitBar";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/feedback/Alert";
import { Eyebrow } from "@/components/feedback/Eyebrow";
import { MediaThumb } from "@/components/feedback/MediaThumb";
import { DotPulser } from "@/components/feedback/DotPulser";
import { MediaGridSkeleton } from "@/components/skeletons";
import {
  IconAlert,
  IconAlertCircle,
  IconImage,
  IconUpload,
  IconVideo,
  IconX,
} from "@/components/icons";

export const Route = createFileRoute("/_app/sessions/$sessionId/upload")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(mediaQueryOptions(params.sessionId)),
  pendingComponent: () => (
    <>
      <AppHeader onBack title="Adicionar mídia" hideAvatar />
      <MediaGridSkeleton />
    </>
  ),
  component: UploadScreen,
});

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(0)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function FileRow({
  file,
  error,
  storageError,
  uploading,
  onRemove,
}: {
  file: File;
  error?: FileError;
  /** pt-BR copy for a file that failed the storage stage on a prior 207 upload. */
  storageError?: string;
  uploading: boolean;
  onRemove: () => void;
}) {
  const message = error?.message ?? storageError;
  return (
    <div className="flex items-center gap-3 rounded-xl bg-secondary p-[11px_13px]">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-[9px] bg-[#0F1525] text-primary">
        {file.type.startsWith("image/") ? (
          <IconImage size={18} />
        ) : (
          <IconVideo size={18} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="min-w-0 truncate text-[12.5px] font-semibold text-foreground">
            {file.name}
          </span>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {formatBytes(file.size)}
          </span>
        </div>
        {message && (
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-danger">
            <IconAlertCircle size={12} />
            {message}
          </div>
        )}
      </div>
      {!uploading && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remover arquivo"
          className="shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
        >
          <IconX size={16} />
        </button>
      )}
    </div>
  );
}

function UploadScreen() {
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();
  const { data: media } = useSessionMedia(sessionId);
  const uploadMedia = useUploadMedia(sessionId);
  const deleteMedia = useDeleteMedia(sessionId);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const [files, setFiles] = React.useState<File[]>([]);
  const [fileErrors, setFileErrors] = React.useState<Map<File, FileError>>(
    new Map()
  );
  const [selectionError, setSelectionError] = React.useState<string | null>(
    null
  );
  // Files that failed the storage stage on the last 207 upload, keyed by name so
  // a row can look up its pt-BR message and the user can retry just those.
  const [failedUploads, setFailedUploads] = React.useState<
    Map<string, FailedUpload>
  >(new Map());
  const isUploading = uploadMedia.isPending;

  // Media already attached to the session constrains what can still be added:
  // a video locks the session, existing photos cap the combined count at 3.
  const existingType = media[0]?.mediaType ?? null;
  const existingImageCount = media.filter(
    (m) => m.mediaType === "image"
  ).length;
  const existing: ExistingMedia = {
    type: existingType,
    imageCount: existingImageCount,
  };
  const locked = existingType === "video";

  async function applySelection(next: File[]) {
    setFiles(next);
    setFailedUploads(new Map());
    uploadMedia.reset();
    const result = await validateMediaFiles(next, existing);
    setFileErrors(result.fileErrors);
    setSelectionError(result.selectionError);
  }

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (picked.length) void applySelection(resolveMediaBatch(picked));
  }

  function removeFile(file: File) {
    void applySelection(files.filter((f) => f !== file));
  }

  const valid = files.filter((f) => !fileErrors.has(f));
  const hasErrors = fileErrors.size > 0 || selectionError != null;
  const canSubmit = valid.length > 0 && !hasErrors && !isUploading;

  async function handleUpload() {
    if (!canSubmit) return;
    const batch = valid;
    setFailedUploads(new Map());
    try {
      const { succeeded, failed } = await uploadMedia.mutateAsync({
        files: batch,
      });
      if (failed.length === 0) {
        toast.success("Mídia enviada.");
        await navigate({ to: "/sessions/$sessionId", params: { sessionId } });
        return;
      }
      // Storage-stage partial success (§11.4): the succeeded files are already
      // saved (gallery refetched). Keep only the failed files selected so retry
      // re-submits just those — never the whole batch — and stay on the screen.
      // Staying also blocks "continue to review" until the set is restored,
      // honoring the min-photos floor (§4.5).
      const failedByName = new Map(failed.map((f) => [f.fileName, f]));
      setFiles(batch.filter((f) => failedByName.has(f.name)));
      setFileErrors(new Map());
      setSelectionError(null);
      setFailedUploads(failedByName);
      toast.warning(
        `${succeeded.length} enviada(s), ${failed.length} falhou(aram). Toque em “Tentar de novo”.`
      );
    } catch (err) {
      if (!isModerationError(err)) {
        toast.error(toUserMessage(err));
      }
      if (err instanceof ApiError && err.code === "EXPLICIT_CONTENT") {
        setFiles([]);
      }
    }
  }

  const submitLabel = hasErrors
    ? "Corrija os arquivos"
    : failedUploads.size > 0
      ? "Tentar de novo"
      : "Enviar";

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader onBack title="Adicionar mídia" hideAvatar />
      <div className="flex-1 px-5 pb-6 pt-1.5 max-w-[100vw]">
        <input
          ref={inputRef}
          type="file"
          accept={MEDIA_ACCEPT_ATTR}
          multiple
          className="hidden"
          onChange={handleSelect}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={locked}
          className="flex w-full cursor-pointer flex-col items-center gap-2.5 rounded-[18px] border-[1.5px] border-dashed border-border bg-card p-[30px_20px] text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:opacity-50"
        >
          <div className="flex size-[52px] items-center justify-center rounded-[14px] bg-primary/[0.12] text-primary">
            <IconUpload size={24} />
          </div>
          <div className="text-sm font-semibold text-foreground">
            Toque pra escolher
          </div>
          <div className="text-[11.5px] leading-[17px] text-muted-foreground">
            1 vídeo ou {MAX_IMAGES_PER_SESSION} fotos · ≤100MB
            <br />
            vídeo ≤120s
          </div>
        </button>

        {locked && (
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <IconAlertCircle size={12} />
            Esta sessão já tem um vídeo — remova-o para trocar a mídia.
          </p>
        )}

        {selectionError && (
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-danger">
            <IconAlertCircle size={12} />
            {selectionError}
          </p>
        )}

        {isModerationError(uploadMedia.error) && (
          <UploadErrorAlert error={uploadMedia.error} />
        )}

        {failedUploads.size > 0 && (
          <Alert tone="warning" icon={<IconAlert />} className="mt-3">
            Só as que falharam ficam aqui — as demais já foram salvas. Toque em
            “Tentar de novo” para reenviá-las, remova com ✕ para continuar ou
            escolha outras.
          </Alert>
        )}

        {files.length > 0 && (
          <div className="mt-[22px]">
            <Eyebrow>Selecionados</Eyebrow>
            <div className="flex flex-col gap-2.5">
              {files.map((file) => (
                <FileRow
                  key={`${file.name}-${file.size}`}
                  file={file}
                  error={fileErrors.get(file)}
                  storageError={
                    failedUploads.has(file.name)
                      ? failedUploadMessage(file.name)
                      : undefined
                  }
                  uploading={isUploading}
                  onRemove={() => removeFile(file)}
                />
              ))}
            </div>
          </div>
        )}

        {media.length > 0 && (
          <div className="mt-[22px]">
            <Eyebrow>Na sessão</Eyebrow>
            <div className="grid grid-cols-3 gap-2">
              {media.map((m) => (
                <MediaThumb
                  key={m.id}
                  media={m}
                  onDelete={() => deleteMedia.mutate(m.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <SubmitBar>
        <Button
          size="lg"
          className="w-full"
          disabled={!canSubmit}
          onClick={handleUpload}
        >
          {isUploading ? <DotPulser /> : submitLabel}
        </Button>
      </SubmitBar>
    </div>
  );
}
