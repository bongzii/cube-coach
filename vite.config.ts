import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['logo.png', 'olls  numbered/**/*.svg', 'plls lettered/**/*.svg'],
        manifest: {
          name: 'Cube Coach',
          short_name: 'CubeCoach',
          description: 'OLL/PLL Rubik\'s Cube Trainer',
          theme_color: '#0f172a',
          background_color: '#fafafa',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {src: '/logo.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable'},
            {src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable'}
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
  };
});
