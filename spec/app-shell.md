# app-shell

> **What this covers:** The Next.js App Router skeleton — how the app boots, the root layout/chrome, per-route fade transitions, and how pages compose ordered sections.

## What
- Owns the App Router structure under `showcase/app/`: the root layout (HTML/body, fonts, metadata, persistent chrome), the route transition wrapper (`template.tsx`), and the page entry points (`/` and `/about`).
- Responsible for *composition and boot wiring*: which font variables exist, what global setup `globals.css` triggers, how chrome (header/footer) persists across routes, and the order sections render inside each page.
- NOT responsible for: theme tokens / global CSS rules (owned by `styling` — this doc only references `globals.css`), the section components themselves (owned by `sections`), chrome internals like nav behavior (owned by chrome/`sections`), or motion hooks/primitives beyond noting their use here.
- Fits the system as the outermost frame: `layout.tsx` wraps every route, `template.tsx` wraps every route's children with a re-mounting transition, and each `page.tsx` is just an ordered list of section components.

## Where
- `showcase/app/layout.tsx` — Root layout (Server Component). Defines fonts, exports `metadata`, renders `<html>/<body>` with persistent `<HeaderNav />` + `{children}` + `<Footer />`, all wrapped in `<ConvexClientProvider>` (the `"use client"` Convex boundary — see `spec/convex.md`). Imports `./globals.css`.
- `showcase/app/ConvexClientProvider.tsx` — thin `"use client"` provider mounted in `layout.tsx`; constructs the `ConvexReactClient` once at module scope and supplies it to the tree so `NewsletterForm` can reach the backend. Detail in `spec/convex.md`.
- `showcase/app/template.tsx` — Route transition wrapper (Client Component, `"use client"`). Re-mounts on every navigation and applies an opacity fade. Uses `framer-motion` + `usePathname` + `useReducedMotion`.
- `showcase/app/page.tsx` — Home route `/` (Server Component). Renders `<main>` with sections in order: `Hero, H4, H5, H6, H7, H8`.
- `showcase/app/about/page.tsx` — About route `/about` (Server Component). Renders `<main>` with sections in order: `A1, A2, A3, A4, A5`.
- `showcase/app/globals.css` — Global stylesheet (theme tokens & base rules owned by `styling`). Imported once in `layout.tsx`. Provides Tailwind layers, `:root` color vars, `html/body` base styles (background, default `--font-eb-garamond` family), focus-visible ring, and the `altar-sigil-draw` keyframes + reduced-motion overrides.
- Cross-refs: `@/components/chrome/HeaderNav`, `@/components/chrome/Footer` (chrome, both `"use client"`); `@/components/sections/*` (sections — all `"use client"`). `@` resolves to `showcase/` (see `tsconfig.json`).

## How
- **Server vs client boundaries.** `layout.tsx`, `page.tsx`, and `about/page.tsx` are Server Components (no `"use client"`). `template.tsx` is a Client Component. The page files import section components that are themselves `"use client"`, so client interactivity lives below the page level, not in the pages or layout.
- **Fonts.** Two Google fonts are wired via `next/font/google` in `layout.tsx`:
  - `Cormorant_Garamond` → CSS var `--font-cormorant` (weights 300/400/500/600, `display: swap`) — display/headings.
  - `EB_Garamond` → CSS var `--font-eb-garamond` (weights 400/500, normal + italic, `display: swap`) — body default.
  Both `.variable` classes are applied to `<html>`: `className={`${cormorant.variable} ${ebGaramond.variable}`}`. `globals.css` sets `body { font-family: var(--font-eb-garamond), Georgia, serif }`. To use a new font, instantiate it here and add its `.variable` to the `<html>` className.
- **Metadata.** Static `metadata: Metadata` is exported from `layout.tsx` (title `"The Altar Within — Adrianna Naílah"` + description). For per-route titles, export `metadata` from the route's `page.tsx`.
- **Persistent chrome.** `<HeaderNav />` and `<Footer />` sit in `layout.tsx` outside `{children}`, so they persist across navigations (no re-mount). Page content goes between them.
- **Page transitions (`template.tsx`).** Next.js renders `template.tsx` *inside* `layout.tsx` but, unlike a layout, it creates a **new instance on every navigation** — that re-mount is what drives the transition. It wraps children in a `motion.div` keyed by `usePathname()` (the `key={pathname}` forces remount per route), fading `opacity 0 → 1` on enter and `1 → 0` on exit over `0.36s` `easeIn`. `useReducedMotion()` short-circuits it: when reduced motion is preferred, `initial={false}` and `exit={undefined}` so no fade runs. Note: there is no `<AnimatePresence>` here, so the `exit` variant is effectively a no-op on standard App Router navigations — the enter fade is the visible effect.
- **Adding a route.** Create `showcase/app/<route>/page.tsx` exporting a default Server Component returning a `<main>` of section components. It automatically inherits the root layout (fonts/chrome) and the `template.tsx` fade. Add an optional `metadata` export for SEO.
- **Composing a page.** A page is a flat, ordered list of section components inside one `<main>`. Order in the JSX = vertical render order on the page. Home order: `Hero → H4 → H5 → H6 → H7 → H8`. About order: `A1 → A2 → A3 → A4 → A5`. To reorder/add a section, edit the JSX order in the relevant `page.tsx`; section internals are owned by the `sections` domain.
- **Gotchas.**
  - `globals.css` is imported only in `layout.tsx` — import it nowhere else.
  - `<html lang="en">` is hardcoded; the only dynamic part of `<html>` is the font-variable className.
  - The `H*` (home) and `A*` (about) section names are positional/page-scoped, not semantic — naming carries no meaning beyond order on its page.
  - Reduced-motion handling is split: `template.tsx` guards the route fade in JS, while section/sigil animations are disabled via the `@media (prefers-reduced-motion: reduce)` block in `globals.css`.
  - `next.config.mjs` enables `reactStrictMode`, which double-invokes effects in dev — keep that in mind when debugging client-section effects.
