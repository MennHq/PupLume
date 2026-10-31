import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthUser, getAuthUser } from "./authHelper";

export const listNotifications = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUser(ctx, args.userId);
    if (!userId) return [];

    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const addNotification = mutation({
  args: {
    userId: v.optional(v.string()),
    title: v.string(),
    message: v.string(),
    category: v.string(),
    timestamp: v.string(),
    actionUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const { userId: _, ...data } = args;

    return await ctx.db.insert("notifications", {
      ...data,
      userId,
      read: false,
    });
  },
});

export const markNotificationRead = mutation({
  args: { 
    id: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const normId = ctx.db.normalizeId("notifications", args.id);
    if (normId) {
      const item = await ctx.db.get(normId);
      if (item && item.userId === userId) {
        await ctx.db.patch(normId, { read: true });
        return;
      }
    }

    const item = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("read"), false))
      .first();
    if (item && item.userId === userId) {
      await ctx.db.patch(item._id, { read: true });
    }
  },
});

export const markAllNotificationsRead = mutation({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const items = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    for (const item of items) {
      await ctx.db.patch(item._id, { read: true });
    }
  },
});

export const registerPushSubscription = mutation({
  args: {
    userId: v.optional(v.string()),
    endpoint: v.string(),
    keys: v.object({
      p256dh: v.string(),
      auth: v.string(),
    }),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    // Check if endpoint already registered
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        userId,
        keys: args.keys,
        userAgent: args.userAgent,
      });
      return existing._id;
    }

    return await ctx.db.insert("pushSubscriptions", {
      userId,
      endpoint: args.endpoint,
      keys: args.keys,
      userAgent: args.userAgent,
      createdAt: new Date().toISOString(),
    });
  },
});

export const unregisterPushSubscription = mutation({
  args: {
    endpoint: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const sub = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first();

    if (sub && sub.userId === userId) {
      await ctx.db.delete(sub._id);
      return true;
    }
    return false;
  },
});
