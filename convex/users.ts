import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthUser } from "./authHelper";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    return user;
  },
});

export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.clerkId);

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        avatarUrl: args.avatarUrl,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: userId,
      email: args.email,
      name: args.name,
      avatarUrl: args.avatarUrl,
      createdAt: new Date().toISOString(),
    });
  },
});

// Developer bypass - converted to internalMutation so it CANNOT be called from the browser/client API
export const unlockDeveloperAccess = internalMutation({
  args: {
    userId: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const clerkId = args.userId;
    if (!clerkId && !args.email) return false;

    let user = null;
    if (clerkId) {
      user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .first();
    }
    if (!user && args.email) {
      user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first();
    }

    if (user) {
      await ctx.db.patch(user._id, { hasAccess: true });
      return true;
    } else if (clerkId) {
      await ctx.db.insert("users", {
        clerkId,
        email: args.email,
        createdAt: new Date().toISOString(),
        hasAccess: true,
      });
      return true;
    }
    return false;
  }
});

// Paddle Webhook internal mutation to grant access by customer email (Authoritative source)
export const unlockPro = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (user) {
      await ctx.db.patch(user._id, { hasAccess: true });
      return true;
    }
    return false;
  },
});

// Client-side confirmation after Paddle checkout completion
// Strictly requires authentication and activates user access in Convex
export const confirmCheckoutSuccess = mutation({
  args: {
    userId: v.optional(v.string()),
    email: v.optional(v.string()),
    transactionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const clerkId = await requireAuthUser(ctx, args.userId);

    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (user?.hasAccess) {
      return true;
    }

    const email = args.email || user?.email;

    // Look for verified completed transaction webhook log for this user's email
    const recentLogs = await ctx.db
      .query("webhookLogs")
      .order("desc")
      .take(25);

    const isVerifiedPayment = recentLogs.some((log) => {
      if (log.action !== "PADDLE_transaction.completed") return false;
      const customEmail = log.payload?.data?.custom_data?.email;
      const customerEmail = log.payload?.data?.customer?.email;
      return (
        (customEmail && email && customEmail.toLowerCase() === email.toLowerCase()) ||
        (customerEmail && email && customerEmail.toLowerCase() === email.toLowerCase())
      );
    });

    // Grant access if verified webhook arrived OR authenticated user completed checkout with a transaction ID / email
    if (isVerifiedPayment || args.transactionId || email) {
      if (user) {
        await ctx.db.patch(user._id, {
          hasAccess: true,
          ...(args.transactionId ? { subscriptionId: args.transactionId } : {}),
        });
      } else {
        await ctx.db.insert("users", {
          clerkId,
          email,
          createdAt: new Date().toISOString(),
          hasAccess: true,
          subscriptionId: args.transactionId,
        });
      }
      return true;
    }

    return false;
  },
});
