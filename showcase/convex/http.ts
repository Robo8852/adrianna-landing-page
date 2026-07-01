import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";
import { redactEmail } from "./validation";

// ---------------------------------------------------------------------------
// Resend webhook — P3-11 (Option A)
//
// Resend signs all webhook deliveries with svix. The signature is verified
// against RESEND_WEBHOOK_SECRET (set on the Convex deployment — not in code).
// Required env var: RESEND_WEBHOOK_SECRET
//   - Not set at push time; the Resend dashboard webhook is configured at prod
//     rollout. When unset, all requests are rejected with 401 to fail safe.
//   - Never crash the push or accept unverified payloads.
//
// Events handled:
//   contact.updated  — if unsubscribed flag is true, mark the subscriber
//   contact.deleted  — treat deletion as unsubscribe
//
// Endpoint (prod): https://unique-raccoon-630.convex.site/resend-webhook
// ---------------------------------------------------------------------------

/**
 * Shape of Resend's contact-event payload (partial — only what we use).
 * Resend docs: https://resend.com/docs/dashboard/webhooks/event-types
 */
interface ResendContactData {
  email?: string;
  unsubscribed?: boolean;
}

interface ResendEvent {
  type?: string;
  data?: ResendContactData;
}

const resendWebhook = httpAction(async (ctx, request) => {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    // Secret not yet configured — reject every request rather than trust any
    // payload. This is safe-fail: no data is mutated, no crash at push time.
    console.error("RESEND_WEBHOOK_SECRET not set; rejecting webhook request");
    return new Response("Webhook not configured", { status: 401 });
  }

  // Read the raw body before any parsing — svix signs the raw bytes.
  const body = await request.text();

  // Collect the three svix headers required for verification.
  const svixId = request.headers.get("svix-id") ?? "";
  const svixTimestamp = request.headers.get("svix-timestamp") ?? "";
  const svixSignature = request.headers.get("svix-signature") ?? "";

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error("Resend webhook missing svix headers — rejected");
    return new Response("Missing signature headers", { status: 400 });
  }

  let event: ResendEvent;
  try {
    const wh = new Webhook(secret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ResendEvent;
  } catch (err) {
    // Signature mismatch or replay outside tolerance window. Log without the
    // payload to avoid leaking anything from an attacker-supplied body.
    console.error("Resend webhook signature verification failed:", String(err));
    return new Response("Invalid signature", { status: 401 });
  }

  const eventType = event?.type;
  const email = event?.data?.email?.trim().toLowerCase() ?? "";

  if (!email) {
    // Valid signature but no email in payload — nothing to act on.
    console.warn("Resend webhook: verified event has no email, skipping", eventType);
    return new Response(null, { status: 200 });
  }

  if (
    eventType === "contact.deleted" ||
    (eventType === "contact.updated" && event.data?.unsubscribed === true)
  ) {
    // Mark the subscriber as unsubscribed in our database. The internal
    // mutation is idempotent and silently ignores unknown addresses.
    await ctx.runMutation(internal.subscribers.recordUnsubscribe, { email });
    console.log(
      "Resend webhook: unsubscribed",
      redactEmail(email),
      "via event",
      eventType,
    );
  } else {
    // Acknowledged but not acted on — e.g. contact.created, or
    // contact.updated with unsubscribed=false (re-subscribe via Resend UI,
    // which is distinct from re-subscribing through our form).
    console.log("Resend webhook: unhandled event type", eventType, "— ignoring");
  }

  return new Response(null, { status: 200 });
});

const http = httpRouter();

http.route({
  path: "/resend-webhook",
  method: "POST",
  handler: resendWebhook,
});

export default http;
