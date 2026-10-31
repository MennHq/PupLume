import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthUser, getAuthUser } from "./authHelper";

export const getTrainingLessons = query({
  args: { 
    puppyId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUser(ctx, args.userId);
    if (!userId) return [];

    return await ctx.db
      .query("trainingLessons")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const updateLessonStatus = mutation({
  args: {
    puppyId: v.string(),
    userId: v.optional(v.string()),
    lessonId: v.string(),
    completed: v.boolean(),
    mastered: v.boolean(),
    lastPracticed: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const existing = await ctx.db
      .query("trainingLessons")
      .withIndex("by_puppy_lesson", (q) =>
        q.eq("puppyId", args.puppyId).eq("lessonId", args.lessonId)
      )
      .first();

    if (existing) {
      if (existing.userId !== userId) {
        throw new Error("Unauthorized to modify this lesson");
      }
      await ctx.db.patch(existing._id, {
        completed: args.completed,
        mastered: args.mastered,
        lastPracticed: args.lastPracticed || new Date().toISOString().split("T")[0],
      });
      return existing._id;
    }

    return await ctx.db.insert("trainingLessons", {
      puppyId: args.puppyId,
      userId,
      lessonId: args.lessonId,
      completed: args.completed,
      mastered: args.mastered,
      lastPracticed: args.lastPracticed || new Date().toISOString().split("T")[0],
    });
  },
});
