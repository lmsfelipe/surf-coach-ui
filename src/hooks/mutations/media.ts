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
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: qk.media.bySession(sessionId) }),
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
