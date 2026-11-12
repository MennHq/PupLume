import { useState, useEffect, useCallback } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [wasOffline, setWasOffline] = useState<boolean>(false);

  // Active ping function to verify real connectivity
  const checkConnection = useCallback(async (): Promise<boolean> => {
    setIsChecking(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    try {
      const res = await fetch(`/favicon.png?_ping=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      });

      const online = res.ok || res.status < 400;
      setIsOnline(online);
      setLastChecked(new Date());
      setIsChecking(false);
      return online;
    } catch {
      setIsOnline(false);
      setLastChecked(new Date());
      setIsChecking(false);
      return false;
    } finally {
      clearTimeout(timeoutId);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      // Double-check with an active head ping
      checkConnection();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check if browser thinks it's offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOnline(false);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkConnection]);

  return {
    isOnline,
    isChecking,
    lastChecked,
    wasOffline,
    checkConnection,
  };
}
