import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthUser, getAuthUser, verifyPuppyAccess } from "./authHelper";

export const listWalkLogs = query({
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
        .query("walkLogs")
        .withIndex("by_user_puppy", (q) => q.eq("userId", userId).eq("puppyId", args.puppyId))
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("walkLogs")
      .withIndex("by_puppy", (q) => q.eq("puppyId", args.puppyId))
      .order("desc")
      .collect();
  },
});

export const addWalkLog = mutation({
  args: {
    puppyId: v.string(),
    userId: v.optional(v.string()),
    startTime: v.optional(v.string()),
    durationMin: v.number(),
    distanceMiles: v.optional(v.number()),
    peesCount: v.optional(v.number()),
    poopsCount: v.optional(v.number()),
    pullingRating: v.optional(v.string()),
    reactivityNotes: v.optional(v.string()),
    timestamp: v.optional(v.string()),
    route: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);
    await verifyPuppyAccess(ctx, args.puppyId, userId);

    const { userId: _, ...data } = args;

    return await ctx.db.insert("walkLogs", {
      ...data,
      userId,
    });
  },
});

export const deleteWalkLog = mutation({
  args: {
    id: v.id("walkLogs"),
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
