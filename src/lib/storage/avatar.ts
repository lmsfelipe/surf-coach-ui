import { env } from '@/config/env';
import { supabase } from '@/lib/supabase';

/**
 * Client-direct avatar upload (§4.4). Bytes go straight to Supabase Storage
 * (bucket `profile-media`); the API never receives them. Returns the public URL,
 * which the caller persists via PATCH /me.
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from(env.avatarBucket)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) {
    throw new Error('Não conseguimos enviar a foto. Tente de novo?');
  }

  const { data } = supabase.storage.from(env.avatarBucket).getPublicUrl(path);
  // Cache-bust so the freshly uploaded image replaces the previous one.
  return `${data.publicUrl}?t=${Date.now()}`;
}
