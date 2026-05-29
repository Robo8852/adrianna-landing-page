# Branching Strategy

For a solo project like this, branches aren't mandatory. Here's the actual
reasoning behind when we use them — and when we don't.

## Why use branches

1. **`main` auto-deploys to production.** Every push to `main` ships straight
   to the live Vercel site. A branch lets risky work (like the Next 16 major
   upgrade) get **built and previewed by Vercel first**. That's exactly what
   saved us on the Next 16 upgrade — the PR preview proved the build was green
   *before* it could touch the live site.

2. **It makes big changes reversible.** If something had broken, abandoning a
   branch is trivial; un-shipping a bad commit from production `main` is not.

3. **Bigger, multi-step changes stay isolated.** Something like the Convex
   integration (new dependency, backend wiring, form changes) lives on
   `feat/convex-backend` so `main` stays deployable the whole time. You can
   ship small fixes to prod without dragging half-finished work along.

## Where branches are overkill

Small, safe, docs-only changes. No app code = direct to `main` is fine. That's
why the docs cleanup went straight to `main` — no branch, no PR.

## The rule of thumb

- **Small / safe / docs** → commit straight to `main`
- **Risky / major / multi-step / want-a-preview-first** → branch + PR

## Tradeoff of working only on `main`

Totally valid for a solo repo. The only real tradeoff: every commit you push
goes live immediately, so we'd lean more on building locally before pushing.
