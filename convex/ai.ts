import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthUser, verifyPuppyAccess } from "./authHelper";

// Ephemeral Chat: aiMessages table was removed for privacy.

export const saveMemory = mutation({
  args: {
    fact: v.string(),
    category: v.optional(v.string()),
    puppyId: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    if (args.puppyId) {
      await verifyPuppyAccess(ctx, args.puppyId, userId);
    }

    return await ctx.db.insert("memories", {
      userId,
      puppyId: args.puppyId,
      fact: args.fact,
      category: args.category,
      createdAt: new Date().toISOString(),
    });
  },
});

export const deleteMemory = mutation({
  args: { 
    memoryId: v.id("memories"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const memory = await ctx.db.get(args.memoryId);
    if (!memory || memory.userId !== userId) throw new Error("Unauthorized");

    await ctx.db.delete(args.memoryId);
  }
});
