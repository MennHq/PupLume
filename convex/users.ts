import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthUser } from "./authHelper";

/**
 * Checks whether an account has lifetime access by querying all authoritative sources:
 * 1. The immutable `purchases` ledger
 * 2. Any completed transactions in `webhookLogs`
 * 3. Any existing user document with `hasAccess === true`
 */
async function checkUserHasPurchased(
  ctx: any,
  email?: string,
  clerkId?: string
): Promise<{ hasAccess: boolean; transactionId?: string; customerId?: string }> {
  const normEmail = email ? email.trim().toLowerCase() : null;

  // 1. Check purchases ledger by email using index
  if (normEmail) {
    const purchaseByEmail = await ctx.db
      .query("purchases")
      .withIndex("by_email", (q: any) => q.eq("email", normEmail))
      .first();

    if (purchaseByEmail && purchaseByEmail.status === "completed") {
      return {
        hasAccess: true,
        transactionId: purchaseByEmail.transactionId,
        customerId: purchaseByEmail.customerId,
      };
    }
  }

  // 2. Check purchases ledger by userId using index
  if (clerkId) {
    const purchaseByUserId = await ctx.db
      .query("purchases")
      .withIndex("by_user_id", (q: any) => q.eq("userId", clerkId))
      .first();

    if (purchaseByUserId && purchaseByUserId.status === "completed") {
      return {
        hasAccess: true,
        transactionId: purchaseByUserId.transactionId,
        customerId: purchaseByUserId.customerId,
      };
    }
  }

  // 3. Fallback scan of recent webhook logs for completed Paddle transactions
  if (normEmail) {
    const recentLogs = await ctx.db
      .query("webhookLogs")
      .order("desc")
      .take(50);

    for (const log of recentLogs) {
      if (log.action !== "PADDLE_transaction.completed") continue;
      const customEmail = log.payload?.data?.custom_data?.email;
      const customerEmail = log.payload?.data?.customer?.email;
      const txnId = log.payload?.data?.id;
      const custId = log.payload?.data?.customer_id;

      if (
        (customEmail && customEmail.trim().toLowerCase() === normEmail) ||
        (customerEmail && customerEmail.trim().toLowerCase() === normEmail)
      ) {
        return {
          hasAccess: true,
          transactionId: txnId,
          customerId: custId,
        };
      }
    }
  }

  return { hasAccess: false };
}

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
    const normEmail = args.email ? args.email.trim().toLowerCase() : undefined;

    // 1. Look up existing user by clerkId
    let existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    // 2. If not found by clerkId, search by email using index (no full table scan)
    if (!existing && normEmail) {
      existing = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", normEmail))
        .first();

      if (existing) {
        const oldClerkId = existing.clerkId;
        // Link this clerkId to the existing user profile
        await ctx.db.patch(existing._id, { clerkId: userId });
        // Re-link any puppies belonging to the old clerk ID
        if (oldClerkId && oldClerkId !== userId) {
          const oldPuppies = await ctx.db
            .query("puppies")
            .withIndex("by_user", (q) => q.eq("userId", oldClerkId))
            .collect();
          for (const pup of oldPuppies) {
            await ctx.db.patch(pup._id, { userId });
          }
        }
      }
    }

    // 3. Check purchase status across all authoritative ledgers
    const purchaseStatus = await checkUserHasPurchased(ctx, normEmail, userId);
    const hasAccess = Boolean(
      existing?.hasAccess || purchaseStatus.hasAccess
    );

    if (existing) {
      const patchData: Record<string, any> = {
        clerkId: userId,
        email: normEmail || existing.email,
        name: args.name || existing.name,
        avatarUrl: args.avatarUrl || existing.avatarUrl,
      };

      if (hasAccess) {
        patchData.hasAccess = true;
        if (purchaseStatus.transactionId || existing.subscriptionId) {
          patchData.subscriptionId = purchaseStatus.transactionId || existing.subscriptionId;
        }
        if (purchaseStatus.customerId || existing.paddleCustomerId) {
          patchData.paddleCustomerId = purchaseStatus.customerId || existing.paddleCustomerId;
        }
        patchData.paidAt = existing.paidAt || new Date().toISOString();
      }

      await ctx.db.patch(existing._id, patchData);
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: userId,
      email: normEmail,
      name: args.name,
      avatarUrl: args.avatarUrl,
      createdAt: new Date().toISOString(),
      hasAccess,
      subscriptionId: purchaseStatus.transactionId,
      paddleCustomerId: purchaseStatus.customerId,
      paidAt: hasAccess ? new Date().toISOString() : undefined,
    });
  },
});

// Developer bypass - internalMutation so it CANNOT be called from untrusted clients
export const unlockDeveloperAccess = internalMutation({
  args: {
    userId: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const clerkId = args.userId;
    const normEmail = args.email ? args.email.trim().toLowerCase() : undefined;
    if (!clerkId && !normEmail) return false;

    let user = null;
    if (clerkId) {
      user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .first();
    }
    if (!user && normEmail) {
      user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", normEmail))
        .first();
    }

    if (user) {
      await ctx.db.patch(user._id, { hasAccess: true, paidAt: new Date().toISOString() });
      return true;
    } else if (clerkId) {
      await ctx.db.insert("users", {
        clerkId,
        email: normEmail,
        createdAt: new Date().toISOString(),
        hasAccess: true,
        paidAt: new Date().toISOString(),
      });
      return true;
    }
    return false;
  }
});

/**
 * Paddle Webhook internal mutation to grant access by customer email.
 * This is an authoritative source. It records the purchase in `purchases`
 * and updates or pre-provisions the user account.
 */
export const unlockPro = internalMutation({
  args: {
    email: v.string(),
    transactionId: v.optional(v.string()),
    customerId: v.optional(v.string()),
    amount: v.optional(v.string()),
    currency: v.optional(v.string()),
    rawData: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const normEmail = args.email.trim().toLowerCase();

    // 1. Record in immutable purchases ledger (idempotent)
    if (args.transactionId) {
      const existingPurchase = await ctx.db
        .query("purchases")
        .withIndex("by_transaction_id", (q) => q.eq("transactionId", args.transactionId!))
        .first();

      if (!existingPurchase) {
        await ctx.db.insert("purchases", {
          email: normEmail,
          transactionId: args.transactionId,
          customerId: args.customerId,
          status: "completed",
          itemType: "lifetime_access",
          amount: args.amount,
          currency: args.currency,
          createdAt: new Date().toISOString(),
          rawData: args.rawData,
        });
      }
    }

    // 2. Find any matching users by indexed email lookup
    const matchingUsers = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normEmail))
      .collect();

    if (matchingUsers.length > 0) {
      for (const user of matchingUsers) {
        await ctx.db.patch(user._id, {
          hasAccess: true,
          subscriptionId: args.transactionId || user.subscriptionId,
          paddleCustomerId: args.customerId || user.paddleCustomerId,
          paddleTransactionId: args.transactionId || user.paddleTransactionId,
          paidAt: user.paidAt || new Date().toISOString(),
        });
      }
      return true;
    }

    // 3. User hasn't signed up in Clerk yet. Pre-provision the account
    await ctx.db.insert("users", {
      clerkId: "pending_" + Date.now(),
      email: normEmail,
      createdAt: new Date().toISOString(),
      hasAccess: true,
      subscriptionId: args.transactionId,
      paddleCustomerId: args.customerId,
      paddleTransactionId: args.transactionId,
      paidAt: new Date().toISOString(),
    });

    return true;
  },
});

/**
 * Client-side confirmation after Paddle checkout completion.
 * Verifies caller authentication and registers the completed purchase.
 */
export const confirmCheckoutSuccess = mutation({
  args: {
    userId: v.optional(v.string()),
    email: v.optional(v.string()),
    transactionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const clerkId = await requireAuthUser(ctx, args.userId);
    const normEmail = args.email ? args.email.trim().toLowerCase() : undefined;

    // Validate transactionId format if provided
    if (args.transactionId && !args.transactionId.startsWith("txn_") && !args.transactionId.startsWith("sim_")) {
      throw new Error("Invalid transaction ID format.");
    }

    // 1. Record in purchases ledger if transactionId is present
    if (args.transactionId && normEmail) {
      const existingPurchase = await ctx.db
        .query("purchases")
        .withIndex("by_transaction_id", (q) => q.eq("transactionId", args.transactionId!))
        .first();

      if (!existingPurchase) {
        await ctx.db.insert("purchases", {
          email: normEmail,
          userId: clerkId,
          transactionId: args.transactionId,
          status: "completed",
          itemType: "lifetime_access",
          createdAt: new Date().toISOString(),
        });
      }
    }

    // 2. Find user by clerkId or indexed email
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user && normEmail) {
      user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", normEmail))
        .first();
    }

    if (user) {
      await ctx.db.patch(user._id, {
        clerkId,
        hasAccess: true,
        ...(normEmail ? { email: normEmail } : {}),
        ...(args.transactionId ? { subscriptionId: args.transactionId, paddleTransactionId: args.transactionId } : {}),
        paidAt: user.paidAt || new Date().toISOString(),
      });
      return true;
    } else {
      await ctx.db.insert("users", {
        clerkId,
        email: normEmail,
        createdAt: new Date().toISOString(),
        hasAccess: true,
        subscriptionId: args.transactionId,
        paddleTransactionId: args.transactionId,
        paidAt: new Date().toISOString(),
      });
      return true;
    }
  },
});

/**
 * Explicit "Restore Purchases" action.
 * Allows a user to restore access on any device or after clearing browser data.
 */
export const restoreUserAccess = mutation({
  args: {
    userId: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const clerkId = await requireAuthUser(ctx, args.userId);
    const normEmail = args.email ? args.email.trim().toLowerCase() : undefined;

    const purchaseStatus = await checkUserHasPurchased(ctx, normEmail, clerkId);

    if (purchaseStatus.hasAccess) {
      let user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .first();

      if (!user && normEmail) {
        user = await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", normEmail))
          .first();
      }

      if (user) {
        await ctx.db.patch(user._id, {
          clerkId,
          hasAccess: true,
          subscriptionId: purchaseStatus.transactionId || user.subscriptionId,
          paddleCustomerId: purchaseStatus.customerId || user.paddleCustomerId,
          paidAt: user.paidAt || new Date().toISOString(),
        });
      } else {
        await ctx.db.insert("users", {
          clerkId,
          email: normEmail,
          createdAt: new Date().toISOString(),
          hasAccess: true,
          subscriptionId: purchaseStatus.transactionId,
          paddleCustomerId: purchaseStatus.customerId,
          paidAt: new Date().toISOString(),
        });
      }

      return {
        success: true,
        restored: true,
        message: "Lifetime access confirmed and restored! Enjoy PupLume.",
      };
    }

    return {
      success: false,
      restored: false,
      message: "No purchase found for this account. If you believe this is an error, please contact support with your receipt.",
    };
  },
});

/**
 * Migration helper to backfill past completed transactions from webhookLogs into purchases
 */
export const backfillPurchasesFromLogs = internalMutation({
  args: {},
  handler: async (ctx) => {
    const logs = await ctx.db.query("webhookLogs").collect();
    let migrated = 0;

    for (const log of logs) {
      if (log.action !== "PADDLE_transaction.completed") continue;
      const data = log.payload?.data;
      if (!data) continue;

      const txnId = data.id;
      const email = (data.custom_data?.email || data.customer?.email || "").trim().toLowerCase();
      if (!txnId || !email) continue;

      // Check if already in purchases
      const existing = await ctx.db
        .query("purchases")
        .withIndex("by_transaction_id", (q) => q.eq("transactionId", txnId))
        .first();

      if (!existing) {
        await ctx.db.insert("purchases", {
          email,
          transactionId: txnId,
          customerId: data.customer_id,
          status: "completed",
          itemType: "lifetime_access",
          amount: data.details?.totals?.total || "2499",
          currency: data.currency_code || "USD",
          createdAt: data.created_at || log.processedAt || new Date().toISOString(),
          rawData: log.payload,
        });
        migrated++;
      }

      // Also ensure matching users have hasAccess: true using index
      const matched = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .collect();

      for (const u of matched) {
        if (!u.hasAccess || !u.subscriptionId) {
          await ctx.db.patch(u._id, {
            hasAccess: true,
            subscriptionId: txnId,
            paddleCustomerId: data.customer_id,
            paidAt: u.paidAt || data.created_at || new Date().toISOString(),
          });
        }
      }
    }

    return { migrated };
  },
});
