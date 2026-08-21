# notifications — shared email & anti-spam plumbing

> The two form features that use this live in `newsletter.md` and `contact.md`.
> This spec is only the plumbing they share: the Resend client, Turnstile, the
> honeypot/timing/rate-limit ladder, the gateway secret, and the webhook receiver.

## What
The shared machinery under both public forms. It owns: the client Turnstile hook,
the server-side Turnstile verifier + IP hashing, the gateway shared-secret check,
the rate-limit bucket definitions, the validation/sanitization helpers, the Resend
action module, and the svix-verified Resend webhook.

It does NOT own either feature's flow, copy, or schema — the subscriber lifecycle
(pending → confirmed → unsubscribed, purge) is `newsletter.md`; the message
submit/notify/purge is `contact.md`. Nothing here is feature-specific except the
per-feature bucket names and source allowlists, which are colocated for one place
to tune limits. Status: **BUILT.**

## Where
- `showcase/lib/formGateway.ts` — server-only. `getClientIp` (Vercel-trusted
  `x-forwarded-for`), `hashIp` (salted sha256, salt = `CONVEX_SHARED_SECRET`),
  `verifyTurnstile` (fail-open). Never import from a client component.
- `showcase/lib/hooks/useTurnstile.ts` — client hook. Lazy-loads the Turnstile
  widget on first `arm()`; `getToken()` resolves the token; a safe no-op when
  `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is unset.
- `showcase/convex/rateLimits.ts` — the `RateLimiter` and all buckets for BOTH
  features (`subscribe*`, `confirmResendPerEmail`, `contact*`), plus `EMAIL_RE`.
- `showcase/convex/validation.ts` — plain TS (no Convex imports). `LIMITS`, the
  `NEWSLETTER_SOURCES` / `CONTACT_SOURCES` allowlists, `normalizeSource`,
  `sanitizeSubjectName`, `redactEmail`, `countUrls`, `sharedSecretOk`.
- `showcase/convex/emails.ts` — the `"use node"` Resend action module. Houses all
  three send actions (`sendConfirmation`, `sendWelcome`, `sendContactNotification`)
  and the log-redaction helpers.
- `showcase/convex/http.ts` — the Resend webhook `httpAction`: svix signature
  verification, then routes unsubscribe events to `subscribers.recordUnsubscribe`.
- `showcase/lib/convexValidation.test.ts` — unit tests for the validation helpers
  (kept out of `convex/`, which `convex push` analyzes).

Env vars (names only): `CONVEX_SHARED_SECRET`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`,
`TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `RESEND_AUDIENCE_ID`,
`RESEND_WEBHOOK_SECRET`, `NEWSLETTER_FROM`, `SITE_URL`, `CONTACT_NOTIFY_EMAIL`,
`NEXT_PUBLIC_CONVEX_URL`.

## How
Every public form mutation runs the same ladder, in order. All rungs but the last
answer an **opaque `{ok:true}` with no write** — a caught bot learns nothing:

```
form ─POST─▶ /api/{subscribe,contact} route (BUILT)
   1. verifyTurnstile(token, ip)   ── secret set + bad/absent token → opaque ok
   2. hashIp(ip) + attach CONVEX_SHARED_SECRET, forward to Convex mutation
      └▶ mutation ladder (BUILT):
         3. sharedSecretOk(secret)  ── bypassed the front door → opaque ok
         4. honeypot (hp non-empty) ── opaque ok
         5. timing (elapsedMs<1500) ── opaque ok
         6. rate limits (per-email / per-ip / global / hourly / daily) → opaque ok
         7. validation (regex, length) ── the ONLY non-opaque path: throws
         (contact only) URL-count heuristic + 24h dedup → opaque ok
```

- **Fail-OPEN vs fail-SAFE.** Missing *form* secrets fail open on purpose so dev /
  preview without keys still work: `CONVEX_SHARED_SECRET` unset → `sharedSecretOk`
  returns true; `TURNSTILE_SECRET_KEY` unset → `verifyTurnstile` returns true; both
  logged once. The **webhook** does the opposite — `RESEND_WEBHOOK_SECRET` unset →
  reject every request with 401. Don't "harmonize" these; the asymmetry is the point.
- **Turnstile is also fail-open on Cloudflare outage** — a non-OK or non-JSON
  siteverify response returns true so an outage can't take the forms down; the Convex
  heuristics still apply. Only a *set* secret with a bad/absent token rejects.
- **The raw IP never leaves the route process.** Only its salted sha256 (`hashIp`)
  reaches Convex, as a rate-limit key.
- **`emails.ts` is a Node action, and every send is scheduled, not awaited.** A form
  never fails because email failed — the action runs after the mutation commits.
  Send failures are logged (addresses redacted via `redactEmail`), never thrown.
- **Sources are allowlisted** per feature; unknown values collapse to `"unknown"`
  before they touch the DB or an email (`normalizeSource`).
- **The webhook only acts on** `contact.deleted` and `contact.updated` with
  `unsubscribed=true`; other events are acknowledged (200) and ignored.
  `recordUnsubscribe` is idempotent and silently skips unknown addresses.
