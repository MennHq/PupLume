import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthUser, getAuthUser } from "./authHelper";

export const getPuppies = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUser(ctx, args.userId);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("puppies")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
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
      if (puppy && puppy.userId === userId) return puppy;
      return null;
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

    const { id, userId: _, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Puppy not found or unauthorized");
    }

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
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("name"), args.name))
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

    await ctx.db.delete(args.id);
    return args.id;
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

    // 1. Check if it's a valid Convex puppy ID
    const normId = ctx.db.normalizeId("puppies", raw);
    let puppy = null;
    if (normId) {
      puppy = await ctx.db.get(normId);
    }

    // 2. If not found by ID, look up by name or slugified variants
    if (!puppy) {
      const allPups = await ctx.db.query("puppies").collect();
      const cleanRaw = raw.toLowerCase().replace(/[^a-z0-9]/g, '');

      puppy = allPups.find((p) => {
        const pName = (p.name || '').trim().toLowerCase();
        if (pName === raw.toLowerCase()) return true;
        // Compare slugified (spaces replaced by hyphens)
        if (pName.replace(/[\s_]+/g, '-') === raw.toLowerCase().replace(/[\s_]+/g, '-')) return true;
        // Compare alphanumeric only
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

// Mutation to toggle Lost Mode and emergency notes (Owner only)
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

    const puppy = await ctx.db.get(args.puppyId);
    if (!puppy || puppy.userId !== userId) {
      throw new Error("Puppy not found or unauthorized");
    }

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
      const allPups = await ctx.db.query("puppies").collect();
      puppy = allPups.find(
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
