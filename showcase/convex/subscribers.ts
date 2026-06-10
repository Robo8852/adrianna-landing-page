import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const subscribe = mutation({
  args: {
    email: v.string(),
    source: v.optional(v.string()),
    // Honeypot: a hidden field humans never see. Bots tend to fill every
    // input, so a non-empty value here is a strong spam signal.
    hp: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Spam trap. Enforced server-side because a bot can call this mutation
    // directly without ever rendering the form. Return ok so the bot gets
    // no signal that it was caught, but write nothing.
    if (args.hp && args.hp.trim() !== "") return { ok: true };

    const email = args.email.trim().toLowerCase();
    const source = args.source ?? "unknown";

    if (!EMAIL_RE.test(email)) throw new Error("invalid email");

    const existing = await ctx.db
      .query("subscribers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing) return { ok: true };

    await ctx.db.insert("subscribers", { email, createdAt: Date.now(), source });

    // Scheduled (not awaited) so the Resend API call runs after this
    // transaction commits — the signup never fails because email did.
    await ctx.scheduler.runAfter(0, internal.emails.sendWelcome, { email });

    return { ok: true };
  },
});
