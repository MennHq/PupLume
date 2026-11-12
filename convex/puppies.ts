import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthUser, getAuthUser, verifyPuppyAccess } from "./authHelper";

export const getPuppies = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUser(ctx, args.userId);
    if (!userId) {
      return [];
    }

    const ownedPuppies = await ctx.db
      .query("puppies")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Check if user is a family member for any shared puppies
    const identity = await ctx.auth.getUserIdentity();
    let email = identity?.email?.trim().toLowerCase();
    if (!email) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
        .first();
      email = user?.email?.trim().toLowerCase();
    }

    if (email) {
      const familyInvites = await ctx.db
        .query("familyMembers")
        .withIndex("by_email", (q) => q.eq("email", email!))
        .collect();

      for (const invite of familyInvites) {
        if (invite.puppyId) {
          const normPupId = ctx.db.normalizeId("puppies", invite.puppyId);
          if (normPupId) {
            const sharedPup = await ctx.db.get(normPupId);
            if (sharedPup && !ownedPuppies.some((p) => p._id === sharedPup._id)) {
              ownedPuppies.push(sharedPup);
            }
          }
        }
      }
    }

    return ownedPuppies;
  },
});

export const getPuppy = query({
  args: { 
    id: v.optional(v.id("puppies")),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUser(ctx, args.userId);
    if (!userId) return null;

    if (args.id) {
      const puppy = await ctx.db.get(args.id);
      if (!puppy) return null;
      try {
        await verifyPuppyAccess(ctx, puppy._id, userId);
        return puppy;
      } catch {
        return null;
      }
    }

    return await ctx.db
      .query("puppies")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

export const createPuppy = mutation({
  args: {
    userId: v.optional(v.string()),
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
    favoriteTreat: v.optional(v.string()),
    adoptionDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const { userId: _, ...data } = args;

    return await ctx.db.insert("puppies", {
      ...data,
      userId,
      createdAt: new Date().toISOString(),
    });
  },
});

export const updatePuppy = mutation({
  args: {
    id: v.id("puppies"),
    userId: v.optional(v.string()),
    name: v.optional(v.string()),
    breed: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    sex: v.optional(v.string()),
    weightLbs: v.optional(v.number()),
    photoUrl: v.optional(v.string()),
    temperament: v.optional(v.string()),
    dietaryRestrictions: v.optional(v.string()),
    microchipNumber: v.optional(v.string()),
    allergies: v.optional(v.string()),
    vetClinic: v.optional(v.string()),
    vetPhone: v.optional(v.string()),
    vetName: v.optional(v.string()),
    insuranceProvider: v.optional(v.string()),
    favoriteTreat: v.optional(v.string()),
    ownerPhone: v.optional(v.string()),
    ownerEmail: v.optional(v.string()),
    emergencyContactName: v.optional(v.string()),
    emergencyContactPhone: v.optional(v.string()),
    emergencyNotes: v.optional(v.string()),
    isLost: v.optional(v.boolean()),
    rewardAmount: v.optional(v.string()),
    slug: v.optional(v.string()),
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
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);
    await verifyPuppyAccess(ctx, args.id, userId);

    const { id, userId: _, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const savePuppy = mutation({
  args: {
    id: v.optional(v.string()),
    userId: v.optional(v.string()),
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
    createdAt: v.optional(v.string()),
    ownerPhone: v.optional(v.string()),
    ownerEmail: v.optional(v.string()),
    emergencyContactName: v.optional(v.string()),
    emergencyContactPhone: v.optional(v.string()),
    emergencyNotes: v.optional(v.string()),
    isLost: v.optional(v.boolean()),
    rewardAmount: v.optional(v.string()),
    slug: v.optional(v.string()),
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
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    // Try finding existing puppy by ID first, then by name
    let existing = null;
    if (args.id) {
      const normId = ctx.db.normalizeId("puppies", args.id);
      if (normId) {
        const p = await ctx.db.get(normId);
        if (p) {
          if (p.userId !== userId) {
            throw new Error("Unauthorized to modify this puppy");
          }
          existing = p;
        }
      }
    }

    if (!existing) {
      existing = await ctx.db
        .query("puppies")
        .withIndex("by_user_name", (q) => q.eq("userId", userId).eq("name", args.name))
        .first();
    }

    const data = {
      userId,
      name: args.name,
      breed: args.breed,
      birthDate: args.birthDate,
      sex: args.sex,
      weightLbs: args.weightLbs,
      photoUrl: args.photoUrl,
      temperament: args.temperament,
      dietaryRestrictions: args.dietaryRestrictions,
      microchipNumber: args.microchipNumber,
      allergies: args.allergies,
      vetClinic: args.vetClinic,
      vetPhone: args.vetPhone,
      vetName: args.vetName,
      insuranceProvider: args.insuranceProvider,
      insurancePolicyNumber: args.insurancePolicyNumber,
      favoriteTreat: args.favoriteTreat,
      adoptionDate: args.adoptionDate,
      ownerPhone: args.ownerPhone,
      ownerEmail: args.ownerEmail,
      emergencyContactName: args.emergencyContactName,
      emergencyContactPhone: args.emergencyContactPhone,
      emergencyNotes: args.emergencyNotes,
      isLost: args.isLost,
      rewardAmount: args.rewardAmount,
      slug: args.slug !== undefined ? args.slug : existing?.slug,
      hasSmartTagPass: (args.hasSmartTagPass || existing?.hasSmartTagPass) ?? false,
      ownerInstagram: args.ownerInstagram,
      ownerFacebook: args.ownerFacebook,
      ownerWhatsApp: args.ownerWhatsApp,
      ownerTelegram: args.ownerTelegram,
      ownerSlack: args.ownerSlack,
      communicationLinks: args.communicationLinks,
      createdAt: args.createdAt || new Date().toISOString(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    }

    // If an ID was specified but not found, this puppy was deleted or wiped — do not resurrect
    if (args.id) {
      return null;
    }

    return await ctx.db.insert("puppies", data);
  },
});

export const deletePuppy = mutation({
  args: { 
    id: v.id("puppies"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Puppy not found or unauthorized");
    }

    // Cascade delete child records for this puppy to prevent orphan records
    const childTables = [
      'tasks', 'pottyLogs', 'feedingLogs', 'sleepLogs', 'walkLogs',
      'vaccinations', 'medications', 'appointments', 'expenses', 'documents',
      'behaviorLogs', 'groomingTasks', 'socialization', 'journalEntries',
      'trainingLessons'
    ];

    const puppyIdStr = args.id as string;
    for (const table of childTables) {
      const childRecords: any[] = await (ctx.db.query as any)(table)
        .withIndex('by_puppy', (q: any) => q.eq('puppyId', puppyIdStr))
        .collect();
      for (const rec of childRecords) {
        await ctx.db.delete(rec._id);
      }
    }

    // Also delete any memories referencing this puppy
    const pupMemories = await ctx.db
      .query('memories')
      .withIndex('by_user', q => q.eq('userId', userId))
      .filter(q => q.eq(q.field('puppyId'), puppyIdStr))
      .collect();
    for (const mem of pupMemories) {
      await ctx.db.delete(mem._id);
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

const RESERVED_SLUGS = new Set([
  'home', 'tasks', 'plan', 'ai', 'academy', 'more', 'potty', 'health', 
  'expenses', 'vault', 'socialization', 'journal', 'recap', 'puppy', 
  'profile', 'sharing', 'settings', 'onboarding', 'privacy', 'terms',
  'auth', 'signin', 'signup', 'login', 'api', 'pup', 'safety', 'p', 
  'sw', 'assets', 'favicon', 'robots', 'paddlelog', 'share-target'
]);

// Query to check if a custom puppy URL slug is available
export const checkSlugAvailability = query({
  args: {
    slug: v.string(),
    puppyId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const cleanSlug = (args.slug || "")
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, '');

    if (!cleanSlug) {
      return { available: false, reason: "Slug cannot be empty." };
    }
    if (cleanSlug.length < 3 || cleanSlug.length > 7) {
      return { available: false, reason: "Slug must be between 3 and 7 characters." };
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)) {
      return { available: false, reason: "Slug must contain only lowercase letters, numbers, and single hyphens." };
    }
    if (RESERVED_SLUGS.has(cleanSlug)) {
      return { available: false, reason: `"${cleanSlug}" is reserved for system routes.` };
    }

    const match = await ctx.db
      .query("puppies")
      .withIndex("by_slug", (q) => q.eq("slug", cleanSlug))
      .first();

    if (match) {
      const matchId = match._id.toString();
      if (args.puppyId && matchId === args.puppyId) {
        return { available: true, isCurrent: true };
      }
      return { available: false, reason: "This custom URL is already in use by another puppy." };
    }

    return { available: true };
  },
});

// Mutation to migrate/update a puppy's public URL slug
export const updatePuppySlug = mutation({
  args: {
    puppyId: v.id("puppies"),
    slug: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);
    const existing = await ctx.db.get(args.puppyId);
    if (!existing || existing.userId !== userId) {
      throw new Error("Puppy not found or unauthorized");
    }

    const cleanSlug = args.slug
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, '');

    if (cleanSlug.length < 3 || cleanSlug.length > 7) {
      throw new Error("Slug must be between 3 and 7 characters.");
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)) {
      throw new Error("Slug must only contain lowercase alphanumeric characters and single hyphens.");
    }
    if (RESERVED_SLUGS.has(cleanSlug)) {
      throw new Error(`"${cleanSlug}" is a reserved system path.`);
    }

    // Name inclusion rule
    const cleanPupName = (existing.name || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '');
    let nameMatches = false;
    if (cleanPupName.length <= 7) {
      nameMatches = cleanSlug.includes(cleanPupName) || cleanSlug.replace(/-/g, '').includes(cleanPupName);
    } else {
      const prefix = cleanPupName.slice(0, 3);
      nameMatches = cleanSlug.includes(prefix) || cleanSlug.replace(/-/g, '').includes(prefix);
    }
    if (!nameMatches && cleanPupName) {
      throw new Error(`The slug must contain your puppy's name ("${existing.name}").`);
    }

    // Uniqueness validation
    const collision = await ctx.db
      .query("puppies")
      .withIndex("by_slug", (q) => q.eq("slug", cleanSlug))
      .first();

    if (collision && collision._id !== args.puppyId) {
      throw new Error("This custom URL is already in use by another puppy. Please choose a unique slug.");
    }

    await ctx.db.patch(args.puppyId, { slug: cleanSlug });
    return { success: true, slug: cleanSlug };
  },
});

// Public query for Smart QR Collar Tag emergency page (Intentionally accessible without user login when a dog is lost)
export const getPublicPuppyByTag = query({
  args: { identifier: v.string() },
  handler: async (ctx, args) => {
    let raw = (args.identifier || "").trim();
    if (!raw) return null;

    try {
      raw = decodeURIComponent(raw).trim();
    } catch {
      // Keep raw if decoding fails
    }

    const cleanSlug = raw
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, '');

    // 1. Primary lookup: Match exact custom URL slug
    let puppy = null;
    if (cleanSlug) {
      puppy = await ctx.db
        .query("puppies")
        .withIndex("by_slug", (q) => q.eq("slug", cleanSlug))
        .first();
    }

    // 2. Next lookup: Check if raw identifier is a valid Convex ID
    if (!puppy) {
      const normId = ctx.db.normalizeId("puppies", raw);
      if (normId) {
        puppy = await ctx.db.get(normId);
      }
    }

    // 3. Fallback for uncustomized puppies (NO custom slug has been chosen yet)
    if (!puppy) {
      const candidates = await ctx.db.query("puppies").take(100);
      const cleanRaw = raw.toLowerCase().replace(/[^a-z0-9]/g, '');

      puppy = candidates.find((p) => {
        if (p.slug && p.slug !== cleanSlug) {
          return false;
        }
        const pName = (p.name || '').trim().toLowerCase();
        if (pName === raw.toLowerCase()) return true;
        if (pName.replace(/[\s_]+/g, '-') === raw.toLowerCase().replace(/[\s_]+/g, '-')) return true;
        const cleanPName = pName.replace(/[^a-z0-9]/g, '');
        if (cleanPName && cleanPName === cleanRaw) return true;
        return false;
      }) || null;
    }

    if (!puppy) return null;

    // Return safe, sanitized emergency info (no internal auth secrets)
    return {
      _id: puppy._id,
      name: puppy.name,
      breed: puppy.breed,
      sex: puppy.sex,
      weightLbs: puppy.weightLbs,
      birthDate: puppy.birthDate,
      photoUrl: puppy.photoUrl,
      temperament: puppy.temperament,
      allergies: puppy.allergies,
      dietaryRestrictions: puppy.dietaryRestrictions,
      microchipNumber: puppy.microchipNumber,
      vetClinic: puppy.vetClinic,
      vetPhone: puppy.vetPhone,
      vetName: puppy.vetName,
      ownerPhone: puppy.ownerPhone,
      ownerEmail: puppy.ownerEmail,
      emergencyContactName: puppy.emergencyContactName,
      emergencyContactPhone: puppy.emergencyContactPhone,
      emergencyNotes: puppy.emergencyNotes,
      isLost: puppy.isLost ?? false,
      rewardAmount: puppy.rewardAmount,
      slug: puppy.slug,
      hasSmartTagPass: puppy.hasSmartTagPass ?? false,
      ownerInstagram: puppy.ownerInstagram,
      ownerFacebook: puppy.ownerFacebook,
      ownerWhatsApp: puppy.ownerWhatsApp,
      ownerTelegram: puppy.ownerTelegram,
      ownerSlack: puppy.ownerSlack,
      communicationLinks: puppy.communicationLinks,
    };
  },
});

// Mutation to toggle Lost Mode and emergency notes (Owner or authorized family only)
export const updateSmartTagLostMode = mutation({
  args: {
    puppyId: v.id("puppies"),
    userId: v.optional(v.string()),
    isLost: v.boolean(),
    rewardAmount: v.optional(v.string()),
    emergencyNotes: v.optional(v.string()),
    ownerPhone: v.optional(v.string()),
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
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);
    await verifyPuppyAccess(ctx, args.puppyId, userId);

    await ctx.db.patch(args.puppyId, {
      isLost: args.isLost,
      ...(args.rewardAmount !== undefined ? { rewardAmount: args.rewardAmount } : {}),
      ...(args.emergencyNotes !== undefined ? { emergencyNotes: args.emergencyNotes } : {}),
      ...(args.ownerPhone !== undefined ? { ownerPhone: args.ownerPhone } : {}),
      ...(args.ownerInstagram !== undefined ? { ownerInstagram: args.ownerInstagram } : {}),
      ...(args.ownerFacebook !== undefined ? { ownerFacebook: args.ownerFacebook } : {}),
      ...(args.ownerWhatsApp !== undefined ? { ownerWhatsApp: args.ownerWhatsApp } : {}),
      ...(args.ownerTelegram !== undefined ? { ownerTelegram: args.ownerTelegram } : {}),
      ...(args.ownerSlack !== undefined ? { ownerSlack: args.ownerSlack } : {}),
      ...(args.communicationLinks !== undefined ? { communicationLinks: args.communicationLinks } : {}),
    });

    return true;
  },
});

// Mutation to unlock Smart Tag Pass (Owner only)
export const unlockSmartTagPass = mutation({
  args: {
    puppyId: v.optional(v.string()),
    identifier: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    let puppy = null;
    const candidateId = args.puppyId || args.identifier;
    if (candidateId) {
      const normId = ctx.db.normalizeId("puppies", candidateId.trim());
      if (normId) {
        const p = await ctx.db.get(normId);
        if (p && p.userId === userId) {
          puppy = p;
        }
      }
    }

    if (!puppy) {
      const userPups = await ctx.db
        .query("puppies")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      if (args.identifier) {
        const raw = args.identifier.trim().toLowerCase();
        puppy = userPups.find(
          (p) => p.name.trim().toLowerCase() === raw
        ) || null;
      }
      if (!puppy && userPups.length > 0) {
        puppy = userPups[0];
      }
    }

    if (!puppy || puppy.userId !== userId) {
      throw new Error("Puppy not found or unauthorized");
    }

    await ctx.db.patch(puppy._id, {
      hasSmartTagPass: true,
    });

    return puppy._id;
  },
});

// Webhook-driven internal unlock (cannot be triggered by client)
export const unlockSmartTagPassInternal = internalMutation({
  args: {
    puppyId: v.optional(v.string()),
    puppyName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let puppy = null;
    if (args.puppyId) {
      const normId = ctx.db.normalizeId("puppies", args.puppyId);
      if (normId) {
        puppy = await ctx.db.get(normId);
      }
    }
    if (!puppy && args.puppyName) {
      const candidates = await ctx.db.query("puppies").take(100);
      puppy = candidates.find(
        (p) => p.name.trim().toLowerCase() === args.puppyName!.trim().toLowerCase()
      ) || null;
    }

    if (puppy) {
      await ctx.db.patch(puppy._id, { hasSmartTagPass: true });
      return true;
    }
    return false;
  },
});
