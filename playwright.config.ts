import { defineConfig, devices } from '@playwright/test';

// A dedicated port, deliberately different from vite.config.ts's normal dev
// port (5173) — otherwise `reuseExistingServer` (on by default outside CI)
// would silently reuse a developer's already-running `npm run dev`, which is
// wired to their real .env / real Supabase project, not these pinned fakes.
const PORT = 5183;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * All e2e specs mock the network (page.route) against these two hosts, so
 * they're deliberately fake — nothing must ever reach a real backend or
 * Supabase project. Mirrors vitest.config.ts's `test.env` block.
 */
const E2E_ENV = {
  VITE_API_BASE_URL: 'http://localhost:8000',
  VITE_SUPABASE_URL: 'http://localhost:54321',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key',
  VITE_SUPABASE_AVATAR_BUCKET: 'profile-media',
  VITE_MIN_IMAGES_PER_SESSION: '3',
  VITE_MAX_IMAGES_PER_SESSION: '3',
};

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-first-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: E2E_ENV,
  },
});
