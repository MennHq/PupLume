import { storage } from './storage';
import { PuppyProfile } from '../types';
import { copyToClipboard } from './clipboard';

/**
 * PupLume Native Bridge
 * Brings native iOS & Android mobile capabilities to the PWA:
 * 1. Haptic Feedback (Vibration API)
 * 2. Native Web Share Sheet (Web Share API + Clipboard Fallback)
 * 3. Screen Wake Lock (Keeps display awake during timers & training)
 * 4. App Icon Badging (Sets unread task count on home screen icon)
 * 5. Standalone App Detection
 */

class NativeBridge {
  private wakeLockSentinel: any = null;
  private activeWakeLockKey: string | null = null;
  private isWakeLockSupported: boolean;

  constructor() {
    this.isWakeLockSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;

    // Auto re-acquire wake lock if page becomes visible again
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', async () => {
        if (document.visibilityState === 'visible' && this.activeWakeLockKey && !this.wakeLockSentinel) {
          await this.requestWakeLock(this.activeWakeLockKey);
        }
      });
    }
  }

  /* ========================================================================
   * 1. Haptic Feedback (Vibration API)
   * ======================================================================== */
  public haptics = {
    isSupported: (): boolean => {
      return typeof navigator !== 'undefined' && 'vibrate' in navigator;
    },

    /** Light tap (10ms) - for button clicks, tab switching, toggles */
    light: (): void => {
      try {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(10);
        }
      } catch {
        // Silently ignore if permission blocked
      }
    },

    /** Medium tap (25ms) - for action menus, sheet drag, modals */
    medium: (): void => {
      try {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(25);
        }
      } catch {
        // Silently ignore
      }
    },

    /** Double success buzz [15ms, 50ms pause, 25ms] - for task completed, routine logged */
    success: (): void => {
      try {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([15, 50, 25]);
        }
      } catch {
        // Silently ignore
      }
    },

    /** Warning buzz - for alerts, confirmations */
    warning: (): void => {
      try {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([30, 40, 30]);
        }
      } catch {
        // Silently ignore
      }
    },

    /** Error buzz - for form validations */
    error: (): void => {
      try {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([50, 40, 50]);
        }
      } catch {
        // Silently ignore
      }
    }
  };

  /* ========================================================================
   * 2. Native Web Share Sheet (Web Share API)
   * ======================================================================== */
  public share = {
    isSupported: (): boolean => {
      return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
    },

    /**
     * Triggers the native iOS/Android system share sheet.
     * Gracefully falls back to copying the URL/text to the clipboard if not supported.
     */
    custom: async (payload: {
      title: string;
      text?: string;
      url?: string;
      files?: File[];
    }): Promise<{ success: boolean; method: 'native' | 'clipboard' | 'none'; message?: string }> => {
      // 1. Try Native Mobile Share Sheet
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        try {
          const shareData: ShareData = {
            title: payload.title,
            text: payload.text,
            url: payload.url || (typeof window !== 'undefined' ? window.location.href : undefined)
          };

          if (payload.files && navigator.canShare && navigator.canShare({ files: payload.files })) {
            shareData.files = payload.files;
          }

          await navigator.share(shareData);
          this.haptics.success();
          return { success: true, method: 'native' };
        } catch (err: any) {
          // If user simply closed/cancelled the share sheet, don't fallback to clipboard
          if (err?.name === 'AbortError') {
            return { success: false, method: 'native', message: 'Share dismissed' };
          }
          // Other error: fallback to clipboard below
        }
      }

      // 2. Fallback: Copy URL or text to Clipboard (works on HTTPS, HTTP LAN & all browsers)
      const toCopy = payload.url || payload.text || payload.title;
      const copied = await copyToClipboard(toCopy);
      if (copied) {
        this.haptics.light();
        return { 
          success: true, 
          method: 'clipboard', 
          message: 'Link copied to clipboard!' 
        };
      }

      return { success: false, method: 'none', message: 'Sharing is not supported on this device.' };
    },

    /**
     * Share Puppy Pet Passport / Profile
     */
    puppyProfile: async (puppy: PuppyProfile, ageWeeks?: number) => {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://puplume.pet';
      const cleanSlug = encodeURIComponent(puppy.name.toLowerCase());
      const publicUrl = `${origin}/pup/${cleanSlug}`;
      const ageStr = ageWeeks ? `(${ageWeeks} weeks old)` : '';

      return this.share.custom({
        title: `${puppy.name}'s PupLume Pet Passport 🐾`,
        text: `Meet ${puppy.name}, a sweet ${puppy.breed} ${ageStr}! Check out ${puppy.name}'s digital puppy profile and safety tag.`,
        url: publicUrl
      });
    },

    /**
     * Share Emergency Lost Dog Alert
     */
    safetyAlert: async (puppy: PuppyProfile) => {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://puplume.pet';
      const cleanSlug = encodeURIComponent(puppy.name.toLowerCase());
      const publicUrl = `${origin}/pup/${cleanSlug}`;
      const rewardStr = puppy.rewardAmount ? ` Reward: $${puppy.rewardAmount}!` : '';

      return this.share.custom({
        title: `🚨 LOST PUPPY ALERT: Help Find ${puppy.name}!`,
        text: `EMERGENCY: ${puppy.name} (${puppy.breed}) is reported missing.${rewardStr} If found, please check the safety instructions immediately:`,
        url: publicUrl
      });
    },

    /**
     * Share Training Academy Achievement / Trick Mastered
     */
    achievement: async (lessonTitle: string, puppyName: string) => {
      return this.share.custom({
        title: `🎓 ${puppyName} mastered "${lessonTitle}"!`,
        text: `Proud pet parent moment! ${puppyName} just completed the "${lessonTitle}" training drill on PupLume! 🐶✨`,
        url: typeof window !== 'undefined' ? window.location.origin : 'https://puplume.pet'
      });
    }
  };

  /* ========================================================================
   * 3. Screen Wake Lock (Keeps screen awake during active timers/training)
   * ======================================================================== */
  public wakeLock = {
    isSupported: (): boolean => this.isWakeLockSupported,

    isActive: (): boolean => Boolean(this.wakeLockSentinel),

    /**
     * Request screen wake lock so the phone screen doesn't turn off
     */
    request: async (key: string = 'default'): Promise<boolean> => {
      if (!this.isWakeLockSupported) return false;

      try {
        this.activeWakeLockKey = key;
        if (!this.wakeLockSentinel) {
          this.wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
          this.wakeLockSentinel.addEventListener('release', () => {
            this.wakeLockSentinel = null;
          });
        }
        return true;
      } catch (err) {
        console.debug('[NativeBridge] WakeLock request error:', err);
        return false;
      }
    },

    /**
     * Release screen wake lock so the screen can sleep normally
     */
    release: async (key?: string): Promise<void> => {
      if (key && this.activeWakeLockKey !== key) {
        return; // Only release if matching key or unconditional
      }

      this.activeWakeLockKey = null;
      if (this.wakeLockSentinel) {
        try {
          await this.wakeLockSentinel.release();
        } catch {
          // ignore
        }
        this.wakeLockSentinel = null;
      }
    }
  };

  private requestWakeLock = (key: string) => this.wakeLock.request(key);

  /* ========================================================================
   * 4. App Icon Badging (Badging API)
   * ======================================================================== */
  public badge = {
    isSupported: (): boolean => {
      return typeof navigator !== 'undefined' && ('setAppBadge' in navigator || 'setExperimentalAppBadge' in (navigator as any));
    },

    /**
     * Set the badge number on the home screen PWA app icon
     */
    set: async (count: number): Promise<void> => {
      if (typeof navigator === 'undefined') return;

      try {
        if ('setAppBadge' in navigator) {
          if (count > 0) {
            await (navigator as any).setAppBadge(count);
          } else {
            await (navigator as any).clearAppBadge();
          }
        } else if ('setExperimentalAppBadge' in (navigator as any)) {
          if (count > 0) {
            await (navigator as any).setExperimentalAppBadge(count);
          } else {
            await (navigator as any).clearExperimentalAppBadge();
          }
        }
      } catch {
        // Silently ignore if not in standalone or permission denied
      }
    },

    /**
     * Clear the badge on the app icon
     */
    clear: async (): Promise<void> => {
      if (typeof navigator === 'undefined') return;

      try {
        if ('clearAppBadge' in navigator) {
          await (navigator as any).clearAppBadge();
        } else if ('clearExperimentalAppBadge' in (navigator as any)) {
          await (navigator as any).clearExperimentalAppBadge();
        }
      } catch {
        // Silently ignore
      }
    },

    /**
     * Automatically sync the badge to the count of uncompleted tasks for today
     */
    updateFromTasks: async (puppyId?: string): Promise<void> => {
      try {
        const tasks = storage.getTasks(puppyId);
        const pendingCount = tasks.filter((t) => !t.completed).length;
        await this.badge.set(pendingCount);
      } catch {
        // Silently ignore
      }
    }
  };

  /* ========================================================================
   * 5. Standalone PWA Detection
   * ======================================================================== */
  public isStandalone = (): boolean => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  };
}

export const nativeBridge = new NativeBridge();
