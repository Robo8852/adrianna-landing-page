import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { EMAIL_RE, limiter } from "./rateLimits";
import { LIMITS, CONTACT_SOURCES, normalizeSource, countUrls, sharedSecretOk } from "./validation";

/** Window for suppressing duplicate (email, message) submissions. */
const DUP_WINDOW_MS = 24 * 60 * 60 * 1000;

export const submitContact = mutation({
  args: {
    email: v.string(),
    message: v.string(),
    name: v.optional(v.string()),
    source: v.optional(v.string()),
    hp: v.optional(v.string()),
    elapsedMs: v.optional(v.number()),
    // Set by the /api/contact route handler (P3-9) — see subscribers.subscribe.
    secret: v.optional(v.string()),
    ipHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // gateway secret: direct calls bypassing /api/contact are treated as bots.
    if (!sharedSecretOk(args.secret)) return { ok: true };
    // honeypot
    if (args.hp && args.hp.trim() !== "") return { ok: true };
    // timing
    if (typeof args.elapsedMs === "number" && args.elapsedMs < 1500) return { ok: true };

    const email = args.email.trim().toLowerCase();
    const message = args.message.trim();
    const name = args.name?.trim().slice(0, LIMITS.name) || undefined;
    const source = normalizeSource(args.source, CONTACT_SOURCES);

    // rate-limit (opaque: spam paths return { ok: true })
    const pe = await limiter.limit(ctx, "contactPerEmail", { key: email });
    const g  = await limiter.limit(ctx, "contactGlobal");
    const gh = await limiter.limit(ctx, "contactGlobalHr");
    const d  = await limiter.limit(ctx, "contactDaily");
    const ip = args.ipHash
      ? await limiter.limit(ctx, "contactPerIp", { key: args.ipHash })
      : { ok: true };
    if (!pe.ok || !g.ok || !gh.ok || !d.ok || !ip.ok) return { ok: true };

    // validate (the only non-opaque rejects)
    if (!EMAIL_RE.test(email)) throw new Error("invalid email");
    if (email.length > LIMITS.email) throw new Error("email too long");
    if (!message) throw new Error("empty message");
    if (message.length > LIMITS.message) throw new Error("message too long");

    // content heuristics (opaque: spam paths return { ok: true })
    if (countUrls(message) > 3) return { ok: true };

    // duplicate suppression: same email + same message within the window
    const cutoff = Date.now() - DUP_WINDOW_MS;
    const recent = await ctx.db
      .query("messages")
      .withIndex("by_email", (q) => q.eq("email", email))
      .filter((q) => q.gte(q.field("createdAt"), cutoff))
      .collect();
    if (recent.some((m) => m.message === message)) return { ok: true };

    await ctx.db.insert("messages", {
      email,
      message,
      name,
      source,
      createdAt: Date.now(),
    });

    // Scheduled (not awaited) so the Resend API call runs after this
    // transaction commits — the submission never fails because email did.
    await ctx.scheduler.runAfter(0, internal.emails.sendContactNotification, {
      email,
      message,
      name,
      source,
    });

    return { ok: true };
  },
});
