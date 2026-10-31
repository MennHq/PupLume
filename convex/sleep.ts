import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthUser, getAuthUser } from "./authHelper";

export const listSleepLogs = query({
  args: { 
    puppyId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUser(ctx, args.userId);
    if (!userId) return [];

    return await ctx.db
      .query("sleepLogs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
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
    if (!record || record.userId !== userId) {
      throw new Error("Log not found or unauthorized");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
