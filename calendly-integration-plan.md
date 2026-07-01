# Calendly Integration Plan

**Goal:** Let visitors book appointments with Adrianna directly from the landing page via Calendly.

**Scope:** Booking only. (Newsletter and contact form already exist and are out of scope — see aside at bottom.)

---

## ⏯️ STATUS / NEXT ACTION (read first)

**Where we are:** v1 booking UI BUILT (config-driven) and typechecks clean. Not yet visually verified in the browser.

**Discovery done — from the Linktree scrape:**
- Calendly account: `calendly.com/thealtarwithin`
- ✅ Confirmed live event: `intro` → `short-form-consultation-30-min`
- Substack (for later newsletter item): `https://substack.com/@beyondtherapy`
- ⚠️ Her live event names DON'T cleanly match the H7 pricing cards. Other events seen on Linktree ("Full Immersion 60–75 min", "Precision Consultation", collaboration/speaking) had no captured slug. `session`/`package`/`coaching` slugs are still UNKNOWN.

**What's built:**
- `lib/calendly.ts` — single source of truth. `BookingKey` union + `SERVICE_SLUGS` map. Only `intro` confirmed; others `null` → fall back to account page. Brand theme params baked in.
- `lib/hooks/useCalendly.ts` — lazy-loads Calendly widget.js/css on first click (mirrors `useTurnstile`).
- `components/composites/BookButton.tsx` — gold/ink CTA, `'use client'`.
- Wired: `PriceCard` (optional `bookingKey`) ← `H7` (each service tagged); `A5` "Free Intro Call" → real popup.
- `NEXT_PUBLIC_CALENDLY_URL` added to both `.env.local` files.

**Decisions resolved:** D1 → **A) popup widget** (v1). D2 → account URL confirmed, 1 event slug verified.

**Next action (pick one):**
1. **Verify in browser** — `cd showcase && npm run dev`, click each CTA, confirm popup loads + theme + no console errors (esp. free-intro flow).
2. **Get remaining slugs** from Adrianna (her real event URLs, or a Calendly API token to list event types) → fill `SERVICE_SLUGS` in `lib/calendly.ts`.
3. **D3 still open** — reconcile her real event names with the 4 pricing cards (relabel cards vs. keep + map). Needs her input.

**To run the app:** `cd showcase && npm run dev` → http://localhost:3000

### 📋 Progress board (durable — task list doesn't survive a terminal close)
- [x] Scrape Linktree → account `calendly.com/thealtarwithin`, intro slug, Substack
- [x] Build config-driven booking UI v1 (typechecks clean)
- [~] Sent Adrianna update asking for her **Calendly API key** (personal access token) — AWAITING HER REPLY
- [ ] Fill `SERVICE_SLUGS` (session/package/coaching) in `lib/calendly.ts` once she sends API key/links — *blocked on her*
- [ ] Resolve D3: her event names ("Full Immersion", "Precision Consultation") vs the 4 pricing cards — *needs her input*
- [ ] Verify booking flow in browser (npm run dev, click CTAs, check popup/theme/console) — *not blocked, can do anytime*

### ⏳ Waiting on Adrianna (paste into next session when it arrives)
Her **Calendly API key** (Integrations & apps → API & webhooks → Personal access tokens). Goes in `.env.local` ONLY — never commit it or paste into this file. Fallback if she can't generate one: she copy-pastes each event's "Copy link" URL.

---

## Current state

- The site collects interest but has **no scheduling**:
  - Newsletter → `POST /api/subscribe`
  - Contact form → `POST /api/contact` → Convex
- Pricing section `components/sections/H7.tsx` is **display-only**. `components/composites/PriceCard.tsx` has no action button.
- `components/sections/A5.tsx` already has a "Free Intro Call" CTA that currently just jumps to `/#services` — the natural hook for real booking.

### Services that need a booking action (from `H7.tsx`)
1. Introductory Meeting — Free, 30 min  ← **priority**
2. 1:1 Psychotherapy Session — $120, 60–90 min
3. 3-Session Package — $270
4. Psychotherapy with Coaching — $200, 60–90 min

---

## Conventions to match (so the integration fits the codebase)

- **Lazy-load scripts on interaction**, not in `<head>` — pattern lives in `lib/hooks/useTurnstile.ts`.
- **Modals are custom framer-motion**, not Radix — see `components/composites/NewsletterModal.tsx`.
- **Env vars** use the `NEXT_PUBLIC_` convention; two `.env.local` files (repo root + `showcase/`).
- **TypeScript strict**, explicit `'use client'` on interactive components.
- **Palette:** `ink-green #0B3B36`, `gold #C9A961`, `gold-warm #D9BE7E`, `parchment #F3EEDA`. Fonts: Cormorant (display) / EB Garamond (body).

---

## Decisions to lock before coding

- **D1 — Embed style:**
  - **A) Calendly popup widget** — fast; Calendly controls the popup chrome. Recommended for v1.
  - **B) Own framer-motion modal + Calendly iframe** — best brand match, more code.
- **D2 — Calendly URL:** real link from Adrianna's account, or placeholder for now?
- **D3 — Event types:** one booking link, or separate links (free intro vs paid sessions)?

---

## Build steps

1. **Config** — add `NEXT_PUBLIC_CALENDLY_URL` (and optional intro-event var) to **both** `.env.local` files.
2. **Loader hook** — `lib/hooks/useCalendly.ts`, modeled on `useTurnstile.ts`: inject Calendly's `widget.js` (+ CSS) only on first booking interaction; expose `openPopup(url, prefill)`.
3. **Booking button** — `components/composites/BookButton.tsx` (`'use client'`), styled gold/ink, calls the hook. Optional `eventUrl` prop so different cards target different events.
4. **Price cards** — add a `bookingUrl` prop to `PriceCard.tsx`; render `BookButton` when present (esp. the free Introductory Meeting).
5. **A5 CTA** — repoint "Free Intro Call" from `/#services` to the real booking action.
6. **H7 header (optional)** — single "Book a session" `BookButton`.
7. **Theme + prefill** — pass palette params to Calendly (`background_color=0B3B36&text_color=F3EEDA&primary_color=C9A961`) and prefill name/email when available.
8. **Verify** — run dev server, click each CTA, confirm popup loads, theme matches, prefill works, no console errors. Test the free-intro flow specifically.

### Optional phase 2 (skip for v1)
- **Booking tracking** — Calendly webhook receiver at `app/api/calendly-webhook/route.ts` → Convex mutation to record bookings. (`svix`, already installed, is Calendly's webhook-signing lib.)

---

## Aside: newsletter (out of scope)

The newsletter signup (`NewsletterForm.tsx`, `NewsletterModal.tsx` → `/api/subscribe`) already works and is **not** part of this effort. Listed only so it isn't confused with the booking flow. No changes planned.
