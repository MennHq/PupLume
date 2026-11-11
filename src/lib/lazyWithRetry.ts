import React, { ComponentType, lazy, LazyExoticComponent } from 'react';

/**
 * Enhanced React.lazy with automatic retry and auto-reload on stale chunk errors.
 * Solves the classic Single-Page App "Failed to fetch dynamically imported module"
 * error when a new version is deployed to Vercel/production while a user is active.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T } | any>,
  retries = 2,
  interval = 800
): LazyExoticComponent<T> {
  return lazy(() =>
    new Promise<{ default: T }>((resolve, reject) => {
      const execute = (attemptsLeft: number) => {
        factory()
          .then((module) => {
            const comp = module && module.default ? module : { default: module };
            resolve(comp);
          })
          .catch((error: any) => {
            const errorMessage = String(error?.message || error || '');
            const isChunkLoadError =
              errorMessage.includes('Failed to fetch dynamically imported module') ||
              errorMessage.includes('Loading chunk') ||
              errorMessage.includes('error loading dynamically imported module') ||
              errorMessage.includes('Importing a module script failed') ||
              errorMessage.includes('error loading module') ||
              error?.name === 'ChunkLoadError';

            if (attemptsLeft > 0) {
              // Retry in case of a temporary cellular/WiFi packet drop
              setTimeout(() => {
                execute(attemptsLeft - 1);
              }, interval);
            } else if (isChunkLoadError && typeof window !== 'undefined') {
              // The server deployed a new release and the old chunk hash was purged.
              // Clear any cached SW assets and reload with cache-buster.
              try {
                if ('caches' in window) {
                  caches.keys().then((names) => {
                    names.forEach((name) => {
                      if (name.includes('workbox') || name.includes('precache')) {
                        caches.delete(name);
                      }
                    });
                  });
                }
              } catch (_) {}

              const lastReload = sessionStorage.getItem('puplume_chunk_reload');
              const now = Date.now();
              if (!lastReload || now - parseInt(lastReload, 10) > 15000) {
                sessionStorage.setItem('puplume_chunk_reload', now.toString());
                const cleanUrl = new URL(window.location.href);
                cleanUrl.searchParams.set('_v', now.toString());
                window.location.replace(cleanUrl.toString());
                return;
              }
              // Even if reload occurred recently, don't show the crash screen immediately
              window.location.reload();
              return;
            } else {
              reject(error);
            }
          });
      };

      execute(retries);
    })
  );
}
