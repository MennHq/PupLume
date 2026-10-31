import { query, mutation, internalMutation } from './_generated/server';
import { v } from 'convex/values';
import { requireAuthUser, getAuthUser } from './authHelper';

export const getUserAppData = query({
  args: { 
    userId: v.optional(v.string()),
    puppyId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Strictly verify caller authentication and prevent user ID spoofing
    const userId = await getAuthUser(ctx, args.userId);
    if (!userId) return null;

    const user = await ctx.db.query('users').withIndex('by_clerk_id', q => q.eq('clerkId', userId)).first();

    const [
      puppies, tasks, pottyLogs, feedingLogs, sleepLogs, walkLogs, vaccinations, medications, appointments, expenses, documents, behaviorLogs, groomingTasks, socialization, journalEntries, trainingLessons, notifications, familyMembers, memories, settings
    ] = await Promise.all([
      ctx.db.query('puppies').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('tasks').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('pottyLogs').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('feedingLogs').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('sleepLogs').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('walkLogs').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('vaccinations').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('medications').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('appointments').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('expenses').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('documents').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('behaviorLogs').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('groomingTasks').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('socialization').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('journalEntries').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('trainingLessons').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('notifications').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('familyMembers').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('memories').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('userSettings').withIndex('by_user', q => q.eq('userId', userId)).first(),
    ]);

    // Deduplicate puppies by trimmed lowercase name
    const seenNames = new Set<string>();
    const deduplicatedPuppies = puppies.filter((p: any) => {
      const key = (p.name || '').trim().toLowerCase();
      if (!key || seenNames.has(key)) return false;
      seenNames.add(key);
      return true;
    });

    const primaryPuppyId = deduplicatedPuppies[0]?._id;
    const knownPuppyIds = new Set(deduplicatedPuppies.map((p: any) => p._id));

    const normalizePuppyId = <T extends { puppyId?: string }>(item: T): T => {
      if (!item) return item;
      if (item.puppyId && knownPuppyIds.has(item.puppyId) && !item.puppyId.startsWith('pup-')) {
        return item;
      }
      return {
        ...item,
        puppyId: primaryPuppyId || item.puppyId || 'pup-1',
      };
    };

    return {
      user,
      puppies: deduplicatedPuppies,
      tasks: tasks.map(normalizePuppyId),
      pottyLogs: pottyLogs.map(normalizePuppyId),
      feedingLogs: feedingLogs.map(normalizePuppyId),
      sleepLogs: sleepLogs.map(normalizePuppyId),
      walkLogs: walkLogs.map(normalizePuppyId),
      vaccinations: vaccinations.map(normalizePuppyId),
      medications: medications.map(normalizePuppyId),
      appointments: appointments.map(normalizePuppyId),
      expenses: expenses.map(normalizePuppyId),
      documents: documents.map(normalizePuppyId),
      behaviorLogs: behaviorLogs.map(normalizePuppyId),
      groomingTasks: groomingTasks.map(normalizePuppyId),
      socialization,
      journalEntries,
      trainingLessons,
      notifications,
      familyMembers,
      memories,
      settings
    };
  }
});

export const repairLegacyPuppyIds = mutation({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const puppies = await ctx.db.query('puppies').withIndex('by_user', (q) => q.eq('userId', userId)).collect();

    if (puppies.length === 0) return { repaired: 0 };

    let repaired = 0;
    const primaryPuppyId = puppies[0]._id;
    const knownPuppyIds = new Set(puppies.map((p) => p._id));

    const tables = [
      'tasks', 'pottyLogs', 'feedingLogs', 'sleepLogs', 'walkLogs',
      'vaccinations', 'medications', 'appointments', 'expenses', 'documents',
      'behaviorLogs', 'groomingTasks', 'socialization', 'journalEntries',
      'trainingLessons', 'notifications', 'familyMembers', 'memories'
    ];

    // Deduplicate duplicate puppies for this user
    const seenNames = new Map<string, typeof puppies[0]>();
    for (const pup of puppies) {
      const key = (pup.name || '').trim().toLowerCase();
      if (!seenNames.has(key)) {
        seenNames.set(key, pup);
      } else {
        const keeper = seenNames.get(key)!;
        const dup = pup;
        if (dup._id !== keeper._id) {
          for (const tbl of tables) {
            const recs: any[] = await (ctx.db.query as any)(tbl)
              .withIndex('by_user', (q: any) => q.eq('userId', userId))
              .collect();
            for (const r of recs) {
              if (r.puppyId === dup._id) {
                await ctx.db.patch(r._id, { puppyId: keeper._id });
              }
            }
          }
          await ctx.db.delete(dup._id);
          repaired++;
        }
      }
    }
    for (const table of tables) {
      const records: any[] = await (ctx.db.query as any)(table)
        .withIndex('by_user', (q: any) => q.eq('userId', userId))
        .collect();

      for (const record of records) {
        if (!record.puppyId || record.puppyId.startsWith('pup-') || !knownPuppyIds.has(record.puppyId)) {
          await ctx.db.patch(record._id, { puppyId: primaryPuppyId });
          repaired++;
        }
      }
    }
    return { repaired };
  }
});

// Dangerous mutation converted to internalMutation so it CANNOT be invoked by external clients/browsers
export const wipeAllData = internalMutation({
  args: {},
  handler: async (ctx) => {
    const tables = [
      'users', 'puppies', 'tasks', 'pottyLogs', 'feedingLogs', 'sleepLogs',
      'walkLogs', 'vaccinations', 'medications', 'appointments', 'expenses',
      'documents', 'behaviorLogs', 'groomingTasks', 'socialization',
      'journalEntries', 'trainingLessons', 'notifications', 'familyMembers',
      'memories', 'webhookLogs'
    ];

    for (const table of tables) {
      const records: any[] = await (ctx.db.query as any)(table).collect();
      for (const record of records) {
        await ctx.db.delete(record._id);
      }
    }
  }
});

export const clearUserData = mutation({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const tables = ['puppies', 'tasks', 'pottyLogs', 'feedingLogs', 'sleepLogs', 'walkLogs', 'vaccinations', 'medications', 'appointments', 'expenses', 'documents', 'behaviorLogs', 'socialization', 'journalEntries', 'trainingLessons', 'notifications', 'familyMembers', 'memories'];
    
    for (const table of tables) {
      const records: any[] = await (ctx.db.query as any)(table).withIndex('by_user', (q: any) => q.eq('userId', userId)).collect();
      for (const record of records) {
        await ctx.db.delete(record._id);
      }
    }
  }
});

export const completeAIOnboarding = mutation({
  args: {
    userId: v.optional(v.string()),
    puppy: v.object({
      name: v.string(),
      breed: v.string(),
      birthDate: v.string(),
      sex: v.string(),
      weightLbs: v.number(),
      photoUrl: v.string(),
      temperament: v.optional(v.string()),
      dietaryRestrictions: v.optional(v.string()),
      favoriteTreat: v.optional(v.string()),
    }),
    tasks: v.array(v.object({
      title: v.string(),
      category: v.string(),
      time: v.string(),
      durationMin: v.number(),
      period: v.string(),
      description: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const todayDateStr = new Date().toISOString().split('T')[0];

    // Deduplicate: check if a puppy with the same name already exists for this user
    const existingPuppies = await ctx.db
      .query("puppies")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const existingMatch = existingPuppies.find(
      (p) => (p.name || '').trim().toLowerCase() === args.puppy.name.trim().toLowerCase()
    );

    let puppyId: any;
    if (existingMatch) {
      await ctx.db.patch(existingMatch._id, {
        name: args.puppy.name,
        breed: args.puppy.breed,
        birthDate: args.puppy.birthDate,
        sex: args.puppy.sex,
        weightLbs: args.puppy.weightLbs,
        photoUrl: args.puppy.photoUrl,
        temperament: args.puppy.temperament || 'Curious & playful',
        dietaryRestrictions: args.puppy.dietaryRestrictions,
        favoriteTreat: args.puppy.favoriteTreat,
      });
      puppyId = existingMatch._id;
    } else {
      puppyId = await ctx.db.insert("puppies", {
        userId,
        name: args.puppy.name,
        breed: args.puppy.breed,
        birthDate: args.puppy.birthDate,
        sex: args.puppy.sex,
        weightLbs: args.puppy.weightLbs,
        photoUrl: args.puppy.photoUrl,
        temperament: args.puppy.temperament || 'Curious & playful',
        dietaryRestrictions: args.puppy.dietaryRestrictions,
        favoriteTreat: args.puppy.favoriteTreat,
        createdAt: new Date().toISOString(),
      });
    }

    for (const task of args.tasks) {
      await ctx.db.insert("tasks", {
        userId,
        puppyId: puppyId as string,
        title: task.title,
        category: task.category,
        time: task.time,
        durationMin: task.durationMin,
        completed: false,
        skipped: false,
        period: task.period || 'morning',
        date: todayDateStr,
        description: task.description,
        notes: task.description,
      });
    }

    const existingSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingSettings) {
      await ctx.db.patch(existingSettings._id, {
        activePuppyId: puppyId as string,
        hasCompletedOnboarding: true,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await ctx.db.insert("userSettings", {
        userId,
        activePuppyId: puppyId as string,
        hasCompletedOnboarding: true,
        pottyAlerts: true,
        feedingAlerts: true,
        trainingAlerts: true,
        medAlerts: true,
        units: "imperial",
        updatedAt: new Date().toISOString(),
      });
    }

    return { puppyId };
  }
});

export const deleteUserAccount = mutation({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);
    const user = await ctx.db.query('users').withIndex('by_clerk_id', q => q.eq('clerkId', userId)).first();
    if (user) await ctx.db.delete(user._id);
  }
});
