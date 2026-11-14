import { 
  PuppyProfile, 
  TaskItem, 
  PottyLog, 
  SleepLog, 
  FeedingLog, 
  WalkLog, 
  TrainingLesson, 
  VaccinationRecord, 
  MedicationRecord, 
  VetAppointment, 
  ExpenseRecord, 
  DocumentRecord, 
  BehaviorIncident, 
  GroomingTask, 
  SocializationItem, 
  SocializationStatus, 
  JournalEntry, 
  FamilyMember, 
  NotificationItem, 
  AIMessage,
  UserSession 
} from '../types';
import { INITIAL_TRAINING_CURRICULUM } from './curriculumData';
import { 
  syncPuppyToConvex, 
  syncTaskToConvex, 
  toggleTaskInConvex,
  skipTaskInConvex,
  deleteTaskInConvex,
  updateTaskInConvex,
  syncPottyLogToConvex,
  deletePottyLogInConvex,
  syncFeedingLogToConvex,
  deleteFeedingLogInConvex,
  syncSleepLogToConvex,
  deleteSleepLogInConvex,
  syncWalkLogToConvex,
  deleteWalkLogInConvex,
  syncVaccinationToConvex,
  deleteVaccinationInConvex,
  syncMedicationToConvex,
  deleteMedicationInConvex,
  syncAppointmentToConvex,
  deleteAppointmentInConvex,
  syncExpenseToConvex,
  deleteExpenseInConvex,
  syncDocumentToConvex,
  removeDocumentFromConvex,
  syncBehaviorLogToConvex,
  deleteBehaviorLogInConvex,
  syncGroomingTasksToConvex,
  syncSocializationToConvex,
  syncJournalEntryToConvex,
  deleteJournalEntryInConvex,
  syncTrainingLessonToConvex,
  syncSettingsToConvex,
  syncFamilyMemberToConvex,
  removeFamilyMemberFromConvex,
  syncNotificationToConvex,
  syncNotificationReadToConvex,
  syncAllNotificationsReadToConvex,
  syncAIMessageToConvex,
  syncAIMessagesToConvex,
  repairLegacyPuppyIdsInConvex,
  resetDailyTasksInConvex
} from './convex';

export interface UserSettingsData {
  pottyAlerts: boolean;
  feedingAlerts: boolean;
  trainingAlerts: boolean;
  medAlerts: boolean;
  taskAlerts?: boolean;
  units: 'imperial' | 'metric';
  activePuppyId?: string;
  hasCompletedOnboarding?: boolean;
  hasCompletedChecklist?: boolean;
  pottyIntervalMode?: 'age_dynamic' | 'custom';
  pottyCustomIntervalHours?: number;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  taskAdvanceMinutes?: number;
  headsUpDurationSec?: number;
  snoozeDurationMin?: number;
  chimeSound?: boolean;
}

const DEFAULT_SETTINGS: UserSettingsData = {
  pottyAlerts: true,
  feedingAlerts: true,
  trainingAlerts: true,
  medAlerts: true,
  taskAlerts: true,
  units: 'imperial',
  hasCompletedOnboarding: false,
  hasCompletedChecklist: false,
  pottyIntervalMode: 'age_dynamic',
  pottyCustomIntervalHours: 2.5,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  taskAdvanceMinutes: 15,
  headsUpDurationSec: 12,
  snoozeDurationMin: 15,
  chimeSound: true,
};

class StorageManager {
  private currentUserId: string | null = null;
  private listeners: Set<() => void> = new Set();
  private hasHydratedFromConvex = false;

  // Active in-memory state scoped to authenticated user - starts clean with no fake data
  private puppies: PuppyProfile[] = [];
  private activePuppyId: string | null = null;
  private tasks: TaskItem[] = [];
  private pottyLogs: PottyLog[] = [];
  private sleepLogs: SleepLog[] = [];
  private feedingLogs: FeedingLog[] = [];
  private walkLogs: WalkLog[] = [];
  private trainingLessons: TrainingLesson[] = [...INITIAL_TRAINING_CURRICULUM];
  private vaccinations: VaccinationRecord[] = [];
  private medications: MedicationRecord[] = [];
  private appointments: VetAppointment[] = [];
  private expenses: ExpenseRecord[] = [];
  private documents: DocumentRecord[] = [];
  private behaviorLogs: BehaviorIncident[] = [];
  private groomingTasks: GroomingTask[] = [];
  private socialization: SocializationItem[] = [];
  private journal: JournalEntry[] = [];
  private family: FamilyMember[] = [];
  private notifications: NotificationItem[] = [];
  private aiMessages: AIMessage[] = [];
  private settings: UserSettingsData = { ...DEFAULT_SETTINGS };
  private recentTaskToggles: Map<string, { completed?: boolean; skipped?: boolean; timestamp: number }> = new Map();

  private recordRecentTaskToggle(taskId: string, title: string, completed: boolean): void {
    const entry = { completed, skipped: false, timestamp: Date.now() };
    if (taskId) this.recentTaskToggles.set(taskId, entry);
    if (title) this.recentTaskToggles.set(title.toLowerCase().trim(), entry);
  }

  private recordRecentTaskSkip(taskId: string, title: string): void {
    const entry = { completed: false, skipped: true, timestamp: Date.now() };
    if (taskId) this.recentTaskToggles.set(taskId, entry);
    if (title) this.recentTaskToggles.set(title.toLowerCase().trim(), entry);
  }

  private getOptimisticTaskState(taskId: string, title: string): { completed: boolean; skipped: boolean } | null {
    const now = Date.now();
    const entry = (taskId && this.recentTaskToggles.get(taskId)) || 
                  (title && this.recentTaskToggles.get(title.toLowerCase().trim()));
    if (!entry) return null;
    if (now - entry.timestamp > 5000) {
      if (taskId) this.recentTaskToggles.delete(taskId);
      if (title) this.recentTaskToggles.delete(title.toLowerCase().trim());
      return null;
    }
    return {
      completed: entry.completed ?? false,
      skipped: entry.skipped ?? false,
    };
  }

  constructor() {
    this.loadCache();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.warn('Listener notification error:', e);
      }
    });
  }

  setAuthenticatedUser(userId: string | null): void {
    if (this.currentUserId === userId) return;

    this.currentUserId = userId;
    this.hasHydratedFromConvex = false;

    // Load user cache or clear state
    this.loadCache();
    this.notifyListeners();
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  private userKey(key: string): string {
    return this.currentUserId ? `puplume_u_${this.currentUserId}_${key}` : `puplume_local_${key}`;
  }

  private loadCache(): void {
    try {
      const prefix = this.userKey('');
      const cachedPuppies = localStorage.getItem(`${prefix}puppies`);
      if (cachedPuppies) {
        this.puppies = JSON.parse(cachedPuppies);
        this.activePuppyId = localStorage.getItem(`${prefix}active_puppy_id`) || (this.puppies[0]?.id ?? null);
      } else {
        this.puppies = [];
        this.activePuppyId = null;
      }

      const cachedTasks = localStorage.getItem(`${prefix}tasks`);
      this.tasks = cachedTasks ? JSON.parse(cachedTasks) : [];

      const cachedPotty = localStorage.getItem(`${prefix}potty_logs`);
      this.pottyLogs = cachedPotty ? JSON.parse(cachedPotty) : [];

      const cachedSleep = localStorage.getItem(`${prefix}sleep_logs`);
      this.sleepLogs = cachedSleep ? JSON.parse(cachedSleep) : [];

      const cachedFeeding = localStorage.getItem(`${prefix}feeding_logs`);
      this.feedingLogs = cachedFeeding ? JSON.parse(cachedFeeding) : [];

      const cachedWalk = localStorage.getItem(`${prefix}walk_logs`);
      this.walkLogs = cachedWalk ? JSON.parse(cachedWalk) : [];

      const cachedLessons = localStorage.getItem(`${prefix}training_lessons`);
      this.trainingLessons = cachedLessons ? JSON.parse(cachedLessons) : [...INITIAL_TRAINING_CURRICULUM];

      const cachedVaccinations = localStorage.getItem(`${prefix}vaccinations`);
      this.vaccinations = cachedVaccinations ? JSON.parse(cachedVaccinations) : [];

      const cachedMedications = localStorage.getItem(`${prefix}medications`);
      this.medications = cachedMedications ? JSON.parse(cachedMedications) : [];

      const cachedAppointments = localStorage.getItem(`${prefix}appointments`);
      this.appointments = cachedAppointments ? JSON.parse(cachedAppointments) : [];

      const cachedExpenses = localStorage.getItem(`${prefix}expenses`);
      this.expenses = cachedExpenses ? JSON.parse(cachedExpenses) : [];

      const cachedDocuments = localStorage.getItem(`${prefix}documents`);
      this.documents = cachedDocuments ? JSON.parse(cachedDocuments) : [];

      const cachedBehavior = localStorage.getItem(`${prefix}behavior_logs`);
      this.behaviorLogs = cachedBehavior ? JSON.parse(cachedBehavior) : [];

      const cachedGrooming = localStorage.getItem(`${prefix}grooming_tasks`);
      this.groomingTasks = cachedGrooming ? JSON.parse(cachedGrooming) : [];

      const cachedSocialization = localStorage.getItem(`${prefix}socialization`);
      this.socialization = cachedSocialization ? JSON.parse(cachedSocialization) : [];

      const cachedJournal = localStorage.getItem(`${prefix}journal`);
      this.journal = cachedJournal ? JSON.parse(cachedJournal) : [];

      const cachedFamily = localStorage.getItem(`${prefix}family`);
      this.family = cachedFamily ? JSON.parse(cachedFamily) : [];

      const cachedSettings = localStorage.getItem(`${prefix}settings`);
      this.settings = cachedSettings ? { ...DEFAULT_SETTINGS, ...JSON.parse(cachedSettings) } : { ...DEFAULT_SETTINGS };

      const cachedNotifications = localStorage.getItem(`${prefix}notifications`);
      this.notifications = cachedNotifications ? JSON.parse(cachedNotifications) : [];

      const cachedAIMessages = localStorage.getItem(`${prefix}ai_messages`);
      this.aiMessages = cachedAIMessages ? JSON.parse(cachedAIMessages) : [];

      // Normalize legacy/orphan puppy IDs in cached data
      if (this.puppies.length > 0) {
        const primaryPuppyId = this.puppies[0].id;
        const knownPuppyIds = new Set(this.puppies.map((p) => p.id));
        const resolvePuppyId = (rawId: string | undefined): string => {
          if (rawId && knownPuppyIds.has(rawId) && !rawId.startsWith('pup-')) {
            return rawId;
          }
          return primaryPuppyId || rawId || 'pup-1';
        };
        this.tasks = this.tasks.map(t => ({ ...t, puppyId: resolvePuppyId(t.puppyId) }));
        this.pottyLogs = this.pottyLogs.map(l => ({ ...l, puppyId: resolvePuppyId(l.puppyId) }));
        this.sleepLogs = this.sleepLogs.map(s => ({ ...s, puppyId: resolvePuppyId(s.puppyId) }));
        this.feedingLogs = this.feedingLogs.map(f => ({ ...f, puppyId: resolvePuppyId(f.puppyId) }));
        this.walkLogs = this.walkLogs.map(w => ({ ...w, puppyId: resolvePuppyId(w.puppyId) }));
        this.vaccinations = this.vaccinations.map(v => ({ ...v, puppyId: resolvePuppyId(v.puppyId) }));
        this.medications = this.medications.map(m => ({ ...m, puppyId: resolvePuppyId(m.puppyId) }));
        this.appointments = this.appointments.map(a => ({ ...a, puppyId: resolvePuppyId(a.puppyId) }));
        this.expenses = this.expenses.map(e => ({ ...e, puppyId: resolvePuppyId(e.puppyId) }));
        this.documents = this.documents.map(d => ({ ...d, puppyId: resolvePuppyId(d.puppyId) }));
        this.behaviorLogs = this.behaviorLogs.map(b => ({ ...b, puppyId: resolvePuppyId(b.puppyId) }));
        this.groomingTasks = this.groomingTasks.map(g => ({ ...g, puppyId: resolvePuppyId(g.puppyId) }));
      }

      this.checkDailyTaskRollover();
    } catch (e) {
      console.warn('Error loading cache:', e);
    }
  }

  /**
   * Automatically roll over daily routine tasks when crossing into a new day.
   * Tasks marked completed or skipped on a previous date are reset to pending for today.
   */
  public checkDailyTaskRollover(): boolean {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastDateKey = this.userKey('last_active_date');
    const lastActiveDate = localStorage.getItem(lastDateKey);

    let needsReset = false;
    if (lastActiveDate && lastActiveDate < todayStr) {
      needsReset = true;
    } else {
      needsReset = this.tasks.some(
        (t) => (t.completed || t.skipped) && t.date && t.date < todayStr
      );
    }

    if (needsReset) {
      this.tasks = this.tasks.map((t) => {
        if (!t.date || t.date < todayStr) {
          return {
            ...t,
            completed: false,
            skipped: false,
            completedAt: undefined,
            date: todayStr,
          };
        }
        return t;
      });

      localStorage.setItem(lastDateKey, todayStr);
      this.persistUserCache();
      this.notifyListeners();

      if (this.currentUserId) {
        resetDailyTasksInConvex(undefined, this.currentUserId).catch(() => {});
      }
      return true;
    } else if (!lastActiveDate) {
      localStorage.setItem(lastDateKey, todayStr);
    }
    return false;
  }

  private persistUserCache(): void {
    try {
      const prefix = this.userKey('');
      localStorage.setItem(`${prefix}puppies`, JSON.stringify(this.puppies));
      if (this.activePuppyId) {
        localStorage.setItem(`${prefix}active_puppy_id`, this.activePuppyId);
      } else {
        localStorage.removeItem(`${prefix}active_puppy_id`);
      }
      localStorage.setItem(`${prefix}tasks`, JSON.stringify(this.tasks));
      localStorage.setItem(`${prefix}potty_logs`, JSON.stringify(this.pottyLogs));
      localStorage.setItem(`${prefix}sleep_logs`, JSON.stringify(this.sleepLogs));
      localStorage.setItem(`${prefix}feeding_logs`, JSON.stringify(this.feedingLogs));
      localStorage.setItem(`${prefix}walk_logs`, JSON.stringify(this.walkLogs));
      localStorage.setItem(`${prefix}training_lessons`, JSON.stringify(this.trainingLessons));
      localStorage.setItem(`${prefix}vaccinations`, JSON.stringify(this.vaccinations));
      localStorage.setItem(`${prefix}medications`, JSON.stringify(this.medications));
      localStorage.setItem(`${prefix}appointments`, JSON.stringify(this.appointments));
      localStorage.setItem(`${prefix}expenses`, JSON.stringify(this.expenses));
      localStorage.setItem(`${prefix}documents`, JSON.stringify(this.documents));
      localStorage.setItem(`${prefix}behavior_logs`, JSON.stringify(this.behaviorLogs));
      localStorage.setItem(`${prefix}grooming_tasks`, JSON.stringify(this.groomingTasks));
      localStorage.setItem(`${prefix}socialization`, JSON.stringify(this.socialization));
      localStorage.setItem(`${prefix}journal`, JSON.stringify(this.journal));
      localStorage.setItem(`${prefix}family`, JSON.stringify(this.family));
      localStorage.setItem(`${prefix}settings`, JSON.stringify(this.settings));
      localStorage.setItem(`${prefix}notifications`, JSON.stringify(this.notifications));
      localStorage.setItem(`${prefix}ai_messages`, JSON.stringify(this.aiMessages));
    } catch (e) {
      console.warn('Error persisting user cache:', e);
    }
  }

  clearAllUserData(): void {
    this.puppies = [];
    this.activePuppyId = null;
    this.tasks = [];
    this.pottyLogs = [];
    this.sleepLogs = [];
    this.feedingLogs = [];
    this.walkLogs = [];
    this.vaccinations = [];
    this.medications = [];
    this.appointments = [];
    this.expenses = [];
    this.documents = [];
    this.behaviorLogs = [];
    this.groomingTasks = [];
    this.socialization = [];
    this.journal = [];
    this.family = [];
    this.notifications = [];
    this.aiMessages = [];
    this.settings = { ...DEFAULT_SETTINGS };
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('puplume_offline_mutation_queue');
      } catch {}
    }
    this.persistUserCache();
    this.notifyListeners();
  }

  // Hydrate authoritative state from Convex reactive subscription
  hydrateFromConvex(cloudData: any, userId?: string): void {
    if (!cloudData) return;
    if (userId && this.currentUserId !== userId) {
      this.currentUserId = userId;
    }
    if (!this.currentUserId && cloudData.user?.clerkId) {
      this.currentUserId = cloudData.user.clerkId;
    }

    this.hasHydratedFromConvex = true;

    // 1. Puppies
    if (Array.isArray(cloudData.puppies)) {
      if (cloudData.puppies.length > 0) {
        const rawPuppies = cloudData.puppies.map((p: any) => {
          const pupId = p._id || p.id || 'pup-1';
          const hasPass = Boolean(
            p.hasSmartTagPass ||
            (typeof window !== 'undefined' && localStorage.getItem(`puplume_smart_tag_pass_${pupId}`) === 'true')
          );
          if (hasPass && typeof window !== 'undefined') {
            localStorage.setItem(`puplume_smart_tag_pass_${pupId}`, 'true');
          }
          return {
            id: pupId,
            name: p.name,
            breed: p.breed,
            birthDate: p.birthDate,
            sex: p.sex,
            weightLbs: p.weightLbs,
            photoUrl: p.photoUrl,
            temperament: p.temperament,
            dietaryRestrictions: p.dietaryRestrictions,
            microchipNumber: p.microchipNumber,
            allergies: p.allergies,
            vetClinic: p.vetClinic,
            vetPhone: p.vetPhone,
            vetName: p.vetName,
            insuranceProvider: p.insuranceProvider,
            insurancePolicyNumber: p.insurancePolicyNumber,
            favoriteTreat: p.favoriteTreat,
            adoptionDate: p.adoptionDate,
            createdAt: p.createdAt,
            ownerPhone: p.ownerPhone,
            ownerEmail: p.ownerEmail,
            emergencyContactName: p.emergencyContactName,
            emergencyContactPhone: p.emergencyContactPhone,
            emergencyNotes: p.emergencyNotes,
            isLost: p.isLost ?? false,
            rewardAmount: p.rewardAmount,
            slug: p.slug,
            hasSmartTagPass: hasPass,
            ownerInstagram: p.ownerInstagram,
            ownerFacebook: p.ownerFacebook,
            ownerWhatsApp: p.ownerWhatsApp,
            ownerTelegram: p.ownerTelegram,
            ownerSlack: p.ownerSlack,
            communicationLinks: p.communicationLinks,
          };
        });

        // Deduplicate puppies by trimmed lowercase name and ID
        const seenNames = new Set<string>();
        const seenIds = new Set<string>();
        this.puppies = rawPuppies.filter((p: any) => {
          const nameKey = (p.name || '').trim().toLowerCase();
          if (seenIds.has(p.id) || (nameKey && seenNames.has(nameKey))) {
            return false;
          }
          seenIds.add(p.id);
          if (nameKey) seenNames.add(nameKey);
          return true;
        });

        // Active puppy
        const savedActiveId = cloudData.settings?.activePuppyId;
        if (savedActiveId && this.puppies.some((p) => p.id === savedActiveId)) {
          this.activePuppyId = savedActiveId;
        } else if (this.puppies.length > 0) {
          this.activePuppyId = this.puppies[0].id;
        }
      }
      // If cloudData has 0 puppies but we already have local puppy from onboarding, keep local puppy!
    }

    // 2. Settings
    if (cloudData.settings) {
      this.settings = {
        ...DEFAULT_SETTINGS,
        ...this.settings,
        pottyAlerts: cloudData.settings.pottyAlerts ?? true,
        feedingAlerts: cloudData.settings.feedingAlerts ?? true,
        trainingAlerts: cloudData.settings.trainingAlerts ?? true,
        medAlerts: cloudData.settings.medAlerts ?? true,
        taskAlerts: cloudData.settings.taskAlerts ?? true,
        units: (cloudData.settings.units as 'imperial' | 'metric') || 'imperial',
        activePuppyId: this.activePuppyId ?? cloudData.settings.activePuppyId ?? undefined,
        hasCompletedOnboarding: cloudData.settings.hasCompletedOnboarding ?? (this.puppies.length > 0),
        hasCompletedChecklist: cloudData.settings.hasCompletedChecklist ?? false,
        pottyIntervalMode: cloudData.settings.pottyIntervalMode || 'age_dynamic',
        pottyCustomIntervalHours: cloudData.settings.pottyCustomIntervalHours ?? 2.5,
        quietHoursEnabled: cloudData.settings.quietHoursEnabled !== false,
        quietHoursStart: cloudData.settings.quietHoursStart || '22:00',
        quietHoursEnd: cloudData.settings.quietHoursEnd || '07:00',
        taskAdvanceMinutes: cloudData.settings.taskAdvanceMinutes !== undefined ? cloudData.settings.taskAdvanceMinutes : 15,
        headsUpDurationSec: cloudData.settings.headsUpDurationSec ?? 12,
        snoozeDurationMin: cloudData.settings.snoozeDurationMin ?? 15,
        chimeSound: cloudData.settings.chimeSound !== false,
      };
    }

    const primaryPuppyId = this.puppies[0]?.id;
    const knownPuppyIds = new Set(this.puppies.map((p) => p.id));
    const resolvePuppyId = (rawId: string | undefined): string => {
      if (rawId && knownPuppyIds.has(rawId) && !rawId.startsWith('pup-')) {
        return rawId;
      }
      return primaryPuppyId || rawId || 'pup-1';
    };

    // 3. Tasks - Resilient merge: Never wipe local tasks with an empty cloud response!
    if (Array.isArray(cloudData.tasks)) {
      if (cloudData.tasks.length > 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        const cloudKeys = new Set(cloudData.tasks.map((t: any) => `${t.title}__${t.time}`));
        const mappedCloudTasks: TaskItem[] = cloudData.tasks.map((t: any) => {
          const isPastDate = Boolean(t.date && t.date < todayStr);
          const taskId = t._id || t.id;
          const optimistic = this.getOptimisticTaskState(taskId, t.title);

          const completed = optimistic !== null 
            ? optimistic.completed 
            : (isPastDate ? false : Boolean(t.completed));

          const skipped = optimistic !== null 
            ? optimistic.skipped 
            : (isPastDate ? false : Boolean(t.skipped));

          return {
            id: taskId,
            puppyId: resolvePuppyId(t.puppyId),
            title: t.title,
            category: t.category,
            time: t.time,
            durationMin: t.durationMin,
            completed,
            skipped,
            period: t.period,
            date: todayStr,
            description: t.description,
            notes: t.notes,
            completedAt: completed ? (t.completedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : undefined,
          };
        });

        // Deduplicate mappedCloudTasks by title and time to avoid duplicate task rows
        const seenKeys = new Set<string>();
        const dedupedCloudTasks: TaskItem[] = [];
        for (const task of mappedCloudTasks) {
          const key = `${(task.title || '').toLowerCase().trim()}__${(task.time || '').toLowerCase().trim()}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            dedupedCloudTasks.push(task);
          }
        }

        // Preserve any pending locally created tasks not yet received from cloud
        const pendingLocal = this.tasks.filter((t) => !cloudKeys.has(`${t.title}__${t.time}`));
        this.tasks = [...dedupedCloudTasks, ...pendingLocal];
      }
      // If cloud tasks is empty but we have local tasks (e.g. from onboarding or user added), KEEP local tasks!
    }

    // 4. Potty Logs
    if (Array.isArray(cloudData.pottyLogs)) {
      this.pottyLogs = cloudData.pottyLogs.map((l: any) => ({
        id: l._id || l.id,
        puppyId: resolvePuppyId(l.puppyId),
        type: l.type,
        location: l.location,
        timestamp: l.timestamp,
        notes: l.notes,
      }));
    }

    // 5. Feeding Logs
    if (Array.isArray(cloudData.feedingLogs)) {
      this.feedingLogs = cloudData.feedingLogs.map((l: any) => ({
        id: l._id || l.id,
        puppyId: resolvePuppyId(l.puppyId),
        mealType: l.mealType,
        amountCups: l.amountCups || 1,
        foodBrand: l.foodBrand,
        timestamp: l.timestamp,
        notes: l.notes,
      }));
    }

    // 6. Sleep Logs
    if (Array.isArray(cloudData.sleepLogs)) {
      this.sleepLogs = cloudData.sleepLogs.map((l: any) => ({
        id: l._id || l.id,
        puppyId: resolvePuppyId(l.puppyId),
        type: l.type,
        startTime: l.startTime,
        endTime: l.endTime,
        durationMin: l.durationMin,
        notes: l.notes,
      }));
    }

    // 7. Walk Logs
    if (Array.isArray(cloudData.walkLogs)) {
      this.walkLogs = cloudData.walkLogs.map((l: any) => ({
        id: l._id || l.id,
        puppyId: resolvePuppyId(l.puppyId),
        startTime: l.startTime || l.timestamp,
        durationMin: l.durationMin,
        distanceMiles: l.distanceMiles || 0.5,
        peesCount: l.peesCount || 0,
        poopsCount: l.poopsCount || 0,
        pullingRating: l.pullingRating || 'mild',
        reactivityNotes: l.reactivityNotes,
        notes: l.notes,
      }));
    }

    // 8. Vaccinations
    if (Array.isArray(cloudData.vaccinations)) {
      this.vaccinations = cloudData.vaccinations.map((v: any) => ({
        id: v._id || v.id,
        puppyId: resolvePuppyId(v.puppyId),
        vaccineName: v.vaccineName || v.name || 'Vaccine',
        administeredDate: v.administeredDate,
        nextDueDate: v.nextDueDate || v.dueDate || '',
        vetClinic: v.vetClinic || '',
        status: v.status || 'up_to_date',
        lotNumber: v.lotNumber,
        notes: v.notes,
      }));
    }

    // 9. Medications
    if (Array.isArray(cloudData.medications)) {
      this.medications = cloudData.medications.map((m: any) => ({
        id: m._id || m.id,
        puppyId: resolvePuppyId(m.puppyId),
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        startDate: m.startDate,
        reminderTime: m.reminderTime,
        active: m.active ?? true,
        notes: m.notes,
      }));
    }

    // 10. Appointments
    if (Array.isArray(cloudData.appointments)) {
      this.appointments = cloudData.appointments.map((a: any) => ({
        id: a._id || a.id,
        puppyId: resolvePuppyId(a.puppyId),
        title: a.title,
        clinic: a.clinic,
        date: a.date,
        time: a.time,
        reason: a.reason,
        status: a.status || 'scheduled',
        doctor: a.doctor,
        notes: a.notes,
      }));
    }

    // 11. Expenses
    if (Array.isArray(cloudData.expenses)) {
      this.expenses = cloudData.expenses.map((e: any) => ({
        id: e._id || e.id,
        puppyId: resolvePuppyId(e.puppyId),
        title: e.title,
        category: e.category,
        amount: e.amount,
        date: e.date,
        vendor: e.vendor,
        receiptUrl: e.receiptUrl,
        notes: e.notes,
      }));
    }

    // 12. Documents
    if (Array.isArray(cloudData.documents)) {
      this.documents = cloudData.documents.map((d: any) => ({
        id: d._id || d.id,
        puppyId: resolvePuppyId(d.puppyId),
        title: d.title,
        category: d.category,
        date: d.date,
        fileType: d.fileType,
        fileSize: d.fileSize,
        fileUrl: d.fileUrl,
        notes: d.notes,
      }));
    }

    // 13. Behavior Logs
    if (Array.isArray(cloudData.behaviorLogs)) {
      this.behaviorLogs = cloudData.behaviorLogs.map((b: any) => ({
        id: b._id || b.id,
        puppyId: resolvePuppyId(b.puppyId),
        behaviorType: b.behaviorType,
        timestamp: b.timestamp,
        severity: b.severity || 'mild',
        trigger: b.trigger,
        whatHelped: b.whatHelped,
        notes: b.notes,
      }));
    }

    // 14. Grooming Tasks
    if (Array.isArray(cloudData.groomingTasks)) {
      this.groomingTasks = cloudData.groomingTasks.map((g: any) => ({
        id: g._id || g.id,
        puppyId: resolvePuppyId(g.puppyId),
        type: g.type,
        label: g.label,
        lastDone: g.lastDone,
        nextDue: g.nextDue,
        frequencyDays: g.frequencyDays,
      }));
    }

    // 15. Socialization
    if (Array.isArray(cloudData.socialization)) {
      this.socialization = cloudData.socialization.map((s: any) => ({
        id: s._id || s.id,
        category: s.category,
        title: s.title,
        description: s.description,
        status: s.status,
        lastUpdated: s.lastUpdated,
        notes: s.notes,
      }));
    }

    // 16. Journal
    if (Array.isArray(cloudData.journalEntries)) {
      this.journal = cloudData.journalEntries.map((j: any) => ({
        id: j._id || j.id,
        puppyId: resolvePuppyId(j.puppyId),
        title: j.title,
        date: j.date,
        notes: j.notes,
        mediaUrl: j.mediaUrl,
        milestoneBadge: j.milestoneBadge,
      }));
    }

    // 17. Training Lessons Status
    if (Array.isArray(cloudData.trainingLessons)) {
      const lessonMap = new Map(cloudData.trainingLessons.map((l: any) => [l.lessonId, l]));
      this.trainingLessons = INITIAL_TRAINING_CURRICULUM.map((lesson) => {
        const cloudLesson: any = lessonMap.get(lesson.id);
        if (cloudLesson) {
          return {
            ...lesson,
            completed: cloudLesson.completed,
            mastered: cloudLesson.mastered,
            lastPracticed: cloudLesson.lastPracticed,
          };
        }
        return lesson;
      });
    }

    // 18. Notifications
    if (Array.isArray(cloudData.notifications)) {
      this.notifications = cloudData.notifications.map((n: any) => ({
        id: n._id || n.id,
        title: n.title,
        message: n.message,
        category: n.category,
        timestamp: n.timestamp,
        read: n.read,
      }));
    }

    // 19. AI Messages (REMOVED - Ephemeral Chat is entirely local)

    // 20. Family Members
    if (Array.isArray(cloudData.familyMembers)) {
      this.family = cloudData.familyMembers.map((f: any) => ({
        id: f._id || f.id,
        name: f.name,
        email: f.email,
        role: f.role as any,
        avatarUrl: f.avatarUrl,
        dateAdded: f.dateAdded,
      }));
    }

    this.persistUserCache();
    this.notifyListeners();

    // Permanently repair legacy puppyIds in Convex cloud database in background
    repairLegacyPuppyIdsInConvex(this.currentUserId || undefined).catch(() => {});
  }

  // Puppies
  getPuppies(): PuppyProfile[] {
    return this.puppies;
  }

  getPuppy(): PuppyProfile | null {
    return this.getActivePuppy();
  }

  getActivePuppy(): PuppyProfile | null {
    if (this.puppies.length === 0) return null;
    return this.puppies.find((p) => p.id === this.activePuppyId) || this.puppies[0] || null;
  }

  setActivePuppyId(id: string): void {
    this.activePuppyId = id;
    this.settings.activePuppyId = id;
    this.persistUserCache();
    this.notifyListeners();
    syncSettingsToConvex(this.settings, this.currentUserId || undefined).catch(() => {});
  }

  savePuppy(puppy: PuppyProfile): void {
    const index = this.puppies.findIndex((p) => p.id === puppy.id || p.name === puppy.name);
    if (index >= 0) {
      const existing = this.puppies[index];
      if (existing?.hasSmartTagPass && !puppy.hasSmartTagPass) {
        puppy.hasSmartTagPass = true;
      }
      this.puppies[index] = puppy;
    } else {
      this.puppies.push(puppy);
    }
    this.activePuppyId = puppy.id;
    this.persistUserCache();
    this.notifyListeners();
    syncPuppyToConvex(puppy, this.currentUserId || undefined).catch(() => {});
  }

  private matchesPuppy(recordPuppyId: string | undefined, targetPuppyId: string): boolean {
    if (!targetPuppyId) return true;
    if (this.puppies.length <= 1) return true;
    if (recordPuppyId === targetPuppyId) return true;

    // Check if the record has an unassigned, legacy, or orphan puppyId (e.g. starts with "pup-", or doesn't match any registered puppy)
    const matchesAnyKnownPuppy = this.puppies.some((p) => p.id === recordPuppyId);
    if (!recordPuppyId || !matchesAnyKnownPuppy || recordPuppyId.startsWith('pup-')) {
      // Unassigned/legacy records belong to the primary (first created) puppy
      const primaryPuppy = this.puppies[0];
      return Boolean(primaryPuppy && primaryPuppy.id === targetPuppyId);
    }

    return false;
  }

  // Tasks (Scoped strictly to active or target puppy)
  getTasks(puppyId?: string): TaskItem[] {
    this.checkDailyTaskRollover();
    const targetId = puppyId || this.activePuppyId || this.puppies[0]?.id;
    if (!targetId || this.puppies.length <= 1) return this.tasks;
    return this.tasks.filter((t) => this.matchesPuppy(t.puppyId, targetId));
  }

  getAllTasks(): TaskItem[] {
    return this.tasks;
  }

  resetTasksForPuppy(puppyId?: string): TaskItem[] {
    const targetPuppyId = puppyId || this.activePuppyId || this.puppies[0]?.id;
    const todayStr = new Date().toISOString().split('T')[0];
    this.tasks = this.tasks.map((t) => {
      if (this.matchesPuppy(t.puppyId, targetPuppyId)) {
        return {
          ...t,
          completed: false,
          skipped: false,
          completedAt: undefined,
          date: todayStr,
        };
      }
      return t;
    });
    this.persistUserCache();
    this.notifyListeners();

    if (this.currentUserId) {
      resetDailyTasksInConvex(targetPuppyId, this.currentUserId).catch((e) => {
        console.debug('[storage] resetDailyTasks note:', e);
      });
    }

    return this.getTasks(targetPuppyId);
  }

  saveTasks(tasks: TaskItem[]): void {
    this.tasks = tasks;
    this.persistUserCache();
    this.notifyListeners();
  }

  toggleTask(taskId: string): TaskItem[] {
    let taskTitle = '';
    let targetPuppyId = '';
    let targetCompleted = false;
    const todayStr = new Date().toISOString().split('T')[0];

    this.tasks = this.tasks.map((t) => {
      if (t.id === taskId) {
        taskTitle = t.title;
        targetPuppyId = t.puppyId;
        targetCompleted = !t.completed;
        return {
          ...t,
          completed: targetCompleted,
          skipped: false,
          date: todayStr,
          completedAt: targetCompleted ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
        };
      }
      return t;
    });

    if (taskTitle) {
      this.recordRecentTaskToggle(taskId, taskTitle, targetCompleted);
    }

    this.persistUserCache();
    this.notifyListeners();

    if (taskTitle) {
      toggleTaskInConvex(taskTitle, targetCompleted, this.currentUserId || undefined, taskId, targetPuppyId).catch(() => {});
    }

    return this.tasks;
  }

  skipTask(taskId: string): TaskItem[] {
    let taskTitle = '';
    let targetPuppyId = '';
    const todayStr = new Date().toISOString().split('T')[0];
    this.tasks = this.tasks.map((t) => {
      if (t.id === taskId) {
        taskTitle = t.title;
        targetPuppyId = t.puppyId;
        return {
          ...t,
          completed: false,
          skipped: true,
          date: todayStr,
        };
      }
      return t;
    });

    if (taskTitle) {
      this.recordRecentTaskSkip(taskId, taskTitle);
    }

    this.persistUserCache();
    this.notifyListeners();

    if (taskTitle) {
      skipTaskInConvex(taskTitle, this.currentUserId || undefined, taskId, targetPuppyId).catch(() => {});
    }

    return this.tasks;
  }

  deleteTask(taskId: string): void {
    this.tasks = this.tasks.filter((t) => t.id !== taskId);
    this.persistUserCache();
    this.notifyListeners();

    // Convex IDs vs Local IDs (We attempt to delete in convex if it's a valid ID)
    deleteTaskInConvex(taskId, this.currentUserId || undefined).catch(() => {});
  }

  addTask(task: Omit<TaskItem, 'id'>): TaskItem {
    const activePup = this.getActivePuppy();
    const newTask: TaskItem = {
      ...task,
      id: `task-${Date.now()}`,
      puppyId: task.puppyId || activePup?.id || 'pup-1',
      title: task.title.trim(),
      category: task.category || 'custom',
      time: task.time || '10:00 AM',
      durationMin: Number(task.durationMin) || 15,
      completed: Boolean(task.completed),
      skipped: Boolean(task.skipped),
      period: task.period || 'morning',
      date: task.date || new Date().toISOString().split('T')[0],
      description: task.description || '',
    };
    this.tasks = [newTask, ...this.tasks];
    this.persistUserCache();
    this.notifyListeners();
    syncTaskToConvex(newTask, this.currentUserId || undefined).catch((err) => {
      console.debug('[storage] syncTaskToConvex note:', err);
    });
    return newTask;
  }

  editTask(taskId: string, updates: Partial<Omit<TaskItem, 'id'>>): void {
    let updatedTask: TaskItem | undefined;
    this.tasks = this.tasks.map(t => {
      if (t.id === taskId) {
        updatedTask = { ...t, ...updates };
        return updatedTask;
      }
      return t;
    });

    this.persistUserCache();
    this.notifyListeners();

    if (updatedTask) {
      updateTaskInConvex(updatedTask, this.currentUserId || undefined).catch(() => {});
    }
  }

  // Potty logs (Scoped strictly to active or target puppy)
  getPottyLogs(puppyId?: string): PottyLog[] {
    const targetId = puppyId || this.activePuppyId || this.puppies[0]?.id;
    if (!targetId || this.puppies.length <= 1) return this.pottyLogs;
    return this.pottyLogs.filter((p) => this.matchesPuppy(p.puppyId, targetId));
  }

  addPottyLog(log: Omit<PottyLog, 'id'>): PottyLog {
    const activePup = this.getActivePuppy();
    const newLog: PottyLog = { 
      ...log, 
      id: `potty-${Date.now()}`,
      puppyId: log.puppyId || activePup?.id || 'pup-1',
    };
    this.pottyLogs.unshift(newLog);
    this.persistUserCache();
    this.notifyListeners();
    syncPottyLogToConvex(newLog, this.currentUserId || undefined).catch(() => {});
    return newLog;
  }

  deletePottyLog(id: string): void {
    this.pottyLogs = this.pottyLogs.filter((p) => p.id !== id);
    this.persistUserCache();
    this.notifyListeners();
    deletePottyLogInConvex(id, this.currentUserId || undefined).catch(() => {});
  }

  // Sleep logs (Scoped strictly to active or target puppy)
  getSleepLogs(puppyId?: string): SleepLog[] {
    const targetId = puppyId || this.activePuppyId || this.puppies[0]?.id;
    if (!targetId || this.puppies.length <= 1) return this.sleepLogs;
    return this.sleepLogs.filter((s) => this.matchesPuppy(s.puppyId, targetId));
  }

  addSleepLog(log: Omit<SleepLog, 'id'>): SleepLog {
    const activePup = this.getActivePuppy();
    const newLog: SleepLog = { 
      ...log, 
      id: `sleep-${Date.now()}`,
      puppyId: log.puppyId || activePup?.id || 'pup-1',
    };
    this.sleepLogs.unshift(newLog);
    this.persistUserCache();
    this.notifyListeners();
    syncSleepLogToConvex(newLog, this.currentUserId || undefined).catch(() => {});
    return newLog;
  }

  deleteSleepLog(id: string): void {
    this.sleepLogs = this.sleepLogs.filter((s) => s.id !== id);
    this.persistUserCache();
    this.notifyListeners();
    deleteSleepLogInConvex(id, this.currentUserId || undefined).catch(() => {});
  }

  // Feeding logs (Scoped strictly to active or target puppy)
  getFeedingLogs(puppyId?: string): FeedingLog[] {
    const targetId = puppyId || this.activePuppyId || this.puppies[0]?.id;
    if (!targetId || this.puppies.length <= 1) return this.feedingLogs;
    return this.feedingLogs.filter((f) => this.matchesPuppy(f.puppyId, targetId));
  }

  addFeedingLog(log: Omit<FeedingLog, 'id'>): FeedingLog {
    const activePup = this.getActivePuppy();
    const newLog: FeedingLog = { 
      ...log, 
      id: `feed-${Date.now()}`,
      puppyId: log.puppyId || activePup?.id || 'pup-1',
    };
    this.feedingLogs.unshift(newLog);
    this.persistUserCache();
    this.notifyListeners();
    syncFeedingLogToConvex(newLog, this.currentUserId || undefined).catch(() => {});
    return newLog;
  }

  deleteFeedingLog(id: string): void {
    this.feedingLogs = this.feedingLogs.filter((f) => f.id !== id);
    this.persistUserCache();
    this.notifyListeners();
    deleteFeedingLogInConvex(id, this.currentUserId || undefined).catch(() => {});
  }

  // Walk logs (Scoped strictly to active or target puppy)
  getWalkLogs(puppyId?: string): WalkLog[] {
    const targetId = puppyId || this.activePuppyId || this.puppies[0]?.id;
    if (!targetId || this.puppies.length <= 1) return this.walkLogs;
    return this.walkLogs.filter((w) => this.matchesPuppy(w.puppyId, targetId));
  }

  addWalkLog(log: Omit<WalkLog, 'id'>): WalkLog {
    const activePup = this.getActivePuppy();
    const newLog: WalkLog = { 
      ...log, 
      id: `walk-${Date.now()}`,
      puppyId: log.puppyId || activePup?.id || 'pup-1',
    };
    this.walkLogs.unshift(newLog);
    this.persistUserCache();
    this.notifyListeners();
    syncWalkLogToConvex(newLog, this.currentUserId || undefined).catch(() => {});
    return newLog;
  }

  deleteWalkLog(id: string): void {
    this.walkLogs = this.walkLogs.filter((w) => w.id !== id);
    this.persistUserCache();
    this.notifyListeners();
    deleteWalkLogInConvex(id, this.currentUserId || undefined).catch(() => {});
  }

  // Training
  getTrainingLessons(): TrainingLesson[] {
    return this.trainingLessons;
  }

  saveTrainingLessons(lessons: TrainingLesson[]): void {
    this.trainingLessons = lessons;
    this.persistUserCache();
    this.notifyListeners();
  }

  updateLessonStatus(lessonId: string, completed: boolean, mastered: boolean): TrainingLesson[] {
    this.trainingLessons = this.trainingLessons.map((l) => {
      if (l.id === lessonId) {
        return {
          ...l,
          completed,
          mastered,
          lastPracticed: new Date().toISOString().split('T')[0],
        };
      }
      return l;
    });

    this.persistUserCache();
    this.notifyListeners();

    const activePup = this.getActivePuppy();
    if (activePup) {
      syncTrainingLessonToConvex(activePup.id, lessonId, completed, mastered, this.currentUserId || undefined).catch(() => {});
    }

    return this.trainingLessons;
  }

  // Health records (Scoped strictly to active or target puppy)
  getVaccinations(puppyId?: string): VaccinationRecord[] {
    const targetId = puppyId || this.activePuppyId || this.puppies[0]?.id;
    if (!targetId || this.puppies.length <= 1) return this.vaccinations;
    return this.vaccinations.filter((v) => this.matchesPuppy(v.puppyId, targetId));
  }

  addVaccination(v: Omit<VaccinationRecord, 'id'>): VaccinationRecord {
    const activePup = this.getActivePuppy();
    const newVac: VaccinationRecord = { 
      ...v, 
      id: `vac-${Date.now()}`,
      puppyId: v.puppyId || activePup?.id || 'pup-1',
    };
    this.vaccinations.push(newVac);
    this.persistUserCache();
    this.notifyListeners();
    syncVaccinationToConvex(newVac, this.currentUserId || undefined).catch(() => {});
    return newVac;
  }

  deleteVaccination(id: string): void {
    this.vaccinations = this.vaccinations.filter((v) => v.id !== id);
    this.persistUserCache();
    this.notifyListeners();
    deleteVaccinationInConvex(id, this.currentUserId || undefined).catch(() => {});
  }

  getMedications(puppyId?: string): MedicationRecord[] {
    const targetId = puppyId || this.activePuppyId || this.puppies[0]?.id;
    if (!targetId || this.puppies.length <= 1) return this.medications;
    return this.medications.filter((m) => this.matchesPuppy(m.puppyId, targetId));
  }

  addMedication(m: Omit<MedicationRecord, 'id'>): MedicationRecord {
    const activePup = this.getActivePuppy();
    const newMed: MedicationRecord = { 
      ...m, 
      id: `med-${Date.now()}`,
      puppyId: m.puppyId || activePup?.id || 'pup-1',
    };
    this.medications.push(newMed);
    this.persistUserCache();
    this.notifyListeners();
    syncMedicationToConvex(newMed, this.currentUserId || undefined).catch(() => {});
    return newMed;
  }

  deleteMedication(id: string): void {
    this.medications = this.medications.filter((m) => m.id !== id);
    this.persistUserCache();
    this.notifyListeners();
    deleteMedicationInConvex(id, this.currentUserId || undefined).catch(() => {});
  }

  getAppointments(puppyId?: string): VetAppointment[] {
    const targetId = puppyId || this.activePuppyId || this.puppies[0]?.id;
    if (!targetId || this.puppies.length <= 1) return this.appointments;
    return this.appointments.filter((a) => this.matchesPuppy(a.puppyId, targetId));
  }

  addAppointment(a: Omit<VetAppointment, 'id'>): VetAppointment {
    const activePup = this.getActivePuppy();
    const newApt: VetAppointment = { 
      ...a, 
      id: `apt-${Date.now()}`,
      puppyId: a.puppyId || activePup?.id || 'pup-1',
    };
    this.appointments.push(newApt);
    this.persistUserCache();
    this.notifyListeners();
    syncAppointmentToConvex(newApt, this.currentUserId || undefined).catch(() => {});
    return newApt;
  }

  deleteAppointment(id: string): void {
    this.appointments = this.appointments.filter((a) => a.id !== id);
    this.persistUserCache();
    this.notifyListeners();
    deleteAppointmentInConvex(id, this.currentUserId || undefined).catch(() => {});
  }

  // Expenses (Scoped strictly to active or target puppy)
  getExpenses(puppyId?: string): ExpenseRecord[] {
    const targetId = puppyId || this.activePuppyId || this.puppies[0]?.id;
    if (!targetId || this.puppies.length <= 1) return this.expenses;
    return this.expenses.filter((e) => this.matchesPuppy(e.puppyId, targetId));
  }

  addExpense(e: Omit<ExpenseRecord, 'id'>): ExpenseRecord {
    const activePup = this.getActivePuppy();
    const newExp: ExpenseRecord = { 
      ...e, 
      id: `exp-${Date.now()}`,
      puppyId: e.puppyId || activePup?.id || 'pup-1',
    };
    this.expenses.unshift(newExp);
    this.persistUserCache();
    this.notifyListeners();
    syncExpenseToConvex(newExp, this.currentUserId || undefined).catch(() => {});
    return newExp;
  }

  deleteExpense(id: string): void {
    this.expenses = this.expenses.filter((e) => e.id !== id);
    this.persistUserCache();
    this.notifyListeners();
    deleteExpenseInConvex(id, this.currentUserId || undefined).catch(() => {});
  }

  // Documents (Scoped strictly to active or target puppy)
  getDocuments(puppyId?: string): DocumentRecord[] {
    const targetId = puppyId || this.activePuppyId || this.puppies[0]?.id;
    if (!targetId || this.puppies.length <= 1) return this.documents;
    return this.documents.filter((d) => this.matchesPuppy(d.puppyId, targetId));
  }

  addDocument(d: Omit<DocumentRecord, 'id'>): DocumentRecord {
    const activePup = this.getActivePuppy();
    const newDoc: DocumentRecord = { 
      ...d, 
      id: `doc-${Date.now()}`,
      puppyId: d.puppyId || activePup?.id || 'pup-1',
    };
    this.documents.unshift(newDoc);
    this.persistUserCache();
    this.notifyListeners();
    syncDocumentToConvex(newDoc, this.currentUserId || undefined).catch(() => {});
    return newDoc;
  }

  deleteDocument(id: string): void {
    this.documents = this.documents.filter((d) => d.id !== id);
    this.persistUserCache();
    this.notifyListeners();
    removeDocumentFromConvex(id, this.currentUserId || undefined).catch(() => {});
  }

  // Behavior (Scoped strictly to active or target puppy)
  getBehaviorLogs(puppyId?: string): BehaviorIncident[] {
    const targetId = puppyId || this.activePuppyId || this.puppies[0]?.id;
    if (!targetId || this.puppies.length <= 1) return this.behaviorLogs;
    return this.behaviorLogs.filter((b) => this.matchesPuppy(b.puppyId, targetId));
  }

  addBehaviorIncident(b: Omit<BehaviorIncident, 'id'>): BehaviorIncident {
    const activePup = this.getActivePuppy();
    const newBeh: BehaviorIncident = { 
      ...b, 
      id: `beh-${Date.now()}`,
      puppyId: b.puppyId || activePup?.id || 'pup-1',
    };
    this.behaviorLogs.unshift(newBeh);
    this.persistUserCache();
    this.notifyListeners();
    syncBehaviorLogToConvex(newBeh, this.currentUserId || undefined).catch(() => {});
    return newBeh;
  }

  deleteBehaviorIncident(id: string): void {
    this.behaviorLogs = this.behaviorLogs.filter((b) => b.id !== id);
    this.persistUserCache();
    this.notifyListeners();
    deleteBehaviorLogInConvex(id, this.currentUserId || undefined).catch(() => {});
  }

  // Grooming & Socialization
  getGroomingTasks(puppyId?: string): GroomingTask[] {
    const targetId = puppyId || this.activePuppyId || this.puppies[0]?.id;
    if (!targetId || this.puppies.length <= 1) return this.groomingTasks;
    return this.groomingTasks.filter((g) => this.matchesPuppy(g.puppyId, targetId));
  }

  saveGroomingTasks(tasks: GroomingTask[]): void {
    this.groomingTasks = tasks;
    this.persistUserCache();
    this.notifyListeners();
    const activePup = this.getActivePuppy();
    if (activePup) {
      syncGroomingTasksToConvex(activePup.id, tasks, this.currentUserId || undefined).catch(() => {});
    }
  }

  getSocialization(): SocializationItem[] {
    return this.socialization;
  }

  updateSocializationStatus(id: string, status: SocializationStatus, notes?: string): SocializationItem[] {
    let updatedItem: SocializationItem | null = null;
    this.socialization = this.socialization.map((item) => {
      if (item.id === id) {
        const itemUpdated = {
          ...item,
          status,
          notes: notes !== undefined ? notes : item.notes,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
        updatedItem = itemUpdated;
        return itemUpdated;
      }
      return item;
    });

    this.persistUserCache();
    this.notifyListeners();

    const activePup = this.getActivePuppy();
    if (activePup && updatedItem) {
      syncSocializationToConvex(activePup.id, updatedItem, this.currentUserId || undefined).catch(() => {});
    }

    return this.socialization;
  }

  addSocializationItem(item: {
    puppyId?: string;
    title: string;
    category: string;
    status: any;
    description?: string;
    notes?: string;
  }): SocializationItem {
    const activePup = this.getActivePuppy();
    const newItem: SocializationItem = {
      id: `soc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      category: item.category,
      title: item.title,
      description: item.description || '',
      status: item.status,
      notes: item.notes,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    this.socialization.push(newItem);
    this.persistUserCache();
    this.notifyListeners();
    if (activePup) {
      syncSocializationToConvex(activePup.id, newItem, this.currentUserId || undefined).catch(() => {});
    }
    return newItem;
  }

  // Journal (Scoped strictly to active or target puppy)
  getJournal(puppyId?: string): JournalEntry[] {
    const targetId = puppyId || this.activePuppyId || this.puppies[0]?.id;
    if (!targetId || this.puppies.length <= 1) return this.journal;
    return this.journal.filter((j) => !j.puppyId || j.puppyId === targetId);
  }

  addJournalEntry(j: Omit<JournalEntry, 'id'>): JournalEntry {
    const activePup = this.getActivePuppy();
    const newEntry: JournalEntry = { 
      ...j, 
      id: `jrn-${Date.now()}`,
      puppyId: j.puppyId || activePup?.id || 'pup-1',
    };
    this.journal.unshift(newEntry);
    this.persistUserCache();
    this.notifyListeners();
    syncJournalEntryToConvex(newEntry, this.currentUserId || undefined).catch(() => {});
    return newEntry;
  }

  deleteJournalEntry(id: string): void {
    this.journal = this.journal.filter((j) => j.id !== id);
    this.persistUserCache();
    this.notifyListeners();
    deleteJournalEntryInConvex(id, this.currentUserId || undefined).catch(() => {});
  }

  // Family
  getFamily(): FamilyMember[] {
    return this.family;
  }

  saveFamily(members: FamilyMember[]): void {
    this.family = members;
    this.persistUserCache();
    this.notifyListeners();
  }

  addFamilyMember(m: Omit<FamilyMember, 'id'>): FamilyMember {
    const newMember: FamilyMember = { ...m, id: `fam-${Date.now()}` };
    this.family.push(newMember);
    this.persistUserCache();
    this.notifyListeners();
    const activePup = this.getActivePuppy();
    syncFamilyMemberToConvex(
      {
        puppyId: activePup?.id,
        name: newMember.name,
        email: newMember.email,
        role: newMember.role,
        avatarUrl: newMember.avatarUrl,
        dateAdded: newMember.dateAdded,
      },
      this.currentUserId || undefined
    ).catch(() => {});
    return newMember;
  }

  removeFamilyMember(id: string): void {
    this.family = this.family.filter((f) => f.id !== id);
    this.persistUserCache();
    this.notifyListeners();
    removeFamilyMemberFromConvex(id, this.currentUserId || undefined).catch(() => {});
  }

  // Notifications
  getNotifications(): NotificationItem[] {
    return this.notifications;
  }

  addNotification(notification: NotificationItem): void {
    this.notifications = [notification, ...this.notifications.slice(0, 49)];
    this.persistUserCache();
    this.notifyListeners();
    syncNotificationToConvex(
      {
        title: notification.title,
        message: notification.message,
        category: notification.category,
        timestamp: notification.timestamp,
        actionUrl: notification.actionUrl,
      },
      this.currentUserId || undefined
    ).catch(() => {});
  }

  saveNotifications(notifications: NotificationItem[]): void {
    this.notifications = notifications.slice(0, 50);
    this.persistUserCache();
    this.notifyListeners();
  }

  markNotificationRead(id: string): void {
    this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    this.persistUserCache();
    this.notifyListeners();
    syncNotificationReadToConvex(id, this.currentUserId || undefined).catch(() => {});
  }

  markAllNotificationsRead(): void {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    this.persistUserCache();
    this.notifyListeners();
    syncAllNotificationsReadToConvex(this.currentUserId || undefined).catch(() => {});
  }

  // AI Chat
  getAIMessages(): AIMessage[] {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    const filtered = this.aiMessages.filter(msg => {
      // For old messages without createdAt, try to parse from ID
      let created = msg.createdAt;
      if (!created) {
        const parts = msg.id.split('-');
        if (parts.length > 1) {
          created = parseInt(parts[1], 10);
        }
      }
      
      if (!created || isNaN(created)) return false; // Delete malformed
      return now - created < twentyFourHours;
    });

    if (filtered.length !== this.aiMessages.length) {
      this.aiMessages = filtered;
      this.persistUserCache();
    }
    
    return this.aiMessages;
  }

  saveAIMessages(messages: AIMessage[]): void {
    this.aiMessages = messages;
    this.persistUserCache();
    this.notifyListeners();
  }

  addAIMessage(msg: AIMessage): void {
    this.aiMessages.push(msg);
    this.persistUserCache();
    this.notifyListeners();
  }

  // User Settings
  getSettings(): UserSettingsData {
    return this.settings;
  }

  saveSettings(newSettings: Partial<UserSettingsData>): UserSettingsData {
    this.settings = { ...this.settings, ...newSettings };
    this.persistUserCache();
    this.notifyListeners();
    syncSettingsToConvex(this.settings, this.currentUserId || undefined).catch(() => {});
    return this.settings;
  }

  // Session
  getSession(): UserSession {
    return {
      isAuthenticated: !!this.currentUserId,
      email: '',
      name: '',
      plan: 'premium',
    };
  }

  saveSession(_session: UserSession): void {
    // Session is handled via Clerk
  }

  // Clear active session on Sign-out (Crucial: DOES NOT DELETE CLOUD DATA)
  clearActiveSession(): void {
    if (this.currentUserId) {
      const prefix = `puplume_u_${this.currentUserId}_`;
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    }

    // Also wipe local unauthenticated cache to be absolutely sure nothing is left behind
    const localKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('puplume_local_')) {
        localKeys.push(key);
      }
    }
    localKeys.forEach(k => localStorage.removeItem(k));

    this.currentUserId = null;
    this.hasHydratedFromConvex = false;
    this.clearAll();
  }

  clearAll(): void {
    this.puppies = [];
    this.activePuppyId = null;
    this.tasks = [];
    this.pottyLogs = [];
    this.sleepLogs = [];
    this.feedingLogs = [];
    this.walkLogs = [];
    this.trainingLessons = [...INITIAL_TRAINING_CURRICULUM];
    this.vaccinations = [];
    this.medications = [];
    this.appointments = [];
    this.expenses = [];
    this.documents = [];
    this.behaviorLogs = [];
    this.groomingTasks = [];
    this.socialization = [];
    this.journal = [];
    this.family = [];
    this.notifications = [];
    this.aiMessages = [];
    this.settings = { ...DEFAULT_SETTINGS };
    this.persistUserCache();
    this.notifyListeners();
  }

  resetAll(): void {
    this.clearAll();
  }

  resetToDefaults(): void {
    this.clearAll();
  }

  // Export data as JSON
  exportDataJSON(): string {
    const data = {
      puppy: this.getActivePuppy(),
      tasks: this.getTasks(),
      potty: this.getPottyLogs(),
      sleep: this.getSleepLogs(),
      feeding: this.getFeedingLogs(),
      walks: this.getWalkLogs(),
      training: this.getTrainingLessons(),
      vaccinations: this.getVaccinations(),
      medications: this.getMedications(),
      appointments: this.getAppointments(),
      expenses: this.getExpenses(),
      documents: this.getDocuments(),
      behavior: this.getBehaviorLogs(),
      socialization: this.getSocialization(),
      journal: this.getJournal(),
      grooming: this.getGroomingTasks(),
      family: this.getFamily(),
      settings: this.getSettings(),
      exportedAt: new Date().toISOString(),
      version: '2.0.0-convex',
    };
    return JSON.stringify(data, null, 2);
  }

  // Import data from JSON backup and synchronize to cloud
  async importDataJSON(data: any): Promise<boolean> {
    if (!data || typeof data !== 'object') return false;

    if (data.puppy) {
      this.savePuppy(data.puppy);
    }
    if (Array.isArray(data.tasks)) {
      this.tasks = data.tasks;
    }
    if (Array.isArray(data.potty || data.pottyLogs)) {
      this.pottyLogs = data.potty || data.pottyLogs;
    }
    if (Array.isArray(data.sleep || data.sleepLogs)) {
      this.sleepLogs = data.sleep || data.sleepLogs;
    }
    if (Array.isArray(data.feeding || data.feedingLogs)) {
      this.feedingLogs = data.feeding || data.feedingLogs;
    }
    if (Array.isArray(data.walks || data.walkLogs)) {
      this.walkLogs = data.walks || data.walkLogs;
    }
    if (Array.isArray(data.training || data.trainingLessons)) {
      this.trainingLessons = data.training || data.trainingLessons;
    }
    if (Array.isArray(data.vaccinations)) {
      this.vaccinations = data.vaccinations;
    }
    if (Array.isArray(data.medications)) {
      this.medications = data.medications;
    }
    if (Array.isArray(data.appointments)) {
      this.appointments = data.appointments;
    }
    if (Array.isArray(data.expenses)) {
      this.expenses = data.expenses;
    }
    if (Array.isArray(data.documents)) {
      this.documents = data.documents;
    }
    if (Array.isArray(data.behavior || data.behaviorLogs)) {
      this.behaviorLogs = data.behavior || data.behaviorLogs;
    }
    if (Array.isArray(data.grooming || data.groomingTasks)) {
      this.groomingTasks = data.grooming || data.groomingTasks;
    }
    if (Array.isArray(data.socialization)) {
      this.socialization = data.socialization;
    }
    if (Array.isArray(data.journal || data.journalEntries)) {
      this.journal = data.journal || data.journalEntries;
    }
    if (Array.isArray(data.family || data.familyMembers)) {
      this.family = data.family || data.familyMembers;
    }
    if (data.settings && typeof data.settings === 'object') {
      this.settings = { ...this.settings, ...data.settings };
    }

    this.persistUserCache();
    this.notifyListeners();

    // Trigger full background sync to Convex
    if (this.currentUserId) {
      this.syncFullStateToConvex(this.currentUserId).catch((err) => {
        console.debug('[storage] Background sync after import note:', err);
      });
    }

    return true;
  }

  // Generate .ICS Calendar File
  generateICSFile(puppyName: string, puppyId?: string): string {
    const appointments = this.getAppointments(puppyId);
    const tasks = this.getTasks(puppyId).filter((t) => t.category === 'health' || t.category === 'training');

    let ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PupLume//AI Puppy Manager//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${puppyName} - PupLume Schedule`,
    ];

    appointments.forEach((apt) => {
      const dt = apt.date.replace(/-/g, '');
      const timeClean = apt.time.replace(/[^0-9]/g, '').padEnd(4, '0');
      ics.push(
        'BEGIN:VEVENT',
        `UID:apt-${apt.id}@puplume.pet`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART:${dt}T${timeClean}00Z`,
        `SUMMARY:${apt.title} - ${puppyName}`,
        `DESCRIPTION:${apt.reason}. Doctor: ${apt.doctor || 'Vet'}. Clinic: ${apt.clinic}`,
        `LOCATION:${apt.clinic}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    });

    tasks.forEach((t) => {
      const dt = t.date.replace(/-/g, '');
      ics.push(
        'BEGIN:VEVENT',
        `UID:task-${t.id}@puplume.pet`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART:${dt}T090000Z`,
        `SUMMARY:[PupLume] ${t.title}`,
        `DESCRIPTION:${t.description || ''}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    });

    ics.push('END:VCALENDAR');
    return ics.join('\r\n');
  }

  clearSession(): void {
    this.clearActiveSession();
  }

  // 24/7 Real-Time Cloud Synchronization to Convex
  async syncFullStateToConvex(userId?: string): Promise<void> {
    const uid = userId || this.currentUserId;
    if (!uid) return;

    try {
      const pup = this.getActivePuppy();
      if (pup) {
        await syncPuppyToConvex(pup, uid);
      }

      for (const t of this.tasks) {
        await syncTaskToConvex(t, uid);
      }
      for (const p of this.pottyLogs) {
        await syncPottyLogToConvex(p, uid);
      }
      for (const f of this.feedingLogs) {
        await syncFeedingLogToConvex(f, uid);
      }
      for (const s of this.sleepLogs) {
        await syncSleepLogToConvex(s, uid);
      }
      for (const w of this.walkLogs) {
        await syncWalkLogToConvex(w, uid);
      }
      for (const v of this.vaccinations) {
        await syncVaccinationToConvex(v, uid);
      }
      for (const m of this.medications) {
        await syncMedicationToConvex(m, uid);
      }
      for (const a of this.appointments) {
        await syncAppointmentToConvex(a, uid);
      }
      for (const e of this.expenses) {
        await syncExpenseToConvex(e, uid);
      }
      for (const d of this.documents) {
        await syncDocumentToConvex(d, uid);
      }
      for (const b of this.behaviorLogs) {
        await syncBehaviorLogToConvex(b, uid);
      }
      if (pup && this.groomingTasks.length > 0) {
        await syncGroomingTasksToConvex(pup.id, this.groomingTasks, uid);
      }
      if (pup) {
        for (const s of this.socialization) {
          await syncSocializationToConvex(pup.id, s, uid);
        }
        for (const l of this.trainingLessons) {
          if (l.completed || l.mastered) {
            await syncTrainingLessonToConvex(pup.id, l.id, l.completed, l.mastered, uid);
          }
        }
      }
      for (const j of this.journal) {
        await syncJournalEntryToConvex(j, uid);
      }
      for (const f of this.family) {
        await syncFamilyMemberToConvex(
          {
            puppyId: pup?.id,
            name: f.name,
            email: f.email,
            role: f.role,
            avatarUrl: f.avatarUrl,
            dateAdded: f.dateAdded,
          },
          uid
        );
      }
      await syncSettingsToConvex(this.settings, uid);
    } catch (e) {
      console.debug('[StorageManager] syncFullStateToConvex error:', e);
    }
  }
}

export const storage = new StorageManager();
