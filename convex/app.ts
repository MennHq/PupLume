import { query, mutation, internalMutation } from './_generated/server';
import { v } from 'convex/values';
import { requireAuthUser, getAuthUser } from './authHelper';

export const getUserAppData = query({
  args: { 
    userId: v.optional(v.string()),
    userEmail: v.optional(v.string()),
    puppyId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Strictly verify caller authentication and prevent user ID spoofing
    const userId = await getAuthUser(ctx, args.userId);
    if (!userId) return null;

    const normEmail = args.userEmail ? args.userEmail.trim().toLowerCase() : undefined;

    let user = await ctx.db.query('users').withIndex('by_clerk_id', q => q.eq('clerkId', userId)).first();

    // If not found by clerkId, search by email using index to match any existing account
    if (!user && normEmail) {
      user = await ctx.db.query('users').withIndex('by_email', q => q.eq('email', normEmail)).first();
    }

    // Enterprise entitlement verification: check purchases ledger and webhook logs
    const effectiveEmail = normEmail || (user?.email ? user.email.trim().toLowerCase() : undefined);
    let hasAuthoritativePurchase = false;
    let purchaseTxnId: string | undefined = undefined;

    if (effectiveEmail) {
      const purchase = await ctx.db.query('purchases').withIndex('by_email', q => q.eq('email', effectiveEmail)).first();
      if (purchase && purchase.status === 'completed') {
        hasAuthoritativePurchase = true;
        purchaseTxnId = purchase.transactionId;
      } else {
        const recentLogs = await ctx.db.query('webhookLogs').order('desc').take(50);
        const logMatch = recentLogs.find(l => {
          if (l.action !== 'PADDLE_transaction.completed') return false;
          const e1 = l.payload?.data?.custom_data?.email;
          const e2 = l.payload?.data?.customer?.email;
          return (e1 && e1.trim().toLowerCase() === effectiveEmail) || (e2 && e2.trim().toLowerCase() === effectiveEmail);
        });
        if (logMatch) {
          hasAuthoritativePurchase = true;
          purchaseTxnId = logMatch.payload?.data?.id;
        }
      }
    }

    if (!hasAuthoritativePurchase) {
      const purchaseByUserId = await ctx.db.query('purchases').withIndex('by_user_id', q => q.eq('userId', userId)).first();
      if (purchaseByUserId && purchaseByUserId.status === 'completed') {
        hasAuthoritativePurchase = true;
        purchaseTxnId = purchaseByUserId.transactionId;
      }
    }

    if (user) {
      if (hasAuthoritativePurchase || user.hasAccess) {
        user = {
          ...user,
          hasAccess: true,
          subscriptionId: purchaseTxnId || user.subscriptionId,
        };
      }
    } else if (hasAuthoritativePurchase) {
      // User paid, but user record is still pending sync. Provide synthetic user with full access
      user = {
        clerkId: userId,
        email: effectiveEmail,
        hasAccess: true,
        subscriptionId: purchaseTxnId,
        createdAt: new Date().toISOString(),
      } as any;
    }

    // 1. Fetch owned puppies and puppies shared via family invites
    const ownedPuppies = await ctx.db.query('puppies').withIndex('by_user', q => q.eq('userId', userId)).collect();
    const puppies = [...ownedPuppies];

    // Also include puppies shared with this user via family membership
    if (effectiveEmail) {
      const familyInvites = await ctx.db
        .query('familyMembers')
        .withIndex('by_email', q => q.eq('email', effectiveEmail))
        .collect();

      for (const invite of familyInvites) {
        if (invite.puppyId) {
          const normPupId = ctx.db.normalizeId('puppies', invite.puppyId);
          if (normPupId) {
            const sharedPup = await ctx.db.get(normPupId);
            if (sharedPup && !puppies.some((p: any) => p._id === sharedPup._id)) {
              puppies.push(sharedPup);
            }
          }
        }
      }
    }

    // Deduplicate puppies by trimmed lowercase name and ID
    const seenNames = new Set<string>();
    const seenIds = new Set<string>();
    const deduplicatedPuppies = puppies.filter((p: any) => {
      const key = (p.name || '').trim().toLowerCase();
      if (seenIds.has(p._id) || (key && seenNames.has(key))) return false;
      seenIds.add(p._id);
      if (key) seenNames.add(key);
      return true;
    });

    const accessiblePuppyIds = deduplicatedPuppies.map((p: any) => p._id);

    // Helper to query child tables for all accessible puppies + user's own records
    const collectForPuppies = async (table: any) => {
      const byUser = await ctx.db.query(table).withIndex('by_user', (q: any) => q.eq('userId', userId)).collect();
      const byPuppyPromises = accessiblePuppyIds.map((pupId: any) =>
        ctx.db.query(table).withIndex('by_puppy', (q: any) => q.eq('puppyId', pupId)).collect()
      );
      const byPuppyResults = await Promise.all(byPuppyPromises);
      const all = [...byUser, ...byPuppyResults.flat()];
      const seen = new Set<string>();
      return all.filter((item: any) => {
        if (seen.has(item._id)) return false;
        seen.add(item._id);
        return true;
      });
    };

    const [
      tasks, pottyLogs, feedingLogs, sleepLogs, walkLogs, vaccinations, medications, appointments, expenses, documents, behaviorLogs, groomingTasks, socialization, journalEntries, trainingLessons, notifications, familyMembers, memories, settings
    ] = await Promise.all([
      collectForPuppies('tasks'),
      collectForPuppies('pottyLogs'),
      collectForPuppies('feedingLogs'),
      collectForPuppies('sleepLogs'),
      collectForPuppies('walkLogs'),
      collectForPuppies('vaccinations'),
      collectForPuppies('medications'),
      collectForPuppies('appointments'),
      collectForPuppies('expenses'),
      collectForPuppies('documents'),
      collectForPuppies('behaviorLogs'),
      collectForPuppies('groomingTasks'),
      collectForPuppies('socialization'),
      collectForPuppies('journalEntries'),
      collectForPuppies('trainingLessons'),
      ctx.db.query('notifications').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('familyMembers').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('memories').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('userSettings').withIndex('by_user', q => q.eq('userId', userId)).first(),
    ]);

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
      socialization: socialization.map(normalizePuppyId),
      journalEntries: journalEntries.map(normalizePuppyId),
      trainingLessons: trainingLessons.map(normalizePuppyId),
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

// Dangerous mutation strictly internalMutation so it CANNOT be invoked by external clients/browsers
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

    const tables = [
      'puppies', 'tasks', 'pottyLogs', 'feedingLogs', 'sleepLogs', 'walkLogs',
      'vaccinations', 'medications', 'appointments', 'expenses', 'documents',
      'behaviorLogs', 'groomingTasks', 'socialization', 'journalEntries',
      'trainingLessons', 'notifications', 'familyMembers', 'memories',
      'userSettings', 'pushSubscriptions', 'images', 'emailLogs'
    ];
    
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

    // Check existing tasks for this puppy today to avoid duplicate creation on retry
    const existingTasks = await ctx.db
      .query("tasks")
      .withIndex("by_puppy_date", (q) =>
        q.eq("puppyId", puppyId as string).eq("date", todayDateStr)
      )
      .collect();

    const existingTitles = new Set(existingTasks.map((t) => t.title.trim().toLowerCase()));

    for (const task of args.tasks) {
      if (!existingTitles.has(task.title.trim().toLowerCase())) {
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

    const tables = [
      'puppies', 'tasks', 'pottyLogs', 'feedingLogs', 'sleepLogs', 'walkLogs',
      'vaccinations', 'medications', 'appointments', 'expenses', 'documents',
      'behaviorLogs', 'groomingTasks', 'socialization', 'journalEntries',
      'trainingLessons', 'notifications', 'familyMembers', 'memories',
      'userSettings', 'pushSubscriptions', 'images', 'emailLogs'
    ];

    for (const table of tables) {
      const records: any[] = await (ctx.db.query as any)(table)
        .withIndex('by_user', (q: any) => q.eq('userId', userId))
        .collect();
      for (const record of records) {
        await ctx.db.delete(record._id);
      }
    }

    const user = await ctx.db.query('users').withIndex('by_clerk_id', q => q.eq('clerkId', userId)).first();
    if (user?.email) {
      const externalFamilyInvites = await ctx.db
        .query('familyMembers')
        .withIndex('by_email', q => q.eq('email', user.email!.trim().toLowerCase()))
        .collect();
      for (const invite of externalFamilyInvites) {
        await ctx.db.delete(invite._id);
      }
    }
    if (user) await ctx.db.delete(user._id);

    return true;
  }
});
