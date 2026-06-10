import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { EMAIL_RE, limiter } from "./rateLimits";
import { LIMITS, NEWSLETTER_SOURCES, normalizeSource } from "./validation";

export const subscribe = mutation({
  args: {
    email: v.string(),
    source: v.optional(v.string()),
    hp: v.optional(v.string()),
    elapsedMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // honeypot: a hidden field humans never see. Bots tend to fill every
    // input, so a non-empty value here is a strong spam signal.
    if (args.hp && args.hp.trim() !== "") return { ok: true };

    // timing: enforced server-side because a bot can call this mutation
    // directly without ever rendering the form. Return ok so the bot gets
    // no signal that it was caught, but write nothing.
    if (typeof args.elapsedMs === "number" && args.elapsedMs < 1500) return { ok: true };

    const email = args.email.trim().toLowerCase();
    const source = normalizeSource(args.source, NEWSLETTER_SOURCES);

    // rate-limit (opaque: spam paths return { ok: true })
    const pe = await limiter.limit(ctx, "subscribePerEmail", { key: email });
    const g  = await limiter.limit(ctx, "subscribeGlobal");
    const gh = await limiter.limit(ctx, "subscribeGlobalHr");
    const d  = await limiter.limit(ctx, "subscribeDaily");
    if (!pe.ok || !g.ok || !gh.ok || !d.ok) return { ok: true };

    if (!EMAIL_RE.test(email)) throw new Error("invalid email");
    if (email.length > LIMITS.email) throw new Error("email too long");

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
