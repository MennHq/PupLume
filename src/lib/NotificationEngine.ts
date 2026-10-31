import { storage } from './storage';
import { convex } from './convex';
import { api } from '../../convex/_generated/api';
import { playNotificationChime } from './sound';
import { NotificationItem } from '../types';

class NotificationEngine {
  private timer: NodeJS.Timeout | null = null;
  private notifiedTaskIds: Set<string> = new Set();
  private lastPottyAlertTimes: Map<string, number> = new Map();
  private notifiedMedicationKeys: Set<string> = new Set();
  
  public async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await this.syncPushSubscriptionToCloud();
      }
      return permission;
    } catch {
      return 'denied';
    }
  }

  public getPermissionStatus(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Register push subscription with service worker and sync to Convex
   */
  public async syncPushSubscriptionToCloud(): Promise<void> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      if (!('pushManager' in registration)) return;

      let subscription = await registration.pushManager.getSubscription();
      
      // If no subscription and we have VAPID key or default browser support
      if (!subscription) {
        // Standard browser web push subscription
        try {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            // Generic sample applicationServerKey or standard push subscription
            applicationServerKey: undefined
          });
        } catch {
          // Some browsers require explicit VAPID key; local SW notifications will still fire
        }
      }

      if (subscription) {
        const subJson = subscription.toJSON();
        const currentUserId = storage.getCurrentUserId();
        if (currentUserId && subJson.endpoint && subJson.keys) {
          await convex.mutation(api.notifications.registerPushSubscription, {
            userId: currentUserId,
            endpoint: subJson.endpoint,
            keys: {
              p256dh: subJson.keys.p256dh || '',
              auth: subJson.keys.auth || ''
            },
            userAgent: navigator.userAgent
          });
          console.log('[NotificationEngine] Push subscription successfully synced to cloud');
        }
      }
    } catch (err) {
      console.debug('[NotificationEngine] Push registration note:', err);
    }
  }

  start() {
    if (this.timer) return;

    // Run check every 60 seconds
    this.timer = setInterval(() => this.check(), 60000);
    
    // Initial check 4 seconds after app load
    setTimeout(() => {
      this.check();
      if (this.getPermissionStatus() === 'granted') {
        this.syncPushSubscriptionToCloud();
      }
    }, 4000);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  /**
   * Send an immediate test notification to verify OS popup and sound
   */
  public async testNotification(): Promise<boolean> {
    const puppy = storage.getPuppy();
    const puppyName = puppy?.name || 'PupLume';
    return this.triggerNotification(
      `🐾 ${puppyName} Alert System Active!`,
      `Push notifications are working! Click below to open your puppy dashboard.`,
      'potty',
      '/potty',
      'test-notification'
    );
  }

  private check() {
    const settings = storage.getSettings();
    const allPuppies = storage.getPuppies().length > 0 ? storage.getPuppies() : [storage.getPuppy()].filter(Boolean) as any[];
    if (allPuppies.length === 0) return;
    
    const now = new Date();

    // 0. Check Quiet Hours (Do Not Disturb Schedule)
    if (settings.quietHoursEnabled) {
      const start = settings.quietHoursStart || '22:00';
      const end = settings.quietHoursEnd || '07:00';
      const [sH, sM] = start.split(':').map(Number);
      const [eH, eM] = end.split(':').map(Number);
      const currentMins = now.getHours() * 60 + now.getMinutes();
      const startMins = sH * 60 + sM;
      const endMins = eH * 60 + eM;
      const isQuiet = startMins > endMins
        ? (currentMins >= startMins || currentMins < endMins)
        : (currentMins >= startMins && currentMins < endMins);

      if (isQuiet) {
        return; // Suppress routine reminders during quiet hours
      }
    }

    allPuppies.forEach((pup) => {
      const puppyName = pup.name || 'your puppy';
      const pupId = pup.id;

      // 1. Check pending daily tasks for this puppy
      const tasks = storage.getTasks(pupId);
      const todayDateStr = now.toISOString().split('T')[0];
      const advanceNoticeMins = settings.taskAdvanceMinutes !== undefined ? settings.taskAdvanceMinutes : 15;

      tasks.filter(t => !t.completed && !t.skipped).forEach(task => {
        if (!task.time) return;
        if (task.date && task.date !== todayDateStr) return;

        // Category-specific user notification preferences
        if (task.category === 'feeding' && settings.feedingAlerts === false) return;
        if (task.category === 'training' && settings.trainingAlerts === false) return;
        if (task.category !== 'feeding' && task.category !== 'training' && settings.taskAlerts === false) return;
        
        const [timeStr, period] = task.time.split(' ');
        let [hours, mins] = timeStr.split(':').map(Number);
        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        
        const taskDate = new Date();
        taskDate.setHours(hours, mins, 0, 0);
        
        const diffMs = taskDate.getTime() - now.getTime();
        const diffMins = diffMs / 60000;
        
        // If task starts within user-configured advance notice and we haven't alerted yet
        if (diffMins >= 0 && diffMins <= advanceNoticeMins && !this.notifiedTaskIds.has(task.id)) {
          this.notifiedTaskIds.add(task.id);
          const timeDesc = Math.round(diffMins) <= 0 ? 'Starting now' : `Starts in ${Math.round(diffMins)} minutes`;
          this.triggerNotification(
            `Upcoming: ${task.title}`,
            `${timeDesc} for ${puppyName}.`,
            'tasks',
            '/tasks',
            `task-${task.id}`
          );
        }
      });

      // 2. Smart Potty Monitoring (Dynamic by Puppy Age or Custom Interval)
      if (settings.pottyAlerts !== false) {
        const pottyLogs = storage.getPottyLogs(pupId);
        const lastLog = pottyLogs[0]; // Most recent first
        
        if (lastLog) {
          const lastDate = new Date(lastLog.timestamp);
          const isToday = lastDate.toDateString() === now.toDateString();
          const lastTime = lastDate.getTime();
          const diffMinutesSinceLastPotty = (now.getTime() - lastTime) / 60000;
          const lastAlert = this.lastPottyAlertTimes.get(pupId) || 0;
          const cooldownMinutesSinceLastAlert = (now.getTime() - lastAlert) / 60000;

          // Calculate Puppy Age in Months for Veterinary Rule
          let puppyAgeMonths = 3;
          if (pup.birthDate) {
            const bDate = new Date(pup.birthDate);
            if (!isNaN(bDate.getTime())) {
              const ageDays = (now.getTime() - bDate.getTime()) / (1000 * 60 * 60 * 24);
              puppyAgeMonths = Math.max(1, Math.round(ageDays / 30.44));
            }
          }

          // Target threshold in minutes:
          // If custom: use user-chosen hours
          // If age_dynamic: standard veterinary rule: Age in months = bladder capacity in hours (capped at 5 hrs daytime)
          let targetMinutes = 150;
          if (settings.pottyIntervalMode === 'custom') {
            targetMinutes = Math.round((settings.pottyCustomIntervalHours || 2.5) * 60);
          } else {
            // Veterinary Dynamic: 1.5h min (8 weeks), 2h (2 mos), 3h (3 mos), 4h (4 mos), 5h max daytime
            targetMinutes = Math.min(Math.max(puppyAgeMonths * 60, 90), 300);
          }

          // Alert when threshold reached, break was logged today, and at least 45m cooldown since last alert
          if (isToday && diffMinutesSinceLastPotty >= targetMinutes && cooldownMinutesSinceLastAlert >= 45) {
            this.lastPottyAlertTimes.set(pupId, now.getTime());
            const hoursAgo = (diffMinutesSinceLastPotty / 60).toFixed(1).replace('.0', '');
            const targetHours = (targetMinutes / 60).toFixed(1).replace('.0', '');
            const reason = settings.pottyIntervalMode === 'custom'
              ? `Your custom ${targetHours}h schedule has elapsed.`
              : `At ${puppyAgeMonths} months old, ${puppyName}'s bladder capacity is ~${targetHours} hours.`;

            this.triggerNotification(
              `🐾 Potty Break Time for ${puppyName}!`,
              `It's been ${hoursAgo} hours since ${puppyName}'s last break. ${reason} Let's head outside!`,
              'potty',
              '/potty',
              `potty-alarm-${pupId}-${Date.now()}`
            );
          }
        }
      }

      // 3. Medication & Preventative Booster Alerts for this puppy
      if (settings.medAlerts !== false) {
        const medications = storage.getMedications(pupId);
        const todayStr = now.toISOString().split('T')[0];

        medications.filter(m => m.active).forEach(med => {
          if (!med.reminderTime) return;
          
          const [timePart, period] = med.reminderTime.split(' ');
          let [hours, mins] = timePart.split(':').map(Number);
          if (period === 'PM' && hours < 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;

          const medKey = `${med.id}_${todayStr}_${hours}`;
          
          // If current hour matches reminder hour and within window, and not alerted today
          if (now.getHours() === hours && Math.abs(now.getMinutes() - mins) <= 15 && !this.notifiedMedicationKeys.has(medKey)) {
            this.notifiedMedicationKeys.add(medKey);
            this.triggerNotification(
              `💊 Medication Reminder: ${med.name}`,
              `Time to administer ${med.name} (${med.dosage}) to ${puppyName}.`,
              'health',
              '/health',
              `med-${med.id}`
            );
          }
        });
      }
    });
  }

  /**
   * Trigger native background notification via Service Worker or Notification API,
   * plus create in-app notification in Convex.
   */
  public async triggerNotification(
    title: string,
    message: string,
    category: string,
    actionUrl?: string,
    tag?: string
  ): Promise<boolean> {
    let nativeShown = false;
    const targetUrl = actionUrl || '/';
    const viewName = targetUrl.replace(/^\/+/, '').split('?')[0] || 'home';

    // Tailored action buttons for Windows / Android / macOS native toasts
    let actions: { action: string; title: string }[] = [
      { action: 'open_app', title: '🐾 Open PupLume' },
      { action: 'dismiss', title: '✕ Dismiss' }
    ];

    if (category === 'potty') {
      actions = [
        { action: 'open_potty', title: '🐾 Open Potty Tracker' },
        { action: 'dismiss', title: '✕ Dismiss' }
      ];
    } else if (category === 'health') {
      actions = [
        { action: 'open_health', title: '💊 Open Health Center' },
        { action: 'dismiss', title: '✕ Dismiss' }
      ];
    } else if (category === 'tasks' || category === 'training') {
      actions = [
        { action: 'open_tasks', title: '📋 View Schedule' },
        { action: 'dismiss', title: '✕ Dismiss' }
      ];
    }

    // 0. Trigger In-App Heads-Up Alert & Audio Chime (100% customizable PupLume UI)
    if (typeof window !== 'undefined') {
      playNotificationChime();
      const pup = storage.getPuppy();
      const taskId = tag?.startsWith('task-') ? tag.replace('task-', '') : undefined;
      window.dispatchEvent(
        new CustomEvent('puplume-headsup-alert', {
          detail: {
            id: tag || `notif-${Date.now()}`,
            title,
            message,
            category,
            actionUrl: targetUrl,
            viewName,
            timestamp: Date.now(),
            taskId,
            puppyName: pup?.name
          }
        })
      );
    }

    // 1. Native Push Notification (Phone/Desktop via Service Worker)
    // Only show system push/Windows notification when the app is in the background or minimized.
    // When the app is open and visible to the user, the custom in-app heads-up alert handles it!
    const isAppOpen = typeof document !== 'undefined' && document.visibilityState === 'visible';

    if (!isAppOpen && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const options: any = {
        body: message,
        icon: '/pwa-192x192.png',
        badge: '/icon.svg',
        tag: tag || `puplume-${category}-${Date.now()}`,
        renotify: true,
        requireInteraction: true, // Prevents Windows from auto-fading out!
        vibrate: [200, 100, 200],
        actions: actions,
        data: {
          url: targetUrl,
          category,
          view: viewName,
          timestamp: Date.now()
        }
      };

      // Prefer Service Worker showNotification for background support & action clicks
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.ready;
          await reg.showNotification(title, options);
          nativeShown = true;
        } catch (swErr) {
          console.debug('[NotificationEngine] SW showNotification fallback:', swErr);
        }

        // Also post message to active service worker controller
        if (!nativeShown && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_NOTIFICATION',
            title,
            options
          });
          nativeShown = true;
        }
      }

      // Classic Notification window fallback if SW couldn't show
      if (!nativeShown) {
        try {
          const n = new Notification(title, options);
          n.onclick = (e) => {
            e.preventDefault();
            window.focus();
            if (viewName) {
              window.dispatchEvent(new CustomEvent('navigate', { detail: { view: viewName } }));
              window.history.pushState({ view: viewName }, '', targetUrl);
            }
            n.close();
          };
          nativeShown = true;
        } catch (e) {
          console.warn('[NotificationEngine] Native notification failed:', e);
        }
      }
    }

    // 2. In-App Notification (Stored in Convex & local storage)
    const currentUserId = storage.getCurrentUserId();
    if (currentUserId) {
      convex.mutation(api.notifications.addNotification, {
        userId: currentUserId,
        title,
        message,
        category,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionUrl
      }).catch((e) => {
        console.debug('[NotificationEngine] In-app notification cloud sync note:', e);
      });
    }

    // Save to local storage for instant offline viewing
    try {
      const localNotification: NotificationItem = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title,
        message,
        category: (category as NotificationItem['category']) || 'reminder',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionUrl,
        read: false
      };
      const existing = storage.getNotifications();
      storage.saveNotifications([localNotification, ...existing.slice(0, 49)]);
    } catch (e) {
      console.debug('[NotificationEngine] Local storage note:', e);
    }

    return nativeShown;
  }
}

export const engine = new NotificationEngine();
