import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthUser, getAuthUser, verifyPuppyAccess } from "./authHelper";

export const listBehaviorLogs = query({
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
        .query("behaviorLogs")
        .withIndex("by_user_puppy", (q) => q.eq("userId", userId).eq("puppyId", args.puppyId))
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("behaviorLogs")
      .withIndex("by_puppy", (q) => q.eq("puppyId", args.puppyId))
      .order("desc")
      .collect();
  },
});

export const addBehaviorLog = mutation({
  args: {
    puppyId: v.string(),
    userId: v.optional(v.string()),
    behaviorType: v.string(),
    timestamp: v.string(),
    severity: v.string(),
    trigger: v.optional(v.string()),
    whatHelped: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);
    await verifyPuppyAccess(ctx, args.puppyId, userId);

    const { userId: _, ...data } = args;

    return await ctx.db.insert("behaviorLogs", {
      ...data,
      userId,
    });
  },
});

export const deleteBehaviorLog = mutation({
  args: {
    id: v.id("behaviorLogs"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const record = await ctx.db.get(args.id);
    if (!record || record.userId !== userId) {
      throw new Error("Behavior log not found or unauthorized");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
