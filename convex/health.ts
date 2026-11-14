import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthUser, getAuthUser, verifyPuppyAccess } from "./authHelper";

// Vaccinations
export const listVaccinations = query({
  args: { 
    puppyId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUser(ctx, args.userId);
    if (!userId) return [];

    const { isPersisted } = await verifyPuppyAccess(ctx, args.puppyId, userId);

    if (!isPersisted) {
      return await ctx.db
        .query("vaccinations")
        .withIndex("by_user_puppy", (idx) => idx.eq("userId", userId).eq("puppyId", args.puppyId))
        .collect();
    }

    return await ctx.db
      .query("vaccinations")
      .withIndex("by_puppy", (idx) => idx.eq("puppyId", args.puppyId))
      .collect();
  },
});

export const addVaccination = mutation({
  args: {
    puppyId: v.string(),
    userId: v.optional(v.string()),
    name: v.optional(v.string()),
    vaccineName: v.optional(v.string()),
    status: v.string(),
    administeredDate: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    nextDueDate: v.optional(v.string()),
    vetClinic: v.optional(v.string()),
    lotNumber: v.optional(v.string()),
    isCore: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);
    await verifyPuppyAccess(ctx, args.puppyId, userId);

    const { userId: _, ...data } = args;

    return await ctx.db.insert("vaccinations", {
      ...data,
      name: data.name || data.vaccineName || "Vaccine",
      vaccineName: data.vaccineName || data.name || "Vaccine",
      userId,
    });
  },
});

// Medications
export const listMedications = query({
  args: { 
    puppyId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUser(ctx, args.userId);
    if (!userId) return [];

    const { isPersisted } = await verifyPuppyAccess(ctx, args.puppyId, userId);

    if (!isPersisted) {
      return await ctx.db
        .query("medications")
        .withIndex("by_user_puppy", (idx) => idx.eq("userId", userId).eq("puppyId", args.puppyId))
        .collect();
    }

    return await ctx.db
      .query("medications")
      .withIndex("by_puppy", (idx) => idx.eq("puppyId", args.puppyId))
      .collect();
  },
});

export const addMedication = mutation({
  args: {
    puppyId: v.string(),
    userId: v.optional(v.string()),
    name: v.string(),
    dosage: v.string(),
    frequency: v.string(),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    reminderTime: v.optional(v.string()),
    active: v.boolean(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);
    await verifyPuppyAccess(ctx, args.puppyId, userId);

    const { userId: _, ...data } = args;

    return await ctx.db.insert("medications", {
      ...data,
      userId,
    });
  },
});

// Vet Appointments
export const listAppointments = query({
  args: { 
    puppyId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUser(ctx, args.userId);
    if (!userId) return [];

    const { isPersisted } = await verifyPuppyAccess(ctx, args.puppyId, userId);

    if (!isPersisted) {
      return await ctx.db
        .query("appointments")
        .withIndex("by_user_puppy", (idx) => idx.eq("userId", userId).eq("puppyId", args.puppyId))
        .collect();
    }

    return await ctx.db
      .query("appointments")
      .withIndex("by_puppy", (idx) => idx.eq("puppyId", args.puppyId))
      .collect();
  },
});

export const addAppointment = mutation({
  args: {
    puppyId: v.string(),
    userId: v.optional(v.string()),
    title: v.string(),
    clinic: v.string(),
    date: v.string(),
    time: v.string(),
    reason: v.string(),
    status: v.string(),
    doctor: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);
    await verifyPuppyAccess(ctx, args.puppyId, userId);

    const { userId: _, ...data } = args;

    return await ctx.db.insert("appointments", {
      ...data,
      userId,
    });
  },
});

export const deleteVaccination = mutation({
  args: {
    id: v.id("vaccinations"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const record = await ctx.db.get(args.id);
    if (!record) {
      throw new Error("Record not found");
    }
    await verifyPuppyAccess(ctx, record.puppyId, userId);

    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const deleteMedication = mutation({
  args: {
    id: v.id("medications"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const record = await ctx.db.get(args.id);
    if (!record) {
      throw new Error("Record not found");
    }
    await verifyPuppyAccess(ctx, record.puppyId, userId);

    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const deleteAppointment = mutation({
  args: {
    id: v.id("appointments"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const record = await ctx.db.get(args.id);
    if (!record) {
      throw new Error("Record not found");
    }
    await verifyPuppyAccess(ctx, record.puppyId, userId);

    await ctx.db.delete(args.id);
    return args.id;
  },
});
