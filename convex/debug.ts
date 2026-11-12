import { internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Diagnostic internal queries and mutations.
 * Strictly internal to prevent public API data leakage of sensitive user,
 * purchase, and webhook records.
 */
export const dumpUsers = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  }
});

export const dumpPurchases = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("purchases").collect();
  }
});

export const dumpWebhooks = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("webhookLogs").order("desc").take(10);
  }
});

export const runBackfill = internalMutation({
  args: {},
  handler: async (ctx): Promise<any> => {
    return await ctx.runMutation(internal.users.backfillPurchasesFromLogs, {});
  }
});
