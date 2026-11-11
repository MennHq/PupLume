import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User profiles synced from Clerk authentication
  users: defineTable({
    clerkId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    createdAt: v.string(),
    hasAccess: v.optional(v.boolean()),
    subscriptionId: v.optional(v.string()),
    paddleCustomerId: v.optional(v.string()),
    paddleTransactionId: v.optional(v.string()),
    paidAt: v.optional(v.string()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // Immutable, authoritative purchases ledger (Enterprise standard)
  purchases: defineTable({
    email: v.string(), // normalized lowercase
    userId: v.optional(v.string()), // clerkId if known
    transactionId: v.string(),
    customerId: v.optional(v.string()),
    status: v.string(), // "completed"
    itemType: v.string(), // "lifetime_access" | "smart_tag_pass"
    amount: v.optional(v.string()),
    currency: v.optional(v.string()),
    createdAt: v.string(),
    rawData: v.optional(v.any()),
  })
    .index("by_email", ["email"])
    .index("by_transaction_id", ["transactionId"])
    .index("by_user_id", ["userId"]),

  webhookLogs: defineTable({
    action: v.string(),
    payload: v.any(),
    processedAt: v.optional(v.string()),
    environment: v.optional(v.string()),
  }),


  // Puppies belonging to authenticated users
  puppies: defineTable({
    userId: v.string(),
    name: v.string(),
    breed: v.string(),
    birthDate: v.string(),
    sex: v.string(),
    weightLbs: v.number(),
    photoUrl: v.string(),
    temperament: v.string(),
    dietaryRestrictions: v.optional(v.string()),
    microchipNumber: v.optional(v.string()),
    allergies: v.optional(v.string()),
    vetClinic: v.optional(v.string()),
    vetPhone: v.optional(v.string()),
    vetName: v.optional(v.string()),
    insuranceProvider: v.optional(v.string()),
    insurancePolicyNumber: v.optional(v.string()),
    favoriteTreat: v.optional(v.string()),
    adoptionDate: v.optional(v.string()),
    createdAt: v.string(),
    ownerPhone: v.optional(v.string()),
    ownerEmail: v.optional(v.string()),
    emergencyContactName: v.optional(v.string()),
    emergencyContactPhone: v.optional(v.string()),
    emergencyNotes: v.optional(v.string()),
    isLost: v.optional(v.boolean()),
    rewardAmount: v.optional(v.string()),
    hasSmartTagPass: v.optional(v.boolean()),
    ownerInstagram: v.optional(v.string()),
    ownerFacebook: v.optional(v.string()),
    ownerWhatsApp: v.optional(v.string()),
    ownerTelegram: v.optional(v.string()),
    ownerSlack: v.optional(v.string()),
    communicationLinks: v.optional(v.array(v.object({
      id: v.string(),
      platform: v.string(),
      value: v.string(),
      label: v.optional(v.string()),
    }))),
  }).index("by_user", ["userId"]),

  // User Settings & Preferences
  userSettings: defineTable({
    userId: v.string(),
    pottyAlerts: v.boolean(),
    feedingAlerts: v.boolean(),
    trainingAlerts: v.boolean(),
    medAlerts: v.boolean(),
    taskAlerts: v.optional(v.boolean()),
    units: v.string(), // "imperial" | "metric"
    activePuppyId: v.optional(v.string()),
    hasCompletedOnboarding: v.optional(v.boolean()),
    hasCompletedChecklist: v.optional(v.boolean()),
    pottyIntervalMode: v.optional(v.string()),
    pottyCustomIntervalHours: v.optional(v.number()),
    quietHoursEnabled: v.optional(v.boolean()),
    quietHoursStart: v.optional(v.string()),
    quietHoursEnd: v.optional(v.string()),
    taskAdvanceMinutes: v.optional(v.number()),
    headsUpDurationSec: v.optional(v.number()),
    snoozeDurationMin: v.optional(v.number()),
    chimeSound: v.optional(v.boolean()),
    updatedAt: v.string(),
  }).index("by_user", ["userId"]),

  // Daily schedule tasks
  tasks: defineTable({
    puppyId: v.string(),
    userId: v.string(),
    title: v.string(),
    category: v.string(),
    time: v.string(),
    durationMin: v.number(),
    completed: v.boolean(),
    skipped: v.boolean(),
    period: v.string(),
    date: v.string(),
    description: v.optional(v.string()),
    notes: v.optional(v.string()),
    completedAt: v.optional(v.string()),
  })
    .index("by_puppy", ["puppyId"])
    .index("by_user", ["userId"])
    .index("by_puppy_date", ["puppyId", "date"]),

  // Potty and bathroom tracking
  pottyLogs: defineTable({
    puppyId: v.string(),
    userId: v.string(),
    type: v.string(), // pee, poop, both, accident
    location: v.string(), // outdoor, pad, indoor_accident
    timestamp: v.string(),
    notes: v.optional(v.string()),
  })
    .index("by_puppy", ["puppyId"])
    .index("by_user", ["userId"]),

  // Feeding & meals tracking
  feedingLogs: defineTable({
    puppyId: v.string(),
    userId: v.string(),
    mealType: v.string(), // breakfast, lunch, dinner, snack, water
    amountCups: v.optional(v.number()),
    foodBrand: v.optional(v.string()),
    timestamp: v.string(),
    notes: v.optional(v.string()),
  })
    .index("by_puppy", ["puppyId"])
    .index("by_user", ["userId"]),

  // Sleep and nap tracking
  sleepLogs: defineTable({
    puppyId: v.string(),
    userId: v.string(),
    type: v.string(), // nap, night, crate
    startTime: v.string(),
    endTime: v.optional(v.string()),
    durationMin: v.number(),
    notes: v.optional(v.string()),
  })
    .index("by_puppy", ["puppyId"])
    .index("by_user", ["userId"]),

  // Walk & exercise logs
  walkLogs: defineTable({
    puppyId: v.string(),
    userId: v.string(),
    startTime: v.optional(v.string()),
    durationMin: v.number(),
    distanceMiles: v.optional(v.number()),
    peesCount: v.optional(v.number()),
    poopsCount: v.optional(v.number()),
    pullingRating: v.optional(v.string()),
    reactivityNotes: v.optional(v.string()),
    timestamp: v.optional(v.string()),
    route: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_puppy", ["puppyId"])
    .index("by_user", ["userId"]),

  // Health: Vaccinations
  vaccinations: defineTable({
    puppyId: v.string(),
    userId: v.string(),
    name: v.optional(v.string()),
    vaccineName: v.optional(v.string()),
    status: v.string(), // up_to_date, due_soon, overdue, scheduled, completed
    administeredDate: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    nextDueDate: v.optional(v.string()),
    vetClinic: v.optional(v.string()),
    lotNumber: v.optional(v.string()),
    isCore: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  })
    .index("by_puppy", ["puppyId"])
    .index("by_user", ["userId"]),

  // Health: Medications
  medications: defineTable({
    puppyId: v.string(),
    userId: v.string(),
    name: v.string(),
    dosage: v.string(),
    frequency: v.string(),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    reminderTime: v.optional(v.string()),
    active: v.boolean(),
    notes: v.optional(v.string()),
  })
    .index("by_puppy", ["puppyId"])
    .index("by_user", ["userId"]),

  // Health: Veterinary Appointments
  appointments: defineTable({
    puppyId: v.string(),
    userId: v.string(),
    title: v.string(),
    clinic: v.string(),
    date: v.string(),
    time: v.string(),
    reason: v.string(),
    status: v.string(), // scheduled, completed, cancelled
    doctor: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_puppy", ["puppyId"])
    .index("by_user", ["userId"]),

  // Financial tracking / Expenses
  expenses: defineTable({
    puppyId: v.string(),
    userId: v.string(),
    title: v.string(),
    category: v.string(),
    amount: v.number(),
    date: v.string(),
    vendor: v.string(),
    receiptUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_puppy", ["puppyId"])
    .index("by_user", ["userId"]),

  // Memory book & Milestones Journal
  journalEntries: defineTable({
    puppyId: v.string(),
    userId: v.string(),
    title: v.string(),
    date: v.string(),
    notes: v.string(),
    mediaUrl: v.optional(v.string()),
    milestoneBadge: v.optional(v.string()),
  })
    .index("by_puppy", ["puppyId"])
    .index("by_user", ["userId"]),

  // Socialization checklist
  socialization: defineTable({
    puppyId: v.string(),
    userId: v.string(),
    category: v.string(),
    title: v.string(),
    description: v.string(),
    status: v.string(), // not_started, introduced, comfortable, needs_work
    lastUpdated: v.string(),
    notes: v.optional(v.string()),
  })
    .index("by_puppy", ["puppyId"])
    .index("by_user", ["userId"]),

  // Training Lessons & Curriculum Progress
  trainingLessons: defineTable({
    puppyId: v.string(),
    userId: v.string(),
    lessonId: v.string(),
    completed: v.boolean(),
    mastered: v.boolean(),
    lastPracticed: v.optional(v.string()),
  })
    .index("by_puppy", ["puppyId"])
    .index("by_user", ["userId"])
    .index("by_puppy_lesson", ["puppyId", "lessonId"]),

  // Grooming Tasks
  groomingTasks: defineTable({
    puppyId: v.string(),
    userId: v.string(),
    type: v.string(), // bath, brush, nails, teeth, ears, haircut
    label: v.string(),
    lastDone: v.optional(v.string()),
    nextDue: v.string(),
    frequencyDays: v.number(),
  })
    .index("by_puppy", ["puppyId"])
    .index("by_user", ["userId"]),

  // Document Vault records
  documents: defineTable({
    puppyId: v.string(),
    userId: v.string(),
    title: v.string(),
    category: v.string(),
    date: v.string(),
    fileType: v.string(),
    fileSize: v.string(),
    fileUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_puppy", ["puppyId"])
    .index("by_user", ["userId"]),

  // Behavior Incident logs
  behaviorLogs: defineTable({
    puppyId: v.string(),
    userId: v.string(),
    behaviorType: v.string(),
    timestamp: v.string(),
    severity: v.string(), // mild, moderate, high
    trigger: v.optional(v.string()),
    whatHelped: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_puppy", ["puppyId"])
    .index("by_user", ["userId"]),

  // Notifications
  notifications: defineTable({
    userId: v.string(),
    title: v.string(),
    message: v.string(),
    category: v.string(),
    timestamp: v.string(),
    read: v.boolean(),
    actionUrl: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  // Background Web Push Subscriptions
  pushSubscriptions: defineTable({
    userId: v.string(),
    endpoint: v.string(),
    keys: v.object({
      p256dh: v.string(),
      auth: v.string(),
    }),
    userAgent: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_endpoint", ["endpoint"]),

  // AI Chat History (REMOVED - Ephemeral Chat)

  // Family Members
  familyMembers: defineTable({
    puppyId: v.optional(v.string()),
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.string(),
    avatarUrl: v.optional(v.string()),
    dateAdded: v.string(),
  }).index("by_user", ["userId"]),

  // AI Personalized Memory
  memories: defineTable({
    userId: v.string(),
    puppyId: v.optional(v.string()),
    fact: v.string(),
    category: v.optional(v.string()), // e.g. behavior, medical, preference
    createdAt: v.string(),
  }).index("by_user", ["userId"]),
});

