import { env } from '@/config/env';
import type { Media } from '@/types/api';

/**
 * Absolute URL for a media object's bytes. The backend returns `contentUrl` as a
 * relative path (`/api/v1/media/<id>/content?token=…`); `<img>`/`<video>` tags
 * need it fully-qualified against the API host. Already-absolute URLs pass through.
 */
export function mediaContentUrl(media: Media): string {
  const url = media.contentUrl;
  return url.startsWith('http') ? url : `${env.apiBaseUrl}${url}`;
}
