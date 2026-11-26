import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AppProviders } from './components/providers/AppProviders.tsx';
import './index.css';
import posthog from 'posthog-js';

// Global handler for dynamic module import errors (Vite stale chunk protection)
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault(); // Suppress the unhandled rejection in browser console
    const lastReload = sessionStorage.getItem('puplume_vite_preload_reload');
    const now = Date.now();
    if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
      sessionStorage.setItem('puplume_vite_preload_reload', now.toString());
      window.location.reload();
    }
  });

  // Suppress unwanted browser reload blocking dialogs across any library or background sync
  const originalAddEventListener = window.addEventListener;
  window.addEventListener = function (type: string, listener: any, options?: any) {
    if (type === 'beforeunload') {
      // Prevent any library (Convex, PostHog, etc.) from registering blocking beforeunload listeners
      return;
    }
    return originalAddEventListener.call(window, type, listener, options);
  };

  // Smart PWA update lifecycle:
  // - Never reload on first-ever SW install (when no previous controller existed)
  // - Reload once (throttled & deferred while typing) when an existing PWA receives a new SW build
  // - Check for SW updates whenever the installed PWA returns to foreground
  if ('serviceWorker' in navigator) {
    const hadController = Boolean(navigator.serviceWorker.controller);
    let swRefreshing = false;
    let waitingForBlur = false;

    const reloadForSwUpdate = () => {
      if (swRefreshing) return;
      const active = document.activeElement as HTMLElement | null;
      if (
        active &&
        (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)
      ) {
        if (!waitingForBlur) {
          waitingForBlur = true;
          active.addEventListener(
            'blur',
            () => {
              waitingForBlur = false;
              reloadForSwUpdate();
            },
            { once: true }
          );
        }
        return;
      }
      const lastSwReload = sessionStorage.getItem('puplume_sw_update_reload');
      const now = Date.now();
      if (lastSwReload && now - parseInt(lastSwReload, 10) < 30000) {
        return;
      }
      swRefreshing = true;
      sessionStorage.setItem('puplume_sw_update_reload', now.toString());
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController) return;
      reloadForSwUpdate();
    });

    let lastUpdateCheck = 0;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') return;
      const now = Date.now();
      if (now - lastUpdateCheck < 60000) return;
      lastUpdateCheck = now;
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) reg.update().catch(() => {});
      }).catch(() => {});
    });
  }


}

// Defer PostHog initialization so it does not block the main thread during initial render
const initPostHog = () => {
  if ((posthog as any).__loaded) return;
  posthog.init(import.meta.env.VITE_POSTHOG_KEY || 'phc_ph5K7sEtEe7ma5owE6AdhcKR4TdBwqSjM94ddi6Pcrhx', {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: true,
    autocapture: false,
    disable_session_recording: true,
    disable_surveys: true,
  });
};

if ('requestIdleCallback' in window) {
  window.requestIdleCallback(initPostHog, { timeout: 3000 });
} else {
  setTimeout(initPostHog, 2000);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
