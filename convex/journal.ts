import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthUser, getAuthUser } from "./authHelper";

export const listJournalEntries = query({
  args: { 
    puppyId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUser(ctx, args.userId);
    if (!userId) return [];

    return await ctx.db
      .query("journalEntries")
      .withIndex("by_user", (idx) => idx.eq("userId", userId))
      .collect();
  },
});

export const addJournalEntry = mutation({
  args: {
    puppyId: v.string(),
    userId: v.optional(v.string()),
    title: v.string(),
    date: v.string(),
    notes: v.string(),
    mediaUrl: v.optional(v.string()),
    milestoneBadge: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const { userId: _, ...data } = args;

    return await ctx.db.insert("journalEntries", {
      ...data,
      userId,
    });
  },
});

export const deleteJournalEntry = mutation({
  args: {
    id: v.id("journalEntries"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const entry = await ctx.db.get(args.id);
    if (!entry || entry.userId !== userId) {
      throw new Error("Journal entry not found or unauthorized");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
