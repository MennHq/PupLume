import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthUser, getAuthUser, verifyPuppyAccess } from "./authHelper";

export const listSleepLogs = query({
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
        .query("sleepLogs")
        .withIndex("by_user_puppy", (q) => q.eq("userId", userId).eq("puppyId", args.puppyId))
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("sleepLogs")
      .withIndex("by_puppy", (q) => q.eq("puppyId", args.puppyId))
      .order("desc")
      .collect();
  },
});

export const addSleepLog = mutation({
  args: {
    puppyId: v.string(),
    userId: v.optional(v.string()),
    type: v.string(),
    startTime: v.string(),
    endTime: v.optional(v.string()),
    durationMin: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);
    await verifyPuppyAccess(ctx, args.puppyId, userId);

    const { userId: _, ...data } = args;

    return await ctx.db.insert("sleepLogs", {
      ...data,
      userId,
    });
  },
});

export const deleteSleepLog = mutation({
  args: {
    id: v.id("sleepLogs"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const record = await ctx.db.get(args.id);
    if (!record) {
      throw new Error("Log not found");
    }
    await verifyPuppyAccess(ctx, record.puppyId, userId);

    await ctx.db.delete(args.id);
    return args.id;
  },
});
