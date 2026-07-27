/**
 * Sunset backdrops for session score cards. Vite bundles every image in the
 * folder at build time, so dropping a new `sunset-*.jpg` in is enough — no
 * manifest to update here.
 */
const BACKGROUNDS = Object.entries(
  import.meta.glob('../assets/score-card-backgrounds/*.jpg', {
    eager: true,
    import: 'default',
  }) as Record<string, string>,
)
  // Sort by path so the index→image mapping is stable across builds.
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url);

/**
 * Pick a backdrop for a card. Keyed (usually by session id) so a session keeps
 * the same image across re-renders and navigations — "random" across sessions,
 * deterministic within one. Returns undefined only if the folder is empty.
 */
export function scoreCardBackground(key: string): string | undefined {
  if (BACKGROUNDS.length === 0) return undefined;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return BACKGROUNDS[Math.abs(hash) % BACKGROUNDS.length];
}
