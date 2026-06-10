"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { redactEmail, sanitizeSubjectName } from "./validation";

// Resend wiring. Runs as an *action* (not a mutation) because it calls an
// external API — Convex mutations must be pure database transactions.
//
// Required env vars on the Convex deployment (npx convex env set ...):
//   RESEND_API_KEY      — from resend.com/api-keys
//   RESEND_AUDIENCE_ID  — from resend.com/audiences (the list Broadcasts send to)
// Optional:
//   NEWSLETTER_FROM     — defaults to letters@the-altar-within.com

const RESEND_API = "https://api.resend.com";

// Redact any email addresses embedded in a Resend error body before logging.
// We keep status + body because failures are swallowed (never thrown), so the
// log line is the only debugging signal — it just must not leak addresses.
const EMAIL_IN_TEXT_RE = /[^\s"@,;<>()[\]]+@[^\s"@,;<>()[\]]+\.[^\s"@,;<>()[\]]+/g;
function redactBody(text: string): string {
  return text.replace(EMAIL_IN_TEXT_RE, (match) => redactEmail(match));
}

export const sendWelcome = internalAction({
  args: { email: v.string() },
  handler: async (_ctx, { email }) => {
    const apiKey = process.env.RESEND_API_KEY;
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    const from =
      process.env.NEWSLETTER_FROM ??
      "The Altar Within <letters@the-altar-within.com>";

    // Local dev without keys: skip quietly so signups still work.
    if (!apiKey) {
      console.warn(
        "RESEND_API_KEY not set; skipping Resend sync for",
        redactEmail(email),
      );
      return;
    }

    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    // 1. Add to the Audience — the list Broadcasts send to. Resend manages
    // unsubscribes against this list, so a contact missing here never
    // receives the newsletter even though they exist in our subscribers table.
    if (audienceId) {
      const res = await fetch(`${RESEND_API}/audiences/${audienceId}/contacts`, {
        method: "POST",
        headers,
        body: JSON.stringify({ email, unsubscribed: false }),
      });
      if (!res.ok) {
        console.error(
          "Resend contact add failed:",
          res.status,
          redactBody(await res.text()),
        );
      }
    } else {
      console.warn("RESEND_AUDIENCE_ID not set; subscriber not added to audience");
    }

    // 2. Welcome email. Failure here is logged, not thrown — the signup
    // already succeeded and the contact is on the list; a missed welcome
    // note should not look like an error to anyone.
    const res = await fetch(`${RESEND_API}/emails`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        from,
        to: email,
        subject: "Inscribed — welcome to The Altar Within",
        text: [
          "Your name is on the list.",
          "",
          "Essays, reflections, and educational resources from Judith Adrianna Naílah will arrive in this inbox — thoughtful letters, never noise.",
          "",
          "Lux · Veritas · Forma",
          "The Altar Within",
        ].join("\n"),
      }),
    });
    if (!res.ok) {
      console.error(
        "Resend welcome send failed:",
        res.status,
        redactBody(await res.text()),
      );
    }
  },
});

// Double opt-in confirmation email. The token is generated here (a Node
// action) because Convex mutations can't use crypto, and persisted *before*
// the send — if the email goes out, the link in it must already work.
const CONFIRM_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const sendConfirmation = internalAction({
  args: { subscriberId: v.id("subscribers"), email: v.string() },
  handler: async (ctx, { subscriberId, email }) => {
    const token = crypto.randomUUID();
    const tokenExpiry = Date.now() + CONFIRM_TOKEN_TTL_MS;

    // Persist first. setConfirmationToken only patches rows still pending,
    // so a subscriber who confirmed (or vanished) in the meantime is safe.
    await ctx.runMutation(internal.subscribers.setConfirmationToken, {
      subscriberId,
      token,
      tokenExpiry,
    });

    const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
    const confirmUrl = `${siteUrl}/confirm?token=${token}`;

    const apiKey = process.env.RESEND_API_KEY;
    const from =
      process.env.NEWSLETTER_FROM ??
      "The Altar Within <letters@the-altar-within.com>";

    // Local dev without keys: skip quietly so signups still work.
    if (!apiKey) {
      console.warn(
        "RESEND_API_KEY not set; skipping confirmation email for",
        redactEmail(email),
      );
      return;
    }

    // Failure here is logged, not thrown — the pending row and token exist;
    // the subscriber can simply submit the form again to get a fresh letter.
    const res = await fetch(`${RESEND_API}/emails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: email,
        subject: "One seal remains — confirm your place at The Altar Within",
        text: [
          "Your name has been written in pending ink.",
          "",
          "One seal remains: confirm that this inscription is yours, and the letters will begin.",
          "",
          confirmUrl,
          "",
          "The seal holds for seven days. If you did not ask for this, let the ink fade — no letters will follow.",
          "",
          "Lux · Veritas · Forma",
          "The Altar Within",
        ].join("\n"),
      }),
    });
    if (!res.ok) {
      console.error(
        "Resend confirmation send failed:",
        res.status,
        redactBody(await res.text()),
      );
    }
  },
});

export const sendContactNotification = internalAction({
  args: {
    email: v.string(),
    message: v.string(),
    name: v.optional(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (_ctx, { email, message, name, source }) => {
    const apiKey = process.env.RESEND_API_KEY;
    const from =
      process.env.NEWSLETTER_FROM ??
      "The Altar Within <letters@the-altar-within.com>";
    const notifyEmail = process.env.CONTACT_NOTIFY_EMAIL ?? "leoreyes@costadelsolweb.com";

    // Local dev without keys: skip quietly so submissions still work.
    if (!apiKey) {
      console.warn(
        "RESEND_API_KEY not set; skipping contact notification for",
        redactEmail(email),
      );
      return;
    }

    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    // Sanitize the visitor-supplied name before it reaches the subject or
    // body — defense in depth even once writes truncate at the boundary.
    const safeName = name ? sanitizeSubjectName(name) : "";

    // Notify the site owner of the new inquiry. Failure here is logged,
    // not thrown — the submission already succeeded; a missed notification
    // should not look like an error to the visitor.
    const body = [
      safeName,
      email,
      source ? `Source: ${source}` : "",
      "",
      message,
    ].filter(Boolean).join("\n");

    const res = await fetch(`${RESEND_API}/emails`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        from,
        to: notifyEmail,
        reply_to: email,
        subject: `New inquiry from ${safeName || email} — The Altar Within`,
        text: body,
      }),
    });
    if (!res.ok) {
      console.error(
        "Resend contact notification send failed:",
        res.status,
        redactBody(await res.text()),
      );
    }
  },
});
