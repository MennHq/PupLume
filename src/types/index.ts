export type PuppySex = 'male' | 'female';

export interface PuppyProfile {
  id: string;
  name: string;
  photoUrl: string;
  breed: string;
  birthDate: string; // YYYY-MM-DD
  sex: PuppySex;
  weightLbs: number;
  microchipNumber?: string;
  allergies?: string;
  dietaryRestrictions?: string;
  temperament: string;
  adoptionDate?: string;
  vetName?: string;
  vetPhone?: string;
  vetClinic?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  favoriteTreat?: string;
  createdAt: string;
  ownerPhone?: string;
  ownerEmail?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyNotes?: string;
  isLost?: boolean;
  rewardAmount?: string;
  hasSmartTagPass?: boolean;
  ownerInstagram?: string;
  ownerFacebook?: string;
  ownerWhatsApp?: string;
  ownerTelegram?: string;
  ownerSlack?: string;
  communicationLinks?: CommunicationLinkItem[];
}

export interface CommunicationLinkItem {
  id: string;
  platform: string;
  value: string;
  label?: string;
}

export type TaskCategory = 
  | 'potty'
  | 'feeding'
  | 'training'
  | 'sleep'
  | 'walk'
  | 'health'
  | 'medication'
  | 'grooming'
  | 'socialization'
  | 'custom';

export type DayPeriod = 'morning' | 'afternoon' | 'evening' | 'night';

export interface TaskItem {
  id: string;
  puppyId: string;
  title: string;
  category: TaskCategory;
  time: string; // HH:MM (24h or 12h)
  durationMin: number;
  completed: boolean;
  skipped: boolean;
  period: DayPeriod;
  date: string; // YYYY-MM-DD
  description?: string;
  notes?: string;
  completedAt?: string;
}

export type PottyType = 'pee' | 'poop' | 'both' | 'accident';
export type PottyLocation = 'outdoor' | 'pad' | 'indoor_accident';

export interface PottyLog {
  id: string;
  puppyId: string;
  type: PottyType;
  location: PottyLocation;
  timestamp: string; // ISO string
  notes?: string;
}

export type SleepType = 'nap' | 'night' | 'crate';

export interface SleepLog {
  id: string;
  puppyId: string;
  type: SleepType;
  startTime: string; // ISO string
  endTime?: string; // ISO string
  durationMin: number;
  notes?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'water';

export interface FeedingLog {
  id: string;
  puppyId: string;
  mealType: MealType;
  amountCups?: number;
  foodBrand: string;
  timestamp: string; // ISO string
  notes?: string;
}

export interface WalkLog {
  id: string;
  puppyId: string;
  startTime: string; // ISO string
  durationMin: number;
  distanceMiles?: number;
  peesCount: number;
  poopsCount: number;
  pullingRating: 'none' | 'mild' | 'moderate';
  reactivityNotes?: string;
  notes?: string;
}

export interface TrainingLesson {
  id: string;
  moduleId: string;
  moduleTitle: string;
  title: string;
  goal: string;
  whyItMatters: string;
  steps: string[];
  durationMin: number;
  tips: string[];
  commonMistakes: string[];
  proTip?: string;
  commonMistake?: string;
  completed: boolean;
  mastered: boolean;
  lastPracticed?: string;
}

export interface VaccinationRecord {
  id: string;
  puppyId: string;
  vaccineName: string;
  administeredDate: string; // YYYY-MM-DD
  nextDueDate: string; // YYYY-MM-DD
  vetClinic: string;
  status: 'up_to_date' | 'due_soon' | 'overdue';
  lotNumber?: string;
  notes?: string;
}

export interface MedicationRecord {
  id: string;
  puppyId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  reminderTime?: string;
  active: boolean;
  notes?: string;
}

export interface VetAppointment {
  id: string;
  puppyId: string;
  title: string;
  clinic: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  doctor?: string;
}

export type ExpenseCategory = 
  | 'vet'
  | 'food'
  | 'treats'
  | 'toys'
  | 'training'
  | 'grooming'
  | 'medication'
  | 'insurance'
  | 'walking'
  | 'boarding'
  | 'accessories'
  | 'other';

export interface ExpenseRecord {
  id: string;
  puppyId: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  vendor: string;
  receiptUrl?: string;
  notes?: string;
}

export type DocumentCategory = 
  | 'vaccination'
  | 'vet_record'
  | 'prescription'
  | 'insurance'
  | 'adoption'
  | 'microchip'
  | 'receipt';

export interface DocumentRecord {
  id: string;
  puppyId: string;
  title: string;
  category: DocumentCategory;
  date: string;
  fileType: string;
  fileSize: string;
  fileUrl?: string;
  notes?: string;
}

export type BehaviorType = 
  | 'barking'
  | 'biting'
  | 'chewing'
  | 'fear'
  | 'anxiety'
  | 'jumping'
  | 'guarding'
  | 'reactivity'
  | 'calm';

export interface BehaviorIncident {
  id: string;
  puppyId: string;
  behaviorType: BehaviorType;
  timestamp: string;
  severity: 'mild' | 'moderate' | 'high';
  trigger?: string;
  whatHelped?: string;
  notes?: string;
}

export type GroomingType = 'bath' | 'brush' | 'nails' | 'teeth' | 'ears' | 'haircut';

export interface GroomingTask {
  id: string;
  puppyId: string;
  type: GroomingType;
  label: string;
  lastDone?: string;
  nextDue: string;
  frequencyDays: number;
}

export type SocializationStatus = 'not_started' | 'introduced' | 'comfortable' | 'needs_work' | 'unexposed' | 'positive' | 'neutral';

export interface SocializationItem {
  id: string;
  category: string;
  title: string;
  name?: string;
  description: string;
  status: SocializationStatus;
  lastUpdated?: string;
  notes?: string;
}

export interface JournalEntry {
  id: string;
  puppyId: string;
  title: string;
  date: string;
  notes: string;
  mediaUrl?: string;
  milestoneBadge?: string;
}

export type FamilyRole = 'Owner' | 'Admin' | 'Caregiver' | 'Viewer';

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: FamilyRole;
  avatarUrl?: string;
  dateAdded: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'tasks' | 'health' | 'calendar' | 'ai' | 'family' | 'system' | 'potty' | 'reminder';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export type AIActionType = 
  | 'CREATE_TASK'
  | 'CREATE_APPOINTMENT'
  | 'CREATE_REMINDER'
  | 'LOG_POTTY'
  | 'LOG_FEEDING'
  | 'LOG_SLEEP'
  | 'ADD_EXPENSE'
  | 'CREATE_TRAINING_PLAN'
  | 'SAVE_MEMORY'
  | 'NAVIGATE';

export interface AIActionProposal {
  id: string;
  type: AIActionType;
  title: string;
  summary: string;
  payload: any;
  confirmed?: boolean;
  dismissed?: boolean;
}

export type AIActionSuggestion = AIActionProposal;

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  createdAt?: number;
  suggestedActions?: AIActionProposal[];
  isThinking?: boolean;
}

export interface UserSession {
  isAuthenticated: boolean;
  email: string;
  name: string;
  plan: 'free' | 'premium';
}

export type PottyIntervalMode = 'age_dynamic' | 'custom';

export interface UserSettings {
  pottyAlerts: boolean;
  feedingAlerts: boolean;
  trainingAlerts: boolean;
  medAlerts: boolean;
  taskAlerts?: boolean;
  units: 'imperial' | 'metric';
  activePuppyId?: string;
  hasCompletedOnboarding?: boolean;
  hasCompletedChecklist?: boolean;
  pottyIntervalMode?: PottyIntervalMode;
  pottyCustomIntervalHours?: number;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  taskAdvanceMinutes?: number;
  headsUpDurationSec?: number;
  snoozeDurationMin?: number;
  chimeSound?: boolean;
}
