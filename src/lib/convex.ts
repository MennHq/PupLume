import { ConvexReactClient } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  PuppyProfile,
  TaskItem,
  PottyLog,
  FeedingLog,
  SleepLog,
  WalkLog,
  VaccinationRecord,
  MedicationRecord,
  VetAppointment,
  ExpenseRecord,
  DocumentRecord,
  BehaviorIncident,
  GroomingTask,
  JournalEntry,
} from "../types";

const convexUrl =
  import.meta.env.VITE_CONVEX_URL ||
  "https://energetic-partridge-407.convex.cloud";

export const convex = new ConvexReactClient(convexUrl);

export const CONVEX_DEPLOYMENT =
  import.meta.env.CONVEX_DEPLOYMENT ||
  "dev:energetic-partridge-407|eyJ2MiI6ImIyZjQ0MTY2YjEwYjQzMThiODNhNThlZWMyYTJmMGI0In0=";

import { offlineQueue } from "./offlineQueue";

// Helper to run mutation with instant offline queue fallback
async function runWithOfflineQueue<T>(
  mutationType: string,
  payload: any,
  fn: () => Promise<T>
): Promise<boolean> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    offlineQueue.enqueue(mutationType, payload);
    return true;
  }
  try {
    await fn();
    return true;
  } catch (err) {
    console.debug(`[Convex] ${mutationType} note:`, err);
    offlineQueue.enqueue(mutationType, payload);
    return true;
  }
}

// Async background mutation helpers to Convex
export async function syncPuppyToConvex(
  puppy: PuppyProfile,
  userId?: string
): Promise<boolean> {
  const payload = {
    userId,
    id: puppy.id,
    name: puppy.name,
    breed: puppy.breed,
    birthDate: puppy.birthDate,
    sex: puppy.sex,
    weightLbs: puppy.weightLbs,
    photoUrl: puppy.photoUrl,
    temperament: puppy.temperament,
    dietaryRestrictions: puppy.dietaryRestrictions,
    microchipNumber: puppy.microchipNumber,
    allergies: puppy.allergies,
    vetClinic: puppy.vetClinic,
    vetPhone: puppy.vetPhone,
    vetName: puppy.vetName,
    insuranceProvider: puppy.insuranceProvider,
    insurancePolicyNumber: puppy.insurancePolicyNumber,
    favoriteTreat: puppy.favoriteTreat,
    adoptionDate: puppy.adoptionDate,
    createdAt: puppy.createdAt,
    ownerPhone: puppy.ownerPhone,
    ownerEmail: puppy.ownerEmail,
    emergencyContactName: puppy.emergencyContactName,
    emergencyContactPhone: puppy.emergencyContactPhone,
    emergencyNotes: puppy.emergencyNotes,
    isLost: puppy.isLost,
    rewardAmount: puppy.rewardAmount,
    slug: puppy.slug,
    hasSmartTagPass: puppy.hasSmartTagPass,
    allowSearchIndexing: puppy.allowSearchIndexing,
    ownerInstagram: puppy.ownerInstagram,
    ownerFacebook: puppy.ownerFacebook,
    ownerWhatsApp: puppy.ownerWhatsApp,
    ownerTelegram: puppy.ownerTelegram,
    ownerSlack: puppy.ownerSlack,
    communicationLinks: puppy.communicationLinks,
  };
  return runWithOfflineQueue("puppies:savePuppy", payload, () =>
    convex.mutation(api.puppies.savePuppy, payload)
  );
}

export async function syncTaskToConvex(
  task: TaskItem,
  userId?: string
): Promise<boolean> {
  const payload = {
    userId,
    puppyId: task.puppyId,
    title: task.title,
    category: task.category,
    time: task.time,
    durationMin: task.durationMin,
    period: task.period,
    date: task.date,
    description: task.description,
    notes: task.notes,
  };
  return runWithOfflineQueue("tasks:createTask", payload, () =>
    convex.mutation(api.tasks.createTask, payload)
  );
}

export async function toggleTaskInConvex(
  title: string,
  completed: boolean,
  userId?: string,
  id?: string,
  puppyId?: string
): Promise<boolean> {
  const isValidConvexId = Boolean(id && !id.startsWith('task-'));
  const payload: any = {
    userId,
    title,
    completed,
  };
  if (isValidConvexId) {
    payload.id = id;
  }
  if (puppyId) {
    payload.puppyId = puppyId;
  }
  return runWithOfflineQueue("tasks:toggleTask", payload, () =>
    convex.mutation(api.tasks.toggleTask, payload)
  );
}

export async function skipTaskInConvex(
  title: string,
  userId?: string,
  id?: string,
  puppyId?: string
): Promise<boolean> {
  const isValidConvexId = Boolean(id && !id.startsWith('task-'));
  const payload: any = {
    userId,
    title,
  };
  if (isValidConvexId) {
    payload.id = id;
  }
  if (puppyId) {
    payload.puppyId = puppyId;
  }
  return runWithOfflineQueue("tasks:skipTask", payload, () =>
    convex.mutation(api.tasks.skipTask, payload)
  );
}

export async function deleteTaskInConvex(
  id: string,
  userId?: string
): Promise<boolean> {
  if (!id || id.startsWith('task-')) {
    return true;
  }
  const payload = {
    id: id as any,
    userId,
  };
  return runWithOfflineQueue("tasks:deleteTask", payload, () =>
    convex.mutation(api.tasks.deleteTask, payload)
  );
}

export async function updateTaskInConvex(
  task: TaskItem,
  userId?: string
): Promise<boolean> {
  if (!task.id || task.id.startsWith('task-')) {
    return syncTaskToConvex(task, userId);
  }
  const payload = {
    id: task.id as any,
    userId,
    puppyId: task.puppyId,
    title: task.title,
    category: task.category,
    time: task.time,
    durationMin: task.durationMin,
    period: task.period,
    description: task.description,
  };
  return runWithOfflineQueue("tasks:updateTask", payload, () =>
    convex.mutation(api.tasks.updateTask, payload)
  );
}

export async function repairLegacyPuppyIdsInConvex(userId?: string): Promise<any> {
  try {
    return await convex.mutation(api.app.repairLegacyPuppyIds, { userId });
  } catch (e) {
    console.debug('[convex] repairLegacyPuppyIds note:', e);
    return null;
  }
}

export async function resetDailyTasksInConvex(puppyId?: string, userId?: string, force?: boolean): Promise<any> {
  const payload = { userId, puppyId, force };
  return runWithOfflineQueue("tasks:resetDailyTasks", payload, () =>
    convex.mutation(api.tasks.resetDailyTasks, payload)
  );
}

export async function syncPottyLogToConvex(
  log: PottyLog,
  userId?: string
): Promise<boolean> {
  const payload = {
    userId,
    puppyId: log.puppyId,
    type: log.type,
    location: log.location,
    timestamp: log.timestamp,
    notes: log.notes,
  };
  return runWithOfflineQueue("potty:addPottyLog", payload, () =>
    convex.mutation(api.potty.addPottyLog, payload)
  );
}

export async function syncFeedingLogToConvex(
  log: FeedingLog,
  userId?: string
): Promise<boolean> {
  const payload = {
    userId,
    puppyId: log.puppyId,
    mealType: log.mealType,
    amountCups: log.amountCups,
    foodBrand: log.foodBrand,
    timestamp: log.timestamp,
    notes: log.notes,
  };
  return runWithOfflineQueue("feeding:addFeedingLog", payload, () =>
    convex.mutation(api.feeding.addFeedingLog, payload)
  );
}

export async function syncSleepLogToConvex(
  log: SleepLog,
  userId?: string
): Promise<boolean> {
  const payload = {
    userId,
    puppyId: log.puppyId,
    type: log.type,
    startTime: log.startTime,
    endTime: log.endTime,
    durationMin: log.durationMin,
    notes: log.notes,
  };
  return runWithOfflineQueue("sleep:addSleepLog", payload, () =>
    convex.mutation(api.sleep.addSleepLog, payload)
  );
}

export async function syncWalkLogToConvex(
  log: WalkLog,
  userId?: string
): Promise<boolean> {
  const payload = {
    userId,
    puppyId: log.puppyId,
    durationMin: log.durationMin,
    distanceMiles: log.distanceMiles,
    peesCount: log.peesCount,
    poopsCount: log.poopsCount,
    pullingRating: log.pullingRating,
    reactivityNotes: log.reactivityNotes,
    timestamp: log.startTime || new Date().toISOString(),
    notes: log.notes,
  };
  return runWithOfflineQueue("walk:addWalkLog", payload, () =>
    convex.mutation(api.walk.addWalkLog, payload)
  );
}

export async function syncVaccinationToConvex(
  v: VaccinationRecord,
  userId?: string
): Promise<boolean> {
  const payload = {
    userId,
    puppyId: v.puppyId,
    name: v.vaccineName,
    vaccineName: v.vaccineName,
    status: v.status,
    administeredDate: v.administeredDate,
    dueDate: v.nextDueDate,
    nextDueDate: v.nextDueDate,
    vetClinic: v.vetClinic,
    lotNumber: v.lotNumber,
    isCore: true,
    notes: v.notes,
  };
  return runWithOfflineQueue("health:addVaccination", payload, () =>
    convex.mutation(api.health.addVaccination, payload)
  );
}

export async function syncMedicationToConvex(
  m: MedicationRecord,
  userId?: string
): Promise<boolean> {
  const payload = {
    userId,
    puppyId: m.puppyId,
    name: m.name,
    dosage: m.dosage,
    frequency: m.frequency,
    startDate: m.startDate,
    reminderTime: m.reminderTime,
    active: m.active,
    notes: m.notes,
  };
  return runWithOfflineQueue("health:addMedication", payload, () =>
    convex.mutation(api.health.addMedication, payload)
  );
}

export async function syncAppointmentToConvex(
  a: VetAppointment,
  userId?: string
): Promise<boolean> {
  const payload = {
    userId,
    puppyId: a.puppyId,
    title: a.title,
    clinic: a.clinic,
    date: a.date,
    time: a.time,
    reason: a.reason,
    status: a.status,
    doctor: a.doctor,
    notes: a.notes,
  };
  return runWithOfflineQueue("health:addAppointment", payload, () =>
    convex.mutation(api.health.addAppointment, payload)
  );
}

export async function syncExpenseToConvex(
  e: ExpenseRecord,
  userId?: string
): Promise<boolean> {
  const payload = {
    userId,
    puppyId: e.puppyId,
    title: e.title,
    category: e.category,
    amount: e.amount,
    date: e.date,
    vendor: e.vendor,
    notes: e.notes,
  };
  return runWithOfflineQueue("expenses:addExpense", payload, () =>
    convex.mutation(api.expenses.addExpense, payload)
  );
}

export async function syncDocumentToConvex(
  d: DocumentRecord,
  userId?: string
): Promise<boolean> {
  const payload = {
    userId,
    puppyId: d.puppyId,
    title: d.title,
    category: d.category,
    date: d.date,
    fileType: d.fileType,
    fileSize: d.fileSize,
    fileUrl: d.fileUrl,
    notes: d.notes,
  };
  return runWithOfflineQueue("documents:addDocument", payload, () =>
    convex.mutation(api.documents.addDocument, payload)
  );
}

export async function removeDocumentFromConvex(
  id: string,
  userId?: string
): Promise<boolean> {
  const payload = { id, userId };
  return runWithOfflineQueue("documents:deleteDocument", payload, () =>
    convex.mutation(api.documents.deleteDocument, payload)
  );
}

export async function syncBehaviorLogToConvex(
  b: BehaviorIncident,
  userId?: string
): Promise<boolean> {
  const payload = {
    userId,
    puppyId: b.puppyId,
    behaviorType: b.behaviorType,
    timestamp: b.timestamp,
    severity: b.severity,
    trigger: b.trigger,
    whatHelped: b.whatHelped,
    notes: b.notes,
  };
  return runWithOfflineQueue("behavior:addBehaviorLog", payload, () =>
    convex.mutation(api.behavior.addBehaviorLog, payload)
  );
}

export async function syncGroomingTasksToConvex(
  puppyId: string,
  tasks: GroomingTask[],
  userId?: string
): Promise<boolean> {
  const payload = {
    userId,
    puppyId,
    tasks: tasks.map((t) => ({
      type: t.type,
      label: t.label,
      lastDone: t.lastDone,
      nextDue: t.nextDue,
      frequencyDays: t.frequencyDays,
    })),
  };
  return runWithOfflineQueue("grooming:saveGroomingTasks", payload, () =>
    convex.mutation(api.grooming.saveGroomingTasks, payload)
  );
}

export async function syncSocializationToConvex(
  puppyId: string,
  item: any,
  userId?: string
): Promise<boolean> {
  const payload = {
    userId,
    puppyId,
    category: item.category || "General",
    title: item.title,
    description: item.description || "",
    status: item.status,
    notes: item.notes,
    lastUpdated: item.lastUpdated || new Date().toISOString().split("T")[0],
  };
  return runWithOfflineQueue("socialization:updateSocializationStatus", payload, () =>
    convex.mutation(api.socialization.updateSocializationStatus, payload)
  );
}

export async function syncJournalEntryToConvex(
  j: JournalEntry,
  userId?: string
): Promise<boolean> {
  const payload = {
    userId,
    puppyId: j.puppyId,
    title: j.title,
    date: j.date,
    notes: j.notes,
    mediaUrl: j.mediaUrl,
    milestoneBadge: j.milestoneBadge,
  };
  return runWithOfflineQueue("journal:addJournalEntry", payload, () =>
    convex.mutation(api.journal.addJournalEntry, payload)
  );
}

export async function syncTrainingLessonToConvex(
  puppyId: string,
  lessonId: string,
  completed: boolean,
  mastered: boolean,
  userId?: string
): Promise<boolean> {
  const payload = {
    userId,
    puppyId,
    lessonId,
    completed,
    mastered,
  };
  return runWithOfflineQueue("training:updateLessonStatus", payload, () =>
    convex.mutation(api.training.updateLessonStatus, payload)
  );
}

export async function syncSettingsToConvex(
  settings: any,
  userId?: string
): Promise<boolean> {
  const payload = {
    ...(settings ? (({ _id, _creationTime, updatedAt, ...rest }) => rest)(settings) : {}),
    userId,
  };
  return runWithOfflineQueue("settings:saveSettings", payload, () =>
    convex.mutation(api.settings.saveSettings, payload)
  );
}

export async function syncFamilyMemberToConvex(
  m: {
    puppyId?: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
    dateAdded: string;
  },
  userId?: string
): Promise<boolean> {
  const payload = { ...m, userId };
  return runWithOfflineQueue("family:addFamilyMember", payload, () =>
    convex.mutation(api.family.addFamilyMember, payload)
  );
}

export async function removeFamilyMemberFromConvex(
  id: string,
  userId?: string
): Promise<boolean> {
  const payload = { id, userId };
  return runWithOfflineQueue("family:deleteFamilyMember", payload, () =>
    convex.mutation(api.family.deleteFamilyMember, payload)
  );
}

export async function syncNotificationToConvex(
  n: {
    title: string;
    message: string;
    category: string;
    timestamp: string;
    actionUrl?: string;
  },
  userId?: string
): Promise<boolean> {
  const payload = { ...n, userId };
  return runWithOfflineQueue("notifications:addNotification", payload, () =>
    convex.mutation(api.notifications.addNotification, payload)
  );
}

export async function syncNotificationReadToConvex(
  id: string,
  userId?: string
): Promise<boolean> {
  const payload = { id, userId };
  return runWithOfflineQueue("notifications:markNotificationRead", payload, () =>
    convex.mutation(api.notifications.markNotificationRead, payload)
  );
}

export async function syncAllNotificationsReadToConvex(
  userId?: string
): Promise<boolean> {
  const payload = { userId };
  return runWithOfflineQueue("notifications:markAllNotificationsRead", payload, () =>
    convex.mutation(api.notifications.markAllNotificationsRead, payload)
  );
}

// Ephemeral local AI chat - no cloud sync required for privacy
export async function syncAIMessageToConvex(
  _puppyId: string,
  _msg: { sender: string; text: string; timestamp: string; suggestedActions?: any },
  _userId?: string
): Promise<boolean> {
  return true;
}

export async function syncAIMessagesToConvex(
  _puppyId: string,
  _messages: { sender: string; text: string; timestamp: string; suggestedActions?: any }[],
  _userId?: string
): Promise<boolean> {
  return true;
}

export async function completeAIOnboardingInConvex(
  puppy: {
    name: string;
    breed: string;
    birthDate: string;
    sex: string;
    weightLbs: number;
    photoUrl: string;
    temperament?: string;
    dietaryRestrictions?: string;
    favoriteTreat?: string;
  },
  tasks: Array<{
    title: string;
    category: string;
    time: string;
    durationMin: number;
    period: string;
    description: string;
  }>,
  userId?: string
): Promise<boolean> {
  const payload = {
    userId,
    puppy,
    tasks,
  };
  return runWithOfflineQueue("app:completeAIOnboarding", payload, () =>
    convex.mutation(api.app.completeAIOnboarding, payload)
  );
}

export async function clearUserDataInConvex(userId?: string): Promise<boolean> {
  try {
    await convex.mutation(api.app.clearUserData, { userId });
    return true;
  } catch (err) {
    console.debug("[Convex] clearUserData note:", err);
    return false;
  }
}

export async function deleteUserAccountInConvex(): Promise<boolean> {
  try {
    await convex.mutation(api.app.deleteUserAccount, {});
    return true;
  } catch (err) {
    console.debug("[Convex] deleteUserAccount note:", err);
    return false;
  }
}

export async function deletePuppyInConvex(
  id: string,
  userId?: string
): Promise<boolean> {
  if (!id || id.startsWith('pup-')) return true;
  const payload = { id: id as any, userId };
  return runWithOfflineQueue("puppies:deletePuppy", payload, () =>
    convex.mutation(api.puppies.deletePuppy, payload)
  );
}

export async function deletePottyLogInConvex(
  id: string,
  userId?: string
): Promise<boolean> {
  if (!id || id.startsWith('potty-')) return true;
  const payload = { id: id as any, userId };
  return runWithOfflineQueue("potty:deletePottyLog", payload, () =>
    convex.mutation(api.potty.deletePottyLog, payload)
  );
}

export async function deleteFeedingLogInConvex(
  id: string,
  userId?: string
): Promise<boolean> {
  if (!id || id.startsWith('feed-')) return true;
  const payload = { id: id as any, userId };
  return runWithOfflineQueue("feeding:deleteFeedingLog", payload, () =>
    convex.mutation(api.feeding.deleteFeedingLog, payload)
  );
}

export async function deleteSleepLogInConvex(
  id: string,
  userId?: string
): Promise<boolean> {
  if (!id || id.startsWith('sleep-')) return true;
  const payload = { id: id as any, userId };
  return runWithOfflineQueue("sleep:deleteSleepLog", payload, () =>
    convex.mutation(api.sleep.deleteSleepLog, payload)
  );
}

export async function deleteWalkLogInConvex(
  id: string,
  userId?: string
): Promise<boolean> {
  if (!id || id.startsWith('walk-')) return true;
  const payload = { id: id as any, userId };
  return runWithOfflineQueue("walk:deleteWalkLog", payload, () =>
    convex.mutation(api.walk.deleteWalkLog, payload)
  );
}

export async function deleteVaccinationInConvex(
  id: string,
  userId?: string
): Promise<boolean> {
  if (!id || id.startsWith('vac-')) return true;
  const payload = { id: id as any, userId };
  return runWithOfflineQueue("health:deleteVaccination", payload, () =>
    convex.mutation(api.health.deleteVaccination, payload)
  );
}

export async function deleteMedicationInConvex(
  id: string,
  userId?: string
): Promise<boolean> {
  if (!id || id.startsWith('med-')) return true;
  const payload = { id: id as any, userId };
  return runWithOfflineQueue("health:deleteMedication", payload, () =>
    convex.mutation(api.health.deleteMedication, payload)
  );
}

export async function deleteAppointmentInConvex(
  id: string,
  userId?: string
): Promise<boolean> {
  if (!id || id.startsWith('apt-')) return true;
  const payload = { id: id as any, userId };
  return runWithOfflineQueue("health:deleteAppointment", payload, () =>
    convex.mutation(api.health.deleteAppointment, payload)
  );
}

export async function deleteExpenseInConvex(
  id: string,
  userId?: string
): Promise<boolean> {
  if (!id || id.startsWith('exp-')) return true;
  const payload = { id: id as any, userId };
  return runWithOfflineQueue("expenses:deleteExpense", payload, () =>
    convex.mutation(api.expenses.deleteExpense, payload)
  );
}

export async function deleteJournalEntryInConvex(
  id: string,
  userId?: string
): Promise<boolean> {
  if (!id || id.startsWith('jrn-')) return true;
  const payload = { id: id as any, userId };
  return runWithOfflineQueue("journal:deleteJournalEntry", payload, () =>
    convex.mutation(api.journal.deleteJournalEntry, payload)
  );
}

export async function deleteBehaviorLogInConvex(
  id: string,
  userId?: string
): Promise<boolean> {
  if (!id || id.startsWith('beh-')) return true;
  const payload = { id: id as any, userId };
  return runWithOfflineQueue("behavior:deleteBehaviorLog", payload, () =>
    convex.mutation(api.behavior.deleteBehaviorLog, payload)
  );
}
