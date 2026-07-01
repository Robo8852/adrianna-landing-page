# Implementation Plan: Security Hardening — Contact Form + Newsletter Intake

## Context

This plan hardens the two public write surfaces of the site: the contact form (`showcase/convex/messages.ts` + `ContactForm.tsx`) and the newsletter signup (`showcase/convex/subscribers.ts` + `NewsletterForm.tsx`), plus the Resend email layer (`showcase/convex/emails.ts`). The audit found the foundation already solid: **server-side honeypot** (silent opaque success), **3-tier rate limiting** via the Convex rate-limiter component, **no public read surface** on either table, and **all secrets server-side** (Resend keys live on the Convex deployment, never in client code). The gaps are input caps, source allowlisting, daily rate buckets, content heuristics, log hygiene, double-opt-in for the newsletter, data retention, and (deferred) IP-aware limiting / CAPTCHA / unsubscribe sync. Phases 1–2 are fully specified and implementation-ready; Phase 3 steps are outlines requiring an owner decision before dispatch.

## Execution status (updated 2026-06-10)

- **D1 — DONE.** Commit `5966433` (`feat(security): shared validation helpers, daily rate buckets, email log hygiene, client maxLength`). All steps S0/S1/S4/S5 landed as specced (optional S5 included). Gate passed 41/41 tests. Actual cost ~43k tokens vs ~85k estimate. Note: `normalizeSource(source, allowlist)` takes the allowlist as a parameter; regenerated `_generated/api.d.ts` included in the commit.
- **D2 — DONE.** Commit `2268a30`. S2 + S3 as specced, no deviations; `messages.by_email` index already existed so no schema change was needed. Gate passed 41/41. Actual ~20k tokens vs ~60k estimate.
- **D3 — DONE.** Commit `e26752a`. P2-1/P2-2/P2-6 as specced. Deviations: (a) schema push + backfill ran on the **dev deployment only** (`impartial-camel-461`) — prod rollout deliberately deferred until after D5, because deploying the half-built opt-in flow to prod between D3 and D4 would break live signups; the backfill must be re-run on prod at rollout (it was a no-op on dev: 0 rows). (b) A minimal placeholder `sendConfirmation` internalAction was added in D3 so the gate could pass before D4 implemented it (the plan's D3/D4 split otherwise fails typecheck). (c) `purgeExpiredPending` guards `neq(tokenExpiry, undefined)` because Convex orders `undefined` below numbers. Actual ~31k tokens vs ~65k estimate.
- **D4 — DONE.** Commit `1192db6`. P2-3/P2-4/P2-5 as specced, including `npm run build` and browser verification of both banner states, plus an end-to-end token-lifecycle test on the dev deployment (subscribe → pending+token → confirm → 307 to `/?confirmed=1` → replay spent token → expired). Deviations/findings: (a) ConfirmedBanner latches its variant into `useState` at mount — stripping the query param via `history.replaceState` re-syncs `useSearchParams` and would otherwise unmount the banner instantly; (b) invalid tokens and network errors both redirect to `/?confirmed=expired` (only two banner states, opaque to probers); (c) ConfirmedBanner lives at `showcase/components/composites/ConfirmedBanner.tsx`; (d) two test rows (`d4-test@example.com`, `d4-test2@example.com`) remain in the dev subscribers table — delete via dashboard if a clean table is wanted. Actual ~89k tokens vs ~90k estimate.
- **D5 — DONE.** Commit `59b3b3f` (`test(newsletter): cover the double opt-in flow end to end`). P2-7 as specced: new `showcase/convex/subscribers.test.ts` (19 convex-test tests: pending insert, opaque paths incl. honeypot/timing/dedup/rate-limit, re-subscribe cooldown, `setConfirmationToken` pending-only, confirm valid/expired/missing-expiry/garbage/blank, purge incl. 101-row batch+reschedule), one new NewsletterForm success-copy test (existing `/inscribed/i` assertions needed no changes), `environmentMatchGlobs [["convex/**","edge-runtime"]]` in vitest.config.mts (vitest 2.1.9 — no workspace fallback needed), devDeps `convex-test@0.0.53` + `@edge-runtime/vm@5.0.0`. Deviations: (a) rate-limiter registered via the package's own `@convex-dev/rate-limiter/test` helper instead of hand-rolled `t.registerComponent`; (b) `vitest.setup.ts` jsdom shims guarded behind `typeof window !== "undefined"` since setup also runs in edge-runtime; (c) scheduler-triggering tests use fake timers and assert against the `_scheduled_functions` system table. Gate passed: tsc clean, lint 0 errors, **61/61 tests**, `npx convex dev --once` still pushes cleanly with the test file present. Actual ~60k tokens vs ~55k estimate. **Phase 2 complete — prod rollout checklist below is now unblocked.**
- **D6 — DONE.** Commit `065d63d`. P3-8 (180-day `purgeOldMessages`, daily cron at 04:30 UTC — staggered 30 min from the subscriber purge) + P3-11 option A (svix-verified `POST /resend-webhook` httpAction in new `convex/http.ts`, status union extended with `"unsubscribed"`, `recordUnsubscribe` internalMutation). Deviations: (a) `svix@1.95.2` added as a prod dep, pure-JS so the httpAction stays in the V8 runtime (no `"use node"`); (b) webhook rejects 401 when `RESEND_WEBHOOK_SECRET` is unset (fail-safe — secret not set anywhere yet); (c) re-subscribe after unsubscribe patches the existing row back to `pending` (fresh confirmation email, explicit re-consent) instead of inserting a duplicate; (d) no `t.fetch` webhook tests — signing real svix payloads in-test is impractical, so `recordUnsubscribe` is tested directly (4 cases) plus 1 re-subscribe test. Gate passed: tsc clean, lint 0 errors, **66/66 tests**, `npx convex dev --once` pushes cleanly. Actual ~43k tokens vs ~50k estimate. **New rollout-checklist items:** set `RESEND_WEBHOOK_SECRET` on prod, and create the Resend webhook → `https://unique-raccoon-630.convex.site/resend-webhook` subscribed to `contact.updated` + `contact.deleted`.
- **D7 — DONE.** Commit `235fdc3`. P3-9 option (a) + P3-10 as specced: NEW `app/api/subscribe/route.ts` + `app/api/contact/route.ts` front doors (leftmost `x-forwarded-for`, salted-sha256 `ipHash`, salt = `CONVEX_SHARED_SECRET`), NEW `lib/formGateway.ts` (`getClientIp`/`hashIp`/`verifyTurnstile`), `sharedSecretOk()` in `validation.ts` gating both mutations, `subscribePerIp` (6/10min) + `contactPerIp` (4/10min) buckets, both forms rewired from `useMutation` to `fetch()`, Turnstile lazy-loaded on first focus via NEW `lib/hooks/useTurnstile.ts` (interaction-only appearance, 8s token bound, soft-fail). Documented decisions: wrong/missing secret → opaque `{ ok: true }` no-op; secret env UNSET on deployment → fail OPEN with one-time warn (same for Turnstile secret / Cloudflare outage — an outage can't take the forms down). Gate passed: tsc clean, lint 0 errors, **78/78 tests** (12 new, incl. NEW `convex/messages.test.ts`), `npm run build` clean, `npx convex dev --once` clean. Browser-verified on dev with Cloudflare test keys: newsletter e2e through `/api/subscribe` → pending row + token; contact e2e; **live no-secret direct-mutation call wrote nothing and returned opaque ok**. Dev env wired by the agent: `CONVEX_SHARED_SECRET` (random 64-hex) on dev deployment + `.env.local`; Turnstile test keys in `.env.local`. Actual ~116k tokens vs ~80k estimate (browser verification + fetch-seam test rewrite). **All 7 dispatches complete — plan fully executed; only the prod rollout remains.**

**Environment facts discovered/changed during execution:**

- Convex project linked locally: project `altar-within`, team `leoreyes`; prod deployment `unique-raccoon-630`, dev deployment `impartial-camel-461` (`CONVEX_DEPLOYMENT` now in gitignored `showcase/.env.local`).
- `SITE_URL` has been **set** on the prod deployment to `https://www.the-altar-within.com` (canonical host; apex 308-redirects to www). The env-prerequisites table row is updated accordingly.
- Correction to the env table: `NEWSLETTER_FROM` is **not** actually set on the prod deployment (the table said "Present") — the code's default `letters@the-altar-within.com` covers it; the Resend domain `the-altar-within.com` is verified with sending enabled (the D3 hard prerequisite held).
- Dev deployment has **no** env vars (no RESEND_API_KEY), so email sends on dev are logged-and-skipped — fine for testing.

**Prod rollout checklist (final — D1–D7 all landed; owner decided to ship everything at once):**

1. Merge `preview/combined` → `main` first so the Vercel frontend and Convex backend ship together.
2. Prod env vars (owner actions, before or at deploy):
   - `CONVEX_SHARED_SECRET`: generate a fresh value (do **not** reuse the dev one); set it on the prod Convex deployment **and** as a Vercel env var (same value). Until set on Convex, the mutations fail open (logged once).
   - Cloudflare Turnstile: create a real managed-mode widget scoped to the domain; set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` in Vercel. Until set, verification is skipped (fail-open, logged once).
   - `RESEND_WEBHOOK_SECRET`: create a webhook in the Resend dashboard pointing at `https://unique-raccoon-630.convex.site/resend-webhook`, subscribed to `contact.updated` + `contact.deleted`; set the signing secret on the prod Convex deployment. The endpoint 401s all requests until set.
3. `npx convex deploy` (pushes schema + functions to `unique-raccoon-630`).
4. `npx convex run migrations:backfillSubscriberStatus --prod` (was a no-op on dev; prod may have legacy rows).
5. Verify on the live site: real signup → confirmation email → confirm link → welcome email; contact form submission; Turnstile widget renders with the real sitekey.

Until then prod runs the pre-D1 backend.

**Session handoff (for the next orchestrator session) — read this before doing anything:**

- **State:** D1–D7 all DONE and committed on `preview/combined` (commits above), gates green (78/78 tests). **Plan fully executed.** Prod NOT touched except `SITE_URL` env. Nothing is running. Only the prod rollout checklist above remains (all owner actions + deploy).
- **Owner decisions — MADE (2026-06-10). D6 and D7 are now UNGATED:**
  - P3-8: YES — auto-delete contact messages after 180 days.
  - P3-11: option A — Resend unsubscribe sync via webhook.
  - P3-9: option a — IP rate limiting via Next.js route handler.
  - P3-10: YES — add Turnstile.
  - **Prod rollout: WAIT until D6+D7 are done**, then ship everything at once (checklist above). Do not deploy to prod before then.
- **New env prerequisites the owner must provide (or the orchestrator must set up) before/during D6/D7:** `RESEND_WEBHOOK_SECRET` (create the webhook in the Resend dashboard or via the Resend API pointing at the Convex HTTP endpoint `https://unique-raccoon-630.convex.site/resend-webhook` — for dev testing use `https://impartial-camel-461.convex.site/...`); `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` (requires a Cloudflare Turnstile site — owner action, no API key on this machine; Turnstile's test keys `1x00000000000000000000AA`/`1x0000000000000000000000000000000AA` can be used for dev verification until real ones exist).
- **Model policy (owner-approved):** orchestrator on Fable 5 / Opus; **D6 → Sonnet** (`model: "sonnet"` on the Agent call — well-specified, mechanical gate); **D7 → Fable** (browser verification + cross-system secret wiring); bookkeeping agents (like imp.md updates) → **Haiku**. Rationale: match model to *unspecified judgment* left in the task; the detailed specs are what make cheaper executors safe.
- **Orchestration conventions used for D1–D5 (keep for D6/D7):** one subagent per dispatch, strictly sequential; paste the dispatch section verbatim into the agent prompt plus: repo path `/home/owner/adrianna-landing-page` (app in `showcase/`), branch `preview/combined`, what previous dispatches landed (commits + key exports), **never pass `--prod` to any convex command**, run the gate once at the end, then commit staging ONLY touched files (untracked junk like imp.md, fb-cover/, "last chat.md", svg-draw-on-recipe.md, showcase/app/sigil-lab/, *.bak.tsx, deleted hello.md stays out), conventional-commit message ending with the Claude Co-Authored-By line, and report back: per-step summary, deviations, gate results, commit hash.
- **After each dispatch:** update this Execution status section (status line, deviations, actual tokens) — the owner wants imp.md kept current as we go.
- **Known loose ends:** two test rows in the dev subscribers table (`d4-test@example.com`, `d4-test2@example.com`); a dev server the owner may want restarted was killed during D4; 2 pre-existing lint warnings in `HeaderNav.tsx`/`useReveal.ts` (not ours).

## How this plan is organized: dispatch bundles

The work is grouped into **7 subagent dispatches (D1–D7)**, each bundling 1–4 of the original fine-grained steps (S0–S5, P2-1…P2-7, P3-8…P3-11). The step IDs, file lists, change descriptions, acceptance criteria, and dependency notes are all preserved — steps are now **sub-items within a dispatch**, executed by one agent in the stated internal order.

**Why fewer, fatter agents:** calibrated runs in this codebase show each dispatch pays a roughly fixed ~10–15k-token overhead regardless of step size — orienting reads of the convex dir and surrounding files, plus a typecheck/lint/test gate run. Under the old one-agent-per-step model that overhead was paid ~17 times (≈ ~550k grand total). One agent doing four small steps pays it **once**: it explores the codebase once, holds the helper/schema context across all its steps, and runs the gate once at the end. Bundling 17 steps into 7 dispatches recovers roughly 10 redundant orientation+gate passes, dropping the grand total to **~485k** (~465k without optional S5). Each dispatch is sized to consume roughly **80–100k tokens** where the dependency graph allows; D2/D3/D6 land a bit under that band because `subscribers.ts` is edited in five different steps and must be strictly serialized — packing those dispatches fatter would either break the same-file rule or create a single >120k mega-dispatch.

> **Token estimates** are subagent-token costs **per dispatch** (calibrated from real runs in this codebase: read-only audit of ~5 convex files ≈ 23–31k; 1–3-file implementation with typecheck/lint/tests ≈ 24–37k; browser verification adds ~5–10k). Per-step sizing bands from the original plan are retained for reference: S ≈ 15–25k, M ≈ 25–40k, L ≈ 40–60k; +~10k where a step needs manual browser/dashboard verification. Each dispatch lists both its raw step sum and its bundled estimate (raw sum minus the deduplicated orientation/gate overhead). **Re-runs and failed dispatches cost extra** — treat totals as a floor, not a ceiling.

**Acceptance gate** (referred to below as "the gate") — run **once per dispatch, after all of its steps are complete**, not per step:

```bash
cd showcase && npx tsc --noEmit && npm run lint && npm test
```

## Dispatch schedule

| Dispatch | Steps | Est. tokens | Depends on | Parallel with |
|----------|-------|-------------|------------|---------------|
| D1 | S0, S1, S4, S5 | ~85k | — | — |
| D2 | S2, S3 | ~60k | D1 | — |
| D3 | P2-1, P2-2, P2-6 | ~65k | D2 (and D1) | — |
| D4 | P2-3, P2-4, P2-5 | ~90k | D3 | — |
| D5 | P2-7 | ~55k | D4 | — |
| D6 (gated) | P3-8, P3-11 | ~50k | D5 + owner decision | — |
| D7 (gated) | P3-9, P3-10 | ~80k | D6 + owner decision | — |

**The schedule is a strict chain — no two dispatches ever run in parallel.** This is deliberate: `subscribers.ts` is edited in D2, D3, D4, D6, and D7; `rateLimits.ts` in D1, D3, D7; `NewsletterForm.tsx` in D1, D4, D7; `emails.ts` in D1 and D4. Bundling absorbed the old intra-phase parallelism into intra-dispatch work, trading thin parallel agents for fat sequential ones (which is where the token savings come from). **Hard rule preserved from the original plan:** never split changes within one file across two concurrently-running agents — these are ~55-line files and merge conflicts are guaranteed.

---

## Phase 1 — Input hardening, rate buckets, log hygiene (D1 + D2)

---

## Dispatch D1 — Foundations: shared helpers, daily buckets, email hygiene, client caps

- **Steps bundled:** S0, S1, S4, S5
- **Est. tokens:** ~85k (raw step sum ~100k; orientation + single gate paid once)
- **Files touched (union):** NEW `showcase/convex/validation.ts`, NEW `showcase/lib/convexValidation.test.ts`, `showcase/convex/rateLimits.ts`, `showcase/convex/emails.ts`, `showcase/components/composites/ContactForm.tsx`, `showcase/components/composites/NewsletterForm.tsx`, both co-located component test files
- **Sequencing:** No dependencies — first dispatch. D2 depends on this dispatch. Nothing runs in parallel with it.
- **Internal order:** S0 first (S4 imports its helpers); then S1, S4, S5 in any order.

**Context / decisions binding on this dispatch:**
- Codebase convention is plain `Error`, not `ConvexError`.
- rate-limiter v0.3.2 exports `DAY`.
- New unit-test files must **NOT** live in `showcase/convex/` (the Convex CLI analyzes that dir on push) — helper tests go in `showcase/lib/`.
- Client `maxLength` (S5) is UX only; the server (D2) is the real enforcement.

### S0 — Shared validation helpers + unit tests

- **Size:** M · **Est. tokens (standalone):** ~30k
- **Files:** NEW `showcase/convex/validation.ts`, NEW `showcase/lib/convexValidation.test.ts`
- **Change:** Create shared helpers: `LIMITS = { name: 100, email: 254, message: 5000, source: 50 }`; `NEWSLETTER_SOURCES = ["hero","h8","modal","footer"]`; `CONTACT_SOURCES = ["contact-h8","footer"]`; `normalizeSource()` (allowlist match or `"unknown"`); `sanitizeSubjectName()` (strip control chars `/[\x00-\x1f\x7f]/g`, collapse whitespace, `slice(0,100)`); `redactEmail()` (`j***@example.com`); `countUrls()` (matches `/(https?:\/\/|www\.)/gi`). Unit tests in `showcase/lib/convexValidation.test.ts` covering all helpers.
- **Acceptance:** All new helpers exported and unit-tested.
- **Deps:** none

### S1 — Daily rate-limit buckets

- **Size:** S · **Est. tokens (standalone):** ~20k
- **Files:** `showcase/convex/rateLimits.ts`
- **Change:** Import `DAY`; add `subscribeDaily { rate: 200, period: DAY, capacity: 200 }` and `contactDaily { rate: 50, period: DAY, capacity: 50 }`.
- **Flag for owner:** the TODO at `subscribers.ts:27` suggested 80–100/day to guard the Resend free tier (100 emails/day); 200/day does **not** guard it. Implement 200 as specced but note the discrepancy in the commit message.
- **Acceptance:** Both buckets defined.
- **Deps:** none

### S4 — emails.ts: subject sanitization + log hygiene

- **Size:** M · **Est. tokens (standalone):** ~30k
- **Files:** `showcase/convex/emails.ts`
- **Change:** (Bundled — one file.) Import `sanitizeSubjectName` / `redactEmail`; use `safeName` in subject (line 122) and body (line 108) — defense in depth even with S2's write-time truncation; redact emails in `console.warn` at lines 28 and 95; replace raw `res.text()` logging at lines 47, 74, 127 with an email-redacted body (keep status + body — it is the only debugging signal since failures are swallowed).
- **Acceptance:** No raw email addresses or unsanitized user input in logs/subjects.
- **Deps:** S0 (satisfied within this dispatch — do S0 first)

### S5 (optional) — Client maxLength attributes

- **Size:** S · **Est. tokens (standalone):** ~20k
- **Files:** `showcase/components/composites/ContactForm.tsx`, `showcase/components/composites/NewsletterForm.tsx`, both co-located test files
- **Change:** Add `maxLength` to ContactForm inputs (name 100, email 254, message 5000) and the NewsletterForm email input; add 1–2 attribute-assertion tests per test file (10 and 14 existing tests respectively).
- **Acceptance:** Attributes present and asserted.
- **Deps:** none (server is the real enforcement; this is UX only)

**Dispatch D1 acceptance gate (run once, after all steps):**

```bash
cd showcase && npx tsc --noEmit && npm run lint && npm test
```

---

## Dispatch D2 — Mutation hardening: messages.ts + subscribers.ts

- **Steps bundled:** S2, S3
- **Est. tokens:** ~60k (raw step sum ~70k; the agent reads the D1 helpers once and applies them to both mutations)
- **Files touched (union):** `showcase/convex/messages.ts`, `showcase/convex/subscribers.ts`
- **Sequencing:** Depends on D1 (imports S0 helpers; uses S1 daily buckets). D3 depends on this dispatch (it re-edits `subscribers.ts`). Nothing runs in parallel with it.
- **Internal order:** S2 and S3 in either order.

**Context / decisions binding on this dispatch:**
- Reject email > 254 / message > 5000 with a thrown error; **truncate** name > 100.
- **Never reject on `source`** — normalize unknown values to `"unknown"` (a strict `v.union` validator would break stale cached clients still sending `"footer"`).
- Heuristic failures (URL spam, duplicates, rate limits) return opaque `{ ok: true }` — never reveal filtering to bots.
- Codebase convention is plain `Error`, not `ConvexError`.

### S2 — messages.ts: caps + allowlist + contactDaily + content heuristics

- **Size:** L · **Est. tokens (standalone):** ~50k
- **Files:** `showcase/convex/messages.ts`
- **Change:** (Bundled deliberately — one file, one agent.) Import S0 helpers. `source = normalizeSource(args.source, CONTACT_SOURCES)`; name trimmed + sliced to 100; add `contactDaily` limiter call to the existing `!ok` guard (opaque); `throw` on email > 254 / message > 5000; URL cap: `countUrls(message) > 3` → opaque `{ ok: true }`; duplicate suppression: `by_email` index, same message within 24h (`DUP_WINDOW_MS`) → opaque `{ ok: true }`. ContactForm tests are unaffected (the mutation is mocked).
- **Acceptance:** All heuristics in place with opaque responses.
- **Deps:** S0, S1 (satisfied by D1)

### S3 — subscribers.ts: caps + allowlist + subscribeDaily

- **Size:** S · **Est. tokens (standalone):** ~20k
- **Files:** `showcase/convex/subscribers.ts`
- **Change:** Import S0 helpers; `normalizeSource` with `NEWSLETTER_SOURCES`; delete the FUTURE TODO comment at line 27; add `subscribeDaily` to the rate-limit guard; `throw` on email > 254.
- **Acceptance:** Caps + allowlist + daily bucket active.
- **Deps:** S0, S1 (satisfied by D1)

**Dispatch D2 acceptance gate (run once, after all steps):**

```bash
cd showcase && npx tsc --noEmit && npm run lint && npm test
```

**Phase 1 subtotal: ~145k tokens** (D1 ~85k + D2 ~60k; ~125k without optional S5)

---

## Phase 2 — Double opt-in for the newsletter (D3 + D4 + D5)

Verified facts driving the design: no `convex/http.ts` or `convex/crons.ts` exists yet; `emails.ts` is `"use node"` (so `crypto.randomUUID` is available in actions; mutations can't generate tokens) — therefore **token generation lives in the Node action**. The confirm endpoint is a Next.js route handler `GET /confirm` (link shows the site's own domain, not `*.convex.site`; the token is the capability; the route calls public mutation `subscribers.confirm`). `convex-test` + `@edge-runtime/vm` are not installed yet (P2-7 / D5 adds them).

---

## Dispatch D3 — Double opt-in backend: schema, pending flow, purge cron

- **Steps bundled:** P2-1, P2-2, P2-6
- **Est. tokens:** ~65k (raw step sum ~75k; includes the one-off `npx convex run` migration from P2-1)
- **Files touched (union):** `showcase/convex/schema.ts`, NEW `showcase/convex/migrations.ts`, `showcase/convex/subscribers.ts`, `showcase/convex/rateLimits.ts`, NEW `showcase/convex/crons.ts`, NEW `showcase/convex/maintenance.ts`
- **Sequencing:** Depends on D2 (re-edits `subscribers.ts` after S3) and D1 (re-edits `rateLimits.ts` after S1). D4 depends on this dispatch. Nothing runs in parallel with it.
- **Internal order:** P2-1 first (P2-2 and P2-6 both need the new schema fields/indexes); then P2-2 and P2-6 in either order.

**Context / decisions binding on this dispatch:**
- Opaque-response convention from Phase 1 carries over: dedup/cooldown/rate-limit hits return `{ ok: true }`.
- Token generation does NOT happen in mutations (no `crypto.randomUUID` outside Node actions) — P2-2 inserts pending rows with **no** token; the token arrives later via `setConfirmationToken`, called from the D4 action.
- `setConfirmationToken` lives in `subscribers.ts` precisely so that D4's P2-3 never has to edit this file.

### P2-1 — Schema + migration

- **Size:** S · **Est. tokens (standalone):** ~25k (includes one-off `npx convex run` of the migration)
- **Files:** `showcase/convex/schema.ts`, NEW `showcase/convex/migrations.ts`
- **Change:** `subscribers` gains `status` (optional union `pending`/`confirmed`; `undefined` = legacy confirmed), `confirmToken`, `tokenExpiry`; indexes `by_token` + `by_status`. New `internalMutation backfillSubscriberStatus` (paginate, patch `undefined` → `confirmed`), run once via `npx convex run`.
- **Acceptance:** Schema pushes cleanly; backfill executed.
- **Deps:** none

### P2-2 — Subscribe mutation: pending flow

- **Size:** M · **Est. tokens (standalone):** ~30k
- **Files:** `showcase/convex/subscribers.ts`, `showcase/convex/rateLimits.ts`
- **Change:** rateLimits.ts: add `confirmResendPerEmail { rate: 1, period: 10*MINUTE, capacity: 1 }`. subscribers.ts: confirmed/legacy dedup unchanged (opaque); pending re-subscribe → cooldown-limited re-send of confirmation; new row inserted as `pending` with **no** token; schedule `internal.emails.sendConfirmation` (replaces the `sendWelcome` schedule). Add `internalMutation setConfirmationToken({ subscriberId, token, tokenExpiry })` patching only-if-still-pending (lives here so P2-3 never edits this file).
- **Acceptance:** New signups land as pending, no welcome email scheduled at signup.
- **Deps:** P2-1 (satisfied within this dispatch — do P2-1 first)

### P2-6 — Purge cron for expired pendings

- **Size:** S · **Est. tokens (standalone):** ~20k
- **Files:** NEW `showcase/convex/crons.ts`, NEW `showcase/convex/maintenance.ts`
- **Change:** `internalMutation purgeExpiredPending`: `by_status` pending with `tokenExpiry < now`, plus tokenless pendings older than 8 days; `.take(100)` + self-reschedule. `crons.daily` at 04:00 UTC.
- **Acceptance:** Cron registered; batch + reschedule logic in place.
- **Deps:** P2-1 (satisfied within this dispatch)

**Dispatch D3 acceptance gate (run once, after all steps):**

```bash
cd showcase && npx tsc --noEmit && npm run lint && npm test
```

---

## Dispatch D4 — Double opt-in front half: confirmation email, confirm route, landing UX

- **Steps bundled:** P2-3, P2-4, P2-5
- **Est. tokens:** ~90k (raw step sum ~105k; includes ~10k browser verification of the banner from P2-5)
- **Files touched (union):** `showcase/convex/emails.ts`, `showcase/convex/subscribers.ts`, NEW `showcase/app/confirm/route.ts`, NEW `showcase/components/ConfirmedBanner.tsx`, `showcase/app/page.tsx`, `showcase/components/NewsletterForm.tsx`
- **Sequencing:** Depends on D3 (P2-3 calls `setConfirmationToken` from P2-2; P2-4 re-edits `subscribers.ts` after P2-2) and transitively on D1 (re-edits `emails.ts` after S4 and `NewsletterForm.tsx` after S5). D5 depends on this dispatch. Nothing runs in parallel with it.
- **Internal order:** P2-3, P2-4, P2-5 in any order (all their cross-step deps were satisfied by D3); run `npm run build` and the browser check after P2-5.
- **Env prerequisite:** `SITE_URL` must be set on the Convex deployment (`npx convex env set SITE_URL ...`) **before** this dispatch runs (hard prerequisite for P2-3).

### P2-3 — sendConfirmation internalAction

- **Size:** M · **Est. tokens (standalone):** ~30k
- **Files:** `showcase/convex/emails.ts`
- **Change:** New `sendConfirmation` internalAction: generates `crypto.randomUUID()` token + 7-day expiry; persists via `ctx.runMutation(internal.subscribers.setConfirmationToken)` **before** sending; link `` `${SITE_URL ?? "http://localhost:3000"}/confirm?token=...` ``; on-brand plaintext (subject like "One seal remains — confirm your place at The Altar Within"); log-don't-throw. Does **not** add to the Resend audience — that stays in `sendWelcome`, which now runs only post-confirmation.
- **Acceptance:** Token persisted before send; SITE_URL fallback works.
- **Deps:** P2-2 (requires `setConfirmationToken` — satisfied by D3); SITE_URL env set on the Convex deployment

### P2-4 — Confirm mutation + Next.js route

- **Size:** M · **Est. tokens (standalone):** ~35k
- **Files:** `showcase/convex/subscribers.ts`, NEW `showcase/app/confirm/route.ts`
- **Change:** Public mutation `confirm({ token })`: invalid/missing → `{ ok: false, reason: "invalid" }`; expired → reason `"expired"`; valid → patch `confirmed`, clear token + expiry, schedule existing `sendWelcome` (audience-add + welcome email happen at confirmation). Route: GET, `force-dynamic`, `ConvexHttpClient(NEXT_PUBLIC_CONVEX_URL)` from `"convex/browser"`, redirect to `/?confirmed=1` or `/?confirmed=expired` (network errors → expired).
- **Acceptance:** Valid/expired/garbage token paths behave as specced.
- **Deps:** P2-1, P2-2 (satisfied by D3 — `subscribers.ts` edits land after P2-2's by construction)

### P2-5 — Confirm landing UX + copy

- **Size:** M · **Est. tokens (standalone):** ~40k (M + ~10k browser verification of the banner)
- **Files:** NEW `showcase/components/ConfirmedBanner.tsx`, `showcase/app/page.tsx`, `showcase/components/NewsletterForm.tsx`
- **Change:** `ConfirmedBanner` (`"use client"`, `useSearchParams`): `?confirmed=1` → gold/parchment success banner "Sealed. Your name is inscribed — the first letter will find you soon."; `?confirmed=expired` → lapsed-seal copy; auto-dismiss ~8s; strip the param. `page.tsx`: `<Suspense><ConfirmedBanner/></Suspense>` (Suspense required for `useSearchParams`). NewsletterForm success copy changed to confirmation-pending voice **keeping the word "Inscribed"** (preserves the `/inscribed/i` test assertions). `npm run build` must also succeed (no CSR bailout).
- **Acceptance:** `npm run build` succeeds; banner verified in browser for both query params.
- **Deps:** none of its own (bundled here so the dispatch ships the full confirm experience end-to-end)

**Dispatch D4 acceptance gate (run once, after all steps):**

```bash
cd showcase && npx tsc --noEmit && npm run lint && npm test
```

…plus `npm run build` and the P2-5 browser verification of `?confirmed=1` and `?confirmed=expired`.

---

## Dispatch D5 — Double opt-in test suite (terminal Phase 2 dispatch)

- **Steps bundled:** P2-7
- **Est. tokens:** ~55k (single step — no bundling savings; the estimate already includes full-suite debugging headroom)
- **Files touched (union):** `showcase/components/NewsletterForm.test.tsx` (or its actual test path), NEW `showcase/convex/subscribers.test.ts`, `showcase/vitest.config.mts`, `showcase/package.json`
- **Sequencing:** Depends on D4 (and transitively D1–D3); terminal step of Phase 2. Nothing runs in parallel with it. Not padded with extra steps: every remaining step is Phase-3 decision-gated, so there is nothing eligible to bundle here.
- **Internal order:** single step.

**Context / decisions binding on this dispatch:**
- Exception to the "no test files in `showcase/convex/`" rule: `subscribers.test.ts` uses convex-test, which is the supported pattern for that dir.

### P2-7 — Tests (terminal step)

- **Size:** L · **Est. tokens (standalone):** ~55k
- **Files:** `showcase/components/NewsletterForm.test.tsx` (or its actual test path), NEW `showcase/convex/subscribers.test.ts`, `showcase/vitest.config.mts`, `showcase/package.json`
- **Change:** NewsletterForm copy-assertion updates + new confirmation-mention test. New convex-test suite: pending insert, opaque paths, cooldown, `setConfirmationToken` pending-only, confirm valid/expired/garbage, purge — note the rate-limiter component needs `t.registerComponent` or stubbing. vitest config: `environmentMatchGlobs [["convex/**","edge-runtime"]]`. devDeps: `convex-test` + `@edge-runtime/vm`.
- **Acceptance:** Full suite green, including the new convex-test file.
- **Deps:** P2-2, P2-4, P2-5, P2-6 (all satisfied by D3/D4)

**Dispatch D5 acceptance gate (run once, after the step):**

```bash
cd showcase && npx tsc --noEmit && npm run lint && npm test
```

**Phase 2 subtotal: ~210k tokens** (D3 ~65k + D4 ~90k + D5 ~55k)

---

## Phase 3 — Deferred hardening (D6 + D7; outlines — owner decision required before dispatch)

Both dispatches below are **decision-gated**: do not dispatch until the owner has confirmed the flagged choices (retention policy for P3-8; option (a)/(b) for P3-9; option A/B for P3-11; whether spam pressure justifies P3-10).

---

## Dispatch D6 (gated) — Retention cron + Resend unsubscribe sync

- **Steps bundled:** P3-8, P3-11
- **Est. tokens:** ~50k (raw step sum ~55k)
- **Files touched (union):** `showcase/convex/maintenance.ts`, `showcase/convex/crons.ts`, NEW `showcase/convex/http.ts`, `showcase/convex/schema.ts`, `showcase/convex/subscribers.ts` (option A)
- **Sequencing:** Depends on D5 (Phase 2 complete: P3-8 needs P2-6's `maintenance.ts`/`crons.ts`; P3-11 needs P2-1's schema and re-edits `subscribers.ts`, so it must land after D4's edits and with D5's tests green). D7 depends on this dispatch (`subscribers.ts` conflict). Nothing runs in parallel with it.
- **Internal order:** P3-8 and P3-11 in either order (disjoint files within the dispatch).
- **Owner gate:** confirm messages retention policy (P3-8) and webhook-vs-cron option (P3-11) before dispatch.

### P3-8 — Messages retention cron

- **Size:** S · **Est. tokens (standalone):** ~20k
- **Files:** `showcase/convex/maintenance.ts`, `showcase/convex/crons.ts`
- **Change:** `purgeOldMessages` using the built-in `by_creation_time` index, `RETENTION_DAYS = 180` constant, batch + reschedule, registered in crons. **Confirm retention policy with owner first** (messages are already emailed to the owner, so deletion loses nothing new).
- **Acceptance:** Cron registered.
- **Deps:** P2-6 (shared files — satisfied by D3; this dispatch runs well after)

### P3-11 — Resend unsubscribe sync (outline)

- **Size:** M · **Est. tokens (standalone):** ~35k
- **Files (option A):** NEW `showcase/convex/http.ts`, `showcase/convex/schema.ts`, `showcase/convex/subscribers.ts`
- **Change:** Option A (recommended): webhook `/resend-webhook` in `convex/http.ts`, svix signature verification via `RESEND_WEBHOOK_SECRET`, handle `contact.updated`/`contact.deleted`, extend the status union with `"unsubscribed"`. Option B: nightly reconcile cron paginating the Resend audience API.
- **Acceptance:** Webhook signature verified; status transitions recorded.
- **Deps:** P2-1 (satisfied by D3)

**Dispatch D6 acceptance gate (run once, after all steps):**

```bash
cd showcase && npx tsc --noEmit && npm run lint && npm test
```

---

## Dispatch D7 (gated) — IP-aware entry point + Turnstile

- **Steps bundled:** P3-9, P3-10
- **Est. tokens:** ~80k (raw step sum ~90k; includes ~10k browser verification of the Turnstile widget)
- **Files touched (union):** NEW `showcase/app/api/subscribe/route.ts`, `showcase/convex/subscribers.ts`, `showcase/convex/rateLimits.ts`, `showcase/components/NewsletterForm.tsx` (and the contact-form equivalents)
- **Sequencing:** Depends on D6 (P3-11 in D6 edits `subscribers.ts`; this dispatch edits it again) and on D5 (P3-9's stated dep is "after P2-7"). Nothing runs in parallel with it. Last dispatch.
- **Internal order:** P3-9 first, then P3-10 (the widget verification plugs into the P3-9 route).
- **Owner gate:** confirm option (a) vs (b) for P3-9, and whether spam pressure justifies P3-10 at all (if not, dispatch P3-9 alone at ~45k).

### P3-9 — IP-aware entry point (outline)

- **Size:** L (implementation) / S (decision) · **Est. tokens (standalone):** ~50k
- **Files (option a):** NEW `showcase/app/api/subscribe/route.ts`, `showcase/convex/subscribers.ts`, `showcase/convex/rateLimits.ts`, `showcase/components/NewsletterForm.tsx` (and the contact-form equivalents)
- **Change:** Recommended option (a): Next.js route handler `/api/subscribe` as front door; Vercel-trustworthy `x-forwarded-for`; sha256 + salt `ipHash` arg; `subscribePerIp` bucket; `CONVEX_SHARED_SECRET` verified by the mutation (or internalMutation behind an HTTP action) to stop direct mutation abuse; same treatment for the contact form. Option (b) — Convex HTTP action: one platform but weaker IP provenance + CORS handling.
- **Acceptance:** Direct mutation calls without the shared secret are rejected/no-op.
- **Deps:** after P2-7 (satisfied by D5)

### P3-10 — Turnstile (only if spam pressure grows)

- **Size:** M · **Est. tokens (standalone):** ~40k (M + ~10k browser verification of the widget)
- **Files:** `showcase/components/NewsletterForm.tsx`, the P3-9 route handler
- **Change:** Invisible/managed Turnstile widget lazy-loaded in NewsletterForm; server-side `siteverify` in the P3-9 route; verification failure → opaque `{ ok: true }`. Env: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`.
- **Acceptance:** Widget verified in browser; failure path is opaque.
- **Deps:** prefers P3-9 option (a) (satisfied within this dispatch — do P3-9 first)

**Dispatch D7 acceptance gate (run once, after all steps):**

```bash
cd showcase && npx tsc --noEmit && npm run lint && npm test
```

…plus the P3-10 browser verification of the widget.

**Phase 3 subtotal: ~130k tokens** (D6 ~50k + D7 ~80k)

---

## Totals

| Phase | Dispatches | Subtotal |
|-------|------------|----------|
| Phase 1 | D1, D2 | ~145k (~125k without optional S5) |
| Phase 2 | D3, D4, D5 | ~210k |
| Phase 3 | D6, D7 | ~130k |
| **Grand total** | **7 dispatches** | **~485k** (~465k without S5) |

Down from ~550k under the old one-agent-per-step model (~65k recovered by paying orientation reads and gate runs once per dispatch instead of once per step). Estimates are per-dispatch subagent costs; failed runs, retries, and review passes are on top.

## Env / config prerequisites

| Item | Where | Needed by | Status |
|------|-------|-----------|--------|
| `SITE_URL` | Convex deployment (`npx convex env set SITE_URL ...`) | P2-3 (D4 — hard prerequisite) | **Done** — set on prod (`unique-raccoon-630`) to `https://www.the-altar-within.com` |
| `RESEND_API_KEY` | Convex deployment | P2-3 (D4), existing flows | Present |
| `RESEND_AUDIENCE_ID` | Convex deployment | sendWelcome audience add | Present |
| `NEWSLETTER_FROM` | Convex deployment | All outbound mail | **Correction: not set on prod** — code default `letters@the-altar-within.com` covers it (Resend domain verified) |
| `NEXT_PUBLIC_CONVEX_URL` | Next.js env | P2-4 route (D4) | Present |
| Verified Resend sending domain | Resend dashboard | All outbound mail | Hard prerequisite — verify before D3 |
| `convex-test` + `@edge-runtime/vm` | `showcase/package.json` devDeps | P2-7 (D5) | Installed by D5 |
| `CONVEX_SHARED_SECRET` | Next.js + Convex envs | P3-9 (D7) | Set on **dev** deployment + `.env.local` (D7). Prod: owner generates a fresh value at rollout |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` | Next.js env / route env | P3-10 (D7) | Cloudflare test keys in dev `.env.local` (D7). Prod: owner creates a real Turnstile widget |
| `RESEND_WEBHOOK_SECRET` | Convex deployment | P3-11 (D6) | Not set anywhere — endpoint 401s until set. Prod: owner creates the Resend webhook at rollout |

## How to run this with subagents

Dispatch **one subagent per dispatch bundle (D1–D7)**, strictly in order — the schedule is a sequential chain, so wait for each dispatch to pass its gate before starting the next. **Paste the dispatch section verbatim as the agent prompt** — each section is self-contained: bundled steps with IDs, files, change descriptions, per-step acceptance criteria, internal ordering, binding decisions, and the single end-of-dispatch gate. The agent executes its steps in the stated internal order and runs the gate **once at the end** (plus any extra dispatch-level checks like `npm run build` or browser verification). If a dispatch fails its gate, redispatch the same bundle with a note on what failed (budget extra tokens) before starting the next dispatch. D6 and D7 additionally require the owner decisions flagged in their sections before they may be dispatched at all.
