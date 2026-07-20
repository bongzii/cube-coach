import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(({command}) => {
  const isGitHubPages = process.env.GITHUB_PAGES === 'true';
  const base = isGitHubPages ? '/cube-coach/' : './';

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'prompt',
        includeAssets: ['logo.png', 'olls  numbered/**/*.svg', 'plls lettered/**/*.svg'],
        manifest: {
          name: 'Cube Coach',
          short_name: 'CubeCoach',
          description: 'F2L, OLL & PLL Rubik\'s Cube Trainer',
          theme_color: '#0f172a',
          background_color: '#fafafa',
          display: 'standalone',
          orientation: 'portrait',
          scope: base,
          start_url: base,
          icons: [
            {src: `${base}logo.png`, sizes: '192x192', type: 'image/png', purpose: 'any maskable'},
            {src: `${base}logo.png`, sizes: '512x512', type: 'image/png', purpose: 'any maskable'}
          ]
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,png,svg,jpg,jpeg,ico,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {cacheName: 'google-fonts-cache', expiration: {maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365}}
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {cacheName: 'gstatic-fonts-cache', expiration: {maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365}}
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        output: {
          // The case library is substantial. Keeping it separate lets browsers
          // cache it independently of UI updates and avoids one oversized app bundle.
          manualChunks(id) {
            if (id.includes('/src/data/')) return 'cube-data';
            if (id.includes('/node_modules/react/')) return 'react';
            if (id.includes('/node_modules/react-dom/')) return 'react-dom';
            if (id.includes('/node_modules/lucide-react/')) return 'icons';
          },
        },
      },
    },
  };
});
