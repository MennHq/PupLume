import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthUser, getAuthUser, verifyPuppyAccess } from "./authHelper";

export const listJournalEntries = query({
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
        .query("journalEntries")
        .withIndex("by_user_puppy", (idx) => idx.eq("userId", userId).eq("puppyId", args.puppyId))
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("journalEntries")
      .withIndex("by_puppy", (idx) => idx.eq("puppyId", args.puppyId))
      .order("desc")
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
    await verifyPuppyAccess(ctx, args.puppyId, userId);

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
    if (!entry) {
      throw new Error("Journal entry not found");
    }
    await verifyPuppyAccess(ctx, entry.puppyId, userId);

    await ctx.db.delete(args.id);
    return args.id;
  },
});
