import { useEffect, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// Check if running inside installed standalone PWA
export const checkIsStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://') ||
    window.location.search.includes('source=pwa') ||
    window.location.search.includes('utm_source=pwa') ||
    window.location.search.includes('mode=standalone')
  );
};

// Global variable to capture prompt event even if hook mounts later
let capturedPrompt: BeforeInstallPromptEvent | null = (window as any).__deferredInstallPrompt || null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    // If already in standalone PWA, suppress browser prompt completely
    if (checkIsStandalone()) {
      e.preventDefault();
      capturedPrompt = null;
      return;
    }
    e.preventDefault();
    capturedPrompt = e as BeforeInstallPromptEvent;
    (window as any).__deferredInstallPrompt = capturedPrompt;
    window.dispatchEvent(new CustomEvent('pwa-prompt-available'));
  });

  window.addEventListener('appinstalled', () => {
    capturedPrompt = null;
    (window as any).__deferredInstallPrompt = null;
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });
}

export function usePWAInstall() {
  const [isInstalled, setIsInstalled] = useState<boolean>(checkIsStandalone);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => 
    checkIsStandalone() ? null : capturedPrompt
  );
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone = checkIsStandalone();
    setIsInstalled(isStandalone);
    if (isStandalone) {
      setDeferredPrompt(null);
    }

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    const onPromptAvailable = () => {
      if (!checkIsStandalone()) {
        setDeferredPrompt(capturedPrompt);
      }
    };

    const onAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('pwa-prompt-available', onPromptAvailable);
    window.addEventListener('pwa-installed', onAppInstalled);

    if (capturedPrompt && !deferredPrompt && !isStandalone) {
      setDeferredPrompt(capturedPrompt);
    }

    return () => {
      window.removeEventListener('pwa-prompt-available', onPromptAvailable);
      window.removeEventListener('pwa-installed', onAppInstalled);
    };
  }, [deferredPrompt]);

  const install = async (): Promise<boolean> => {
    if (!deferredPrompt || checkIsStandalone()) {
      return false;
    }
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        capturedPrompt = null;
        return true;
      }
    } catch (err) {
      console.warn('PWA install prompt error:', err);
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt && !isInstalled,
    isInstalled,
    isIOS,
    install,
    deferredPrompt,
  };
}
