import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthUser, getAuthUser } from "./authHelper";

export const getSettings = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUser(ctx, args.userId);
    if (!userId) return null;

    return await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

export const saveSettings = mutation({
  args: {
    userId: v.optional(v.string()),
    pottyAlerts: v.boolean(),
    feedingAlerts: v.boolean(),
    trainingAlerts: v.boolean(),
    medAlerts: v.boolean(),
    taskAlerts: v.optional(v.boolean()),
    units: v.string(),
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
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const updatedAt = new Date().toISOString();
    const { userId: _, ...data } = args;

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...data,
        updatedAt,
      });
      return existing._id;
    }

    const hasPuppy = await ctx.db
      .query("puppies")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!hasPuppy) {
      return null;
    }

    return await ctx.db.insert("userSettings", {
      ...data,
      userId,
      updatedAt,
    });
  },
});

export const dismissChecklistForever = mutation({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const updatedAt = new Date().toISOString();
    if (existing) {
      await ctx.db.patch(existing._id, {
        hasCompletedChecklist: true,
        updatedAt,
      });
      return existing._id;
    }

    return await ctx.db.insert("userSettings", {
      userId,
      pottyAlerts: true,
      feedingAlerts: true,
      trainingAlerts: true,
      medAlerts: true,
      units: "imperial",
      hasCompletedChecklist: true,
      updatedAt,
    });
  },
});
