# calendly — booking popup feature

## What
Lets visitors book appointments with Adrianna via Calendly, launched from CTAs on
the pricing and about sections. The feature owns: the booking-link config (which
service maps to which Calendly event), the lazy widget loader, and the `BookButton`
composite. It does NOT own scheduling logic, payment, or any record of who booked —
bookings live entirely inside Calendly's hosted popup. There is no server side yet.

Status: **PARTIAL.** Only the `intro` event has a confirmed real slug; the other three
booking keys are `null` and fall back to Adrianna's account landing page. The flow is
not yet browser-verified. A Calendly webhook receiver (to record bookings in Convex)
is **PLANNED, not started.**

## Where
All feature code lives under `showcase/features/calendly/` and is consumed only through
its barrel:

- `showcase/features/calendly/index.ts` — public API barrel. Consumers import from
  `@/features/calendly` only; never reach into the files below.
- `showcase/features/calendly/calendly.ts` — single source of truth for booking links.
  `BookingKey` union (`"intro" | "session" | "package" | "coaching"`), the
  `SERVICE_SLUGS` map, brand-theme params, and the `bookingUrl(key)` /
  `hasConfirmedBooking(key)` helpers.
- `showcase/features/calendly/useCalendly.ts` — `'use client'` hook that lazy-loads
  Calendly's `widget.js` + `widget.css` on first `open()` and calls
  `initPopupWidget`. Module-level `scriptPromise` so the script loads exactly once.
- `showcase/features/calendly/BookButton.tsx` — `'use client'` gold/ink CTA. Takes a
  `bookingKey` (+ optional `label`, `className`), calls `bookingUrl(key)` then the hook.

Consumers (import `BookButton` / `BookingKey` from `@/features/calendly`):
- `showcase/components/composites/PriceCard.tsx` — renders `BookButton` when a
  `bookingKey` prop is present; label is "Book — Free" for `intro`, else "Book a Session".
- `showcase/components/sections/H7.tsx` — the pricing section; tags each of the four
  service cards with a `bookingKey`.
- `showcase/components/sections/A5.tsx` — "Free Intro Call" CTA → `bookingKey="intro"`.

Env: `NEXT_PUBLIC_CALENDLY_URL` (account base URL, in both `.env.local` files). No secret
values here — the account URL is public and the code has a hardcoded fallback.

**Does not exist yet:** any Calendly webhook route, any Convex table for bookings, any
API token wiring. Only `intro` resolves to a real event; `session` / `package` /
`coaching` are `null` in `SERVICE_SLUGS`.

## How
- **Booking keys, not raw URLs.** Every button references a service by `BookingKey`.
  To add or fix a real event, edit `SERVICE_SLUGS` in `calendly.ts` only — no component
  changes. A `null` slug is intentional: it falls back to the account page rather than
  breaking, so do not "fix" the nulls by inventing slugs; they need Adrianna's real ones.
- **Lazy-load is deliberate.** Nothing Calendly loads at page load; the script/CSS inject
  on first `open()` (mirrors `useTurnstile`). Don't move it into `<head>`.
- **Event names don't match the cards.** Her live Calendly events ("Full Immersion",
  "Precision Consultation") don't cleanly map to the four H7 pricing cards. That
  reconciliation is unresolved and needs her input — don't assume the card labels are the
  event names.
- **Booking-tracking (PLANNED)** would add `app/api/calendly-webhook/route.ts` → a Convex
  mutation. `svix` (already installed for the Resend webhook) is also Calendly's signing lib.

## Session addendum 2026-08-21 (pluck from live session)

- HeaderNav: brass plaque is now "Book a Session" (opens popup via
  useCalendly, bookingKey "session" → falls back to account landing page
  since slug is null). Newsletter demoted to plain link. Mobile menu same.
  OPEN: consider pointing header at "intro" (only confirmed live slug).
- Calendly popup overflow FIXED in globals.css: vendor hard-codes 1000×700
  + translate(-500px,-350px); override clamps to min(1000px,100vw-2rem) etc.
  and re-centers with translate(-50%,-50%).
- STILL NULL: session/package/coaching slugs in features/calendly/calendly.ts.
