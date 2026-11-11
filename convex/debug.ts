import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const dumpUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  }
});

export const dumpPurchases = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("purchases").collect();
  }
});

export const dumpWebhooks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("webhookLogs").order("desc").take(10);
  }
});

export const runBackfill = mutation({
  args: {},
  handler: async (ctx): Promise<any> => {
    return await ctx.runMutation(internal.users.backfillPurchasesFromLogs, {});
  }
});
