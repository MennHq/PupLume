import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthUser, getAuthUser, verifyPuppyAccess } from "./authHelper";

export const listExpenses = query({
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
        .query("expenses")
        .withIndex("by_user_puppy", (idx) => idx.eq("userId", userId).eq("puppyId", args.puppyId))
        .collect();
    }

    return await ctx.db
      .query("expenses")
      .withIndex("by_puppy", (idx) => idx.eq("puppyId", args.puppyId))
      .collect();
  },
});

export const addExpense = mutation({
  args: {
    puppyId: v.string(),
    userId: v.optional(v.string()),
    title: v.string(),
    category: v.string(),
    amount: v.number(),
    date: v.string(),
    vendor: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);
    await verifyPuppyAccess(ctx, args.puppyId, userId);

    if (args.amount < 0) {
      throw new Error("Invalid expense amount: must be non-negative.");
    }

    const { userId: _, ...data } = args;

    return await ctx.db.insert("expenses", {
      ...data,
      userId,
    });
  },
});

export const deleteExpense = mutation({
  args: {
    id: v.id("expenses"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const record = await ctx.db.get(args.id);
    if (!record || record.userId !== userId) {
      throw new Error("Expense not found or unauthorized");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
