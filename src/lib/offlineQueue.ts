/**
 * PupLume Offline Mutation Sync Queue
 * Automatically queues failed/offline Convex mutations in localStorage
 * and flushes them in order whenever the user regains internet connectivity.
 */

import { convex } from './convex';
import { api } from '../../convex/_generated/api';

export interface QueuedMutation {
  id: string;
  type: string;
  payload: any;
  timestamp: string;
  retries: number;
}

const STORAGE_KEY = 'puplume_offline_mutation_queue';

class OfflineMutationQueue {
  private isProcessing = false;
  private listeners: Set<(count: number) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[OfflineQueue] Connection restored. Flushing queued mutations...');
        this.flush();
      });

      // Attempt to flush on startup if online
      setTimeout(() => {
        if (navigator.onLine) {
          this.flush();
        }
      }, 3000);
    }
  }

  public subscribe(listener: (count: number) => void): () => void {
    this.listeners.add(listener);
    listener(this.getCount());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const count = this.getCount();
    this.listeners.forEach((l) => l(count));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('offline-queue-changed', { detail: { count } }));
    }
  }

  public getQueue(): QueuedMutation[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public getCount(): number {
    return this.getQueue().length;
  }

  private saveQueue(queue: QueuedMutation[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
      this.notify();
    } catch (e) {
      console.warn('[OfflineQueue] Failed to save queue to localStorage:', e);
    }
  }

  /**
   * Enqueue a mutation to be sent when internet is available
   */
  public enqueue(type: string, payload: any) {
    const queue = this.getQueue();
    const item: QueuedMutation = {
      id: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      payload,
      timestamp: new Date().toISOString(),
      retries: 0,
    };
    queue.push(item);
    this.saveQueue(queue);
    console.log(`[OfflineQueue] Enqueued mutation ${type}. Total queued: ${queue.length}`);
  }

  /**
   * Flush all queued mutations to Convex
   */
  public async flush(): Promise<boolean> {
    if (this.isProcessing) return false;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return false;

    const queue = this.getQueue();
    if (queue.length === 0) return true;

    this.isProcessing = true;
    const initialCount = queue.length;
    console.log(`[OfflineQueue] Flushing ${initialCount} mutations...`);

    const remaining: QueuedMutation[] = [];
    let syncedCount = 0;

    for (const item of queue) {
      try {
        const success = await this.executeMutation(item);
        if (success) {
          syncedCount++;
        } else {
          item.retries += 1;
          if (item.retries < 5) {
            remaining.push(item);
          } else {
            console.warn(`[OfflineQueue] Dropping mutation ${item.type} after 5 retries`);
          }
        }
      } catch (err) {
        console.warn(`[OfflineQueue] Mutation execution error for ${item.type}:`, err);
        item.retries += 1;
        if (item.retries < 5) {
          remaining.push(item);
        }
      }
    }

    this.saveQueue(remaining);
    this.isProcessing = false;
    console.log(`[OfflineQueue] Flush finished. Synced: ${syncedCount}, Remaining: ${remaining.length}`);

    if (syncedCount > 0 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('offline-queue-flushed', { detail: { count: syncedCount } }));
    }

    return remaining.length === 0;
  }

  private async executeMutation(item: QueuedMutation): Promise<boolean> {
    const { type, payload } = item;

    switch (type) {
      // Tasks
      case 'tasks:createTask':
        await convex.mutation(api.tasks.createTask, payload);
        return true;
      case 'tasks:toggleTask':
        await convex.mutation(api.tasks.toggleTask, payload);
        return true;
      case 'tasks:skipTask':
        await convex.mutation(api.tasks.skipTask, payload);
        return true;
      case 'tasks:updateTask':
        await convex.mutation(api.tasks.updateTask, payload);
        return true;
      case 'tasks:deleteTask':
        await convex.mutation(api.tasks.deleteTask, payload);
        return true;
      case 'tasks:resetDailyTasks':
        await convex.mutation(api.tasks.resetDailyTasks, payload);
        return true;

      // Puppies
      case 'puppies:savePuppy':
        await convex.mutation(api.puppies.savePuppy, payload);
        return true;
      case 'puppies:deletePuppy':
        await convex.mutation(api.puppies.deletePuppy, payload);
        return true;

      // Potty Logs
      case 'potty:addPottyLog':
      case 'potty:logPotty':
        await convex.mutation(api.potty.addPottyLog, payload);
        return true;
      case 'potty:deletePottyLog':
        await convex.mutation(api.potty.deletePottyLog, payload);
        return true;

      // Feeding Logs
      case 'feeding:addFeedingLog':
      case 'feeding:logFeeding':
        await convex.mutation(api.feeding.addFeedingLog, payload);
        return true;
      case 'feeding:deleteFeedingLog':
        await convex.mutation(api.feeding.deleteFeedingLog, payload);
        return true;

      // Sleep Logs
      case 'sleep:addSleepLog':
      case 'sleep:logSleep':
        await convex.mutation(api.sleep.addSleepLog, payload);
        return true;
      case 'sleep:deleteSleepLog':
        await convex.mutation(api.sleep.deleteSleepLog, payload);
        return true;

      // Walk Logs
      case 'walk:addWalkLog':
      case 'walk:logWalk':
        await convex.mutation(api.walk.addWalkLog, payload);
        return true;
      case 'walk:deleteWalkLog':
        await convex.mutation(api.walk.deleteWalkLog, payload);
        return true;

      // Health
      case 'health:addVaccination':
      case 'health:saveVaccination':
        await convex.mutation(api.health.addVaccination, payload);
        return true;
      case 'health:addMedication':
      case 'health:saveMedication':
        await convex.mutation(api.health.addMedication, payload);
        return true;
      case 'health:addAppointment':
      case 'health:saveAppointment':
        await convex.mutation(api.health.addAppointment, payload);
        return true;
      case 'health:deleteVaccination':
        await convex.mutation(api.health.deleteVaccination, payload);
        return true;
      case 'health:deleteMedication':
        await convex.mutation(api.health.deleteMedication, payload);
        return true;
      case 'health:deleteAppointment':
        await convex.mutation(api.health.deleteAppointment, payload);
        return true;

      // Expenses
      case 'expenses:addExpense':
      case 'expenses:saveExpense':
        await convex.mutation(api.expenses.addExpense, payload);
        return true;
      case 'expenses:deleteExpense':
        await convex.mutation(api.expenses.deleteExpense, payload);
        return true;

      // Documents
      case 'documents:addDocument':
      case 'documents:saveDocument':
        await convex.mutation(api.documents.addDocument, payload);
        return true;
      case 'documents:deleteDocument':
        await convex.mutation(api.documents.deleteDocument, payload);
        return true;

      // Journal
      case 'journal:addJournalEntry':
      case 'journal:saveJournalEntry':
        await convex.mutation(api.journal.addJournalEntry, payload);
        return true;
      case 'journal:deleteJournalEntry':
        await convex.mutation(api.journal.deleteJournalEntry, payload);
        return true;

      // Behavior
      case 'behavior:addBehaviorLog':
        await convex.mutation(api.behavior.addBehaviorLog, payload);
        return true;

      // Settings
      case 'settings:saveSettings':
        await convex.mutation(api.settings.saveSettings, payload);
        return true;
      case 'settings:dismissChecklistForever':
        await convex.mutation(api.settings.dismissChecklistForever, payload);
        return true;

      default:
        console.warn(`[OfflineQueue] Unknown mutation type: ${type}`);
        return true; // Mark done so it doesn't block queue
    }
  }
}

export const offlineQueue = new OfflineMutationQueue();
