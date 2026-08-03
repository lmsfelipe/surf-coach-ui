import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaApi } from '@/lib/api/endpoints';
import { uploadMedia, type UploadOptions } from '@/lib/api/upload';
import { qk } from '@/lib/queryKeys';

interface UploadVars {
  files: File[];
  onProgress?: UploadOptions['onProgress'];
}

/** Upload media via the XHR uploader so progress can be reported (§4.6). */
export function useUploadMedia(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ files, onProgress }: UploadVars) =>
      uploadMedia(sessionId, files, { onProgress }),
    // A 207 partial success resolves with an empty `succeeded` only if every
    // file failed storage (that path is a 502 → onError), so refetch the gallery
    // whenever at least one file actually stored.
    onSuccess: ({ succeeded }) => {
      if (succeeded.length) {
        queryClient.invalidateQueries({ queryKey: qk.media.bySession(sessionId) });
      }
    },
  });
}

export function useDeleteMedia(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mediaId: string) => mediaApi.remove(mediaId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: qk.media.bySession(sessionId) }),
  });
}
