# resend-spec — The Altar Within: newsletter email (welcome send)

A specification for the **Resend phase** of the newsletter: sending a welcome email when someone subscribes. This builds directly on the shipped Convex backend (`spec/convex.md`), filling the documented seam in `convex/subscribers.ts`.

This document describes **what** the email layer does and **why**, not **how** it is built. A separate `resend-imp.md` will follow with the sequential build plan. When complete, both archive to `finished-implementations/` and `spec/convex.md` (or a new `spec/email.md`) is updated so the spec map stays honest.

Cross-references:
- The backend this extends: `spec/convex.md`; the `subscribe` mutation + Resend seam: `showcase/convex/subscribers.ts`.
- The prior phase's spec/plan (archived): `finished-implementations/convex-spec.md`, `finished-implementations/convex-imp.md`.
- The form that triggers signups: `showcase/components/composites/NewsletterForm.tsx`, `spec/composites.md`.
- Deploy/env model: `spec/tooling.md`.

**Build method:** built by **orchestrated subagents**, same as the Convex phase — each `resend-imp.md` step gets an implementer subagent and an adversarial verifier subagent against that step's acceptance criteria, with parallel fan-out where the dependency graph allows.

---

## 0. Hard prerequisite — a verified sending domain (do this FIRST)

**Resend will not send to real subscribers without a verified custom domain.** Its shared `onboarding@resend.dev` sender can only deliver to *your own Resend account email* — useless for a newsletter. This phase therefore **cannot be tested end-to-end until the domain is verified**, so the domain is Step 0 of `resend-imp.md`, blocking all code work.

- **Domain:** `thealtarwithin.com`, **registered on Vercel** (Vercel also hosts the production site, so DNS is managed in the Vercel dashboard — one place for site + email records).
- **Flow:**
  1. Register/attach `thealtarwithin.com` in Vercel and point the `adrianna-landing-page` project at it (this also moves the live site off `*.vercel.app`).
  2. Add the domain in the **Resend dashboard**; Resend emits DNS records.
  3. Paste those records into **Vercel → Domains → thealtarwithin.com → DNS**: **SPF** (TXT) + the **MX** Resend specifies for bounce/complaint feedback, **DKIM** (TXT), and **DMARC** (TXT, recommended).
  4. Wait for Resend to mark the domain **Verified** (usually minutes; Resend rechecks for up to 72h).
- ❓ *Open: verify the **root** `thealtarwithin.com` (clean `from`, e.g. `hello@thealtarwithin.com`) or a **send subdomain** `send.thealtarwithin.com` (isolates sending reputation from the apex)? Default = **root domain** for the first cut, since this is low-volume transactional welcome mail; revisit if we add marketing blasts.*

---

## 1. Purpose & scope

The Convex phase made signups **persist**; it deliberately sent **no email** (`spec/convex.md` §Resend seam). This phase closes that: **on a new subscription, send a single welcome email** in the site's voice, reliably and exactly once.

Resend is the chosen provider: it has a **first-party Convex component** (`@convex-dev/resend`, endorsed by both Convex and Resend) that gives durable queued delivery, batching, idempotency, rate-limit back-pressure, and delivery webhooks — so we don't hand-roll any of that in the mutation.

**In scope (this iteration):**
- A verified `thealtarwithin.com` sending domain (Step 0).
- The `@convex-dev/resend` component installed and configured in the Convex backend.
- A welcome email sent **once per new subscriber**, fired from the `subscribe` mutation's existing insert branch (the documented seam).
- Welcome email content in the brand voice (parchment/illuminated-manuscript tone), as HTML + plaintext.
- `RESEND_API_KEY` configured in Convex env (dev + prod); `testMode` flipped off for production.
- Tests updated: a new subscription **enqueues** the welcome; a **duplicate** does not.

**Out of scope (this iteration — design must not preclude them):**
- **Double opt-in / confirmation flow** (`status: pending → confirmed`). Welcome is single opt-in for now; the schema seam for it is noted below.
- **Delivery webhooks** (`RESEND_WEBHOOK_SECRET`, bounce/complaint handling, suppression sync). Component supports it; we defer wiring it.
- **Unsubscribe flow / List-Unsubscribe header**, segmentation, broadcast/marketing blasts, admin notifications.
- Any **second email** beyond the welcome.

---

## 2. Architecture & data flow

```
NewsletterForm ──▶ subscribe mutation (convex/subscribers.ts)
                      ├─ validate + dedup (unchanged)
                      ├─ insert subscriber (unchanged)
                      └─ NEW: on first insert only →
                           resend.sendEmail(ctx, { from, to, subject, html, text })
                                   │  (@convex-dev/resend component)
                                   ▼
                           Convex workpool (durable queue)
                                   │  batches, retries, idempotency key, rate-limit
                                   ▼
                           Resend API  ──▶  recipient inbox
                                   │
                                   └─(optional, later) webhook ──▶ delivery status
```

- **No separate action needed for the happy path.** The `@convex-dev/resend` component is called from inside the mutation (`resend.sendEmail(ctx, …)`); it enqueues into a Convex workpool and performs the actual network send in its own scheduled functions. Mutations stay pure (no direct network I/O); the component owns the I/O. This is cleaner than the originally-sketched `ctx.scheduler.runAfter(0, internal.emails.sendWelcome)` seam, which it supersedes.
- **Welcome fires only on a genuinely new insert** — it lives in the `subscribe` mutation's new-subscriber branch, *after* the dedup check. Re-subscribing (an existing email) returns the same opaque `{ ok: true }` and **sends nothing**, so no one is re-welcomed.
- **Layering:** purely a backend-domain addition (`showcase/convex/*` + the component). `NewsletterForm`, sections, primitives, styling are **unchanged** — the form's success state already reads "Inscribed. A response will arrive in due time." which now becomes literally true.

---

## 3. Data model

No schema change is **required** for a single welcome email — the existing `subscribers` table (`email`, `createdAt`, `source` + Convex's `_id`/`_creationTime`) is sufficient, and dedup already prevents double-sends.

**Forward-looking fields (NOT added now; noted to keep the model stable):**
- `welcomeEmailSentAt?: number` — if we later want to record/confirm the welcome actually queued.
- `status?: "pending" | "confirmed"`, `confirmedAt?: number` — for the future double-opt-in phase.

These stay additive; the welcome-send logic must not depend on them.

---

## 4. The welcome-send contract

**Where:** inside `subscribe` (`convex/subscribers.ts`), in the new-subscriber branch, replacing the seam comment. Optionally extracted to a small `convex/emails.ts` helper for testability.

**Trigger:** exactly once, immediately after `ctx.db.insert("subscribers", …)` for a new email. Never on the dedup/return-early path.

**Send call (via `@convex-dev/resend`):**
- `from`: a verified-domain address — proposed `The Altar Within <hello@thealtarwithin.com>` (final address pending §0 root-vs-subdomain decision).
- `to`: the just-subscribed `email`.
- `subject`: brand-voiced welcome — e.g. *"You are inscribed."* (final copy TBD; match the liturgical tone of `landing-page-copy.md`).
- `html` + `text`: welcome body in the parchment/gold voice; **plaintext alternative required** for deliverability.
- Idempotency is handled by the component; the natural idempotency key is the subscriber email (or `_id`) so retries can't double-send.

**Failure behaviour:** email send is **fire-and-forget relative to the signup** — a Resend/queue failure must **NOT** fail the `subscribe` mutation or the user's "Inscribed" confirmation. The subscriber is already persisted; the welcome is best-effort and the component retries durably. (The form's failure message is reserved for the *persistence* call failing, not the email.)

---

## 5. Configuration, environment & secrets

- **`RESEND_API_KEY`** — set in **Convex** env, not Vercel (the send happens in the Convex backend): `npx convex env set RESEND_API_KEY <key>` for the dev deployment and `--prod` for production. The browser never sees it.
- **`RESEND_WEBHOOK_SECRET`** — only when webhooks are added (out of scope this iteration).
- **`testMode`** — `@convex-dev/resend` defaults to `testMode: true` (sends only to Resend test addresses). Production config must set **`testMode: false`**; keep it `true` for local/dev until the domain verifies.
- **Component registration** — `convex/convex.config.ts` must `app.use(resend)` (per the component's install docs); `@convex-dev/resend` added to `showcase/package.json` (and `package-lock.json` resynced for `npm ci` / CI).
- No secrets committed; this changes nothing about `.env.local` (the API key lives in Convex's env store, not a file).

---

## 6. Security, privacy & deliverability

- **API key is server-only** (Convex env). Never `NEXT_PUBLIC_*`.
- **No enumeration leak preserved** — the welcome send is invisible to the client; the mutation still returns the same opaque `{ ok: true }` for new and duplicate.
- **Deliverability:** SPF + DKIM are mandatory for the domain to send at all; DMARC recommended. Send from a consistent `from`. Plaintext part required. A `List-Unsubscribe` header / unsubscribe link is best practice and a likely pre-launch follow-up (not built now).
- **PII:** the recipient address is already stored; no new PII. Don't log full addresses in plaintext beyond what Convex/Resend record.

---

## 7. Free-tier limits (plan around these)

- Resend free tier: **3,000 emails/month**, hard **100 emails/day**, **one domain**, 30-day log retention.
- Welcome emails are 1-per-new-signup and low volume, so the daily cap is fine for transactional use. **A future bulk/broadcast send would blow the 100/day cap** — flag before any mass mailing.

---

## 8. Testing

- **Mock `@convex-dev/resend`** (or the `convex/emails.ts` wrapper) so tests need no real key/deployment.
- Assert: a **new** subscription calls the welcome send **once** with the right `to`/`from`/`subject`; a **duplicate** subscription sends **nothing**; an invalid email sends nothing.
- Assert the `subscribe` mutation still **succeeds even if the send throws** (best-effort decoupling from §4).
- `NewsletterForm.test.tsx` should remain green unchanged (the form's contract is unaffected).

---

## 9. Acceptance criteria (feature-level)

- [ ] `thealtarwithin.com` is **Verified** in Resend (SPF + DKIM passing) via Vercel-managed DNS.
- [ ] `@convex-dev/resend` installed, registered in `convex/convex.config.ts`, `RESEND_API_KEY` set in Convex dev + prod, `testMode: false` in production.
- [ ] Subscribing a **new** real email delivers one welcome email to that inbox, from a `@thealtarwithin.com` address.
- [ ] Subscribing the **same** email again sends **no** second welcome (dedup holds) and shows no user error.
- [ ] A failing/queued send does **not** break the signup or the "Inscribed" confirmation.
- [ ] `npm run lint`, `npm run test`, `npm run build` pass in `showcase/`; `package-lock.json` in sync for `npm ci`.
- [ ] No secrets committed; `RESEND_API_KEY` documented as a Convex env var.
- [ ] `spec/convex.md` (or new `spec/email.md`) updated so the spec map reflects that welcome email now sends; the "Resend seam — not built" note is retired.

---

## 10. Open questions (do not block drafting `resend-imp.md`)

1. **§0** Verify root `thealtarwithin.com` vs `send.` subdomain? *(default: root, low-volume transactional)*
2. **§1** Single welcome vs double opt-in confirmation this phase? *(default: single welcome; opt-in deferred)*
3. **§4** Final `from` address + subject + body copy. *(default: `hello@thealtarwithin.com`, "You are inscribed."; copy drafted to match `landing-page-copy.md` voice)*
4. **§1/§6** Add `List-Unsubscribe` / unsubscribe link now or as pre-launch follow-up? *(default: follow-up)*
5. **§1** Wire delivery webhooks (`RESEND_WEBHOOK_SECRET`, bounce/complaint suppression) this phase? *(default: defer)*
6. **§4** Idempotency key = subscriber email or `_id`? *(default: email — matches the dedup key)*

Defaults above are what `resend-imp.md` will assume unless you say otherwise.
