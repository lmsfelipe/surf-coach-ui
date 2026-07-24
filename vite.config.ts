import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { fileURLToPath, URL } from 'node:url';

// Source-map upload only runs when a build-time auth token is present, so
// credential-less builds (and the free-plan default) never break.
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;

export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    ...(sentryAuthToken
      ? [
          sentryVitePlugin({
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            authToken: sentryAuthToken,
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Only emit source maps when Sentry can actually consume them: the plugin
    // uploads the maps and then strips them from the deployed assets. Emitting
    // them without the plugin would publish the full unminified source to the
    // CDN alongside the bundle, so in that case don't generate them at all.
    sourcemap: Boolean(sentryAuthToken),
  },
  server: {
    port: 5173,
  },
});
