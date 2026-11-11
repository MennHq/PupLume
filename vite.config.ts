import dotenv from 'dotenv';
dotenv.config();
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { processAIChat, processAIOnboardingChat } from './src/server/geminiService.ts';
import { uploadToCloudinary, deleteFromCloudinary } from './src/server/cloudinaryService.ts';

function serverApiPlugin(): Plugin {
  return {
    name: 'server-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // AI Onboarding endpoint
        if (req.url === '/api/ai/onboarding' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body || '{}');
              const result = await processAIOnboardingChat(payload);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err?.message || 'AI Onboarding error' }));
            }
          });
          return;
        }

        // AI Assistant endpoint
        if (req.url === '/api/ai/assistant' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body || '{}');
              const result = await processAIChat(payload);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err?.message || 'AI processing error' }));
            }
          });
          return;
        }

        // Cloudinary Upload endpoint (with automatic previous image deletion)
        if ((req.url === '/api/upload' || req.url === '/api/cloudinary/upload') && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body || '{}');
              const { file, folder, tags, previousImageUrl, previousPublicId } = payload;
              if (!file) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'No image file provided' }));
              }
              const result = await uploadToCloudinary(file, {
                folder,
                tags,
                previousImageUrl,
                previousPublicId,
              });
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, ...result }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err?.message || 'Cloudinary upload failed' }));
            }
          });
          return;
        }

        // Cloudinary Delete endpoint
        if ((req.url === '/api/cloudinary/delete' || req.url === '/api/delete-image') && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body || '{}');
              const target = payload.url || payload.publicId;
              if (!target) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'No image url or publicId provided' }));
                return;
              }
              const result = await deleteFromCloudinary(target);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err?.message || 'Cloudinary delete failed' }));
            }
          });
          return;
        }

        // PWA Web Share Target endpoint
        if (req.url?.startsWith('/share-target')) {
          res.writeHead(303, { Location: '/journal?action=shared-media' });
          res.end();
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'favicon.png', 'apple-touch-icon.png', 'icon.svg', 'puplume-logo.svg', 'icon-color.png', 'offline.html', 'sw-custom.js'],
        manifest: {
          id: '/',
          name: 'PupLume — AI Puppy Manager',
          short_name: 'PupLume',
          description: 'PupLume is your clean, premium AI puppy companion — effortlessly managing potty routines, nutrition, wellness, and veterinary safety.',
          theme_color: '#8B5E3C',
          background_color: '#FFF9F2',
          display: 'standalone',
          display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
          orientation: 'portrait-primary',
          start_url: '/?source=pwa',
          scope: '/',
          categories: ['lifestyle', 'productivity', 'utilities'],
          lang: 'en-US',
          dir: 'ltr',
          prefer_related_applications: false,
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/apple-touch-icon.png',
              sizes: '180x180',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any',
            },
          ],
          screenshots: [
            {
              src: '/screenshots/puplume-mobile-preview.png',
              sizes: '720x1280',
              type: 'image/png',
              form_factor: 'narrow',
              label: 'PupLume Clean Premium Mobile Preview',
            },
            {
              src: '/screenshots/puplume-desktop-preview.png',
              sizes: '1280x720',
              type: 'image/png',
              form_factor: 'wide',
              label: 'PupLume Clean Premium Desktop View',
            },
          ],
          shortcuts: [
            {
              name: 'Log Potty Break',
              short_name: 'Potty',
              description: 'Quick 1-tap pee, poo, or accident log',
              url: '/?action=potty',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'Log Meal & Water',
              short_name: 'Meal',
              description: 'Quick log puppy food & water bowl',
              url: '/?action=feeding',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'Training Academy',
              short_name: 'Academy',
              description: 'Puppy drills with hands-free timer',
              url: '/academy',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'Lost Dog SOS Alert',
              short_name: 'Lost Dog SOS',
              description: 'Emergency missing puppy broadcast & flyer',
              url: '/?action=sos',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
          ],
          share_target: {
            action: '/share-target',
            method: 'POST',
            enctype: 'multipart/form-data',
            params: {
              title: 'title',
              text: 'text',
              url: 'url',
              files: [
                {
                  name: 'media',
                  accept: ['image/*'],
                },
              ],
            },
          },
        },
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
          importScripts: ['/sw-custom.js'],
          navigateFallbackDenylist: [/^\/api\//, /^\/share-target/, /^\/assets\//, /\.[a-zA-Z0-9]+$/],
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
      serverApiPlugin()
    ],
    resolve: {
      alias: {
        '@': import.meta.dirname,
      },
    },
    build: {
      target: 'esnext',
      minify: 'esbuild',
      cssMinify: true,
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react-dom') || id.includes('react/') || id.includes('react-router')) {
                return 'vendor-react';
              }
              if (id.includes('@clerk')) {
                return 'vendor-clerk';
              }
              if (id.includes('convex')) {
                return 'vendor-convex';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('framer-motion')) {
                return 'vendor-motion';
              }
              return 'vendor-libs';
            }
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
