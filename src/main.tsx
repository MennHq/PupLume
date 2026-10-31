import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AppProviders } from './components/providers/AppProviders.tsx';
import './index.css';
import posthog from 'posthog-js';

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
