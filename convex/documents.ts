import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthUser, getAuthUser, verifyPuppyAccess } from "./authHelper";

export const listDocuments = query({
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
        .query("documents")
        .withIndex("by_user_puppy", (q) => q.eq("userId", userId).eq("puppyId", args.puppyId))
        .collect();
    }

    return await ctx.db
      .query("documents")
      .withIndex("by_puppy", (q) => q.eq("puppyId", args.puppyId))
      .collect();
  },
});

export const addDocument = mutation({
  args: {
    puppyId: v.string(),
    userId: v.optional(v.string()),
    title: v.string(),
    category: v.string(),
    date: v.string(),
    fileType: v.string(),
    fileSize: v.string(),
    fileUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);
    await verifyPuppyAccess(ctx, args.puppyId, userId);

    const { userId: _, ...data } = args;

    return await ctx.db.insert("documents", {
      ...data,
      userId,
    });
  },
});

export const deleteDocument = mutation({
  args: { 
    id: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const normId = ctx.db.normalizeId("documents", args.id);
    if (normId) {
      const doc = await ctx.db.get(normId);
      if (doc && doc.userId === userId) {
        await ctx.db.delete(normId);
        return normId;
      }
    }

    const doc = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("title"), args.id))
      .first();
    if (doc && doc.userId === userId) {
      await ctx.db.delete(doc._id);
      return doc._id;
    }

    throw new Error("Document not found or unauthorized");
  },
});
