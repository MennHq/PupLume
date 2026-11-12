import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthUser, getAuthUser, verifyPuppyAccess } from "./authHelper";

export const listSocialization = query({
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
        .query("socialization")
        .withIndex("by_user_puppy", (q) => q.eq("userId", userId).eq("puppyId", args.puppyId))
        .collect();
    }

    return await ctx.db
      .query("socialization")
      .withIndex("by_puppy", (q) => q.eq("puppyId", args.puppyId))
      .collect();
  },
});

export const updateSocializationStatus = mutation({
  args: {
    puppyId: v.string(),
    userId: v.optional(v.string()),
    category: v.string(),
    title: v.string(),
    description: v.string(),
    status: v.string(),
    notes: v.optional(v.string()),
    lastUpdated: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);
    await verifyPuppyAccess(ctx, args.puppyId, userId);

    const existing = await ctx.db
      .query("socialization")
      .withIndex("by_puppy", (q) => q.eq("puppyId", args.puppyId))
      .filter((q) => q.eq(q.field("title"), args.title))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        notes: args.notes,
        lastUpdated: args.lastUpdated,
      });
      return existing._id;
    }

    const { userId: _, ...data } = args;

    return await ctx.db.insert("socialization", {
      ...data,
      userId,
    });
  },
});
