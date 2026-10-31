import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthUser, getAuthUser } from "./authHelper";

export const listExpenses = query({
  args: { 
    puppyId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUser(ctx, args.userId);
    if (!userId) return [];

    return await ctx.db
      .query("expenses")
      .withIndex("by_user", (idx) => idx.eq("userId", userId))
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
