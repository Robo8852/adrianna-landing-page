# newsletter — signup, double opt-in, and the scroll modal

## What
The newsletter signup feature: an email-only form, a scroll-triggered modal that
wraps it, and the full double opt-in lifecycle behind it — a signup writes a
*pending* row, a confirmation email is sent, and only a clicked seal promotes the
address to *confirmed* and onto the Resend broadcast list. The feature also owns
the subscriber lifecycle after signup: the unsubscribe webhook and the daily purge
of abandoned pending rows.

It does NOT own the contact form (→ `contact.md`), nor the shared anti-spam /
email plumbing it leans on (Turnstile, honeypot, rate limits, the Resend client,
the gateway secret — all → `notifications.md`). Status: **BUILT & wired.**

## Where
- `showcase/features/newsletter/NewsletterForm.tsx` — the form. Email-only, `compact`
  (row) / full (column) modes, `source` + `buttonLabel` props. Client-side email
  regex + honeypot + timing capture, then POSTs `/api/subscribe`.
- `showcase/features/newsletter/NewsletterModal.tsx` — scroll-depth lightbox that
  renders `NewsletterForm source="modal"`. Decides once at `triggerDepth` (default
  0.5); `sessionStorage` dismiss; suppresses itself if `#contact` is in view.
- `showcase/features/newsletter/NewsletterForm.test.tsx` — vitest + Testing Library.
- `showcase/features/newsletter/index.ts` — public barrel. Consumers import
  `NewsletterForm` / `NewsletterModal` (+ prop types) from `@/features/newsletter`.
- `showcase/components/composites/ConfirmedBanner.tsx` — the `?confirmed=1|expired`
  landing banner. Part of this flow but NOT in `features/newsletter/` — it stays a
  composite (see How).
- `showcase/app/api/subscribe/route.ts` — front door; verifies Turnstile, hashes IP,
  forwards to `subscribers.subscribe` with the gateway secret.
- `showcase/app/confirm/route.ts` — handles the emailed link; calls
  `subscribers.confirm`, then redirects to `/?confirmed=1|expired`.
- `showcase/convex/subscribers.ts` — `subscribe`, `confirm`, `recordUnsubscribe`,
  `setConfirmationToken`.
- `showcase/convex/emails.ts` — `sendConfirmation` + `sendWelcome` Node actions (this
  file also holds the contact action; the Resend mechanics live in `notifications.md`).
- `showcase/convex/http.ts` — Resend webhook → `recordUnsubscribe` (svix mechanics in
  `notifications.md`).
- `showcase/convex/crons.ts` / `maintenance.ts` — `purgeExpiredPending`, daily 04:00 UTC.
- `showcase/convex/schema.ts` — `subscribers(email, createdAt, source, status,
  confirmToken, tokenExpiry)`; indexes `by_email`, `by_token`, `by_status`.

Consumers (import from `@/features/newsletter`): `sections/Hero.tsx`
(`source="hero"`), `sections/H8.tsx` (`source="h8"`), `app/page.tsx` (renders
`NewsletterModal`). `ConfirmedBanner` is imported by `app/page.tsx` from its
composites path.

Env vars (names only): `RESEND_API_KEY`, `RESEND_AUDIENCE_ID`, `NEWSLETTER_FROM`,
`SITE_URL`, `RESEND_WEBHOOK_SECRET`, plus the shared `CONVEX_SHARED_SECRET`,
`TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_CONVEX_URL`.

## How
```
┌─ SIGNUP → CONFIRM → WELCOME (BUILT) ──────────────────────────────┐
│ NewsletterForm ─POST─▶ /api/subscribe (Turnstile + gateway secret) │
│   ▶ subscribers.subscribe → insert PENDING row (no token yet)      │
│   ▶ schedule emails.sendConfirmation:                              │
│        generate token (Node crypto) → setConfirmationToken patches │
│        the pending row → send confirmation email w/ /confirm link  │
│   ─click─▶ /confirm?token → subscribers.confirm                    │
│   ▶ status: confirmed, clear token → schedule emails.sendWelcome:  │
│        add to Resend AUDIENCE + send welcome email                 │
│   ─redirect─▶ /?confirmed=1|expired → ConfirmedBanner (Suspense)   │
└───────────────────────────────────────────────────────────────────┘
┌─ UNSUBSCRIBE (BUILT) ─────────────────────────────────────────────┐
│ Resend webhook (svix) → http.ts → recordUnsubscribe               │
│   contact.updated(unsubscribed) / contact.deleted → status:        │
│   unsubscribed, token cleared                                      │
└───────────────────────────────────────────────────────────────────┘
┌─ PURGE (BUILT) ── daily 04:00 UTC ────────────────────────────────┐
│ purgeExpiredPending: expired-token rows + tokenless rows >8d       │
└───────────────────────────────────────────────────────────────────┘
```

- **The token is NOT made in the mutation.** `subscribe` inserts a pending row with
  no token; the token is generated in `emails.sendConfirmation` (a `"use node"`
  action — mutations can't use crypto) and written back via `setConfirmationToken`,
  which only patches rows still `pending`. Don't try to move token generation into
  the mutation.
- **Audience add happens at confirm, not signup.** The Resend audience/broadcast add
  lives in `sendWelcome`, so an address reaches the mailing list only after its owner
  clicks the seal. A pending row is never on the list.
- **`confirm` never throws.** It returns `{ok, reason}`. The `/confirm` route collapses
  every miss — unknown token, expired token, Convex unreachable — into
  `?confirmed=expired`, so a prober can't tell which kind of miss it scored.
- **Re-subscribe is deliberate.** Re-submitting while `pending` re-sends the
  confirmation (cooldown-limited so it can't become an email cannon). Re-subscribing
  after `unsubscribed` resets the row to `pending` and re-confirms — re-establishing
  explicit consent. Confirmed addresses are an opaque dedup.
- **`ConfirmedBanner` needs `<Suspense>`** (it uses `useSearchParams`), strips the
  query param immediately so reloads/shared links don't replay it, and auto-dismisses
  after 8s. It reads `?confirmed=1` (sealed) / `expired` (lapsed).
- **Modal decides once.** At `triggerDepth` it commits to show-or-suppress for the
  visit; if `#contact` is already in view it suppresses (never interrupt someone at
  the form). Dismissal persists via `sessionStorage`, so it won't re-trigger on reload.
- **`source` is allowlisted server-side** to `hero | h8 | modal | footer`; anything
  else collapses to `"unknown"` (`convex/validation.ts`).
- Anti-spam layers (gateway secret, honeypot, <1.5s timing reject, Turnstile, rate
  limits) all answer an opaque `{ok:true}` with no write — **intentional, do not
  "fix".** Details in `notifications.md`.
