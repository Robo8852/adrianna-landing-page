# contact — the contact form and owner notification

## What
The contact form: a visitor sends a name (optional) + email + message, it is
persisted to Convex, and the site owner is emailed the inquiry. Fire-and-forget —
there is no confirmation step, no reply threading, no double opt-in. The DB copy
is short-lived: because every message is emailed on arrival, rows are purged after
180 days.

It does NOT own the newsletter (→ `newsletter.md`) or the shared anti-spam / email
plumbing it leans on (→ `notifications.md`). Status: **BUILT & wired.**

## Where
- `showcase/features/contact/ContactForm.tsx` — the form. Name (optional) / email /
  message, `source` prop. Client-side email + non-empty-message checks, honeypot,
  timing capture, then POSTs `/api/contact`.
- `showcase/features/contact/ContactForm.test.tsx` — vitest + Testing Library.
- `showcase/features/contact/index.ts` — public barrel. Consumers import `ContactForm`
  (+ `ContactFormProps`) from `@/features/contact`.
- `showcase/app/api/contact/route.ts` — front door; verifies Turnstile, hashes IP,
  forwards to `messages.submitContact` with the gateway secret.
- `showcase/convex/messages.ts` — `submitContact` mutation (dedup + URL heuristic).
- `showcase/convex/emails.ts` — `sendContactNotification` Node action (this file also
  holds the newsletter actions; Resend mechanics live in `notifications.md`).
- `showcase/convex/crons.ts` / `maintenance.ts` — `purgeOldMessages`, daily 04:30 UTC.
- `showcase/convex/schema.ts` — `messages(email, message, name, source, createdAt)`;
  index `by_email`.

Consumer (imports from `@/features/contact`): `sections/ContactSection.tsx`
(`source="contact-h8"`).

Env vars (names only): `CONTACT_NOTIFY_EMAIL`, `NEWSLETTER_FROM`, `RESEND_API_KEY`,
plus the shared `CONVEX_SHARED_SECRET`, `TURNSTILE_SECRET_KEY`,
`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_CONVEX_URL`.

## How
```
┌─ SUBMIT → NOTIFY (BUILT) ─────────────────────────────────────────┐
│ ContactForm ─POST─▶ /api/contact (Turnstile + gateway secret)      │
│   ▶ messages.submitContact → insert messages row                  │
│   ▶ schedule emails.sendContactNotification →                     │
│        email to CONTACT_NOTIFY_EMAIL, reply_to = visitor's email   │
└───────────────────────────────────────────────────────────────────┘
┌─ PURGE (BUILT) ── daily 04:30 UTC ────────────────────────────────┐
│ purgeOldMessages: messages older than 180 days                    │
└───────────────────────────────────────────────────────────────────┘
```

- **No confirmation, no double opt-in** — unlike newsletter, a contact submit writes
  the row and schedules the owner email in one shot. Nothing is sent back to the
  visitor beyond the on-page "Inscribed" acknowledgement.
- **`CONTACT_NOTIFY_EMAIL` is comma-separated multi-recipient** and has a hardcoded
  fallback (`leoreyes@costadelsolweb.com`) when unset. `reply_to` is set to the
  visitor's address so a reply from the inbox goes straight back to them.
- **24h duplicate suppression:** same email + identical message within a 24-hour
  window is dropped as an opaque `{ok:true}` (no write, no email). Not a bug.
- **URL heuristic:** a message with more than 3 URL-ish tokens (`http://`, `https://`,
  `www.`) is dropped opaquely as spam.
- **Name is sanitized before it reaches the email** (`sanitizeSubjectName`: strips
  control chars, collapses whitespace, caps at 100) — header-injection defense, even
  though writes already truncate at the boundary.
- **`source` is allowlisted server-side** to `contact-h8 | footer`; anything else
  collapses to `"unknown"` (`convex/validation.ts`).
- **Messages are purged after 180 days** because they're already emailed to the owner
  on arrival — the DB copy is redundant PII. Purge runs in batches of 100 and
  reschedules itself when a batch fills.
- Anti-spam layers (gateway secret, honeypot, <1.5s timing reject, Turnstile, rate
  limits) all answer an opaque `{ok:true}` with no write — **intentional, do not
  "fix".** Details in `notifications.md`.
