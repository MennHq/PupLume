/**
 * PupLume Offline Local Alarms & Smart Reminders Engine
 * 
 * Schedules native OS alerts that trigger even in Airplane Mode or with zero internet signal
 * using the Web Notification Triggers API (`TimestampTrigger`) and Service Worker background timers.
 */

export interface OfflineAlarmOptions {
  id?: string;
  title: string;
  body: string;
  targetTimestamp: number;
  category?: 'potty' | 'feeding' | 'medication' | 'walk' | 'general';
  actionUrl?: string;
}

class LocalAlarmsEngine {
  /**
   * Check if native notification triggers or service worker scheduling is supported
   */
  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
  }

  /**
   * Request notification permission if not yet granted
   */
  public async ensurePermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    if (Notification.permission === 'granted') return true;
    try {
      const res = await Notification.requestPermission();
      return res === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Schedule a native offline alarm
   */
  public async schedule(options: OfflineAlarmOptions): Promise<boolean> {
    const hasPermission = await this.ensurePermission();
    if (!hasPermission) return false;

    const { id, title, body, targetTimestamp, category = 'general', actionUrl = '/' } = options;
    const tag = id || `offline-alarm-${category}-${targetTimestamp}`;

    try {
      const registration = await navigator.serviceWorker.ready;

      // 1. Try native Notification Triggers API (Chromium / modern Android)
      const WindowWithTrigger = window as any;
      if ('showTrigger' in Notification.prototype && WindowWithTrigger.TimestampTrigger) {
        try {
          await registration.showNotification(title, {
            body,
            icon: '/pwa-192x192.png',
            badge: '/icon.svg',
            tag,
            vibrate: [200, 100, 200],
            requireInteraction: true,
            data: { url: actionUrl, category, timestamp: targetTimestamp },
            showTrigger: new WindowWithTrigger.TimestampTrigger(targetTimestamp),
          } as any);
          console.log('[LocalAlarms] Scheduled via TimestampTrigger for:', new Date(targetTimestamp).toLocaleTimeString());
          return true;
        } catch (err) {
          console.debug('[LocalAlarms] TimestampTrigger failed, using SW message fallback:', err);
        }
      }

      // 2. Dispatch to Service Worker for background scheduling
      if (registration.active) {
        registration.active.postMessage({
          type: 'SCHEDULE_OFFLINE_ALARM',
          id: tag,
          title,
          targetTimestamp,
          options: {
            body,
            tag,
            data: { url: actionUrl, category, timestamp: targetTimestamp },
          },
        });
        console.log('[LocalAlarms] Dispatched to SW timer for:', new Date(targetTimestamp).toLocaleTimeString());
        return true;
      }

      // 3. Client fallback if SW inactive
      const delay = Math.max(0, targetTimestamp - Date.now());
      if (delay < 86400000) { // Under 24h
        setTimeout(() => {
          if (Notification.permission === 'granted') {
            new Notification(title, { body, icon: '/pwa-192x192.png', tag });
          }
        }, delay);
      }
      return true;
    } catch (err) {
      console.warn('[LocalAlarms] Failed to schedule alarm:', err);
      return false;
    }
  }

  /**
   * Automatically schedule the next potty break alarm based on puppy name and minutes
   */
  public async scheduleNextPotty(puppyName: string, minutesFromNow: number = 90): Promise<boolean> {
    const targetTimestamp = Date.now() + minutesFromNow * 60 * 1000;
    const timeFormatted = new Date(targetTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return this.schedule({
      id: `potty-next-${puppyName.toLowerCase()}`,
      title: `🐾 ${puppyName}’s Potty Window (${timeFormatted})`,
      body: `It's time to take ${puppyName} out for a potty break! Keeping this rhythm builds reliable outdoor habits.`,
      targetTimestamp,
      category: 'potty',
      actionUrl: '/?action=potty',
    });
  }

  /**
   * Schedule next puppy meal reminder
   */
  public async scheduleMealReminder(puppyName: string, mealType: string = 'next meal', minutesFromNow: number = 60): Promise<boolean> {
    const targetTimestamp = Date.now() + minutesFromNow * 60 * 1000;
    const timeFormatted = new Date(targetTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return this.schedule({
      id: `meal-next-${puppyName.toLowerCase()}`,
      title: `🍖 ${puppyName}’s ${mealType} (${timeFormatted})`,
      body: `Time for ${puppyName}’s scheduled meal and fresh water bowl!`,
      targetTimestamp,
      category: 'feeding',
      actionUrl: '/?action=feeding',
    });
  }

  /**
   * Cancel pending alarms
   */
  public async cancel(tag?: string): Promise<void> {
    if (!this.isSupported()) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration.active) {
        registration.active.postMessage({
          type: 'CANCEL_OFFLINE_ALARMS',
          tag,
        });
      }
      const notifs = await registration.getNotifications();
      notifs.forEach((n) => {
        if (!tag || n.tag === tag) n.close();
      });
    } catch (err) {
      console.debug('[LocalAlarms] Cancel error:', err);
    }
  }
}

export const localAlarms = new LocalAlarmsEngine();
