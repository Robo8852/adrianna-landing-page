# spec/readme.md — the map of the map

> **What this is:** the entry point to this codebase's spec map. It tells you what the app is, how the
> major parts connect, and which spec covers which domain. When you don't know which spec to load,
> start here — then `@`-load the specific spec(s) you need.
>
> **How to use:** in Claude Code, prefix your task with `study @spec/<domain>.md` to inject that domain's
> what/where/how into context deterministically, then give your instruction. Don't `@`-load this readme
> every time — it's a router, not a per-task spec.

---

## What the application is

**The Altar Within — Adrianna Naílah.** A single, ornate marketing/landing site (Next.js App Router) for a
somatic/spiritual practitioner. Two routes — a Home page (`/`) and an About page (`/about`) — each composed
of large, ordered "section" components. The aesthetic is a **gold/parchment-on-ink-green, two-serif**
illuminated-manuscript look, with subtle scroll-reveal and a draw-on brand sigil.

- **Stack:** Next.js 16 (Turbopack) · React 19.2 · TypeScript · Tailwind CSS 3 · framer-motion.
- **App code lives in `showcase/`** (the repo root also holds docs, design assets, and this `spec/` folder).
- **`@` path alias → `showcase/`** (see `showcase/tsconfig.json`).
- **One backend domain (Convex).** The only interactive feature (newsletter signup) persists to a Convex `subscribers` table via a `subscribe` mutation — see [`convex.md`](./convex.md). Everything else is static/presentational.

---

## How the major parts connect (data/composition flow)

```
app-shell (layout + template + pages)
   │  composes ordered ──▶ sections (Hero, A1–A5, H4–H8)
   │                          │  build from ──▶ composites (cards, rows, NewsletterForm) + chrome (HeaderNav, Footer)
   │                          │                    │  build from ──▶ primitives (Sigil, GoldRule, headings, marks) + ui/button
   │  persistent chrome  ─────┘                    │
   │                                               ▼
   └─ everything reads ──▶ styling (palette + font tokens in globals.css / tailwind.config)
                          and some components use ──▶ hooks (useReveal, useScrolled)

tooling governs how all of the above is run, linted, tested, built, and deployed.
```

- **Pages are flat ordered lists of sections.** Home: `Hero → H4 → H5 → H6 → H7 → H8`. About: `A1 → A2 → A3 → A4 → A5`. (`H*`/`A*` are positional/page-scoped names, **not** semantic.)
- **Component layering:** primitives → composites/chrome → sections → pages. Lower layers never import higher ones.
- **Server vs client:** `layout.tsx` + both `page.tsx` files are Server Components; `template.tsx`, all sections, all chrome, and interactive composites are `"use client"`.
- **Styling is dual-sourced:** every component pulls colors/fonts from CSS custom properties; tokens are duplicated in `globals.css` **and** `tailwind.config.ts`.

---

## Which spec covers which area

| Spec | Domain | Load it when you're working on… |
|------|--------|--------------------------------|
| [`app-shell.md`](./app-shell.md) | App Router skeleton: root layout, fonts, metadata, `template.tsx` route fade, page composition | adding a route, changing fonts/metadata, page transitions, reordering sections |
| [`sections.md`](./sections.md) | The 11 page narrative blocks (`Hero`, `A1–A5`, `H4–H8`) + page→section mapping | editing page content/layout, adding or reordering a section |
| [`composites.md`](./composites.md) | Mid-level building blocks (cards, rows, **NewsletterForm**) + chrome (HeaderNav, Footer) | the signup form, header/nav, footer, pricing/pillar/credential cards |
| [`convex.md`](./convex.md) | The Convex backend: `subscribers` schema, `subscribe` mutation, `ConvexClientProvider`, env/deploy model, Resend seam | persisting signups, the mutation contract, the Convex client, env vars, deploying the backend |
| [`primitives.md`](./primitives.md) | Smallest visual atoms (`Sigil`, `GoldRule`, `SectionHeading`, `DropCap`, marks) + `ui/button` | the brand sigil, dividers, headings, decorative marks, the base button |
| [`styling.md`](./styling.md) | Design language: color/font **tokens**, Tailwind theme, `cn()` helper | colors, fonts, spacing tokens, adding a theme value |
| [`hooks.md`](./hooks.md) | `useReveal` (scroll reveal) and `useScrolled` (scroll threshold) | scroll-reveal animation, sticky-on-scroll header behavior |
| [`tooling.md`](./tooling.md) | Build/dev/lint/test/CI/deploy infrastructure | running, testing, linting, CI, or shipping the app |

---

## Global best practices (apply to any feature)

- **Run everything from `showcase/`.** `npm run dev` / `build` / `lint` / `test`. Node `>=20.9` (pinned in `engines`).
- **Honor the layering.** primitives → composites → sections → pages. Don't import upward; don't put page content in primitives.
- **Use the tokens, not hardcoded values.** Pull colors/fonts from CSS vars (`var(--gold)`, `var(--parchment)`, `var(--font-cormorant)`, …). If you add a token, add it to **both** `globals.css` and `tailwind.config.ts` (they're duplicated). This codebase favors inline `style={{ color: "var(--token)" }}` over Tailwind color classes — match that.
- **Mind the deploy model.** `main` auto-deploys to **production** on Vercel; every PR gets a **preview** deploy. CI (lint → test → build) runs on every PR via `npm ci`, which requires `package-lock.json` to be in sync — regenerate the lock with `npm install` if you change deps.
- **Reduced motion is respected** two ways: `template.tsx` guards the route fade in JS; section/sigil animations are disabled via the `@media (prefers-reduced-motion: reduce)` block in `globals.css`.
- **Determinism over probabilism:** the `react-hooks/set-state-in-effect` lint rule is intentionally a *warning* (the SSR-mounted and reduced-motion guards trip it legitimately). Don't "fix" those by refactoring working guards.

---

## ⚠️ Known gaps / state of the world (read before promising features work)

- **NewsletterForm persists, but sends no email yet.** On valid submit it calls the Convex `subscribe` mutation,
  which stores the address in the `subscribers` table (idempotent — duplicates are silently deduped). What is
  **not** built: **no email is sent** (welcome/opt-in/admin). That is the **Resend phase**, present only as a
  documented seam in `convex/subscribers.ts`. Also still unwired: `convex deploy` into the Vercel build command
  (prod backend deploy is manual for now). See `convex.md` and `composites.md`.
- **Placeholder copy in chrome:** `Footer.tsx` ships a placeholder `[email]` mailto. Real contact details TBD.
- **Sigil edits are fiddly:** the brand `Sigil` uses ~25 stroke-dashoffset draw-on paths; changing a path's `d`
  requires recomputing its dash length. Backups exist (`Sigil.filled.bak.tsx`, `Sigil.handcoded.bak.tsx`). See `primitives.md`.

---

## Keeping this spec map honest

Specs only work if they are the **source of truth**. This map reflects the codebase as of its creation. When
code changes, update the relevant spec in the same change. If/when drift becomes a problem, adopt a sync
strategy (hand-maintain → post-commit `claude -p` hook → a `/sync-specs` command), in that order of automation.
