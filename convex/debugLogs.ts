import { query, mutation, internalQuery, internalMutation } from './_generated/server';
import { v } from "convex/values";
import { requireAuthUser } from "./authHelper";

// Dangerous functions are strictly INTERNAL so no external client or API caller can touch them
export const wipeAllData = internalMutation({
  args: {},
  handler: async (ctx) => {
    const tables = [
      'users', 'puppies', 'userSettings', 'tasks', 'pottyLogs', 'feedingLogs', 'sleepLogs',
      'walkLogs', 'vaccinations', 'medications', 'appointments', 'expenses',
      'documents', 'behaviorLogs', 'groomingTasks', 'socialization',
      'journalEntries', 'trainingLessons', 'notifications', 'pushSubscriptions',
      'familyMembers', 'memories', 'webhookLogs'
    ];

    let totalDeleted = 0;
    const summary: Record<string, number> = {};

    for (const table of tables) {
      // @ts-ignore
      const records = await ctx.db.query(table).collect();
      summary[table] = records.length;
      totalDeleted += records.length;
      for (const record of records) {
        await ctx.db.delete(record._id);
      }
    }

    return { totalDeleted, summary };
  }
});

export const dumpSampleData = internalQuery({
  args: {},
  handler: async (ctx) => {
    const puppies = await ctx.db.query('puppies').collect();
    const tasks = await ctx.db.query('tasks').collect();
    const userSettings = await ctx.db.query('userSettings').collect();
    return { puppies, tasks, userSettings };
  }
});

export const getAllCounts = internalQuery({
  args: {},
  handler: async (ctx) => {
    const tables = [
      'users', 'puppies', 'userSettings', 'tasks', 'pottyLogs', 'feedingLogs', 'sleepLogs',
      'walkLogs', 'vaccinations', 'medications', 'appointments', 'expenses',
      'documents', 'behaviorLogs', 'groomingTasks', 'socialization',
      'journalEntries', 'trainingLessons', 'notifications', 'pushSubscriptions',
      'familyMembers', 'memories', 'webhookLogs'
    ];
    const counts: Record<string, number> = {};
    let total = 0;
    for (const table of tables) {
      // @ts-ignore
      const records = await ctx.db.query(table).collect();
      counts[table] = records.length;
      total += records.length;
    }
    return { total, counts };
  }
});

// Webhook Logging - internal mutation called by httpAction (/paddle-webhook)
export const logWebhook = internalMutation({
  args: { 
    action: v.string(), 
    payload: v.any(),
    environment: v.optional(v.string()),
    processedAt: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let env = args.environment;
    if (!env) {
      if (args.payload?.data?.status === "sandbox" || args.payload?.event_type?.includes("sandbox")) {
        env = "sandbox";
      } else if (args.payload?.data?.id?.startsWith("txn_") || args.payload?.data?.price_id) {
        env = "live";
      } else {
        env = "unknown";
      }
    }

    return await ctx.db.insert("webhookLogs", {
      action: args.action,
      payload: args.payload,
      processedAt: args.processedAt || new Date().toISOString(),
      environment: env,
    });
  }
});

// Authenticated queries & mutations for the developer PaddleLogPage view
export const getWebhookLogs = query({
  args: {},
  handler: async (ctx) => {
    await requireAuthUser(ctx);
    return await ctx.db.query('webhookLogs').order('desc').take(50);
  }
});

export const clearWebhookLogs = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuthUser(ctx);
    const logs = await ctx.db.query('webhookLogs').collect();
    for (const log of logs) {
      await ctx.db.delete(log._id);
    }
    return true;
  }
});

export const simulateTestWebhook = mutation({
  args: {
    eventType: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuthUser(ctx);
    const eventType = args.eventType || "transaction.completed";
    const testPayload = {
      event_id: "evt_test_" + Date.now(),
      event_type: eventType,
      data: {
        id: "txn_test_" + Date.now(),
        status: "completed",
        custom_data: {
          email: args.email || "tester@puplume.com"
        },
        customer: {
          email: args.email || "tester@puplume.com"
        }
      }
    };

    return await ctx.db.insert("webhookLogs", {
      action: "PADDLE_" + eventType,
      payload: testPayload,
      processedAt: new Date().toISOString(),
      environment: "test_simulation",
    });
  }
});
