import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { EMAIL_RE, limiter } from "./rateLimits";

export const submitContact = mutation({
  args: {
    email: v.string(),
    message: v.string(),
    name: v.optional(v.string()),
    source: v.optional(v.string()),
    hp: v.optional(v.string()),
    elapsedMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // honeypot
    if (args.hp && args.hp.trim() !== "") return { ok: true };
    // timing
    if (typeof args.elapsedMs === "number" && args.elapsedMs < 1500) return { ok: true };

    const email = args.email.trim().toLowerCase();
    const message = args.message.trim();
    const source = args.source ?? "unknown";

    // rate-limit (opaque: spam paths return { ok: true })
    const pe = await limiter.limit(ctx, "contactPerEmail", { key: email });
    const g  = await limiter.limit(ctx, "contactGlobal");
    const gh = await limiter.limit(ctx, "contactGlobalHr");
    if (!pe.ok || !g.ok || !gh.ok) return { ok: true };

    // validate (the only non-opaque rejects)
    if (!EMAIL_RE.test(email)) throw new Error("invalid email");
    if (!message) throw new Error("empty message");

    await ctx.db.insert("messages", {
      email,
      message,
      name: args.name?.trim() || undefined,
      source,
      createdAt: Date.now(),
    });

    // FUTURE (resend-spec): notify Adrianna of new message

    return { ok: true };
  },
});
