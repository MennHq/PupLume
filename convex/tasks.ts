import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthUser, getAuthUser, verifyPuppyAccess } from "./authHelper";

export const listTasks = query({
  args: { 
    puppyId: v.string(), 
    date: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUser(ctx, args.userId);
    if (!userId) return [];

    const { isPersisted } = await verifyPuppyAccess(ctx, args.puppyId, userId);

    if (!isPersisted) {
      const q = ctx.db
        .query("tasks")
        .withIndex("by_user_puppy", (idx) =>
          idx.eq("userId", userId).eq("puppyId", args.puppyId)
        );
      if (args.date) {
        return (await q.collect()).filter((t) => t.date === args.date);
      }
      return await q.collect();
    }

    if (args.date) {
      return await ctx.db
        .query("tasks")
        .withIndex("by_puppy_date", (idx) =>
          idx.eq("puppyId", args.puppyId).eq("date", args.date!)
        )
        .collect();
    }

    return await ctx.db
      .query("tasks")
      .withIndex("by_puppy", (idx) => idx.eq("puppyId", args.puppyId))
      .collect();
  },
});

export const createTask = mutation({
  args: {
    userId: v.optional(v.string()),
    puppyId: v.string(),
    title: v.string(),
    category: v.string(),
    time: v.string(),
    durationMin: v.number(),
    period: v.string(),
    date: v.string(),
    description: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);
    await verifyPuppyAccess(ctx, args.puppyId, userId);

    const { userId: _, ...taskData } = args;

    // Prevent duplicate tasks with the exact same title, date, and puppy
    const existing = await ctx.db
      .query("tasks")
      .withIndex("by_puppy_date", (q) =>
        q.eq("puppyId", taskData.puppyId).eq("date", taskData.date)
      )
      .filter((q) => q.eq(q.field("title"), taskData.title))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("tasks", {
      ...taskData,
      userId,
      completed: false,
      skipped: false,
    });
  },
});

export const updateTask = mutation({
  args: {
    id: v.id("tasks"),
    userId: v.optional(v.string()),
    puppyId: v.optional(v.string()),
    title: v.string(),
    category: v.string(),
    time: v.string(),
    durationMin: v.number(),
    period: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) throw new Error("Not authorized");

    const { id, userId: _, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const toggleTask = mutation({
  args: { 
    id: v.optional(v.id("tasks")),
    title: v.optional(v.string()),
    puppyId: v.optional(v.string()),
    userId: v.optional(v.string()),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    let task = null;
    if (args.id) {
      task = await ctx.db.get(args.id);
      if (task && task.userId !== userId) {
        throw new Error("Unauthorized: Task does not belong to user");
      }
    }
    if (!task && args.title) {
      const candidates = await ctx.db
        .query("tasks")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("title"), args.title))
        .collect();
      task = (args.puppyId ? candidates.find((c) => c.puppyId === args.puppyId) : candidates[0]) || null;
    }

    const todayDateStr = new Date().toISOString().split('T')[0];

    if (!task) {
      if (args.title) {
        return await ctx.db.insert("tasks", {
          userId,
          puppyId: args.puppyId || "pup-1",
          title: args.title,
          category: "custom",
          time: "10:00 AM",
          durationMin: 15,
          completed: args.completed,
          skipped: false,
          period: "morning",
          date: todayDateStr,
          completedAt: args.completed ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
        });
      }
      return null;
    }

    await ctx.db.patch(task._id, {
      completed: args.completed,
      skipped: false,
      date: todayDateStr,
      completedAt: args.completed ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
    });
    return task._id;
  },
});

export const skipTask = mutation({
  args: {
    id: v.optional(v.id("tasks")),
    title: v.optional(v.string()),
    puppyId: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    let task = null;
    if (args.id) {
      task = await ctx.db.get(args.id);
      if (task && task.userId !== userId) {
        throw new Error("Unauthorized: Task does not belong to user");
      }
    }
    if (!task && args.title) {
      const candidates = await ctx.db
        .query("tasks")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("title"), args.title))
        .collect();
      task = (args.puppyId ? candidates.find((c) => c.puppyId === args.puppyId) : candidates[0]) || null;
    }

    const todayDateStr = new Date().toISOString().split('T')[0];

    if (!task) {
      if (args.title) {
        return await ctx.db.insert("tasks", {
          userId,
          puppyId: args.puppyId || "pup-1",
          title: args.title,
          category: "custom",
          time: "10:00 AM",
          durationMin: 15,
          completed: false,
          skipped: true,
          period: "morning",
          date: todayDateStr,
        });
      }
      return null;
    }

    await ctx.db.patch(task._id, {
      skipped: true,
      completed: false,
      date: todayDateStr,
    });
    return task._id;
  },
});

export const deleteTask = mutation({
  args: { 
    id: v.id("tasks"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) {
      throw new Error("Task not found or unauthorized");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const saveTasksBatch = mutation({
  args: {
    userId: v.optional(v.string()),
    puppyId: v.string(),
    tasks: v.array(
      v.object({
        title: v.string(),
        category: v.string(),
        time: v.string(),
        durationMin: v.number(),
        period: v.string(),
        date: v.string(),
        completed: v.boolean(),
        skipped: v.boolean(),
        description: v.optional(v.string()),
        notes: v.optional(v.string()),
        completedAt: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);
    await verifyPuppyAccess(ctx, args.puppyId, userId);

    const existing = await ctx.db
      .query("tasks")
      .withIndex("by_puppy", (q) => q.eq("puppyId", args.puppyId))
      .collect();

    for (const item of args.tasks) {
      const match = existing.find((e) => e.title === item.title && e.date === item.date);
      if (match) {
        await ctx.db.patch(match._id, {
          completed: item.completed,
          skipped: item.skipped,
          completedAt: item.completedAt,
        });
      } else {
        await ctx.db.insert("tasks", {
          puppyId: args.puppyId,
          userId,
          title: item.title,
          category: item.category,
          time: item.time,
          durationMin: item.durationMin,
          period: item.period,
          date: item.date,
          completed: item.completed,
          skipped: item.skipped,
          description: item.description,
          notes: item.notes,
          completedAt: item.completedAt,
        });
      }
    }
    return true;
  },
});

export const resetDailyTasks = mutation({
  args: {
    userId: v.optional(v.string()),
    puppyId: v.optional(v.string()),
    force: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const tasks = args.puppyId
      ? await ctx.db
          .query("tasks")
          .withIndex("by_puppy", (q) => q.eq("puppyId", args.puppyId!))
          .collect()
      : await ctx.db
          .query("tasks")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .collect();

    const todayDateStr = new Date().toISOString().split('T')[0];
    let resetCount = 0;
    for (const task of tasks) {
      if (task.userId === userId) {
        const isPastOrEmpty = !task.date || task.date < todayDateStr;
        if (args.force || isPastOrEmpty) {
          await ctx.db.patch(task._id, {
            completed: false,
            skipped: false,
            completedAt: undefined,
            date: todayDateStr,
          });
          resetCount++;
        }
      }
    }
    return { reset: resetCount };
  },
});

export const cleanupDuplicateTasks = mutation({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await requireAuthUser(ctx, args.userId);

    const tasks = await ctx.db.query("tasks").withIndex("by_user", (q) => q.eq("userId", userId)).collect();

    const groups = new Map<string, any[]>();
    for (const t of tasks) {
      const key = `${t.userId}_${t.puppyId}_${t.date}_${t.title}`.trim().toLowerCase();
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(t);
    }

    let deleted = 0;
    for (const [, group] of groups) {
      if (group.length > 1) {
        group.sort((a, b) => (b.completed ? 1 : 0) - (a.completed ? 1 : 0));
        for (let i = 1; i < group.length; i++) {
          await ctx.db.delete(group[i]._id);
          deleted++;
        }
      }
    }
    return { deleted };
  }
});
