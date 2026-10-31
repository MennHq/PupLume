import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthUser, getAuthUser } from "./authHelper";

export const listFamilyMembers = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUser(ctx, args.userId);
    if (!userId) return [];

    return await ctx.db
      .query("familyMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const addFamilyMember = mutation({
  args: {
    puppyId: v.optional(v.string()),
    userId: v.optional(v.string()),
    name: v.string(),
    email: v.string(),
    role: v.string(),
    avatarUrl: v.optional(v.string()),
    dateAdded: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const { userId: _, ...data } = args;

    return await ctx.db.insert("familyMembers", {
      ...data,
      userId,
    });
  },
});

export const deleteFamilyMember = mutation({
  args: { 
    id: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const normId = ctx.db.normalizeId("familyMembers", args.id);
    if (normId) {
      const member = await ctx.db.get(normId);
      if (member && member.userId === userId) {
        await ctx.db.delete(normId);
        return normId;
      }
    }

    const member = await ctx.db
      .query("familyMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("email"), args.id))
      .first();
    if (member && member.userId === userId) {
      await ctx.db.delete(member._id);
      return member._id;
    }

    throw new Error("Family member not found or unauthorized");
  },
});
