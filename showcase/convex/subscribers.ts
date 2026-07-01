import { mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { EMAIL_RE, limiter } from "./rateLimits";
import { LIMITS, NEWSLETTER_SOURCES, normalizeSource, sharedSecretOk } from "./validation";

export const subscribe = mutation({
  args: {
    email: v.string(),
    source: v.optional(v.string()),
    hp: v.optional(v.string()),
    elapsedMs: v.optional(v.number()),
    // Set by the /api/subscribe route handler (P3-9). `secret` proves the call
    // came through the front door; `ipHash` is a salted sha256 of the caller's
    // IP for per-IP rate limiting. Both optional so the mutation fails open
    // when the env var is unset (see sharedSecretOk).
    secret: v.optional(v.string()),
    ipHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // gateway secret: direct mutation calls that bypassed /api/subscribe are
    // treated as bots — opaque ok, no write. Fails open if the env var is unset.
    if (!sharedSecretOk(args.secret)) return { ok: true };

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
    const ip = args.ipHash
      ? await limiter.limit(ctx, "subscribePerIp", { key: args.ipHash })
      : { ok: true };
    if (!pe.ok || !g.ok || !gh.ok || !d.ok || !ip.ok) return { ok: true };

    if (!EMAIL_RE.test(email)) throw new Error("invalid email");
    if (email.length > LIMITS.email) throw new Error("email too long");

    const existing = await ctx.db
      .query("subscribers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing) {
      if (existing.status === "pending") {
        // Pending re-subscribe: re-send the confirmation, but cooldown-limited
        // so repeated submits can't turn us into an email cannon.
        const rl = await limiter.limit(ctx, "confirmResendPerEmail", { key: email });
        if (rl.ok) {
          await ctx.scheduler.runAfter(0, internal.emails.sendConfirmation, {
            subscriberId: existing._id,
            email,
          });
        }
        return { ok: true };
      }

      if (existing.status === "unsubscribed") {
        // Re-subscribe after unsubscribe: reset to pending and send a fresh
        // confirmation. This is intentional — unsubscribing is reversible, and
        // requiring re-confirmation re-establishes explicit consent.
        await ctx.db.patch(existing._id, {
          status: "pending",
          confirmToken: undefined,
          tokenExpiry: undefined,
          source,
        });
        await ctx.scheduler.runAfter(0, internal.emails.sendConfirmation, {
          subscriberId: existing._id,
          email,
        });
        return { ok: true };
      }

      // Confirmed (or legacy undefined = confirmed): opaque dedup.
      return { ok: true };
    }

    // Double opt-in: the row starts as pending with no token. The token is
    // generated in the Node action (mutations can't use crypto), which calls
    // back into setConfirmationToken before sending the confirmation email.
    const subscriberId = await ctx.db.insert("subscribers", {
      email,
      createdAt: Date.now(),
      source,
      status: "pending",
    });

    // Scheduled (not awaited) so the Resend API call runs after this
    // transaction commits — the signup never fails because email did.
    await ctx.scheduler.runAfter(0, internal.emails.sendConfirmation, {
      subscriberId,
      email,
    });

    return { ok: true };
  },
});

/**
 * Double opt-in confirmation, called from the /confirm route with the token
 * from the emailed link. Returns a result object (never throws) so the route
 * can redirect to the right landing state:
 *   - unknown/missing token → { ok: false, reason: "invalid" }
 *   - known but past expiry → { ok: false, reason: "expired" }
 *   - valid → confirm the row, clear the token, send the welcome email
 * The Resend audience add lives in sendWelcome, so an address only ever
 * reaches the broadcast list after its owner clicked the link.
 */
export const confirm = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    if (token.trim() === "") return { ok: false as const, reason: "invalid" as const };

    const subscriber = await ctx.db
      .query("subscribers")
      .withIndex("by_token", (q) => q.eq("confirmToken", token))
      .unique();
    if (!subscriber) return { ok: false as const, reason: "invalid" as const };

    if (subscriber.tokenExpiry === undefined || subscriber.tokenExpiry < Date.now()) {
      return { ok: false as const, reason: "expired" as const };
    }

    await ctx.db.patch(subscriber._id, {
      status: "confirmed",
      confirmToken: undefined,
      tokenExpiry: undefined,
    });

    // Scheduled (not awaited) so the Resend API call runs after this
    // transaction commits — confirmation never fails because email did.
    await ctx.scheduler.runAfter(0, internal.emails.sendWelcome, {
      email: subscriber.email,
    });

    return { ok: true as const };
  },
});

/**
 * Called from the Resend webhook httpAction (P3-11) when Resend reports a
 * contact.updated (unsubscribed=true) or contact.deleted event.
 *
 * Status transitions:
 *   pending    → unsubscribed  (they unsubscribed before confirming — honour it)
 *   confirmed  → unsubscribed
 *   unsubscribed → unsubscribed (idempotent)
 *   undefined (legacy) → unsubscribed
 *
 * A missing row is silently ignored — Resend may fire events for addresses
 * that were never in our system (e.g. imported contacts we removed).
 */
export const recordUnsubscribe = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const subscriber = await ctx.db
      .query("subscribers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (!subscriber) return;
    await ctx.db.patch(subscriber._id, {
      status: "unsubscribed",
      // Clear any pending token — the address should not be confirmable after
      // an unsubscribe.
      confirmToken: undefined,
      tokenExpiry: undefined,
    });
  },
});

/**
 * Called from the sendConfirmation Node action once it has generated a
 * token. Patches only rows still pending — a subscriber who confirmed (or
 * was deleted) between schedule and send is left alone.
 */
export const setConfirmationToken = internalMutation({
  args: {
    subscriberId: v.id("subscribers"),
    token: v.string(),
    tokenExpiry: v.number(),
  },
  handler: async (ctx, { subscriberId, token, tokenExpiry }) => {
    const subscriber = await ctx.db.get(subscriberId);
    if (!subscriber || subscriber.status !== "pending") return;
    await ctx.db.patch(subscriberId, { confirmToken: token, tokenExpiry });
  },
});
