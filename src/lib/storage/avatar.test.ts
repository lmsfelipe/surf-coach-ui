import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  supabase: { storage: { from: vi.fn() } },
}));

import { supabase } from '@/lib/supabase';
import { uploadAvatar } from './avatar';

function mockStorage(overrides: { uploadError?: { message: string } } = {}) {
  const upload = vi.fn().mockResolvedValue({ error: overrides.uploadError ?? null, data: {} });
  const getPublicUrl = vi
    .fn()
    .mockReturnValue({ data: { publicUrl: 'http://cdn.test/profile-media/user-1/avatar.jpg' } });
  vi.mocked(supabase.storage.from).mockReturnValue({ upload, getPublicUrl } as never);
  return { upload, getPublicUrl };
}

describe('uploadAvatar', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uploads to <userId>/avatar.<ext> with a lowercased extension', async () => {
    const { upload } = mockStorage();
    const file = new File(['x'], 'photo.JPG', { type: 'image/jpeg' });

    await uploadAvatar('user-1', file);

    expect(upload).toHaveBeenCalledWith('user-1/avatar.jpg', file, {
      upsert: true,
      contentType: 'image/jpeg',
    });
  });

  it('falls back to jpg when the file name has no extension', async () => {
    const { upload } = mockStorage();
    const file = new File(['x'], 'photo.', { type: 'image/jpeg' });

    await uploadAvatar('user-1', file);

    expect(upload).toHaveBeenCalledWith('user-1/avatar.jpg', file, {
      upsert: true,
      contentType: 'image/jpeg',
    });
  });

  it('uses the configured avatar bucket', async () => {
    mockStorage();
    const file = new File(['x'], 'photo.png', { type: 'image/png' });

    await uploadAvatar('user-1', file);

    expect(supabase.storage.from).toHaveBeenCalledWith('profile-media');
  });

  it('throws a pt-BR error message when the upload fails', async () => {
    mockStorage({ uploadError: { message: 'boom' } });
    const file = new File(['x'], 'photo.png', { type: 'image/png' });

    await expect(uploadAvatar('user-1', file)).rejects.toThrow(
      'Não conseguimos enviar a foto. Tente de novo?',
    );
  });

  it('appends a cache-busting ?t= query param to the returned URL', async () => {
    mockStorage();
    const file = new File(['x'], 'photo.png', { type: 'image/png' });

    const url = await uploadAvatar('user-1', file);

    expect(url).toMatch(/\?t=\d+$/);
  });
});
