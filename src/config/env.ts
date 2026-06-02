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

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  supabaseUrl: required('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL),
  supabaseAnonKey: required('VITE_SUPABASE_ANON_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY),
  avatarBucket: import.meta.env.VITE_SUPABASE_AVATAR_BUCKET ?? 'profile-media',
} as const;
