/**
 * Typed access to Vite env vars. Fails fast at startup if a required var
 * is missing so we never ship a build that silently points nowhere.
 */
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Required in production builds, but falls back to the local default in dev so
 * a fresh clone runs without a .env. A shipped build must never silently point
 * at localhost — that fails as a hang at request time rather than at startup.
 */
function requiredInProd(name: string, value: string | undefined, devFallback: string): string {
  return import.meta.env.PROD ? required(name, value) : (value ?? devFallback);
}

/** Optional positive-integer override. Falls back to `fallback` when unset or invalid. */
function optionalInt(name: string, value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    console.warn(`Ignoring invalid ${name}="${value}" (expected a positive integer); using ${fallback}.`);
    return fallback;
  }
  return parsed;
}

export const env = {
  apiBaseUrl: requiredInProd(
    'VITE_API_BASE_URL',
    import.meta.env.VITE_API_BASE_URL,
    'http://localhost:8000',
  ),
  supabaseUrl: required('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL),
  supabaseAnonKey: required('VITE_SUPABASE_ANON_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY),
  avatarBucket: import.meta.env.VITE_SUPABASE_AVATAR_BUCKET ?? 'profile-media',
  // Optional: Sentry stays a no-op (never initializes) when this is unset.
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  // Optional: Google Analytics stays a no-op when this is unset.
  gaMeasurementId: import.meta.env.VITE_GA_MEASUREMENT_ID,
  // Session media photo count (mirrors the API rule; must match its config).
  minImagesPerSession: optionalInt(
    'VITE_MIN_IMAGES_PER_SESSION',
    import.meta.env.VITE_MIN_IMAGES_PER_SESSION,
    3,
  ),
  maxImagesPerSession: optionalInt(
    'VITE_MAX_IMAGES_PER_SESSION',
    import.meta.env.VITE_MAX_IMAGES_PER_SESSION,
    3,
  ),
} as const;
