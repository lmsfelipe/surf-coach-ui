import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';

/** Module singleton. Supabase persists the session to localStorage. */
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
