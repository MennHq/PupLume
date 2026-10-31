import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthUser, getAuthUser } from "./authHelper";

export const listFeedingLogs = query({
  args: { 
    puppyId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUser(ctx, args.userId);
    if (!userId) return [];

    return await ctx.db
      .query("feedingLogs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const addFeedingLog = mutation({
  args: {
    puppyId: v.string(),
    userId: v.optional(v.string()),
    mealType: v.string(),
    amountCups: v.optional(v.number()),
    foodBrand: v.optional(v.string()),
    timestamp: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const { userId: _, ...data } = args;

    return await ctx.db.insert("feedingLogs", {
      ...data,
      userId,
    });
  },
});

export const deleteFeedingLog = mutation({
  args: {
    id: v.id("feedingLogs"),
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
