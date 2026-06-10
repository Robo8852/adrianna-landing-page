# intake-spec — The Altar Within: complete the data-capture layer + spam hardening

A specification for an **audit-and-remediation phase**: prove that **every** email / contact / form / data-capture touchpoint on the site is wired to the Convex backend (none silently dropping input), wire the ones that aren't, and add **spam/abuse protections** to all submission paths.

This describes **what** must be true and **why**, not the line-by-line **how** (that goes in `intake-imp.md`). It builds on the shipped Convex backend (`spec/convex.md`) and is independent of the parked Resend/email-send phase (`resend-spec.md`).

Cross-references:
- Backend it extends: `spec/convex.md`, `showcase/convex/subscribers.ts`.
- Form composite + chrome: `spec/composites.md`, `showcase/components/composites/NewsletterForm.tsx`, `showcase/components/chrome/Footer.tsx`.
- Sections that host CTAs: `spec/sections.md`, `showcase/components/sections/*`.
- Deploy/env/CI: `spec/tooling.md`.

**Build method:** executed by a **thorough fan-out of orchestrated subagents** — see §3 (Audit methodology) and §8 (Build orchestration). The audit is deliberately redundant: multiple subagents sweep the codebase along *different* axes so no touchpoint is missed, findings are reconciled, then remediation + verification run per finding.

---

## 1. Purpose & scope

The Convex phase wired *one* form (`NewsletterForm`, used in H8 + Footer). But the site has **other** data-capture surfaces that were never connected, so user input is being **dropped on the floor** in places we previously believed were covered. This phase makes the guarantee explicit and total: **no interactive element that collects user data discards it.** It also hardens every real submission path against spam and abuse, which the current code does not do at all.

**Known gaps at spec time (from an initial sweep — the fan-out must confirm and extend this list):**
1. **`Hero.tsx` bespoke email form** — the home-page hero CTA ("Join the Vespers") is its *own* inline `<form>` with `onSubmit={(e) => e.preventDefault()}` and a raw `<input type="email">`. It is **not** `NewsletterForm`, has no validation/persistence/confirmation, and **discards every email**. This is likely the highest-traffic signup on the site.
2. **`mailto:[email]` placeholders** — `H8.tsx` and `Footer.tsx` ship literal `[email]` mailto links (also noted in `spec/composites.md` gotchas). Broken contact affordances.
3. **No spam protection anywhere** — the `subscribe` mutation has server-side email-format validation and dedup, but **no rate limiting, no honeypot, no timing/bot heuristics, no abuse controls**. A script can hammer it freely.

**In scope (this iteration):**
- An **exhaustive audit** (subagent fan-out) cataloguing every data-capture touchpoint: forms, `<input>`/`<textarea>`/`<select>`, `onSubmit` handlers, `mailto:`/`tel:` links, and any element that takes user input — across `showcase/app` and `showcase/components`.
- For each: classify as **(a) wired to Convex**, **(b) unwired/dropping data → must wire**, or **(c) intentionally static** (e.g. a real `mailto:` to a monitored inbox — acceptable, but must use a real address, not `[email]`).
- **Remediate the unwired ones:** replace the Hero bespoke form with `<NewsletterForm source="hero" />` (single source of truth for signup UX), and resolve the `[email]` placeholders (real address or a wired form — see §5).
- **Spam/abuse hardening** on every persisting mutation (§6).
- Tests + spec-map sync.

**Out of scope (this iteration):**
- **Sending email** (welcome/opt-in/notifications) — that is `resend-spec.md`, parked.
- A net-new **contact form with a free-text message** *unless* the audit/decision in §5 calls for one; if added, it is a small, well-scoped addition with its own table (§4).
- CAPTCHA/Turnstile **unless** §6's lighter measures prove insufficient (kept as an escalation, not a default).
- Auth, accounts, admin UI.

---

## 2. The invariant this phase establishes

> **Every interactive element that accepts user data either (a) persists it to Convex through a validated, spam-protected mutation, or (b) is an explicitly-approved static link to a real, monitored destination. Nothing silently discards input.**

The deliverable is both the **code** that makes this true and the **audit artifact** (a catalogue of touchpoints with their classification + disposition) that proves it.

---

## 3. Audit methodology (the fan-out)

The audit must be **redundant and multi-axis** — single-pass grep misses things (the Hero form was missed for an entire phase). Independent subagents sweep along different axes; results are de-duplicated and reconciled into one catalogue:

- **Axis A — by markup:** every `<form>`, `<input>`, `<textarea>`, `<select>`, `<button type="submit">` in `showcase/**`.
- **Axis B — by behaviour:** every `onSubmit`, `onClick` that mutates/sends, `useMutation`/`useAction`/`fetch`/`action(` call, and any `e.preventDefault()` that swallows a submission.
- **Axis C — by contact affordance:** every `mailto:`, `tel:`, `href` to an external contact channel, and any placeholder tokens (`[email]`, `TODO`, `lorem`, dummy addresses).
- **Axis D — by route/section walk:** read each `page.tsx` and each section/chrome component end-to-end and list every place a user could *enter or send* anything (catches custom/inline widgets that don't look like standard forms — e.g. the Hero CTA).

Each axis is one (or more) subagent. The orchestrator merges findings into a **touchpoint catalogue**: `{ location (file:line), kind, current behaviour, classification (wired / unwired / static), disposition }`. A **completeness-critic** subagent then reviews the merged catalogue against the raw component list and asks "what surface did no axis cover?" Anything it surfaces becomes another remediation item.

---

## 4. Data model

- **No change required** to wire the Hero form — it reuses the existing `subscribers` table + `subscribe` mutation (just a new `source: "hero"`).
- **Spam-signal fields** (optional, see §6) — if we record lightweight abuse signals, add them additively to `subscribers` (e.g. nothing user-facing; prefer keeping spam logic in the mutation/rate-limiter rather than the row).
- **IF a contact-message form is added (§5):** a new `messages` table — `{ name?, email, message, source, createdAt }` + a `submitContact` mutation with the **same** validation + spam protections as `subscribe`. Indexed for basic dedup/rate checks. This is the only schema addition, and only if chosen.
- **`source` values** extend to include `"hero"` (and any new placement); update the canonical list in `spec/convex.md`.

---

## 5. Remediation requirements

- **Hero CTA → `NewsletterForm`.** Delete the bespoke inline `<form>`/`<input>`/`<Button>` in `Hero.tsx` and render `<NewsletterForm source="hero" />`. This unifies validation, pending/error/success states, accessibility wiring, and persistence with the other placements. Preserve the Hero's existing layout/animation hooks (e.g. the `altar-reveal` + `animationDelay` styling) by passing `className`/wrapping as needed. Visual parity is required; the form already matches the Hero's look.
- **`mailto:[email]` placeholders.** Decide per §10: either (a) replace `[email]` with a **real, monitored address**, or (b) replace the mailto affordance with a wired **contact form** (`messages` table, §4). Default = real `mailto:` to a confirmed address for now; promote to a form only if the client wants in-app contact capture. **Either way, no `[email]` token ships.**
- **No regressions:** H8 + Footer `NewsletterForm` stay as-is (already wired). `NewsletterForm.test.tsx` stays green.

---

## 6. Spam & abuse protections (applied to every persisting mutation)

Layered, cheapest-first; each is independently valuable:

1. **Honeypot field** — add a hidden, off-screen input (e.g. `name="company"`) to the form(s); real users leave it empty, many bots fill it. If non-empty, the mutation **returns the opaque success** (`{ ok: true }`) **without inserting** — silently dropped, no signal to the bot.
2. **Submission-timing heuristic** — record form render time client-side; if submit happens implausibly fast (e.g. < ~1–2s), treat as bot (same opaque no-op). Low-friction, no UI.
3. **Rate limiting (server-side, authoritative) — the anti-swarm lever.** Cap submissions in the Convex mutation using `@convex-dev/rate-limiter` (token-bucket; prefer it over hand-rolled). **Caveat that shapes the whole design: Convex mutations do NOT expose the raw client IP**, so per-IP limiting isn't possible here — we key on what we *can* see, backed by a **global cap** that is the real flood defense. Two tiers, both enforced:
   - **Per-email (backstop):** ~**3 per 10 min**, ~**5 per hour** for a given normalized email. Mostly catches accidental double-clicks; dedup already no-ops repeat same-email, and spammers rotate addresses, so this tier alone is weak — it's cheap insurance, not the defense.
   - **Global / per-deployment (the meaningful lever against swarms):** ~**20–30 per minute** and ~**200–300 per hour** across *all* callers. Legit signups on a low-traffic practitioner site are sparse (a handful/hour at most), so these ceilings never touch real users but stop a botnet flood dead. This is the cap that actually guards against a swarm.
   - **Daily ceiling tied to the email phase:** once `resend-spec.md` ships, add a global **~80–100 subscribes/day** cap so a spam burst can't blow Resend's free-tier **100 emails/day** limit. Note now even though email is parked.
   - These are **generous-to-humans, tight-against-automation starting values** — tune from the Convex dashboard after launch. Honeypot (§6.1) + timing (§6.2) sit *in front* of the limiter so dumb bots are dropped for free before they count against it.
4. **Validation stays server-authoritative** — keep the existing `EMAIL_RE` server check; consider rejecting obvious disposable/garbage domains via a small blocklist (optional, low priority — avoid over-blocking).
5. **Idempotent dedup (already present)** — re-submits never create duplicates; this also blunts repeat spam of the same address.
6. **Escalation (only if needed):** a privacy-respecting CAPTCHA (Cloudflare Turnstile) on the form(s) — **not** a default; reserved for if 1–3 prove insufficient against real abuse.

**Principle: fail closed but stay opaque.** Rejected/suspicious submissions return the *same* `{ ok: true }` the user sees on success — never reveal why something was dropped (no oracle for spammers, no enumeration leak), consistent with `spec/convex.md` §privacy.

---

## 7. Configuration, environment & secrets

- No new public env vars for the audit/wiring/honeypot/timing work.
- **Rate-limiter component:** if `@convex-dev/rate-limiter` is used, register it in `convex/convex.config.ts` and resync `package-lock.json` for `npm ci`/CI.
- **Turnstile (only if escalated):** a public site key (client) + a secret key in **Convex** env (`npx convex env set TURNSTILE_SECRET …`). Not in scope unless §6.6 triggers.

---

## 8. Build orchestration (subagents)

Same implementer→adversarial-verifier discipline as the Convex phase, with an explicit fan-out audit up front:

1. **Audit fan-out (parallel):** one subagent per axis A–D (§3) → each returns a structured findings list → orchestrator merges + dedupes into the touchpoint catalogue → **completeness-critic** subagent reviews for gaps.
2. **Per-remediation (pipeline):** for each catalogue item classified *unwired* or *placeholder*, an implementer makes the change and a verifier independently confirms (e.g. "does the Hero still have a raw `<input>`? does any `[email]` token remain? does the honeypot path actually skip the insert?").
3. **Spam-hardening:** implemented once across the mutation(s), verified adversarially (verifier tries to bypass: empty honeypot vs filled, fast vs slow submit, burst beyond the rate limit).
4. **Spec sync + archive:** update `spec/convex.md` / `spec/composites.md` / `spec/sections.md` and the `source` list; archive `intake-spec.md` + `intake-imp.md` to `finished-implementations/`.

---

## 9. Acceptance criteria (feature-level)

- [ ] A reconciled **touchpoint catalogue** exists listing every data-capture surface in `showcase/**` with its classification + disposition; the completeness-critic found no uncovered surface.
- [ ] The **Hero CTA persists** — submitting it writes a `subscribers` row with `source: "hero"`; the bespoke inline form/input is gone; Hero visuals unchanged.
- [ ] **No `[email]` (or other placeholder) token** remains in shipped markup; every contact affordance points to a real destination or a wired form.
- [ ] Every persisting mutation enforces: honeypot drop, timing heuristic, **server-side rate limit**, server validation, dedup — and all rejection paths return the opaque success (no leak).
- [ ] Adversarial verification demonstrates a burst / filled-honeypot / too-fast submit is **not** persisted while a normal submit **is**.
- [ ] `npm run lint`, `npm run test`, `npm run build` pass in `showcase/`; `package-lock.json` in sync for `npm ci`.
- [ ] No secrets committed; any new component/env documented.
- [ ] `spec/convex.md`, `spec/composites.md`, `spec/sections.md` updated (Hero now uses `NewsletterForm`; `source` list includes `"hero"`; spam protections documented); spec map honest.

---

## 10. Open questions (do not block drafting `intake-imp.md`)

1. **§5** `mailto:[email]` → real address, or a wired contact form? And what is the real monitored address? *(default: real `mailto:` for now; form only if client wants in-app capture)*
2. **§4/§5** If a contact form is added, which fields (name? subject? message)? *(default: none added this phase)*
3. **§6.3** Rate-limit thresholds — **RESOLVED:** `@convex-dev/rate-limiter`, two tiers — per-email (~3/10min, ~5/hr) + a **global cap** (~20–30/min, ~200–300/hr) as the anti-swarm lever, plus a ~80–100/day global ceiling once email ships (Resend free-tier guard). Generous-to-humans, tight-against-automation; tune from the dashboard post-launch. *(Still open: whether to also key on a client-supplied token in addition to the global cap — default: global cap is sufficient given the IP caveat.)*
4. **§6.4** Add a disposable-email-domain blocklist? *(default: no — avoid over-blocking; revisit if abuse appears)*
5. **§6.6** Pre-provision Turnstile, or only if spam materializes? *(default: only if needed)*
6. **§3** Should the audit also cover **analytics/tracking** or external embeds that exfiltrate data, or strictly first-party capture? *(default: first-party data capture only)*

Defaults above are what `intake-imp.md` will assume unless you say otherwise.
