import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setupTests.ts'],
    css: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    env: {
      VITE_API_BASE_URL: 'http://localhost:8000',
      VITE_SUPABASE_URL: 'http://localhost:54321',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
      VITE_SUPABASE_AVATAR_BUCKET: 'profile-media',
      // Pin the photo-count range so tests don't inherit a developer's local
      // .env (which may raise VITE_MAX_IMAGES_PER_SESSION). Tests assert "3 fotos"
      // for the cap; the floor of 1 means any non-empty photo pick is valid.
      VITE_MIN_IMAGES_PER_SESSION: '1',
      VITE_MAX_IMAGES_PER_SESSION: '3',
      // Same reasoning for the video cap — kept at the API's default of 1.
      VITE_MAX_VIDEOS_PER_SESSION: '1',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/routeTree.gen.ts',
        'src/test/**',
        'src/**/*.test.{ts,tsx}',
        'src/components/landing/**',
        'src/dev/**',
        'src/types/**',
        'src/vite-env.d.ts',
      ],
    },
  },
});
