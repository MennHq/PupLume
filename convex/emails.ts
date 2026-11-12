import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// ─────────────────────────────────────────────────────────────────
// Resend Email Transporter
// ─────────────────────────────────────────────────────────────────

const RESEND_API_URL = "https://api.resend.com/emails";

/**
 * Core email sender via Resend REST API.
 * Works in sandbox mode (sends only to your verified email) until
 * you attach your domain and verify DNS records.
 */
async function sendEmail(args: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Email] RESEND_API_KEY not set — skipping email send");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  // Sandbox mode: Resend free tier can only send from onboarding@resend.dev
  // Once domain is verified, switch to your branded from address
  const fromAddress = process.env.RESEND_FROM_EMAIL || "PupLume <onboarding@resend.dev>";

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [args.to],
        subject: args.subject,
        html: args.html,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[Email] Resend API error ${res.status}:`, errorText);
      return { success: false, error: errorText };
    }

    const data = await res.json();
    console.log(`[Email] Sent "${args.subject}" to ${args.to} — id: ${data.id}`);
    return { success: true, id: data.id };
  } catch (err: any) {
    console.error("[Email] Network error:", err.message);
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────
// Email Log Table Mutation (for tracking)
// ─────────────────────────────────────────────────────────────────

export const logEmailSent = internalMutation({
  args: {
    userId: v.string(),
    emailType: v.string(),
    recipientEmail: v.string(),
    subject: v.string(),
    resendId: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("emailLogs", {
      userId: args.userId,
      emailType: args.emailType,
      recipientEmail: args.recipientEmail,
      subject: args.subject,
      resendId: args.resendId,
      error: args.error,
      sentAt: new Date().toISOString(),
    });
  },
});

// ─────────────────────────────────────────────────────────────────
// 1. WELCOME EMAIL — sent after first purchase / signup
// ─────────────────────────────────────────────────────────────────

export const sendWelcomeEmail = internalAction({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    puppyName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const firstName = args.name?.split(" ")[0] || "there";
    const puppyLine = args.puppyName
      ? `We can't wait to help you and <strong>${args.puppyName}</strong> thrive together.`
      : `Set up your puppy's profile to get started with personalized routines.`;

    const appUrl = process.env.APP_URL || "https://puplume.pet";

    const result = await sendEmail({
      to: args.email,
      subject: `🐾 Welcome to PupLume, ${firstName}!`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FFF9F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px">
    
    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px">
      <div style="display:inline-block;background:#2C211B;color:#FFF9F2;font-weight:900;font-size:20px;padding:10px 20px;border-radius:16px;letter-spacing:-0.5px">
        🐾 PupLume
      </div>
    </div>

    <!-- Main Card -->
    <div style="background:#FFFFFF;border-radius:24px;padding:40px 32px;border:1px solid #E8DDD3;box-shadow:0 4px 24px rgba(0,0,0,0.06)">
      <h1 style="color:#2C211B;font-size:24px;font-weight:800;margin:0 0 8px;text-align:center">
        Welcome to the Pack! 🎉
      </h1>
      <p style="color:#766A63;font-size:15px;line-height:1.6;text-align:center;margin:0 0 24px">
        Hey ${firstName}, your lifetime access is now unlocked.<br/>
        ${puppyLine}
      </p>

      <!-- What's Inside -->
      <div style="background:#FFF9F2;border-radius:16px;padding:20px 24px;margin-bottom:24px;border:1px solid #F3E7DA">
        <p style="font-weight:700;color:#2C211B;font-size:14px;margin:0 0 12px">Here's what's waiting for you:</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 0;color:#2C211B;font-size:13px">✅ AI Co-Pilot — instant puppy advice 24/7</td></tr>
          <tr><td style="padding:6px 0;color:#2C211B;font-size:13px">✅ Smart Potty Predictor — no more accidents</td></tr>
          <tr><td style="padding:6px 0;color:#2C211B;font-size:13px">✅ Training Academy — age-tailored lessons</td></tr>
          <tr><td style="padding:6px 0;color:#2C211B;font-size:13px">✅ Health Vault — vaccines, weight & vet records</td></tr>
          <tr><td style="padding:6px 0;color:#2C211B;font-size:13px">✅ Family Sync — invite co-parents & sitters</td></tr>
        </table>
      </div>

      <!-- CTA Button -->
      <div style="text-align:center;margin-bottom:16px">
        <a href="${appUrl}/?login=true" style="display:inline-block;background:#8B5E3C;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:14px;box-shadow:0 2px 8px rgba(139,94,60,0.3)">
          Open Your Dashboard →
        </a>
      </div>

      <p style="color:#766A63;font-size:12px;text-align:center;margin:0">
        Lifetime access • No monthly fees • 14-day money-back guarantee
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:32px;color:#766A63;font-size:11px;line-height:1.5">
      <p style="margin:0 0 4px">© ${new Date().getFullYear()} PupLume. Built for puppies and their humans.</p>
      <p style="margin:0">
        <a href="${appUrl}/legal/privacy" style="color:#8B5E3C;text-decoration:none">Privacy</a> · 
        <a href="${appUrl}/legal/terms" style="color:#8B5E3C;text-decoration:none">Terms</a> · 
        <a href="mailto:support@puplume.pet" style="color:#8B5E3C;text-decoration:none">Support</a>
      </p>
    </div>
  </div>
</body>
</html>`,
    });

    await ctx.runMutation(internal.emails.logEmailSent, {
      userId: args.userId,
      emailType: "welcome",
      recipientEmail: args.email,
      subject: `Welcome to PupLume, ${firstName}!`,
      resendId: result.id,
      error: result.error,
    });
  },
});

// ─────────────────────────────────────────────────────────────────
// 2. VET APPOINTMENT / VACCINE REMINDER EMAIL
// ─────────────────────────────────────────────────────────────────

export const sendVetReminderEmail = internalAction({
  args: {
    userId: v.string(),
    email: v.string(),
    puppyName: v.string(),
    reminderType: v.string(), // "vaccine" | "appointment" | "medication"
    title: v.string(),
    dueDate: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const appUrl = process.env.APP_URL || "https://puplume.pet";

    const typeLabels: Record<string, { emoji: string; heading: string }> = {
      vaccine: { emoji: "💉", heading: "Vaccine Reminder" },
      appointment: { emoji: "🏥", heading: "Vet Appointment" },
      medication: { emoji: "💊", heading: "Medication Due" },
    };

    const label = typeLabels[args.reminderType] || typeLabels.appointment;

    const result = await sendEmail({
      to: args.email,
      subject: `${label.emoji} ${args.puppyName}: ${args.title} — ${args.dueDate}`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FFF9F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px">
    
    <div style="text-align:center;margin-bottom:32px">
      <div style="display:inline-block;background:#2C211B;color:#FFF9F2;font-weight:900;font-size:20px;padding:10px 20px;border-radius:16px">
        🐾 PupLume
      </div>
    </div>

    <div style="background:#FFFFFF;border-radius:24px;padding:40px 32px;border:1px solid #E8DDD3;box-shadow:0 4px 24px rgba(0,0,0,0.06)">
      
      <div style="text-align:center;margin-bottom:24px">
        <div style="display:inline-block;background:#FFF9F2;border:1px solid #E8DDD3;border-radius:16px;padding:16px;font-size:32px">
          ${label.emoji}
        </div>
      </div>

      <h1 style="color:#2C211B;font-size:22px;font-weight:800;margin:0 0 8px;text-align:center">
        ${label.heading} for ${args.puppyName}
      </h1>

      <div style="background:#FFF9F2;border-radius:16px;padding:20px 24px;margin:20px 0;border:1px solid #F3E7DA">
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:8px 0;color:#766A63;font-size:12px;font-weight:700;text-transform:uppercase">What</td>
            <td style="padding:8px 0;color:#2C211B;font-size:14px;font-weight:600;text-align:right">${args.title}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#766A63;font-size:12px;font-weight:700;text-transform:uppercase;border-top:1px solid #E8DDD3">When</td>
            <td style="padding:8px 0;color:#8B5E3C;font-size:14px;font-weight:700;text-align:right;border-top:1px solid #E8DDD3">${args.dueDate}</td>
          </tr>
          ${args.details ? `
          <tr>
            <td colspan="2" style="padding:12px 0 0;color:#766A63;font-size:13px;border-top:1px solid #E8DDD3">${args.details}</td>
          </tr>` : ""}
        </table>
      </div>

      <div style="text-align:center;margin-top:24px">
        <a href="${appUrl}/?login=true" style="display:inline-block;background:#8B5E3C;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:14px;box-shadow:0 2px 8px rgba(139,94,60,0.3)">
          Open Health Vault →
        </a>
      </div>
    </div>

    <div style="text-align:center;margin-top:32px;color:#766A63;font-size:11px;line-height:1.5">
      <p style="margin:0 0 4px">© ${new Date().getFullYear()} PupLume. Built for puppies and their humans.</p>
      <p style="margin:0">
        <a href="${appUrl}/legal/privacy" style="color:#8B5E3C;text-decoration:none">Privacy</a> · 
        <a href="mailto:support@puplume.pet" style="color:#8B5E3C;text-decoration:none">Support</a>
      </p>
    </div>
  </div>
</body>
</html>`,
    });

    await ctx.runMutation(internal.emails.logEmailSent, {
      userId: args.userId,
      emailType: `vet_reminder_${args.reminderType}`,
      recipientEmail: args.email,
      subject: `${args.puppyName}: ${args.title} — ${args.dueDate}`,
      resendId: result.id,
      error: result.error,
    });
  },
});

// ─────────────────────────────────────────────────────────────────
// 3. INACTIVITY / WE MISS YOU EMAIL
// ─────────────────────────────────────────────────────────────────

export const sendInactivityEmail = internalAction({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    puppyName: v.optional(v.string()),
    daysSinceLastVisit: v.number(),
  },
  handler: async (ctx, args) => {
    const firstName = args.name?.split(" ")[0] || "there";
    const appUrl = process.env.APP_URL || "https://puplume.pet";

    const puppyMention = args.puppyName
      ? `<strong>${args.puppyName}</strong> might be wondering where you went! 🐕`
      : `Your puppy's schedule has been waiting for you!`;

    const result = await sendEmail({
      to: args.email,
      subject: `🐾 ${args.puppyName || "Your pup"} misses you — it's been ${args.daysSinceLastVisit} days`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FFF9F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px">
    
    <div style="text-align:center;margin-bottom:32px">
      <div style="display:inline-block;background:#2C211B;color:#FFF9F2;font-weight:900;font-size:20px;padding:10px 20px;border-radius:16px">
        🐾 PupLume
      </div>
    </div>

    <div style="background:#FFFFFF;border-radius:24px;padding:40px 32px;border:1px solid #E8DDD3;box-shadow:0 4px 24px rgba(0,0,0,0.06)">
      
      <h1 style="color:#2C211B;font-size:24px;font-weight:800;margin:0 0 8px;text-align:center">
        We miss you, ${firstName}! 👋
      </h1>
      <p style="color:#766A63;font-size:15px;line-height:1.6;text-align:center;margin:0 0 24px">
        It's been <strong>${args.daysSinceLastVisit} days</strong> since your last visit.<br/>
        ${puppyMention}
      </p>

      <div style="background:#FFF9F2;border-radius:16px;padding:20px 24px;margin-bottom:24px;border:1px solid #F3E7DA">
        <p style="font-weight:700;color:#2C211B;font-size:14px;margin:0 0 12px">Quick things to catch up on:</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 0;color:#2C211B;font-size:13px">📋 Check today's task schedule</td></tr>
          <tr><td style="padding:6px 0;color:#2C211B;font-size:13px">🚽 Log any potty breaks you've tracked manually</td></tr>
          <tr><td style="padding:6px 0;color:#2C211B;font-size:13px">💉 Review upcoming vaccine reminders</td></tr>
          <tr><td style="padding:6px 0;color:#2C211B;font-size:13px">🤖 Ask the AI Co-Pilot any questions</td></tr>
        </table>
      </div>

      <div style="text-align:center;margin-bottom:16px">
        <a href="${appUrl}/?login=true" style="display:inline-block;background:#8B5E3C;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:14px;box-shadow:0 2px 8px rgba(139,94,60,0.3)">
          Jump Back In →
        </a>
      </div>

      <p style="color:#766A63;font-size:12px;text-align:center;margin:0">
        Your puppy's data is safe and waiting exactly where you left it.
      </p>
    </div>

    <div style="text-align:center;margin-top:32px;color:#766A63;font-size:11px;line-height:1.5">
      <p style="margin:0 0 4px">© ${new Date().getFullYear()} PupLume. Built for puppies and their humans.</p>
      <p style="margin:0">
        <a href="${appUrl}/legal/privacy" style="color:#8B5E3C;text-decoration:none">Privacy</a> · 
        <a href="mailto:support@puplume.pet" style="color:#8B5E3C;text-decoration:none">Support</a>
      </p>
      <p style="margin:8px 0 0;color:#999;font-size:10px">
        Don't want these emails? Reply "unsubscribe" and we'll stop.
      </p>
    </div>
  </div>
</body>
</html>`,
    });

    await ctx.runMutation(internal.emails.logEmailSent, {
      userId: args.userId,
      emailType: "inactivity",
      recipientEmail: args.email,
      subject: `${args.puppyName || "Your pup"} misses you`,
      resendId: result.id,
      error: result.error,
    });
  },
});

// ─────────────────────────────────────────────────────────────────
// CRON HELPERS — Query functions for scheduled jobs
// ─────────────────────────────────────────────────────────────────

/**
 * Find users with upcoming vaccine due dates (within next 3 days)
 */
export const getUsersWithUpcomingVaccines = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const todayStr = now.toISOString().split("T")[0];
    const futureStr = threeDaysFromNow.toISOString().split("T")[0];

    const allVaccines = await ctx.db.query("vaccinations").take(250);

    const dueSoon = allVaccines.filter((v) => {
      const dueDate = v.nextDueDate || v.dueDate;
      if (!dueDate) return false;
      return dueDate >= todayStr && dueDate <= futureStr && v.status !== "completed";
    });

    // Group by userId and look up emails
    const byUser = new Map<string, typeof dueSoon>();
    for (const vax of dueSoon) {
      const list = byUser.get(vax.userId) || [];
      list.push(vax);
      byUser.set(vax.userId, list);
    }

    const results = [];
    for (const [userId, vaccines] of byUser) {
      const user = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", userId)).first();
      if (!user?.email) continue;

      const puppies = await ctx.db.query("puppies").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
      const puppyMap = new Map<string, string>(puppies.map((p) => [p._id as string, p.name]));

      for (const vax of vaccines) {
        results.push({
          userId,
          email: user.email,
          name: user.name,
          puppyName: puppyMap.get(vax.puppyId) || "Your puppy",
          vaccineName: vax.vaccineName || vax.name || "Vaccine",
          dueDate: vax.nextDueDate || vax.dueDate || "",
        });
      }
    }

    return results;
  },
});

/**
 * Find users with upcoming vet appointments (within next 2 days)
 */
export const getUsersWithUpcomingAppointments = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const todayStr = now.toISOString().split("T")[0];
    const futureStr = twoDaysFromNow.toISOString().split("T")[0];

    const allAppointments = await ctx.db.query("appointments").take(250);

    const upcoming = allAppointments.filter((a) => {
      return a.date >= todayStr && a.date <= futureStr && a.status === "scheduled";
    });

    const results = [];
    for (const appt of upcoming) {
      const user = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", appt.userId)).first();
      if (!user?.email) continue;

      const puppies = await ctx.db.query("puppies").withIndex("by_user", (q) => q.eq("userId", appt.userId)).collect();
      const puppyName = puppies.find((p) => p._id === appt.puppyId)?.name || "Your puppy";

      results.push({
        userId: appt.userId,
        email: user.email,
        puppyName,
        title: appt.title,
        dueDate: `${appt.date} at ${appt.time}`,
        clinic: appt.clinic,
      });
    }

    return results;
  },
});

/**
 * Find users inactive for 7+ days (no tasks completed recently)
 */
export const getInactiveUsers = internalQuery({
  args: {},
  handler: async (ctx) => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const allUsers = await ctx.db.query("users").take(100);
    const results = [];

    for (const user of allUsers) {
      if (!user.email || !user.hasAccess) continue;

      // Check if we already sent an inactivity email in the last 14 days
      const recentEmails = await ctx.db
        .query("emailLogs")
        .withIndex("by_user", (q) => q.eq("userId", user.clerkId))
        .collect();

      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      const alreadySent = recentEmails.some(
        (e) => e.emailType === "inactivity" && e.sentAt > fourteenDaysAgo
      );
      if (alreadySent) continue;

      // Check last task completion
      const recentTasks = await ctx.db
        .query("tasks")
        .withIndex("by_user", (q) => q.eq("userId", user.clerkId))
        .collect();

      const lastCompleted = recentTasks
        .filter((t) => t.completedAt)
        .sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || ""))
        [0];

      if (lastCompleted && lastCompleted.completedAt && lastCompleted.completedAt > sevenDaysAgo) {
        continue; // User is active
      }

      // If no tasks at all and account is older than 7 days
      if (!lastCompleted && user.createdAt > sevenDaysAgo) {
        continue; // New user, give them time
      }

      const puppies = await ctx.db.query("puppies").withIndex("by_user", (q) => q.eq("userId", user.clerkId)).collect();
      const daysSince = lastCompleted?.completedAt
        ? Math.floor((Date.now() - new Date(lastCompleted.completedAt).getTime()) / (24 * 60 * 60 * 1000))
        : Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (24 * 60 * 60 * 1000));

      results.push({
        userId: user.clerkId,
        email: user.email,
        name: user.name,
        puppyName: puppies[0]?.name,
        daysSinceLastVisit: daysSince,
      });
    }

    return results;
  },
});
