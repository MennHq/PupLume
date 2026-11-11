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

  // Seamless update when service worker installs a new build
  if ('serviceWorker' in navigator) {
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
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
