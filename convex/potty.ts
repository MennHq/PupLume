import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthUser, getAuthUser } from "./authHelper";

export const listPottyLogs = query({
  args: { 
    puppyId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUser(ctx, args.userId);
    if (!userId) return [];

    return await ctx.db
      .query("pottyLogs")
      .withIndex("by_user", (idx) => idx.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const addPottyLog = mutation({
  args: {
    puppyId: v.string(),
    userId: v.optional(v.string()),
    type: v.string(),
    location: v.string(),
    timestamp: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const { userId: _, ...data } = args;

    return await ctx.db.insert("pottyLogs", {
      ...data,
      userId,
    });
  },
});

export const deletePottyLog = mutation({
  args: { 
    id: v.id("pottyLogs"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const log = await ctx.db.get(args.id);
    if (!log || log.userId !== userId) {
      throw new Error("Log not found or unauthorized");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
