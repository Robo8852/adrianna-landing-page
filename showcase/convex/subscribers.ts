import { mutation } from "./_generated/server";
import { v } from "convex/values";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const subscribe = mutation({
  args: { email: v.string(), source: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const source = args.source ?? "unknown";

    if (!EMAIL_RE.test(email)) throw new Error("invalid email");

    const existing = await ctx.db
      .query("subscribers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing) return { ok: true };

    // FUTURE (Resend phase): ctx.scheduler.runAfter(0, internal.emails.sendWelcome, { email })
    await ctx.db.insert("subscribers", { email, createdAt: Date.now(), source });

    return { ok: true };
  },
});
