# intake-imp — The Altar Within: data-capture audit + spam-hardening build plan

Execute steps top-to-bottom. Do not skip ahead. Each step lists its prerequisites — if a prerequisite is not marked DONE, stop and surface the issue. Mark DONE by changing `[ ]` to `[x]` after acceptance criteria pass.

Implements `intake-spec.md`. All spec defaults are accepted (see `intake-spec.md` §10) **except where an Open Question is still unresolved** — those are flagged ⛔ BLOCKED in-line and must not be guessed. Builds on the shipped Convex backend (`spec/convex.md`); independent of the parked `resend-spec.md`.

The guiding invariant (intake-spec §2): **every interactive element that accepts user data either persists it through a validated, spam-protected mutation, or is an approved static link to a real monitored destination — nothing silently discards input.**

---

## Conventions block (read once; reference from every step)

### File paths
- All app + backend code lives under `showcase/`. Run every `npm`/`npx` command from `showcase/`.
- Path alias `@/*` → `./` (relative to `showcase/`). `@/convex/_generated/api` → `showcase/convex/_generated/api`.
- **Backend:** `showcase/convex/*.ts` (`schema.ts`, `subscribers.ts`, new `convex.config.ts`) + `showcase/convex/_generated/*` (codegen — never hand-edit).
- **Form composite:** `showcase/components/composites/NewsletterForm.tsx` (+ `NewsletterForm.test.tsx`).
- **Unwired surfaces to remediate:** `showcase/components/sections/Hero.tsx`, `showcase/components/sections/H8.tsx`, `showcase/components/chrome/Footer.tsx`.

### `source` values (canonical list — extend `spec/convex.md`)
- **`subscribers`:** `"h8"`, `"footer"`, `"unknown"` (existing) **+ `"hero"`** (new, this phase).
- **`messages` (new contact table):** `"contact-h8"` (the contact form rendered in the H8 section) and `"contact-footer"` (footer "write directly" link routes to the same form anchor; if a distinct footer form is ever added it gets its own source). No other placements exist in code.

### Contact form — decision & defaults (intake-spec §10 Q1 = **(b) contact form**, Q2 fields)
- §10 Q1 **RESOLVED → contact form**, not `mailto:` — the client has no monitored inbox to give yet, so a wired `messages` capture is the correct "real destination" for the invariant. No `[email]` token ships.
- **Fields (intake-spec §4 default):** `email` (required, validated), `message` (required, non-empty, free text) , `name` (optional). **No subject.** Override before building 2.2 if you want name required or a subject added.
- **Placement default:** one `<ContactForm source="contact-h8" />` rendered where the H8 "prefer to write directly" mailto is now, on a wrapper with `id="contact"`. The Footer "write directly" mailto becomes a cross-route link `href="/#contact"` to that form (footers shouldn't embed a multi-line textarea). Override if you'd rather have a standalone `/contact` route or a footer-embedded form.
- **Same spam stack as `subscribe`:** `submitContact` gets honeypot + timing + rate-limit + server validation + opaque success — identical discipline (§6 applies to *every* persisting mutation).

### Spam-protection constants (locked from intake-spec §6)
- **Honeypot field name:** `company` — hidden/off-screen text input, `tabIndex={-1}`, `autoComplete="off"`, `aria-hidden`. Real users leave it empty.
- **Timing threshold:** submissions **< 1500 ms** after form render are treated as bot (opaque no-op).
- **Rate limits (`@convex-dev/rate-limiter`, token-bucket; intake-spec §6.3):**
  - **Per-email backstop:** ~3 / 10 min and ~5 / hour, keyed on normalized email. (Weak alone — cheap insurance.)
  - **Global / per-deployment (the anti-swarm lever):** ~25 / minute (capacity ~30) and ~250 / hour across all callers.
  - **Daily ceiling — PARKED:** ~80–100 / day global, to guard Resend's 100/day free tier. **Note it in code as a comment; do NOT enforce until `resend-spec.md` ships.**
  - Convex mutations cannot see client IP → **no per-IP tier**; the global cap is the real flood defense.

### The opaque-success principle (intake-spec §94 / `spec/convex.md` §privacy)
- **Fail closed, stay opaque.** Every rejected/suspicious submission (honeypot filled, too-fast, rate-limited) returns the **same `{ ok: true }`** a real success returns — no insert, no throw, no distinguishing signal. Only a genuinely invalid email keeps the existing server `throw` (client maps it to copy). Order in the mutation: **honeypot → timing → rate-limit (per-email, then global) → validate → dedup → insert.**

### Voice / copy (unchanged — do NOT add new user-facing strings)
- Success: *"Inscribed. A response will arrive in due time."*
- Invalid email: *"a valid email, please"*
- Network/server failure: *"the ink did not take — try again"*
- Spam drops are **silent successes** — they show the success copy, by design.

### Validation regex (shared client + server, unchanged)
- `EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/`

### Rate-limiter component shape (reference for Phase 0 + Phase 3)
```ts
// convex/convex.config.ts
import { defineApp } from "convex/server";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";
const app = defineApp();
app.use(rateLimiter);
export default app;
```
```ts
// convex/subscribers.ts (excerpt)
import { RateLimiter, MINUTE, HOUR } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";
const limiter = new RateLimiter(components.rateLimiter, {
  // subscribe (newsletter)
  subscribeGlobal:   { kind: "token bucket", rate: 25,  period: MINUTE, capacity: 30 },
  subscribeGlobalHr: { kind: "token bucket", rate: 250, period: HOUR,   capacity: 300 },
  subscribePerEmail: { kind: "token bucket", rate: 3,   period: 10 * MINUTE, capacity: 5 },
  // submitContact (contact form) — lower-volume surface, tighter buckets
  contactGlobal:     { kind: "token bucket", rate: 15,  period: MINUTE, capacity: 20 },
  contactGlobalHr:   { kind: "token bucket", rate: 100, period: HOUR,   capacity: 120 },
  contactPerEmail:   { kind: "token bucket", rate: 3,   period: 10 * MINUTE, capacity: 5 },
});
// in handler — opaque (do NOT pass { throws: true }):
const g  = await limiter.limit(ctx, "subscribeGlobal");
const gh = await limiter.limit(ctx, "subscribeGlobalHr");
const pe = await limiter.limit(ctx, "subscribePerEmail", { key: email });
if (!g.ok || !gh.ok || !pe.ok) return { ok: true }; // opaque drop, no insert
```

---

## Build orchestration (subagents)

**This plan is executed by orchestrated subagents, not a single linear pass.** The main agent is the orchestrator; it hand-writes only trivial one-line edits. There are two subagent shapes:

**1. Audit fan-out (Phase 1, parallel).** One subagent per audit axis (A–D, intake-spec §3) sweeps `showcase/**` independently along a *different* dimension; a **completeness-critic** subagent then reviews the merged catalogue against the raw component list for gaps. Redundancy is the point — single-pass grep missed the Hero form for a whole phase. Output = the reconciled **touchpoint catalogue** (already produced — see Appendix A).

**2. Per-step implementer → adversarial verifier (Phases 0, 2–6).**
- **Implementer subagent** — given one step's full block (Inputs/Outputs/Implementation) + this Conventions block, makes exactly that step's changes and returns a structured summary (files touched, decisions, deviations).
- **Adversarial verifier subagent** — given the same step's **Acceptance criteria** + the implementer's diff, independently checks each criterion and is prompted to *try to fail* the step. Spam steps get **adversarial attack prompts** specifically: *does a filled `company` field still insert? does a 200-ms submit insert? does the 31st request in a minute insert? does a rejected path leak a different return value than success? did the genuine slow human submit still persist?* A step is DONE only when every criterion passes; on any fail the orchestrator re-dispatches the implementer with the verifier's findings.

**Parallelism (from the dependency graph):**
- **Phase 1 axes A/B/C/D run concurrently** (4 read-only subagents); critic joins after.
- After Phase 0: **Step 2.1 (Hero)** touches `Hero.tsx` only; **Step 3.1 (honeypot/timing in `NewsletterForm.tsx`)** touches the form — disjoint files, so their implementers may run concurrently. **Step 3.3 (mutation)** touches `subscribers.ts`, also disjoint → concurrent with 2.1/3.1.
- **Join point:** Step 4.1 (tests) needs 3.1 + 3.3 green; Step 5.1 (lint/build) needs everything.
- **Step 2.2 (contact form, §10 Q1 = form)** is now a 5-substep backend+UI track (2.2a–2.2e). 2.2a/2.2b (schema+mutation, `messages.ts`) run alongside the `subscribe` hardening (also backend) but on a disjoint new file; 2.2c (`ContactForm.tsx`, new file) runs ∥ with 2.1/3.1. It reuses Phase 3's honeypot/timing/rate-limit patterns, so sequence 3.1–3.3 patterns first (or share the implementer).
- **Phase 6 docs** (6.1–6.3) may be drafted by parallel doc subagents once 5.1 is green, then reconciled.

**Isolation:** concurrent implementers touch disjoint paths (`Hero.tsx` vs `NewsletterForm.tsx` vs `subscribers.ts`). If two steps would ever touch the same file, serialize them. Backend steps assume `npx convex dev` is running so codegen stays live (`components.rateLimiter` won't typecheck until the component is registered + pushed — see 0.2).

**USER-RUN boundaries:** none are auth-gated this phase **except** the optional production redeploy (the live deployment already exists; pushing the rate-limiter component + `messages` table + new `source`s is a normal `convex deploy`, prepared by Claude, run/approved by the user). §10 Q1 is **RESOLVED → contact form**; the remaining micro-decisions (contact-form fields/placement/copy) have defaults in the Conventions block and don't block the build.

**Orchestrator ledger:** after each verifier passes, flip that step's `[ ]`→`[x]` here so this doc stays the live build truth.

---

## Phase 0 — Pre-flight (rate-limiter component)

### Step 0.1 — Install `@convex-dev/rate-limiter`  [x]
**Prerequisites:** none
**Inputs:** `showcase/package.json`
**Outputs:** `showcase/package.json`, `showcase/package-lock.json`

**Implementation:**
- From `showcase/`: `npm install @convex-dev/rate-limiter`.
- Confirm it lands in `dependencies` (the Convex backend imports it at deploy time).

**Acceptance criteria:**
- [x] `npm install` exits 0; `@convex-dev/rate-limiter` in `package.json` `dependencies`.
- [x] `package-lock.json` updated and in sync (CI `npm ci` will pass).
- [x] No other deps upgraded; React-19 peer warnings acceptable unless hard errors.

---

### Step 0.2 — Register the component in `convex/convex.config.ts`  [x]
**Prerequisites:** 0.1
**Inputs:** Conventions "Rate-limiter component shape"
**Outputs:** `showcase/convex/convex.config.ts` (new)

**Implementation:**
- Create `convex/convex.config.ts` exactly as in the Conventions block (`defineApp` → `app.use(rateLimiter)` → `export default app`).
- With `npx convex dev` running, let it push so `_generated/api` exposes `components.rateLimiter`.

**Acceptance criteria:**
- [x] `convex.config.ts` exists, registers the rate-limiter component.
- [x] `convex dev` pushes with no error; `components.rateLimiter` resolves in `_generated`.
- [x] No app behaviour change yet (component registered but not called).

---

## Phase 1 — Audit fan-out → touchpoint catalogue

### Step 1.1 — Run axes A–D + completeness critic  [x]
**Prerequisites:** none (read-only; can precede Phase 0)
**Inputs:** `showcase/app/**`, `showcase/components/**`; intake-spec §3
**Outputs:** the reconciled **touchpoint catalogue** — Appendix A of this file

**Implementation:**
- Dispatch 4 parallel read-only subagents (Axis A markup / B behaviour / C contact affordance / D route+section walk). Merge + dedupe findings. Run a completeness-critic over the merged list vs the raw component inventory.

**Acceptance criteria:**
- [x] A reconciled catalogue exists with every data-capture surface classified `wired` / `unwired` / `static-placeholder` / `static-ok`.
- [x] Completeness-critic found no uncovered surface.
- [x] The 3 known gaps (Hero form, H8 mailto, Footer mailto) confirmed; **no additional unwired surface** found.

> **Result (DONE):** see **Appendix A**. Catalogue confirms exactly: Hero bespoke form discards email (→ 2.1); H8 + Footer `[email]` placeholders (→ 2.2); `NewsletterForm` in H8/Footer already wired (no regression); HeaderNav buttons + H5/H6/A5/HeaderNav links are static-ok navigation/UI; `example.com` only in tests. Remediation backlog = **2 items** (Hero, mailto) + spam hardening (Phase 3).

---

## Phase 2 — Remediation (per catalogue)

### Step 2.1 — Replace the Hero bespoke form with `<NewsletterForm source="hero" />`  [x]
**Prerequisites:** 1.1
**Inputs:** `showcase/components/sections/Hero.tsx` (the `<form onSubmit={(e)=>e.preventDefault()}>` block ≈ lines 225–283), `intake-spec.md` §5
**Outputs:** `Hero.tsx` (modify)

**Implementation:**
- Delete the bespoke `<form>` + raw `<input type="email">` + `<Button>Join the Vespers</Button>` block entirely.
- Import `{ NewsletterForm }` from `@/components/composites/NewsletterForm`; render `<NewsletterForm source="hero" />` in its place.
- **Preserve the reveal animation:** the deleted form had `className="altar-reveal …"` + `style={{ animationDelay: "3.0s" }}`. Wrap the new form in a `<div className="altar-reveal" style={{ animationDelay: "3.0s", width: "100%", maxWidth: "28rem" }}>` (or pass `className="altar-reveal"` to `NewsletterForm` — it forwards `className` to the `<form>`; choose whichever keeps visual parity — the default non-compact form's `maxWidth: 28rem` already matches the old `max-w-md`).
- The default `buttonLabel` is already **"Join the Vespers"** — Hero parity needs no label override.
- Do NOT delete the Hero `@keyframes`/`.altar-*` styles (still used by other Hero elements).

**Acceptance criteria:**
- [x] No raw `<input>`/bespoke `<form>` remains in `Hero.tsx`; the only capture surface is `<NewsletterForm source="hero" />`.
- [x] A Hero submit calls `api.subscribers.subscribe` with `source: "hero"` (verify via the form's mutation path).
- [x] Visual/animation parity: form still fades in at the same position/delay; button reads "Join the Vespers".
- [x] `Hero.tsx` still typechecks and renders; `npm run build` unaffected.

---

### Step 2.2 — Resolve the `mailto:[email]` placeholders via a wired contact form  ✅ UNBLOCKED (§10 Q1 = contact form)
> Re-scoped from the simple-mailto default into a `messages`-table contact form, per the user's decision (no monitored inbox exists yet). Five sub-steps 2.2a–2.2e. The `submitContact` mutation carries the **same** spam stack as `subscribe` (Phase 3 patterns apply to it too). Sub-steps marked ∥ may run with their disjoint-file peers.

#### Step 2.2a — `messages` schema  [x]
**Prerequisites:** 1.1
**Inputs:** `showcase/convex/schema.ts`, `intake-spec.md` §4
**Outputs:** `schema.ts` (modify — additive)
**Implementation:** add a `messages` table alongside `subscribers`: `{ email: v.string(), message: v.string(), name: v.optional(v.string()), source: v.string(), createdAt: v.number() }`, `.index("by_email", ["email"])` (for per-email rate checks/dedup). Do not touch `subscribers`.
**Acceptance criteria:**
- [x] `messages` table defined with the fields above (name optional); `by_email` index present.
- [x] `subscribers` unchanged; schema pushes clean under `convex dev`.

#### Step 2.2b — `submitContact` mutation (full spam stack)  [x]
**Prerequisites:** 0.2, 2.2a, 3.2-pattern (honeypot/timing), 3.3-pattern (rate-limit)
**Inputs:** new `showcase/convex/messages.ts`, `intake-spec.md` §4, §6
**Outputs:** `messages.ts` (new)
**Implementation:**
- `submitContact = mutation({ args: { email, message, name?, source?, hp?, elapsedMs? }, handler })`.
- Handler order mirrors `subscribe` exactly (Conventions §opaque-success), all spam rejects opaque `{ ok: true }`:
  1. honeypot: `if (args.hp?.trim()) return { ok:true }`
  2. timing: `if (typeof elapsedMs==="number" && elapsedMs < 1500) return { ok:true }`
  3. normalize `email` (trim+lowercase); `message = args.message.trim()`
  4. rate-limit: `contactPerEmail` (key=email), `contactGlobal`, `contactGlobalHr` → any `!ok` ⇒ opaque `{ ok:true }`
  5. validate: `if (!EMAIL_RE.test(email)) throw new Error("invalid email")`; `if (!message) throw new Error("empty message")` (client guards both first; these are the only non-opaque rejects)
  6. insert `{ email, message, name: args.name?.trim() || undefined, source: args.source ?? "unknown", createdAt: Date.now() }`
  7. `// FUTURE (resend-spec): notify Adrianna of new message`
  8. `return { ok: true }`
- Reuse the shared `EMAIL_RE`; instantiate the same `RateLimiter` (or import a shared one) — keep one component registration from 0.2.
**Acceptance criteria:**
- [x] Filled honeypot / sub-1.5s / over-cap each return `{ ok:true }` with **no** `messages` insert.
- [x] Valid slow submit inserts exactly one `messages` row with trimmed email + message (+ optional name).
- [x] Invalid email or empty message throws (only non-opaque rejects); all spam paths opaque + identical shape.

#### Step 2.2c — `ContactForm` composite  [x]  (∥ with 2.1 / 3.1 — disjoint file)
**Prerequisites:** 2.2b (for the mutation contract; UI can be drafted against it)
**Inputs:** new `showcase/components/composites/ContactForm.tsx`; model it on `NewsletterForm.tsx` (styles, a11y wiring, opaque success UX, honeypot+timing from Step 3.1)
**Outputs:** `ContactForm.tsx` (new)
**Implementation:**
- `email` input (required, `EMAIL_RE` client guard → "a valid email, please"), `message` `<textarea>` (required, non-empty → reuse a short guard copy, e.g. "a few words, please" — confirm copy or keep minimal), optional `name` input. Match the gold/parchment styling + `useId`/`aria-*`/`role="alert"`/`noValidate` pattern from `NewsletterForm`.
- Include the **honeypot `company`** field + **render-timing** exactly as Step 3.1 (same signals sent to `submitContact`).
- Pending/disabled + success copy: reuse "Inscribed. A response will arrive in due time." and failure "the ink did not take — try again" (no net-new voice unless you approve new contact copy).
- `props: { source?: string; className?: string }`.
**Acceptance criteria:**
- [x] Renders email + message (+ optional name); invalid email / empty message guarded client-side (no network).
- [x] Sends `{ email, message, name?, source, hp, elapsedMs }` to `api.messages.submitContact`.
- [x] Honeypot hidden/non-tabbable/aria-hidden; success + failure + pending states match NewsletterForm conventions.
- [x] `<ContactForm />` with no props typechecks/renders.

#### Step 2.2d — Wire into H8 + Footer; delete every `[email]`  [x]
**Prerequisites:** 2.2c
**Inputs:** `H8.tsx` (lines 59–68 mailto block), `Footer.tsx` (lines 33–42 mailto block)
**Outputs:** both (modify)
**Implementation:**
- `H8.tsx`: replace the "Prefer to write directly? `[email]`" `<p>`/mailto with the contact form on an anchor wrapper: `<div id="contact"> … <ContactForm source="contact-h8" /></div>` (keep a short lead-in line like "Prefer to write directly?"). 
- `Footer.tsx`: replace the "Write directly — `[email]`" mailto with a real link `<a href="/#contact">write directly</a>` (cross-route to the H8 form). Source `"contact-footer"` only applies if a distinct footer form is later added; the link itself captures nothing.
**Acceptance criteria:**
- [x] **Zero `[email]`/placeholder tokens** remain anywhere in `showcase/**` shipped markup (grep clean).
- [x] H8 hosts `<ContactForm>` under `id="contact"`; Footer link resolves to `/#contact`.
- [x] Both pages build; no broken layout.

#### Step 2.2e — `ContactForm.test.tsx`  [x]
**Prerequisites:** 2.2c
**Inputs:** mirror `NewsletterForm.test.tsx` (mock `convex/react` + `@/convex/_generated/api`)
**Outputs:** `ContactForm.test.tsx` (new)
**Implementation:** assert: valid submit calls `submitContact` with `{ email, message, name?, source, hp, elapsedMs }`; invalid email + empty message each block with no network; success/failure/pending states; filled honeypot still sends `hp` (server-side drop unit-tested in 2.2b coverage).
**Acceptance criteria:**
- [x] `npm run test` green, no real deployment dependency.
- [x] Honeypot/timing/source + validation paths asserted.

---

## Phase 3 — Spam & abuse hardening (intake-spec §6)

### Step 3.1 — Honeypot + timing in `NewsletterForm.tsx`  [x]
**Prerequisites:** 1.1 (can run ∥ with 2.1 / 3.3 — disjoint files)
**Inputs:** `showcase/components/composites/NewsletterForm.tsx`, `intake-spec.md` §6.1–6.2
**Outputs:** `NewsletterForm.tsx` (modify)

**Implementation:**
- **Honeypot:** add a hidden text input `name="company"` (state-bound, e.g. `hp`), wrapped with the `visuallyHidden` style already in the file (or off-screen), plus `tabIndex={-1}`, `autoComplete="off"`, `aria-hidden="true"`. Not required, not labeled for users.
- **Timing:** capture render time once at mount (`const renderedAt = useRef<number>(Date.now())` — or `useState` set in a mount effect). On submit compute `elapsedMs = Date.now() - renderedAt.current`.
- **Pass both signals to the mutation:** extend the `subscribe({ … })` call with `hp` (the honeypot value) and `elapsedMs`. Client does **not** branch on them (no UI tell) — the server decides and returns opaque success; the existing success UI renders regardless. (Keep the client `EMAIL_RE` guard exactly as-is so invalid email still shows "a valid email, please" with no network call.)
- Do not alter existing a11y wiring, copy, pending/disabled behaviour, or layout.

**Acceptance criteria:**
- [x] A hidden `company` honeypot input exists, is off-screen, not tab-reachable, not announced to AT.
- [x] Submit sends `hp` + `elapsedMs` to `subscribe`; no new visible UI, no copy change.
- [x] Invalid-email path still short-circuits client-side (no network), unchanged.
- [x] `<NewsletterForm />` with no props still typechecks/renders; compact + non-compact unchanged visually.

---

### Step 3.2 — Extend the `subscribe` mutation args (honeypot/timing contract)  [x]
**Prerequisites:** 0.2, 3.1
**Inputs:** `showcase/convex/subscribers.ts`, `intake-spec.md` §6.1–6.2
**Outputs:** `subscribers.ts` (modify args + early-return branches)

**Implementation:**
- Add optional args: `hp: v.optional(v.string())`, `elapsedMs: v.optional(v.number())`.
- **First two checks, before anything else, both opaque:**
  - `if (args.hp && args.hp.trim() !== "") return { ok: true };` (honeypot filled → drop, no insert)
  - `if (typeof args.elapsedMs === "number" && args.elapsedMs < 1500) return { ok: true };` (too fast → drop)
- These sit **in front of** the rate limiter so dumb bots never consume tokens (intake-spec §6.3 final note).

**Acceptance criteria:**
- [x] Non-empty `hp` returns `{ ok: true }` and inserts nothing.
- [x] `elapsedMs < 1500` returns `{ ok: true }` and inserts nothing.
- [x] Absent/empty `hp` and `elapsedMs >= 1500` (or absent) fall through to normal flow.
- [x] Both branches return the **identical** shape to success (no leak).

---

### Step 3.3 — Two-tier rate limiting in `subscribe`  [x]
**Prerequisites:** 0.2, 3.2
**Inputs:** `showcase/convex/subscribers.ts`, Conventions "Rate-limiter component shape", `intake-spec.md` §6.3
**Outputs:** `subscribers.ts` (modify)

**Implementation:**
- Instantiate the `RateLimiter` with the three named limits from the Conventions block (`subscribeGlobal`, `subscribeGlobalHr`, `subscribePerEmail`).
- In the handler, **after** honeypot/timing and **after** computing the normalized `email`, call all three with `{ throws: false }` semantics (default) and: `if (!g.ok || !gh.ok || !pe.ok) return { ok: true };` (opaque drop). Per-email keyed on `email`.
- Add a comment marking the **PARKED daily ceiling**: `// FUTURE (resend-spec): add subscribeDaily ~80–100/day global to guard Resend 100/day free tier`.
- Keep the existing server `EMAIL_RE` throw, the dedup, the insert, and the Resend-seam comment intact and in the §94 order.

**Acceptance criteria:**
- [x] Final handler order = honeypot → timing → normalize email → per-email limit → global/min → global/hr → `EMAIL_RE` validate → dedup → insert → `{ ok: true }`.
- [x] Bursting past the global per-minute cap returns `{ ok: true }` with **no further inserts**; a normal lone submit still inserts exactly one row.
- [x] Per-email cap blocks the 4th rapid same-email attempt (opaque) without throwing.
- [x] Invalid email still **throws** (only non-spam rejection that isn't opaque); all spam rejections are opaque.
- [x] Parked daily-ceiling comment present; no daily limit enforced yet.

---

## Phase 4 — Tests

### Step 4.1 — Extend `NewsletterForm.test.tsx` + add mutation-logic coverage  [x]
**Prerequisites:** 3.1, 3.3 (and 2.1 if asserting Hero source)
**Inputs:** `showcase/components/composites/NewsletterForm.test.tsx`, `intake-spec.md` §8.3, §9
**Outputs:** test file(s) (modify/add)

**Implementation:**
- Keep the existing `convex/react` + `@/convex/_generated/api` mocks (tests must not hit a real deployment).
- **Form-level (component) tests to add:**
  - Honeypot: render, fill the hidden `company` input, submit → asserts the mocked `subscribe` is called with `hp` set (server-side drop is unit-tested separately) **or**, if you prefer pure client contract, assert the payload carries `hp`/`elapsedMs`.
  - Timing: assert the submit payload includes a numeric `elapsedMs`.
  - Source: a `<NewsletterForm source="hero" />` submit calls the mutation with `source: "hero"`.
  - Preserve all original assertions (valid/invalid/success/failure/pending).
- **Mutation-logic tests (adversarial, §8.3):** if a Convex test harness (`convex-test`) is reasonable to add, unit-test the handler branches — filled honeypot ⇒ no insert; `elapsedMs < 1500` ⇒ no insert; over-cap ⇒ no insert; valid slow human ⇒ one insert; all opaque returns identical. If `convex-test` is out of scope, document these as adversarial-verifier checks in Step 3.3 instead (the verifier subagent already exercises them) and note it here.

**Acceptance criteria:**
- [x] `npm run test` passes, no network/deployment dependency.
- [x] New honeypot/timing/source assertions present; all original behaviours still asserted.
- [x] Spam-drop branches are demonstrated (unit test or documented verifier evidence), each returning opaque success. _convex-test harness not added (out of scope); the backend adversarial verifier statically confirmed honeypot/timing/rate-limit/dedup each return opaque `{ ok: true }` with no insert — see Step 3.3/2.2b verifier evidence._

---

## Phase 5 — Verify & ship

### Step 5.1 — Lint / test / build / lockfile  [x]
**Prerequisites:** 2.1, 2.2a–2.2e, 3.3, 4.1
**Inputs:** `showcase/` toolchain
**Outputs:** green checks

**Implementation:**
- From `showcase/`: `npm run lint` → `npm run test` → `npm run build`, all green. (`convex/_generated/**` already in eslint ignores.)
- Confirm `package-lock.json` in sync (`npm ci` clean) after the 0.1 install.
- Grep the shipped tree once more for `[email]` / placeholder tokens → must be clean (2.2d removes the last of them). Do NOT mark this step DONE while any `[email]` token survives in shipped markup.

**Acceptance criteria:**
- [x] `npm run lint`, `npm run test`, `npm run build` all pass.
- [x] `package-lock.json` in sync.
- [x] No `[email]`/placeholder token in shipped markup (gated on 2.2).

---

### Step 5.2 — Deploy backend (rate-limiter component + `source: "hero"`)  [x]  ⚠️ user approves
**Prerequisites:** 5.1
**Inputs:** the live Convex deployment (already provisioned)
**Outputs:** prod deployment carrying `convex.config.ts` (rate-limiter) + updated `subscribe`

**Implementation:**
- Claude prepares: `npx convex deploy` (pushes the new component + mutation logic). The deployment already exists and is live; this is a normal redeploy, not first-time provisioning.
- User runs/approves the deploy (and confirms a live Hero/H8/Footer submit still writes a row, a filled-honeypot/too-fast submit does not).

**Acceptance criteria:**
- [x] `npx convex deploy` succeeds; prod has the rate-limiter component + hardened `subscribe`. _Deployed to prod `unique-raccoon-630`; `messages.by_email` index added, `rateLimiter` component installed, schema validation clean._
- [x] A real Hero submit writes a `subscribers` row with `source: "hero"`. _Live prod check: `subscribers:subscribe` with `source:"hero"`, `elapsedMs:9000` inserted exactly one row (`hero-smoke@example.com`)._
- [x] An adversarial submit (filled `company` / sub-1.5s / burst) does **not** persist. _Live prod check: filled `hp` and `elapsedMs:200` each returned `{ ok:true }` with NO insert (absent from the prod table). Burst/rate-limit path verified by the deployed token buckets + the adversarial verifier (not hammered against live prod)._

---

## Phase 6 — Spec sync + archive (keep the map honest)

### Step 6.1 — Update domain specs  [x]
**Prerequisites:** 5.1
**Inputs:** `spec/convex.md`, `spec/composites.md`, `spec/sections.md`
**Outputs:** all three (modify)

**Implementation:**
- `spec/convex.md`: add `"hero"` to the `subscribers` `source` list; document the **new `messages` table + `submitContact` mutation** (fields, contract, dedup/index) and its `"contact-h8"`/`"contact-footer"` sources; document the spam stack (honeypot, timing, two-tier rate limiter per mutation + the IP caveat + parked daily ceiling) and the opaque-success principle; note the `convex.config.ts` rate-limiter component + the mutation args (`hp`, `elapsedMs`).
- `spec/composites.md`: `NewsletterForm` now carries honeypot + timing and sends `hp`/`elapsedMs`; **add a `ContactForm` entry** (new composite, fields, `submitContact` wiring, same spam stack); note tests mock `convex/react`.
- `spec/sections.md`: Hero no longer has a bespoke form — it renders `<NewsletterForm source="hero" />`; H8 now hosts the `<ContactForm>` under `id="contact"` and the Footer "write directly" links to `/#contact`; no `mailto:[email]` remains.

**Acceptance criteria:**
- [x] `source` list includes `"hero"` in `spec/convex.md`.
- [x] Spam protections + opaque-success documented; the map no longer implies any surface drops input.
- [x] sections/composites specs reflect Hero + form changes.

---

### Step 6.2 — Archive working docs  [x]
**Prerequisites:** 6.1, all steps `[x]`
**Inputs:** `intake-spec.md`, `intake-imp.md`
**Outputs:** moved into `finished-implementations/`

**Implementation:**
- Once every step is `[x]`, move `intake-spec.md` + `intake-imp.md` into `finished-implementations/` (matching the `convex-spec.md` / `convex-imp.md` precedent). `spec/*` remains the durable map.

**Acceptance criteria:**
- [x] Both docs in `finished-implementations/` with all steps checked.
- [x] `spec/convex.md` / `composites.md` / `sections.md` remain the durable source of truth.

---

## Step ownership summary

Every "Claude" step = one **implementer subagent** + one **adversarial verifier subagent** (see "Build orchestration"). The orchestrator dispatches, reconciles, flips the checkbox.

| Step | Who | Subagents |
|------|-----|-----------|
| 0.1 install rate-limiter | Claude | implementer + verifier |
| 0.2 `convex.config.ts` | Claude | implementer + verifier |
| 1.1 audit fan-out | Claude | **4 axis subagents ∥ + completeness-critic** (DONE — Appendix A) |
| 2.1 Hero → NewsletterForm | Claude | implementer + verifier (∥ with 3.1 / 3.3) |
| 2.2a `messages` schema | Claude | implementer + verifier |
| 2.2b `submitContact` mutation | Claude | implementer + adversarial verifier (spam bypass) |
| 2.2c `ContactForm` composite | Claude | implementer + verifier (∥ with 2.1 / 3.1) |
| 2.2d wire H8/Footer, kill `[email]` | Claude | implementer + verifier |
| 2.2e `ContactForm.test.tsx` | Claude | implementer + verifier |
| 3.1 honeypot + timing (form) | Claude | implementer + verifier (∥ with 2.1) |
| 3.2 mutation args | Claude | implementer + verifier |
| 3.3 two-tier rate limit | Claude | implementer + adversarial verifier (bypass attempts) |
| 4.1 tests | Claude | implementer + verifier |
| 5.1 lint/test/build | Claude | implementer + verifier |
| **5.2 deploy** | **User approves**, Claude preps | — not delegated |
| 6.1 spec sync | Claude | parallel doc subagents + verifier |
| 6.2 archive | Claude | orchestrator (trivial move) |

---

## Appendix A — Reconciled touchpoint catalogue (Step 1.1 output)

Produced by axes A–D + completeness-critic over `showcase/app/**` + `showcase/components/**`.

| Location | Kind | Current behaviour | Classification | Disposition |
|----------|------|-------------------|----------------|-------------|
| `components/sections/Hero.tsx` ~225–283 | bespoke `<form>` + `<input type="email">` + submit | `onSubmit={(e)=>e.preventDefault()}` — **discards every email**, no validation/persistence | **unwired** | **2.1** → `<NewsletterForm source="hero" />` |
| `components/sections/H8.tsx` :60, :67 | `mailto:[email]` link + `[email]` text | broken placeholder contact affordance | **static-placeholder** | **2.2d** → `<ContactForm source="contact-h8" />` under `id="contact"` (§10 Q1 = form) |
| `components/chrome/Footer.tsx` :34, :41 | `mailto:[email]` link + `[email]` text | broken placeholder contact affordance | **static-placeholder** | **2.2d** → `<a href="/#contact">write directly</a>` (links to the H8 form) |
| `components/sections/H8.tsx` :47 (`NewsletterForm source="h8"`) | wired form | persists via `api.subscribers.subscribe` | **wired** | no change (+ Phase 3 honeypot/timing flows through it) |
| `components/chrome/Footer.tsx` (`NewsletterForm compact source="footer"`) | wired form | persists via `api.subscribers.subscribe` | **wired** | no change (+ Phase 3) |
| `components/composites/NewsletterForm.tsx` | the form composite | already validated + persisting | **wired** | hardened in Phase 3 (single source of truth) |
| `components/chrome/HeaderNav.tsx` :83, :238 (`<button type="button">`) | menu open/close toggles | UI state only (`setMenuOpen`) — no data | **static-ok** | none |
| `components/sections/H5.tsx`, `H6.tsx`, `A5.tsx`, `HeaderNav.tsx` (`<a>`/`<Link>`) | navigation links (`/about`, `/#newsletter`, etc.) | client-side nav, no capture | **static-ok** | none |
| `components/composites/NewsletterForm.test.tsx` (`*@example.com`) | test fixtures | isolated test doubles | **static-ok** | none (not shipped) |

**Completeness-critic verdict:** every section + chrome component walked end-to-end; no inline/custom capture widget exists beyond the three above. Remediation backlog = **Hero (2.1)** + **mailto (2.2)**; everything else is spam-hardening of the already-wired form/mutation (Phase 3).
