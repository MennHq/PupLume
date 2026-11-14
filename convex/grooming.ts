import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthUser, getAuthUser, verifyPuppyAccess } from "./authHelper";

export const listGroomingTasks = query({
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
        .query("groomingTasks")
        .withIndex("by_user_puppy", (q) => q.eq("userId", userId).eq("puppyId", args.puppyId))
        .collect();
    }

    return await ctx.db
      .query("groomingTasks")
      .withIndex("by_puppy", (q) => q.eq("puppyId", args.puppyId))
      .collect();
  },
});

export const saveGroomingTasks = mutation({
  args: {
    puppyId: v.string(),
    userId: v.optional(v.string()),
    tasks: v.array(
      v.object({
        type: v.string(),
        label: v.string(),
        lastDone: v.optional(v.string()),
        nextDue: v.string(),
        frequencyDays: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);
    await verifyPuppyAccess(ctx, args.puppyId, userId);

    // Remove existing grooming tasks for this puppy using index
    const existing = await ctx.db
      .query("groomingTasks")
      .withIndex("by_puppy", (q) => q.eq("puppyId", args.puppyId))
      .collect();

    for (const item of existing) {
      await ctx.db.delete(item._id);
    }

    // Insert new
    for (const t of args.tasks) {
      await ctx.db.insert("groomingTasks", {
        puppyId: args.puppyId,
        userId,
        type: t.type,
        label: t.label,
        lastDone: t.lastDone,
        nextDue: t.nextDue,
        frequencyDays: t.frequencyDays,
      });
    }

    return true;
  },
});
