# Handoff: finish the feature-folder retrofit

For a fresh Claude Code session. Read `specs/README.md` first — the spec map is the
source of truth; this doc is only the task list. Work from `showcase/` for all commands.

## Goal

Every feature is a subfolder of `showcase/features/`. If code belongs to one feature it
lives in that feature's folder; shared UI stays in `components/`, shared plumbing in
`lib/`; `app/` routes and `convex/<name>.ts` are thin adapters (framework-mandated).
The spec map mirrors it 1:1 — one `specs/<feature>.md` per feature folder.

## Already done (do not redo)

- `features/calendly/` — migrated, barrel included, consumers repointed, build + 78
  tests + lint verified. Spec: `specs/calendly.md`.
- `specs/stripe.md` — full build blueprint (System Design Newsletter #152 patterns
  scaled to Convex). No Stripe code exists; blocked on owner's Stripe account, prices,
  and the pay-vs-book flow decision. Do NOT build Stripe until those are answered.
- Everything is UNCOMMITTED on `main` (git mv renames + new specs/). Commit strategy is
  the user's call.

## Remaining work

1. **Retrofit newsletter** → `features/newsletter/`: `NewsletterForm.tsx`,
   `NewsletterModal.tsx` (from `components/composites/`), plus the subscribe half of
   `lib/formGateway.ts`. Barrel `index.ts`. Repoint consumers (grep for imports).
   `app/api/subscribe/route.ts` and `convex/subscribers.ts` stay as thin adapters.
2. **Retrofit contact** → `features/contact/`: `ContactForm.tsx` + the contact half of
   `formGateway.ts`. Same pattern. `app/api/contact/route.ts` / `convex/messages.ts` stay.
   - If splitting `formGateway.ts` creates duplication, keep the shared core in `lib/`
     and put only feature-specific config in each feature. Shared-by-2+ = stays shared.
   - `ContactForm.test.tsx` / `NewsletterForm.test.tsx` move with their components.
3. **Spec reshuffle**: dissolve `specs/notifications.md` into `specs/newsletter.md` +
   `specs/contact.md` (What/Where/How format — see existing specs for the pattern).
   Shared Resend/Turnstile/rate-limit plumbing gets described once, wherever it lands.
   Update `specs/README.md` (spec list, diagram) and purge stale paths from
   `specs/components.md` — check EVERY spec for stale paths when done (this drifted
   last time).

## Verification (required after each retrofit)

From `showcase/`: `npm run build && npm test && npm run lint` — all were green at
handoff (2 pre-existing lint warnings in `HeaderNav.tsx` and `useReveal.ts`; ignore).
Grep for old import paths after each move; zero references may remain.

## Style notes

- Use `git mv` so history survives. Nothing gets committed unless the user asks.
- Consumers import ONLY through each feature's `index.ts` barrel (`@/features/<name>`).
- The user runs subagent orchestration for parallelizable work — code moves and spec
  edits can run in parallel if they touch disjoint files, but verify both afterward.
