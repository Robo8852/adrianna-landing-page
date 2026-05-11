# imp.md — The Altar Within: sequential build plan

Execute steps top-to-bottom. Do not skip ahead. Each step lists its prerequisites — if a prerequisite is not marked DONE, stop and surface the issue. Mark DONE by changing `[ ]` to `[x]` after acceptance criteria pass.

---

## Conventions block (read once; reference from every step)

### File paths

- All app code lives under `showcase/`. Path alias: `@/*` → `./` (relative to `showcase/`).
- **Primitives:** `showcase/components/primitives/<Name>.tsx` — pure, no business state.
- **Composites:** `showcase/components/composites/<Name>.tsx` — primitives + small local state.
- **Sections:** `showcase/components/sections/<Name>.tsx` — one per page section.
- **Chrome:** `showcase/components/chrome/<Name>.tsx` — `HeaderNav`, `Footer`.
- **Hooks:** `showcase/lib/hooks/<name>.ts` — `useReveal`, `useScrolled`.
- Pages: `showcase/app/page.tsx`, `showcase/app/about/page.tsx`, `showcase/app/layout.tsx`, `showcase/app/template.tsx`.

### Brand tokens (B1)

| Token       | Hex       | CSS var       | Tailwind key  |
|-------------|-----------|---------------|---------------|
| Ink-green   | `#0B3B36` | `--ink-green` | `ink-green`   |
| Gold        | `#C9A961` | `--gold`      | `gold`        |
| Gold-warm   | `#D9BE7E` | `--gold-warm` | `gold-warm`   |
| Parchment   | `#F3EEDA` | `--parchment` | `parchment`   |
| Shadow      | `#061F1C` | `--shadow`    | `shadow-ink`  |

CSS var stays `--shadow`; Tailwind key gets `-ink` suffix to avoid colliding with `shadow-*` utilities.

### Font tokens

| Family             | CSS var              | Tailwind key   | Usage                                                                                  |
|--------------------|----------------------|----------------|----------------------------------------------------------------------------------------|
| Cormorant Garamond | `--font-cormorant`   | `font-display` | Brand title, headings, motto, names, spaced-caps, nav, buttons, drop-caps, romans      |
| EB Garamond        | `--font-eb-garamond` | `font-body`    | Body paragraphs, tagline, italic sublines, email input, pull-quotes, Latin epigram     |

No sans-serif anywhere on the site.

### Type scale

| Use                                             | rem    | Tailwind class       |
|-------------------------------------------------|--------|----------------------|
| Hero brand title (mobile)                       | 3rem   | `text-5xl`           |
| Hero brand title (md+)                          | 3.75rem| `md:text-6xl`        |
| A1 page heading                                 | 4rem   | `text-[4rem]`        |
| H8 headline ("Stay close to the work.")         | 3rem   | `text-[3rem]`        |
| H6 section title                                | 2.25rem| `text-[2.25rem]`     |
| A3 sub-heading                                  | 2.5rem | `text-[2.5rem]`      |
| PillarPanel name (A3)                           | 2rem   | `text-[2rem]`        |
| PriceCard service name                          | 1.5rem | `text-2xl`           |
| PriceCard price                                 | 2rem   | `text-[2rem]`        |
| Pull-quote text                                 | 1.5rem | `text-2xl`           |
| CredentialRow title                             | 1.15rem| `text-[1.15rem]`     |
| H4 epigraph line                                | 1.25rem| `text-xl`            |
| A5 line                                         | 1.15rem| `text-[1.15rem]`     |
| H5 / A2 / A3 body paragraph                     | 1.1rem | `text-[1.1rem]`      |
| H6 PillarCard distillation                      | 1.05rem| `text-[1.05rem]`     |
| Newsletter success line                         | 1.1rem | `text-[1.1rem]`      |
| Latin epigram (footer)                          | 0.85rem| `text-[0.85rem]`     |
| Spaced-caps links (nav, "read more", duration)  | 0.78rem| `text-[0.78rem]`     |
| Copyright line                                  | 0.75rem| `text-xs`            |
| H4 attribution ("— Rumi")                       | 0.7rem | `text-[0.7rem]`      |
| DropCap                                         | 5rem   | inline style         |

### Max-widths

| Use                          | rem    |
|------------------------------|--------|
| Hero stack                   | 48rem  |
| H5 paragraph                 | 36rem  |
| H6 pillar column             | 40rem  |
| H7 price grid                | 52rem  |
| H8 stack                     | 36rem  |
| A2 / A3 reading column       | 34rem  |
| A2 pull-quote                | 42rem  |
| A4 credentials column        | 40rem  |
| A5 closing stack             | 36rem  |

### Tracking

| Use                                     | Value   |
|-----------------------------------------|---------|
| Motto (LUX · VERITAS · FORMA)           | `0.4em` |
| Nav links, "read more", romans          | `0.28em`|
| Mini-sigil wordmark, button labels      | `0.32em`|
| Italic subline ("with Adrianna Naílah") | `0.04em`|
| Tagline                                 | `0.02em`|

### Animation timings

| Item                                | Duration / curve                                |
|-------------------------------------|-------------------------------------------------|
| Hero sigil scale+fade in            | 1.6s cubic-bezier(0.22,0.61,0.36,1), delay 0.05s|
| Hero sigil stroke draw              | 2.2s cubic-bezier(0.65,0,0.35,1), staggered     |
| Hero brand reveal                   | delay 1.05s                                     |
| Hero motto reveal                   | delay 1.55s                                     |
| Hero rule extend                    | 1.4s, delay 1.95s                               |
| Hero tagline reveal                 | delay 2.25s                                     |
| Hero subline reveal                 | delay 2.45s                                     |
| Hero positioning reveal             | delay 2.7s                                      |
| Hero CTA reveal                     | delay 3.0s                                      |
| Gold mote drift                     | 22–32s linear infinite                          |
| Section reveal-on-scroll (generic)  | 1.0s cubic-bezier(0.22,0.61,0.36,1) fade-up 14px|
| GoldRule center-out reveal-on-scroll| 1.0s, transform-origin center                   |
| MicroSigil stroke-in on view        | 1.8s cubic-bezier(0.65,0,0.35,1)                |
| Route exit cross-fade               | 280ms ease-out                                  |
| Route entry cross-fade              | 360ms ease-in                                   |
| HeaderNav scrim transition          | 250ms ease                                      |
| Link hover (parchment → gold-warm)  | 200ms ease                                      |

### `useReveal` hook signature

`showcase/lib/hooks/useReveal.ts` exports:

```ts
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options?: { threshold?: number; rootMargin?: string; once?: boolean }
): { ref: React.RefObject<T>; revealed: boolean };
```

Defaults `threshold: 0.2`, `rootMargin: "0px 0px -10% 0px"`, `once: true`. Under `prefers-reduced-motion`, returns `revealed: true` immediately on mount (skip observation entirely). SSR-safe initial state: server = unrevealed (opacity 0); client mounts and either reveals on scroll or, under reduced-motion, immediately.

### Reduced-motion rule

When `prefers-reduced-motion: reduce`:
- No transforms (no `translateY`/`scaleX`/`scale`); opacity transitions become instant.
- Stroke-draw animations omitted — SVG renders in final state.
- Gold motes hidden entirely.
- `useReveal` short-circuits to revealed-on-mount.
- globals.css ships a `@media (prefers-reduced-motion: reduce)` block overriding keyframe-driven classes to end state with `animation: none !important`; components also gate JS-driven motion (Framer Motion) on `useReducedMotion()`.

### Focus-ring spec

`:focus-visible { outline: 2px solid rgba(201,169,97,0.6); outline-offset: 2px; }` in globals.css.

---

## Dependency graph

```
Phase 0  Pre-flight
   └── (no in-phase deps)
Phase 1  Foundation
   ├── 1.1 globals.css rewrite        (needs 0.x)
   ├── 1.2 tailwind.config extend     (needs 0.x)
   ├── 1.3 fonts in app/layout.tsx    (needs 1.1, 1.2)
   └── 1.4 install framer-motion      (needs 0.x)
Phase 2  Hero extraction
   ├── 2.1 lift hero → Hero.tsx       (needs 1.1, 1.2, 1.3)
   └── 2.2 stub app/page.tsx          (needs 2.1)
Phase 3  Primitives
   ├── 3.0 useReveal hook             (needs 1.x)
   ├── 3.1 Sigil (extracted)          (needs 2.1)
   ├── 3.2 GoldRule                   (needs 1.1, 1.2, 3.0)
   ├── 3.3 ArrowGlyph                 (needs 1.1, 1.2)
   ├── 3.4 MottoLine                  (needs 1.1, 1.2)
   ├── 3.5 IlluminatedMarker          (needs 1.1, 1.2)
   ├── 3.6 DropCap                    (needs 1.1, 1.2)
   ├── 3.7 SectionHeading             (needs 3.2)
   └── 3.8 PullQuote                  (needs 3.2)
Phase 4  MicroSigils
   └── 4.1 MicroSigil (5 motifs)      (needs 3.0, 1.1, 1.2)
Phase 5  Composites
   ├── 5.1 NewsletterForm             (needs 1.1, 1.2, 1.3)
   ├── 5.2 PillarCard                 (needs 4.1, 3.2)
   ├── 5.3 PillarPanel                (needs 4.1, 3.2)
   ├── 5.4 PriceCard                  (needs 3.2)
   ├── 5.5 PriceNote                  (needs 1.1, 1.2)
   └── 5.6 CredentialRow              (needs 1.1, 1.2)
Phase 6  Chrome
   ├── 6.1 useScrolled hook           (needs 1.x)
   ├── 6.2 HeaderNav                  (needs 6.1, 3.1, 5.1)
   ├── 6.3 Footer                     (needs 3.4, 5.1, 3.2)
   └── 6.4 wire chrome into layout    (needs 6.2, 6.3)
Phase 7  Home sections
   ├── 7.1 H4 Epigraph                (needs 3.2, 3.0)
   ├── 7.2 H5 Teaser Intro            (needs 3.3, 3.0)
   ├── 7.3 H6 Pillars condensed       (needs 3.7, 5.2, 3.3)
   ├── 7.4 H7 Service Fees            (needs 3.7, 5.4, 5.5)
   └── 7.5 H8 Primary CTA             (needs 3.2, 5.1)
Phase 8  About sections + page
   ├── 8.1 A1 heading                 (needs 3.2)
   ├── 8.2 A2 Her Story               (needs 3.7, 3.6, 3.8, 3.5)
   ├── 8.3 A3 Her Practice            (needs 3.7, 5.3, 3.5)
   ├── 8.4 A4 Credentials             (needs 3.7, 5.6)
   ├── 8.5 A5 Secondary CTA           (needs 3.2, 3.3)
   └── 8.6 app/about/page.tsx         (needs 8.1–8.5)
Phase 9  Page assembly
   ├── 9.1 wire Home                  (needs 2.1, 7.1–7.5)
   └── 9.2 verify About anchors       (needs 8.6, 6.4)
Phase 10 Route transitions
   └── 10.1 app/template.tsx          (needs 1.4, 6.4, 9.x)
Phase 11 Polish & QA
   ├── 11.1 reduced-motion sweep
   ├── 11.2 focus rings
   ├── 11.3 responsive sweep
   ├── 11.4 contrast spot-check
   └── 11.5 lighthouse
```

---

## Phase 0 — Pre-flight

### Step 0.1 — Confirm deps and dev server  [x]

**Prerequisites:** none
**Inputs:** `showcase/package.json`
**Outputs:** `showcase/package-lock.json` (regenerated on install); no source changes.

**Implementation:**
- Reap any orphan dev servers on port 3000 before starting (`lsof -ti :3000 | xargs -r kill -9`) so the boot check is clean.
- `cd showcase && rm -rf node_modules package-lock.json && npm install` (forces a clean resolution against the upgraded Next 15 / React 19 pins in `package.json`).
- Confirm installed: `next@^15`, `react@^19`, `react-dom@^19`, `tailwindcss@^3.4`, `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/react-slot`, `lucide-react`.
- `npm run dev` boots without error on port 3000; verify the "ready" line, then stop the dev server before marking done.

**Acceptance criteria:**
- [x] `npm install` exits 0.
- [x] Installed `next` major version is 15 and `react` major version is 19 (check via `npm ls next react`).
- [x] `npm run dev` reaches "ready" within ~30s with no errors.
- [x] Dev server is stopped and port 3000 is free at end of step.

**Notes:** Path alias `@/*` already in `tsconfig.json`. Don't touch. If `npm install` flags peer-dep warnings about React 19, those are expected from older `@types/*` or third-party packages — proceed unless they're hard errors.

---

## Phase 1 — Foundation

### Step 1.1 — Rewrite `globals.css`  [x]

**Prerequisites:** 0.1
**Inputs:** `showcase/app/globals.css`
**Outputs:** `showcase/app/globals.css` (full rewrite)

**Implementation:**
- Three Tailwind directives, then `:root` defining the five CSS vars (hex values from conventions).
- `html, body` set bg `var(--ink-green)`, color `var(--parchment)`, font `var(--font-eb-garamond), Georgia, serif`, antialiased, margin/padding 0.
- Universal `box-sizing: border-box`.
- `:focus-visible` rule per conventions.
- `@media (prefers-reduced-motion: reduce)` block: global `animation-duration: 0.001ms`, `transition-duration: 0.001ms`, `scroll-behavior: auto`; classes `.altar-reveal`, `.altar-sigil-reveal`, `.altar-rule` forced to `opacity: 1; transform: none; animation: none`; `.altar-sigil-path` forced to `stroke-dashoffset: 0; animation: none`; `.altar-mote` set to `display: none`.

**Acceptance criteria:**
- [x] Five CSS vars on `:root` with exact hex.
- [x] Body uses ink-green bg / parchment fg / EB Garamond.
- [x] Reduced-motion block present with override classes.
- [x] `npm run dev` still boots; pages render green even before hero is wired.

---

### Step 1.2 — Extend `tailwind.config.ts`  [x]

**Prerequisites:** 0.1
**Inputs:** `showcase/tailwind.config.ts`
**Outputs:** `showcase/tailwind.config.ts` (modify)

**Implementation:**
- `content` covers `./app`, `./components`, `./lib` with `{ts,tsx}` globs.
- `theme.extend.colors`: `ink-green`, `gold`, `gold-warm`, `parchment`, `shadow-ink` (hex values from conventions).
- `theme.extend.fontFamily`: `display` → `["var(--font-cormorant)", "Georgia", "serif"]`; `body` → `["var(--font-eb-garamond)", "Georgia", "serif"]`.

**Acceptance criteria:**
- [x] Colors block matches conventions.
- [x] FontFamily display/body reference CSS vars.
- [x] `bg-ink-green text-gold` renders correctly on a test div.

---

### Step 1.3 — Wire fonts in `app/layout.tsx`  [x]

**Prerequisites:** 1.1, 1.2
**Inputs:** `showcase/app/layout.tsx`, top of `showcase/app/page.tsx` for the font import pattern
**Outputs:** `showcase/app/layout.tsx` (modify)

**Implementation:**
- Import `Cormorant_Garamond` and `EB_Garamond` from `next/font/google`.
- Cormorant: subsets `["latin"]`, weights `["300","400","500","600"]`, variable `--font-cormorant`, display `"swap"`.
- EB Garamond: subsets `["latin"]`, weights `["400","500"]`, styles `["normal","italic"]`, variable `--font-eb-garamond`, display `"swap"`.
- `metadata`: title "The Altar Within — Adrianna Naílah"; description "Transpersonal & Integration Psychotherapy with Adrianna Naílah. Reflections, practices, and announcements."
- `<html lang="en" className={`${cormorant.variable} ${ebGaramond.variable}`}>` wrapping `<body>{children}</body>`.

**Acceptance criteria:**
- [x] CSS vars `--font-cormorant` and `--font-eb-garamond` on `<html>` site-wide.
- [x] DevTools shows EB Garamond resolved on body text.

---

### Step 1.4 — Install Framer Motion  [x]

**Prerequisites:** 0.1
**Outputs:** `showcase/package.json`, `showcase/package-lock.json` (via npm install)

**Implementation:**
- `cd showcase && npm install framer-motion@^11`.

**Acceptance criteria:**
- [x] `framer-motion` in `dependencies`.
- [x] `import { motion, AnimatePresence, useReducedMotion } from "framer-motion"` resolves.

---

## Phase 2 — Hero extraction (B2)

### Step 2.1 — Lift hero into `components/sections/Hero.tsx`  [x]

**Prerequisites:** 1.1, 1.2, 1.3
**Inputs:** `concepts/v1-faithful-altar/page.tsx` (locked source)
**Outputs:** `showcase/components/sections/Hero.tsx` (create)

**Implementation:**
- Copy `concepts/v1-faithful-altar/page.tsx` to `showcase/components/sections/Hero.tsx`.
- Prepend `"use client";`.
- Remove the `next/font/google` font-import block (already in layout).
- Remove the `:root { --ink-green: ... }` block inside `<style jsx global>`. KEEP the `@keyframes` defs and `.altar-*` classes.
- Rename exported function `FaithfulAltarHero` → `Hero`; `export default function Hero()`.
- Change outer `<main>` → `<section>`; drop the `${cormorant.variable} ${ebGaramond.variable}` template-literal class.
- Keep the local `Sigil` function (extracted next step).
- Imports: only `import { Button } from "@/components/ui/button";`.
- Keep all animation delays, motes, vignette, grain, frame inset, sigil paths, motto, brand, tagline, subline, positioning, form **unchanged**.

**Acceptance criteria:**
- [x] File begins with `"use client";` and uses `<section>` not `<main>`.
- [x] No `next/font/google` import.
- [x] `<style jsx global>` contains all five `@keyframes` (`altar-fade-up`, `altar-fade-scale`, `altar-stroke-draw`, `altar-rule-extend`, `altar-mote-drift`) and matching `.altar-*` classes.
- [x] All animation delays match the source.

**Notes:** Copy is locked — do not touch hero text.

---

### Step 2.2 — Stub `app/page.tsx`  [x]

**Prerequisites:** 2.1
**Outputs:** `showcase/app/page.tsx` (full rewrite)

**Implementation:**
- Server component: `import Hero from "@/components/sections/Hero"; export default function Home() { return <main><Hero /></main>; }` — ~6 lines, no `"use client"`.

**Acceptance criteria:**
- [x] `/` visually identical to `concepts/v1-faithful-altar/page.tsx`.
- [x] No console / hydration errors.
- [x] DevTools "prefers-reduced-motion: reduce" emulation: hero fully revealed, no stagger, no motes.

---

## Phase 3 — Primitives

### Step 3.0 — `useReveal` hook  [x]

**Prerequisites:** 1.3
**Outputs:** `showcase/lib/hooks/useReveal.ts` (create)

**Implementation:**
- `"use client"`. Signature per conventions block.
- Defaults: `threshold = 0.2`, `rootMargin = "0px 0px -10% 0px"`, `once = true`.
- In `useEffect`: bail if `typeof window === "undefined"`. If `matchMedia("(prefers-reduced-motion: reduce)").matches`, `setRevealed(true)` and return.
- Else attach `IntersectionObserver(entries → if intersecting, setRevealed(true), disconnect if once; if !once, setRevealed(false) on exit)`.
- Cleanup disconnects.

**Acceptance criteria:**
- [x] Compiles under strict TS.
- [x] Smoke test: attach ref to a div, scroll into view, `revealed` flips true.
- [x] Under reduced-motion emulation, `revealed` is `true` on mount.

---

### Step 3.1 — Extract `Sigil` primitive  [x]

**Prerequisites:** 2.1
**Outputs:**
- `showcase/components/primitives/Sigil.tsx` (create)
- `showcase/components/sections/Hero.tsx` (modify — replace local Sigil with import)

**Implementation:**
- `"use client"`. Props: `size = 148`, `animated = true`, `gold = "#C9A961"`, `goldWarm = "#D9BE7E"`, `strokeWidth = 1.5`, `ariaLabel = "The Altar Within sigil — quatrefoil cross"`, `className`.
- Render the SVG (viewBox `0 0 200 200`, `role="img"`, `aria-label`) with all paths/circles copied verbatim from Hero's local Sigil — swap hard-coded `stroke="#C9A961"`/`"#D9BE7E"` for props, and the literal `"altar-sigil-path"` class for `pathClass = animated ? "altar-sigil-path" : undefined`.
- When `animated={false}`, paths render in final stroked state (no dasharray/offset).
- In Hero.tsx: delete local Sigil, add `import { Sigil } from "@/components/primitives/Sigil";`.

**Acceptance criteria:**
- [x] `Hero.tsx` imports Sigil; no local definition remains.
- [x] `/` looks identical to before extraction.
- [x] `<Sigil size={28} animated={false} />` smoke-test renders a small static sigil.

---

### Step 3.2 — `GoldRule` primitive  [x]

**Prerequisites:** 1.1, 1.2, 3.0
**Outputs:** `showcase/components/primitives/GoldRule.tsx` (create)

**Implementation:**
- `"use client"`. Props: `width = "16rem"`, `opacity = 0.85`, `className`, `animate = true`.
- Render a `<div ref aria-hidden>` height 1px, given width, background `linear-gradient(to right, transparent 0%, rgba(201,169,97,${opacity}) 50%, transparent 100%)`.
- Uses `useReveal({ threshold: 0.4 })`. Transform `scaleX(0) → scaleX(1)` with `transform-origin: center`, transition `1s cubic-bezier(0.22,0.61,0.36,1)`. If `!animate`, render fully extended on mount.

**Acceptance criteria:**
- [x] Default 256px hairline; reveals from center over ~1s when in view.
- [x] `animate={false}` renders fully extended on mount.
- [x] Under reduced-motion, renders fully extended on mount (no transition).
- [x] `width="6rem"` yields ~96px rule.

---

### Step 3.3 — `ArrowGlyph` primitive  [x]

**Prerequisites:** 1.1, 1.2
**Outputs:** `showcase/components/primitives/ArrowGlyph.tsx` (create)

**Implementation:**
- Stateless inline SVG. Props: `size = 12`, `direction = "right" | "left"`, `color = "currentColor"`, `strokeWidth = 1.5`, `className`.
- 16×16 viewBox. Shaft `M2 8 H13`; head `M9 4 L13 8 L9 12`. Both paths use `strokeLinecap="round"`, `strokeLinejoin="round"`, `fill="none"`.
- `direction="left"` applies `transform: scaleX(-1)` via inline style.
- `aria-hidden="true"`; `display: inline-block; verticalAlign: middle`.

**Acceptance criteria:**
- [x] Renders 12px gold-warm arrow inside a `text-gold-warm` parent.
- [x] `direction="left"` mirrors horizontally.
- [x] `aria-hidden` set.

---

### Step 3.4 — `MottoLine` primitive  [x]

**Prerequisites:** 1.1, 1.2
**Outputs:** `showcase/components/primitives/MottoLine.tsx` (create)

**Implementation:**
- Stateless `<p>`. Props: `text = "LUX · VERITAS · FORMA"`, `size = "0.78rem"`, `className`.
- Cormorant, uppercase, letter-spacing `0.4em`, color `var(--gold-warm)`.
- Gold em-dashes (`<span style="color: var(--gold)">— </span>` … ` —</span>`) flank the text (two non-breaking spaces between dash and letters).

**Acceptance criteria:**
- [x] Renders motto in Cormorant 0.4em tracking, uppercase.
- [x] Em-dashes gold, letters gold-warm.
- [x] `size` prop varies font-size.

---

### Step 3.5 — `IlluminatedMarker` primitive  [x]

**Prerequisites:** 1.1, 1.2
**Outputs:** `showcase/components/primitives/IlluminatedMarker.tsx` (create)

**Implementation:**
- Stateless, `aria-hidden="true"`. Props: `variant = "plus" | "triplet"`, `color = "var(--gold)"`, `size = 14`, `className`.
- `"plus"`: a centered `+` character in Cormorant, font-size `size`, opacity 0.85, letter-spacing 0.2em, full-width text-align center.
- `"triplet"`: flex row of three 4×4px gold dots (`borderRadius: 50%`) with `gap: 12px`, opacity 0.7, justify-center.

**Acceptance criteria:**
- [x] `<IlluminatedMarker />` renders centered gold `+`.
- [x] `variant="triplet"` renders three centered gold dots.
- [x] `aria-hidden` set.

---

### Step 3.6 — `DropCap` primitive  [x]

**Prerequisites:** 1.1, 1.2
**Outputs:** `showcase/components/primitives/DropCap.tsx` (create)

**Implementation:**
- Stateless wrapper. Props: `children`, `className`.
- Renders `<p>` (EB Garamond 1.1rem, line-height 1.7, parchment) with a `<style jsx>` block targeting `p::first-letter`: Cormorant `var(--gold-warm)`, font-size 5rem, line-height 0.85, `float: left`, `padding-right: 0.6rem`, `padding-top: 0.4rem`, font-weight 400.

**Acceptance criteria:**
- [x] First letter renders as ~5rem Cormorant gold-warm with 3-line drop.
- [x] Text wraps cleanly around it on desktop and mobile.

**Notes:** `::first-letter` only fires when the element is the direct child paragraph — don't nest deeper inline elements at start.

---

### Step 3.7 — `SectionHeading` primitive  [x]

**Prerequisites:** 3.2
**Outputs:** `showcase/components/primitives/SectionHeading.tsx` (create)

**Implementation:**
- `"use client"`. Props: `as = "h2" | "h3"`, `size = "2.25rem"`, `tracking = "0.18em"`, `smallCaps = true`, `ruleWidth = "6rem"`, `id`, `children`, `className`.
- Vertical stack (flex column, items center, gap `1.25rem`): `<GoldRule width={ruleWidth} />`, `<Tag>` heading (Cormorant, parchment, `size`, `tracking`, uppercase when `smallCaps`, fontWeight 400, margin 0, text-align center), `<GoldRule width={ruleWidth} />`.
- Optional `id` on the wrapper.

**Acceptance criteria:**
- [x] Renders centered Cormorant heading with gold rules above/below, both center-out reveal.
- [x] `as="h3"` renders `<h3>`.
- [x] `id="pillars"` produces an anchor target.

---

### Step 3.8 — `PullQuote` primitive  [x]

**Prerequisites:** 3.2
**Outputs:** `showcase/components/primitives/PullQuote.tsx` (create)

**Implementation:**
- `"use client"`. Props: `quote`, `attribution?`, `className`.
- `<figure>` centered, margin `4rem auto`, max-width 42rem, flex column, gap `2rem`.
- Stack: `<GoldRule width="10rem" />`, `<blockquote>` (EB Garamond italic 1.5rem parchment, line-height 1.55, center) with gold-warm `&ldquo;` / `&rdquo;` flanking spans (font-size 2rem, line-height 0, slight vertical offset), optional `<figcaption>` (Cormorant 0.78rem tracking 0.28em uppercase gold-warm), `<GoldRule width="10rem" />`.

**Acceptance criteria:**
- [x] Italic EB Garamond 1.5rem parchment quote.
- [x] Gold rules above/below; both center-out reveal.
- [x] Quote marks gold-warm ~2rem.
- [x] Optional attribution in spaced-caps Cormorant gold-warm.

---

## Phase 4 — MicroSigils (B4)

### Step 4.1 — `MicroSigil` with five motifs  [x]

**Prerequisites:** 3.0, 1.1, 1.2
**Outputs:** `showcase/components/primitives/MicroSigil.tsx` (create)

**Implementation:**
- `"use client"`. Props: `motif: "vessel" | "vesica" | "vine" | "plumb-line" | "interlocking-lobes"`, `size = 36`, `gold = "#C9A961"`, `strokeWidth = 1.5`, `className`, `ariaLabel?`.
- Wrapper `<div ref>` with `useReveal({ threshold: 0.5 })`, inline-block, width/height = `size`.
- Inline `<style jsx>` defines `@keyframes micro-sigil-draw { from { stroke-dashoffset: 200 } to { stroke-dashoffset: 0 } }`; class `.micro-path { stroke-dasharray: 200; stroke-dashoffset: 200 }`; `.micro-path.revealed { animation: micro-sigil-draw 1.8s cubic-bezier(0.65,0,0.35,1) forwards }`; reduced-motion override sets `stroke-dashoffset: 0` and `animation: none`.
- SVG `viewBox="0 0 64 64"`, `role="img"`, `aria-label={ariaLabel || `${motif} sigil`}`. Every path gets `stroke={gold}`, `strokeWidth`, `strokeLinecap="round"`, `strokeLinejoin="round"`, `fill="none"`, `className="micro-path"` + ` revealed` when `revealed`.

**Motif path geometries** (worker uses these `d` strings verbatim):

- **`vessel`** — *Compassion* — downward chalice silhouette:
  - `d="M 16 22 Q 32 18 48 22"` (cup rim)
  - `d="M 16 22 Q 18 36 28 38 L 36 38 Q 46 36 48 22"` (cup body)
  - `d="M 32 38 V 50"` (stem)
  - `d="M 22 52 H 42"` (base)
- **`vesica`** — *Love* — vesica piscis / double-arc heart:
  - `d="M 32 16 A 16 18 0 0 0 32 52"` (left arc)
  - `d="M 32 16 A 16 18 0 0 1 32 52"` (right arc)
  - `<circle cx="32" cy="34" r="1" stroke={gold} fill={gold} />` (central dot)
- **`vine`** — *Resilience* — upward-branching vine:
  - `d="M 32 52 V 22"` (central stem)
  - `d="M 32 36 Q 22 34 18 24"` (left branch)
  - `d="M 32 30 Q 42 28 46 18"` (right branch)
  - `d="M 32 22 V 16"` ; `d="M 18 24 V 18"` ; `d="M 46 18 V 12"` (three tips)
- **`plumb-line`** — *Integrity* — vertical plumb-line with diamond weight:
  - `d="M 22 14 H 42"` (crossbeam)
  - `d="M 32 14 V 44"` (cord)
  - `d="M 32 44 L 38 50 L 32 56 L 26 50 Z"` (diamond weight)
- **`interlocking-lobes`** — *Partnership & Humor* — two interlocking rounded-square lobes:
  - Left lobe: `d="M 18 24 H 32 A 6 6 0 0 1 38 30 V 40 A 6 6 0 0 1 32 46 H 18 A 6 6 0 0 1 12 40 V 30 A 6 6 0 0 1 18 24 Z"`
  - Right lobe: `d="M 32 18 H 46 A 6 6 0 0 1 52 24 V 34 A 6 6 0 0 1 46 40 H 32 A 6 6 0 0 1 26 34 V 24 A 6 6 0 0 1 32 18 Z"`
  - Linking tick: `d="M 30 32 L 34 32"`

**Acceptance criteria:**
- [x] All five motifs render without warnings.
- [x] On scroll-into-view, strokes draw in over ~1.8s.
- [x] `size={64}` doubles render size proportionally.
- [x] Under reduced-motion, paths render in final state with no animation.

**Notes:** Paths are iconographic, not precision-engineered — if a motif reads visually wrong at 36px, fine-tune coordinates within the same viewBox. Keep stroke 1.5px and gold consistent.

---

## Phase 5 — Composites

### Step 5.1 — `NewsletterForm` composite  [x]

**Prerequisites:** 1.1, 1.2, 1.3
**Outputs:** `showcase/components/composites/NewsletterForm.tsx` (create)

**Implementation:**
- `"use client"`. Props: `buttonLabel = "Join the Vespers"`, `compact = false`, `className`.
- State: `email`, `error`, `submitted`. `useId()` for input id.
- On submit: validate `^[^@\s]+@[^@\s]+\.[^@\s]+$`. Invalid → set error `"a valid email, please"`. Valid → `setSubmitted(true)` (no backend per SPEC §10 #1).
- Submitted state: replace form with column `<div>` (max-width compact ? 22rem : 28rem, gap 1rem, centered) containing `<GoldRule width="6rem" animate={false} />`, italic EB Garamond 1.1rem parchment line *"Inscribed. A response will arrive in due time."*, another `<GoldRule width="6rem" animate={false} />`.
- Form: flex (row when `compact`, column when not), gap `0.5–0.75rem`, max-width as above, margin auto.
- Visually-hidden `<label htmlFor>` "Email address".
- `<input type="email" required>`: transparent bg, 1px border `rgba(201,169,97,0.35)` (or `rgba(217,190,126,0.85)` when error), parchment text, italic EB Garamond, letter-spacing 0.04em, padding `0.85rem 1rem` (or `0.6rem 0.8rem` compact), border-radius 0, no outline, placeholder "your email".
- `<button type="submit">`: transparent bg, gold-warm text, 1px gold border, Cormorant uppercase 0.32em tracking, font-size 0.78rem (or 0.7rem compact), padding `0.85rem 1.6rem` (or `0.6rem 1.2rem` compact), `boxShadow: inset 0 0 0 1px rgba(201,169,97,0.18)`, transition 350ms. Hover swaps bg → `rgba(201,169,97,0.08)` and color → parchment.
- Error message: `role="alert"`, italic EB Garamond 0.85rem gold-warm centered beneath.

**Acceptance criteria:**
- [x] Renders transparent bordered input + brass-plaque button (Cormorant 0.32em tracking, uppercase).
- [x] Empty/invalid submit → italic gold-warm *"a valid email, please"* beneath.
- [x] Valid submit → success state with the two gold rules and the inscription message.
- [x] `compact` switches to row layout with smaller padding/fonts.
- [x] `<label>` associated via `htmlFor`/`id`, visually hidden.

**Notes:** Per SPEC §10 #14 footer button stays *"Join the Vespers"* — that's the default.

---

### Step 5.2 — `PillarCard` composite (H6)  [x]

**Prerequisites:** 4.1, 3.2
**Outputs:** `showcase/components/composites/PillarCard.tsx` (create)

**Implementation:**
- `"use client"`. Props: `motif: MicroSigilMotif`, `name`, `distillation`.
- `<article>` flex column, items center, gap 0.85rem, text-align center, padding `2rem 1rem`.
- Stack: `<MicroSigil motif={motif} size={36} />`, `<h3>` (Cormorant 1.25rem, tracking 0.28em, uppercase, parchment, fw 400), `<GoldRule width="4rem" />`, `<p>` distillation (EB Garamond 1.05rem, line-height 1.6, parchment opacity 0.9, max-width 32rem).

**Acceptance criteria:**
- [x] 36px MicroSigil above Cormorant small-caps name (0.28em tracking).
- [x] 4rem gold rule beneath name; reveals center-out on scroll.
- [x] Distillation in EB Garamond 1.05rem parchment 0.9 opacity, centered.

---

### Step 5.3 — `PillarPanel` composite (A3)  [x]

**Prerequisites:** 4.1, 3.2
**Outputs:** `showcase/components/composites/PillarPanel.tsx` (create)

**Implementation:**
- `"use client"`. Props: `motif`, `name`, `body`.
- `<article>` flex column, items center, gap 1.5rem, text-align center, padding `3rem 1rem`, max-width 34rem, margin auto.
- Stack: `<MicroSigil motif={motif} size={64} />`, `<h3>` (Cormorant 2rem, tracking 0.18em, uppercase, parchment, fw 400), `<GoldRule width="5rem" />`, `<p>` body (EB Garamond 1.1rem, line-height 1.75, parchment 0.92 opacity, **text-align left** within the centered column).

**Acceptance criteria:**
- [x] 64px MicroSigil above 2rem Cormorant name (0.18em tracking).
- [x] Body paragraph 1.1rem EB Garamond, left-aligned within centered column.
- [x] Gold rule beneath name reveals center-out.

---

### Step 5.4 — `PriceCard` composite (H7)  [x]

**Prerequisites:** 3.2
**Outputs:** `showcase/components/composites/PriceCard.tsx` (create)

**Implementation:**
- `"use client"`. Props: `name`, `duration?` (some cards omit), `price` (e.g. "$120"/"Free"/"$270"/"$200"), `priceNote?` (e.g. "save $90"), `description`.
- `<article>` padded `2.5rem 1.75rem`, border `1px solid rgba(201,169,97,0.35)`, `boxShadow: inset 0 0 0 1px rgba(201,169,97,0.08)`, transparent bg, flex column items-center, text-align center, gap 1rem.
- Stack:
  - `<h3>` name (Cormorant 1.5rem parchment fw400 tracking 0.02em).
  - `<GoldRule width="3rem" />`.
  - When `duration`: spaced-caps line (Cormorant 0.78rem tracking 0.28em uppercase gold-warm).
  - `<p>` price (Cormorant 2rem gold-warm tracking 0.02em); when `priceNote`, inline `<span>` italic EB Garamond 0.9rem parchment 0.7 opacity in parentheses with `marginLeft: 0.5rem`.
  - `<p>` description (EB Garamond 1rem line-height 1.7 parchment 0.85 opacity).

**Acceptance criteria:**
- [x] Gold-bordered card with inset shadow (chapel-door inset language).
- [x] Name Cormorant 1.5rem; duration 0.78rem; price 2rem gold-warm; description 1rem.
- [x] `priceNote` renders italic parchment in parens after price.
- [x] Card renders cleanly when `duration` is omitted (3-Session Package case).

---

### Step 5.5 — `PriceNote` composite  [x]

**Prerequisites:** 1.1, 1.2
**Outputs:** `showcase/components/composites/PriceNote.tsx` (create)

**Implementation:**
- Stateless. Props: `title`, `body`.
- Centered column, max-width 32rem, gap 0.5rem.
- Stack: gold `+` ornament (Cormorant 1rem opacity 0.85, `aria-hidden`), `<h4>` (Cormorant 0.85rem tracking 0.28em uppercase gold-warm fw400), `<p>` body (EB Garamond 0.95rem line-height 1.7 parchment 0.8 opacity).

**Acceptance criteria:**
- [x] Centered note with small gold `+` above title.
- [x] Title spaced-caps Cormorant 0.85rem gold-warm.
- [x] Body EB Garamond 0.95rem parchment 0.8 opacity.

---

### Step 5.6 — `CredentialRow` composite (A4)  [x]

**Prerequisites:** 1.1, 1.2
**Outputs:** `showcase/components/composites/CredentialRow.tsx` (create)

**Implementation:**
- Stateless `<li>` (parent A4 section provides `<ol>`). Props: `numeral` (hand-set roman string), `title`, `year`, `institution`, `specialization?`.
- Two-column grid `auto 1fr`, gap 1.5rem, padding `1.5rem 0`, `borderBottom: 1px solid rgba(201,169,97,0.3)`, `list-style: none`, items aligned baseline.
- Left: `<span aria-hidden>` numeral (Cormorant 1.1rem tracking 0.28em gold-warm, min-width 2.5rem).
- Right: stacked column (gap 0.3rem) — `<h3>` title (Cormorant 1.15rem parchment fw400 tracking 0.02em), `<p>` year (EB Garamond italic 0.9rem parchment 0.65 opacity), `<p>` institution (EB Garamond 0.95rem parchment 0.85 opacity), optional `<p>` specialization (EB Garamond italic 0.9rem gold-warm).

**Acceptance criteria:**
- [x] Row shows gold-warm Cormorant roman on left and title/year/institution/optional spec stack on right.
- [x] BorderBottom gold rule at 30% opacity.
- [x] Numeral `aria-hidden`.
- [x] Specialization italic gold-warm when provided.

---

## Phase 6 — Chrome

### Step 6.1 — `useScrolled` hook  [x]

**Prerequisites:** 1.x
**Outputs:** `showcase/lib/hooks/useScrolled.ts` (create)

**Implementation:**
- `"use client"`. `useScrolled(threshold = 80): boolean`.
- `useEffect`: define `onScroll = () => setScrolled(window.scrollY > threshold)`; call once for initial, attach passive scroll listener, cleanup on unmount.

**Acceptance criteria:**
- [x] Returns false below threshold, true above.
- [x] Listener removed on unmount.

---

### Step 6.2 — `HeaderNav` chrome  [x]

**Prerequisites:** 6.1, 3.1, 5.1
**Outputs:** `showcase/components/chrome/HeaderNav.tsx` (create)

**Implementation:**
- `"use client"`. Uses `usePathname()`, `useScrolled(80)`, local `menuOpen` state.
- `<header>` sticky top zIndex 50, padding `0.9rem 1.5rem`. Transparent when not scrolled; once scrolled → bg `rgba(11,59,54,0.85)`, `backdropFilter: blur(8px)`, `borderBottom: 1px solid rgba(201,169,97,0.35)`. Transition 250ms ease.
- `<nav>` flex space-between, max-width 72rem, margin auto.
- **Brand lockup (left, links to `/`):** flex row gap 0.7rem, `aria-label="The Altar Within — home"`, contains `<Sigil size={28} animated={false} ariaLabel="" />` + `<span>` "The Altar Within" (Cormorant 1.15rem parchment tracking 0.04em).
- **Desktop links (hidden on `<sm`, flex on `sm+`):** `Home`, gold mid-dot `·`, `About`, then Newsletter brass-plaque link (`href="/#newsletter"`, transparent bg, gold-warm color, 1px gold border, padding `0.55rem 1.1rem`, Cormorant tracking 0.32em uppercase 0.65rem, inset shadow `rgba(201,169,97,0.18)`).
- Link style helper: Cormorant 0.78rem tracking 0.28em uppercase; active page color `var(--gold-warm)`, others `var(--parchment)`; transition `color 200ms ease`.
- **Mobile hamburger (visible `<sm`):** transparent button, three 22×1px gold-warm `<span>` bars stacked with gap 4px, `aria-label="Open menu"`, `aria-expanded={menuOpen}`.
- **Mobile overlay** (when `menuOpen`): full-viewport fixed, `inset: 0`, zIndex 100, bg `var(--ink-green)`, centered flex. Inset gold frame `absolute inset: 1rem; border: 1px solid rgba(201,169,97,0.18); pointer-events: none`. Close `×` button top-right (Cormorant 1.5rem gold-warm transparent). Stacked links: Home, About, Newsletter (same brass plaque style, 0.78rem). All links close menu via `onClick`.

**Acceptance criteria:**
- [x] Renders at top of every page; sticky.
- [x] Transparent above fold; once `scrollY > 80`, acquires `rgba(11,59,54,0.85)` bg, backdrop blur, and gold bottom border.
- [x] Brand lockup shows 28px static Sigil + "The Altar Within" wordmark linking to `/`.
- [x] Active page link is gold-warm; hover lifts parchment → gold-warm over 200ms.
- [x] Mobile: hamburger opens full-viewport overlay with inset gold frame; close `×` top-right.
- [x] Sigil never animates here (mounted once in layout per Step 6.4).

**Notes:** CTA links to `/#newsletter` so it scroll-anchors on Home and navigates from About.

---

### Step 6.3 — `Footer` chrome  [x]

**Prerequisites:** 3.4, 5.1, 3.2
**Outputs:** `showcase/components/chrome/Footer.tsx` (create)

**Implementation:**
- `"use client"`. Centered `<footer>` bg `var(--ink-green)`, padding `5rem 1.5rem 3rem`, flex column items-center gap 2rem, text-align center.
- Vertical order: `<GoldRule width="6rem" />` → `<MottoLine />` → `<NewsletterForm compact />` → email contact line → Latin epigram → copyright.
- Email line: EB Garamond italic 0.95rem gold-warm: *"Write directly — [email]"* where `[email]` is an `<a href="mailto:[email]">` with gold-warm text, underline, underline-offset 0.2em. Per SPEC §10 #2 the literal placeholder `[email]` is intentional so the real address can be search/replaced once supplied.
- Latin epigram: EB Garamond italic 0.85rem parchment 0.55 opacity — *"Ora et labora"* (SPEC §10 #13).
- Copyright: EB Garamond 0.75rem parchment 0.5 opacity — *"© 2026 Adrianna Naílah · The Altar Within"* (SPEC §10 #18).

**Acceptance criteria:**
- [x] Stack order: gold rule → motto → compact NewsletterForm → email line → "Ora et labora" → copyright.
- [x] Email `href="mailto:[email]"` literal placeholder.
- [x] Newsletter uses compact variant.

---

### Step 6.4 — Wire chrome into `app/layout.tsx`  [x]

**Prerequisites:** 6.2, 6.3
**Outputs:** `showcase/app/layout.tsx` (modify)

**Implementation:**
- Import `HeaderNav` and `Footer`; render `<HeaderNav />` before `{children}` and `<Footer />` after, inside `<body>`. Keep font setup from Step 1.3.

**Acceptance criteria:**
- [x] `/` and `/about` both show header on top, footer at bottom.
- [x] Navigating between routes does NOT re-mount/re-animate the header sigil.
- [x] Header sits over hero transparently above the fold.

---

## Phase 7 — Home sections

### Step 7.1 — `H4` Epigraph section  [x]

**Prerequisites:** 3.2, 3.0
**Outputs:** `showcase/components/sections/H4.tsx` (create)

**Implementation:**
- `"use client"`. `<section>` padding `8rem 1.5rem`, flex column items-center, text-align center, gap 2.5rem.
- Stack: `<GoldRule width="6rem" />`, `<blockquote>` (EB Garamond italic 1.25rem parchment 0.8 opacity, line-height 1.6, max-width 32rem) containing H4 Rumi line verbatim from `landing-page-copy.md`: *"Maybe you are searching among the branches for what only appears in the roots."*, `<p>` attribution "— Rumi" (Cormorant 0.7rem tracking 0.28em uppercase gold-warm), `<GoldRule width="6rem" />`.

**Acceptance criteria:**
- [x] Rumi line in EB Garamond italic 1.25rem parchment 0.8 opacity, max-width 32rem.
- [x] 6rem gold rules flank above/below, center-out reveal.
- [x] "— Rumi" in spaced-caps Cormorant 0.7rem gold-warm.

---

### Step 7.2 — `H5` Teaser Intro section  [x]

**Prerequisites:** 3.3, 3.0
**Outputs:** `showcase/components/sections/H5.tsx` (create)

**Implementation:**
- `"use client"`. `<section>` padding `5rem 1.5rem`, flex column items-center center-aligned, gap 2rem.
- Stack: `<p>` H5 copy verbatim from `landing-page-copy.md` (EB Garamond 1.1rem line-height 1.75 parchment 0.92 opacity max-width 36rem) — *"I facilitate and assist beings from all walks of faith in demystifying psychospiritual psychology and guiding their journey toward integration through neuroscience and embodied awareness."*; then `<Link href="/about">` styled as spaced-caps Cormorant 0.78rem tracking 0.28em uppercase gold-warm inline-flex gap 0.6rem, containing "Read full bio" + `<ArrowGlyph size={12} />`.

**Acceptance criteria:**
- [x] Paragraph max-width 36rem, EB Garamond 1.1rem.
- [x] Link "Read full bio →" routes to `/about`.

---

### Step 7.3 — `H6` Pillars condensed section  [x]

**Prerequisites:** 3.7, 5.2, 3.3
**Outputs:** `showcase/components/sections/H6.tsx` (create)

**Implementation:**
- `"use client"`. `<section>` padding `6rem 1.5rem`, flex column items-center gap 3rem.
- `<SectionHeading size="2.25rem">The Pillars of My Practice</SectionHeading>`.
- Five stacked `<PillarCard>` (single centered column, max-width 40rem) — order and motif mapping:

```ts
const pillars = [
  { motif: "vessel",             name: "Compassion" },
  { motif: "vesica",             name: "Love" },
  { motif: "vine",               name: "Resilience" },
  { motif: "plumb-line",         name: "Integrity" },
  { motif: "interlocking-lobes", name: "Partnership & Humor" },
];
```

Distillation copy: H6 distillations verbatim from `landing-page-copy.md`.
- Trailing `<Link href="/about#pillars">` spaced-caps Cormorant gold-warm with `<ArrowGlyph />`: "Read more about each pillar".

**Acceptance criteria:**
- [x] SectionHeading flanked by gold rules.
- [x] 5 stacked PillarCards at max-width 40rem in the order above.
- [x] Trailing link routes to `/about#pillars`.

---

### Step 7.4 — `H7` Service Fees section  [x]

**Prerequisites:** 3.7, 5.4, 5.5
**Outputs:** `showcase/components/sections/H7.tsx` (create)

**Implementation:**
- `"use client"`. `<section id="services">` padding `6rem 1.5rem`, flex column items-center gap 3.5rem.
- `<SectionHeading size="2.25rem">Services &amp; Offerings</SectionHeading>` (per SPEC §10 #10).
- Grid: `grid grid-cols-1 md:grid-cols-2 gap-6`, max-width 52rem, 4 `<PriceCard>` from data.
- Below, stack of 2 `<PriceNote>` with gap 2.5rem.

**Service data (verbatim from copy):**

```ts
const services = [
  { name: "Introductory Meeting",       duration: "30 minutes",    price: "Free",
    description: "This introductory call is a space for us to connect and see if we're the right fit for each other. It's a chance for you to share your vision and for me to offer a glimpse of how I work. No pressure — just an open conversation to explore whether we can co-create a journey together." },
  { name: "1:1 Psychotherapy Session",  duration: "60–90 minutes", price: "$120",
    description: "In these personalized sessions, we dive deeply into your unique needs. Using a blend of science, spirituality, and practical tools, we work together on what matters most to you — your values and your intention for Beyond Therapy." },
  { name: "3-Session Package",          price: "$270", priceNote: "save $90",
    description: "This package allows us to build momentum and consistency in your healing journey. The same depth as individual sessions at a discounted rate, supporting your commitment to ongoing growth, exploration, integration, and transformation." },
  { name: "Psychotherapy with Coaching", duration: "60–90 minutes", price: "$200",
    description: "These sessions combine psychotherapy with a coaching framework for a holistic, action-oriented approach. Ideal for those entering the realm of Conscious Leadership Coaching — empowering creative executives, professionals, and entrepreneurs to harness both self-leadership and collective leadership capacities, with a focus on fostering clarity, optimizing flow, and creating expansive impact." },
];

const notes = [
  { title: "Insurance",            body: "If you have insurance, we'll apply your deductible and the final payment for sessions will be $65." },
  { title: "Financial Flexibility", body: "Sliding-scale options are available — write directly to inquire." }, // SPEC §10 #5
];
```

**Acceptance criteria:**
- [x] Heading "Services & Offerings" flanked by gold rules.
- [x] 4 PriceCards in 2-col grid on `md:`, single column on mobile.
- [x] 3-Session Package has no duration line, shows "save $90" italic in parens after price.
- [x] Two PriceNotes (Insurance, Financial Flexibility) below grid.
- [x] Section has `id="services"`.

---

### Step 7.5 — `H8` Primary CTA section  [x]

**Prerequisites:** 3.2, 5.1
**Outputs:** `showcase/components/sections/H8.tsx` (create)

**Implementation:**
- `"use client"`. `<section id="newsletter">` padding `10rem 1.5rem`, flex column items-center text-center gap 2rem.
- Stack: `<GoldRule width="6rem" />`, `<h2>` "Stay close to the work." (Cormorant 3rem parchment fw400 tracking 0.01em line-height 1.1), `<p>` supporting line "Join the newsletter for reflections, practices, and announcements from Adrianna." (EB Garamond 1.1rem line-height 1.7 parchment 0.85 opacity max-width 36rem), `<NewsletterForm />` (default scale, "Join the Vespers" button), `<p>` italic fallback "Prefer to write directly? [email]" with `mailto:[email]` link (gold-warm underline-offset 0.2em).

**Acceptance criteria:**
- [x] `id="newsletter"` anchor present.
- [x] Headline Cormorant 3rem parchment.
- [x] Valid submit shows success state inline.
- [x] Fallback `mailto:[email]` literal placeholder.

---

## Phase 8 — About sections + page

### Step 8.1 — `A1` page heading section  [x]

**Prerequisites:** 3.2
**Outputs:** `showcase/components/sections/A1.tsx` (create)

**Implementation:**
- `"use client"`. `<section>` padding `8rem 1.5rem 6rem`, flex column items-center text-center gap 2.5rem.
- `<h1>` "About Adrianna Naílah" — Cormorant fw300 letter-spacing 0.01em line-height 1.1, `fontSize: clamp(2.5rem, 6vw, 4rem)`.
- `<GoldRule width="8rem" />` beneath.

**Acceptance criteria:**
- [x] Semantic `<h1>`.
- [x] Scales from ~2.5rem (mobile) to ~4rem (desktop) via clamp.
- [x] 8rem gold rule beneath reveals center-out.

---

### Step 8.2 — `A2` Her Story section  [x]

**Prerequisites:** 3.7, 3.6, 3.8, 3.5
**Outputs:** `showcase/components/sections/A2.tsx` (create)

**Implementation:**
- `"use client"`. `<section>` padding `5rem 1.5rem`, flex column items-center gap 3rem.
- `<SectionHeading size="1.75rem">Her Story</SectionHeading>`.
- Reading column max-width 34rem containing `<DropCap>` wrapping para 1 (first letter "A"), then `<p>` (EB Garamond 1.1rem line-height 1.75 parchment, marginTop 1.5rem) for para 2.
- `<PullQuote quote="..." attribution="Tk. T 5,53" />` (attribution per SPEC §10 #6).
- Another 34rem column with `<p>` para 3 (EB Garamond 1.1rem).
- `<IlluminatedMarker variant="plus" />` closing.

**Copy** — paragraphs 1–3, pull-quote, and attribution verbatim from A2 in `landing-page-copy.md`:
- **Para 1** opens with letter "A": *"Adrianna Naílah's journey is one of profound transformation and deep challenges — from finding resilience amid soul wounds, chaos, and early fragmentation, to rediscovering her ancient original faith and shaping her purpose through the adversities she endured since childhood and adolescence. At her core, she is a Transpersonal and Integration Psychotherapist, deeply committed to demystifying the complexities of trauma and internal systems."*
- **Para 2:** *"Born in the High Andes of Peru but raised across different parts of the world, Adrianna earned her degree in Clinical Psychology in the U.S. and an MSc in Transpersonal Psychology, Spirituality & Consciousness in the U.K., specializing in the Neuroscience of Emotions. Her early childhood and adolescence were marked by extended and repetitive complex trauma — including domestic violence, emotional and physical abuse, and sexual abuse from a very young age — which she felt fractured her true identity and filtered her understanding of the world, humanity, and suffering."*
- **Pull-quote:** *"To be loved but not seen is comforting but superficial; not to be known and not loved is our greatest fear. To be fully known and truly loved is to be loved by the Almighty."* — attribution `Tk. T 5,53`.
- **Para 3:** *"These experiences not only shaped her professionally through sensitivity, empathy, and compassion, but fueled her personal quest to understand the deeper intersections of the mind, behavior, psyche, and spirit."*

**Acceptance criteria:**
- [x] "Her Story" heading flanked by gold rules.
- [x] Para 1 has gold-warm Cormorant drop-cap on "A".
- [x] PullQuote shows attribution `Tk. T 5,53`.
- [x] Closing `+` marker after para 3.
- [x] Reading column max-width 34rem.

---

### Step 8.3 — `A3` Her Practice section  [x]

**Prerequisites:** 3.7, 5.3, 3.5
**Outputs:** `showcase/components/sections/A3.tsx` (create)

**Implementation:**
- `"use client"`. `<section>` padding `5rem 1.5rem`, flex column items-center gap 3rem.
- `<SectionHeading size="1.75rem">Her Practice</SectionHeading>`.
- Render all A3 professional paragraphs from `landing-page-copy.md` verbatim, in a 34rem reading column (EB Garamond 1.1rem line-height 1.75 parchment, gap 1.5rem between). Insert `<IlluminatedMarker variant="plus" />` after every second paragraph (after indices 1, 3, 5 if 7 paragraphs). No drop-cap, no pull-quote (per SPEC §10 #17).
- Anchor `<div id="pillars" style={{ marginTop: "4rem" }} />`.
- `<SectionHeading as="h3" size="2.5rem">The Pillars and Values of My Service</SectionHeading>`.
- Intro paragraph (centered, EB Garamond 1.1rem max-width 34rem), copy verbatim from A3 sub-block intro in `landing-page-copy.md` — names the five pillars: Compassion, Love, Resilience, Integrity, Partnership.
- Five `<PillarPanel>` stacked with `gap: 6rem`. Use the same motif mapping as H6 (vessel/vesica/vine/plumb-line/interlocking-lobes). Each `body` is the full paragraph verbatim from `landing-page-copy.md` A3 sub-block.
- `<IlluminatedMarker variant="plus" />`.
- Closing summary paragraph (centered, EB Garamond 1.1rem max-width 34rem), verbatim from A3 closing in `landing-page-copy.md`.

**Acceptance criteria:**
- [x] "Her Practice" heading flanked by gold rules.
- [x] All A3 professional paragraphs rendered in order, with `+` markers after every second paragraph (no dangling marker at end).
- [x] No pull-quote in A3.
- [x] Sub-heading `<h3 id="pillars">` "The Pillars and Values of My Service".
- [x] Five PillarPanels with ≥6rem gap, motif order matches H6.
- [x] Closing summary paragraph below the final marker.

**Notes:** SPEC §4.3 mentions "six paragraphs" but the copy file may list 7 blocks — render whatever count is actually in `landing-page-copy.md`; adjust the marker modulo to avoid a trailing marker.

---

### Step 8.4 — `A4` Credentials section  [x]

**Prerequisites:** 3.7, 5.6
**Outputs:** `showcase/components/sections/A4.tsx` (create)

**Implementation:**
- `"use client"`. `<section>` padding `5rem 1.5rem`, flex column items-center gap 3rem.
- `<SectionHeading size="1.75rem">Credentials</SectionHeading>`.
- Below: centered column with `<p>` "Certificate Number — #241254106" (Cormorant 0.78rem tracking 0.28em uppercase gold-warm), then `<GoldRule width="6rem" />`.
- `<ol style="list-style:none; padding:0; margin:0; max-width:40rem; text-align:left">` with 9 `<CredentialRow>`:

```ts
const credentials = [
  { numeral: "I",    title: "Bachelor's in Psychology",                                       year: "2008–2012",   institution: "The Catholic University of America, Washington, D.C., USA" },
  { numeral: "II",   title: "Master's in Neuropsychology",                                    year: "2012–2014",   institution: "The Catholic University of America, Washington, D.C., USA" },
  { numeral: "III",  title: "MSc in Transpersonal Psychology, Spirituality & Consciousness",  year: "2014–2016",   institution: "Liverpool John Moores University, UK", specialization: "Specialization in the Neuroscience of Emotions and Trauma" },
  { numeral: "IV",   title: "Certified Internal Family Systems (IFS) Practitioner",           year: "2017",        institution: "IFS Institute" },
  { numeral: "V",    title: "Certified in Contextual Therapies — CBT, DBT, ACT",              year: "2017–2023",   institution: "Beck Institute for Cognitive Behavioral Therapy" },
  { numeral: "VI",   title: "Accredited Psychedelic-Assisted Psychotherapist",                year: "2018",        institution: "Multidisciplinary Association for Psychedelic Studies (MAPS)" },
  { numeral: "VII",  title: "Transformational Recovery Coach",                                year: "2019",        institution: "Being True To You (BTTY)" },
  { numeral: "VIII", title: "Certified Mindfulness Instructor",                               year: "2020",        institution: "Centre for Mindfulness Research and Practice, University of Galway" },
  { numeral: "IX",   title: "Somatic Experiencing Training — Trauma Reconsolidation",          year: "2021–Present", institution: "Somatic Experiencing International" },
];
```

Per SPEC §9, the rendered DBT row (V) does NOT include the "(verify DBT certifying body…)" annotation.

**Acceptance criteria:**
- [x] Heading flanked by gold rules.
- [x] "Certificate Number — #241254106" in spaced-caps gold-warm with 6rem rule beneath.
- [x] `<ol list-style:none>` with 9 rows in the order above.
- [x] Only row III shows specialization.
- [x] Max column width 40rem, rows left-aligned within centered column.

---

### Step 8.5 — `A5` Secondary CTA section  [x]

**Prerequisites:** 3.2, 3.3
**Outputs:** `showcase/components/sections/A5.tsx` (create)

**Implementation:**
- `"use client"`. `<section>` padding `8rem 1.5rem`, flex column items-center text-center gap 2.5rem.
- Stack: `<GoldRule width="6rem" />`, `<p>` closing line (EB Garamond 1.15rem line-height 1.7 parchment 0.92 opacity max-width 36rem) — A5 copy verbatim from `landing-page-copy.md`: *"Continue the conversation — return to Home, book a free intro call, or join the newsletter."*; then a flex-wrap row of three links separated by gold mid-dots (`·`):
  - `<Link href="/">` with `<ArrowGlyph direction="left" />` + "Return Home"
  - `<Link href="/#services">` "Free Intro Call"
  - `<Link href="/#newsletter">` "Join the Newsletter"

All links spaced-caps Cormorant 0.78rem tracking 0.28em uppercase gold-warm inline-flex gap 0.5rem.

**Acceptance criteria:**
- [x] GoldRule above closing line.
- [x] Closing line max-width 36rem EB Garamond 1.15rem parchment 0.92.
- [x] Three links with gold mid-dot separators, all gold-warm spaced-caps Cormorant.
- [x] "Return Home" precedes label with left-arrow.
- [x] Routes: `/`, `/#services`, `/#newsletter`.

---

### Step 8.6 — `app/about/page.tsx`  [x]

**Prerequisites:** 8.1–8.5
**Outputs:** `showcase/app/about/page.tsx` (create), `showcase/app/about/` (create dir)

**Implementation:**
- Server component. Render `<main><A1 /><A2 /><A3 /><A4 /><A5 /></main>` with each imported from `@/components/sections/<Name>`.

**Acceptance criteria:**
- [x] `/about` renders all 5 sections in order.
- [x] `#pillars` anchor lands inside A3.
- [x] Header and footer chrome wrap the page via root layout.

---

## Phase 9 — Page assembly

### Step 9.1 — Wire Home page  [x]

**Prerequisites:** 2.1, 7.1–7.5
**Outputs:** `showcase/app/page.tsx` (modify)

**Implementation:**
- Replace Step 2.2 stub: render `<main><Hero /><H4 /><H5 /><H6 /><H7 /><H8 /></main>`, each imported from `@/components/sections/<Name>`.

**Acceptance criteria:**
- [x] `/` renders Hero → H4 → H5 → H6 → H7 → H8 with header/footer.
- [x] `#newsletter` anchor works.
- [x] `#services` anchor works.

---

### Step 9.2 — Verify About anchors  [x]

**Prerequisites:** 8.6, 6.4, 9.1
**Outputs:** none (verification)

**Implementation:** Manually test:
1. H6 "Read more about each pillar →" → `/about#pillars` scrolls to Pillars sub-block.
2. A5 "← Return Home" → `/`.
3. A5 "Free Intro Call" → `/#services` (H7).
4. A5 "Join the Newsletter" → `/#newsletter` (H8).
5. Header Newsletter button → `/#newsletter`.

**Acceptance criteria:**
- [x] All five tests pass; anchor scroll lands the target near top of viewport (~80px offset acceptable for sticky header).

---

## Phase 10 — Route transitions

### Step 10.1 — `app/template.tsx` with Framer Motion cross-fade  [x]

**Prerequisites:** 1.4, 6.4, 9.1, 8.6
**Outputs:** `showcase/app/template.tsx` (create)

**Implementation:**
- `"use client"`. Wrap `{children}` in `<motion.div key={pathname} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduce ? undefined : { opacity: 0 }} transition={{ opacity: { duration: 0.36, ease: "easeIn" } }}>`. Uses `usePathname()` and `useReducedMotion()`.
- Header and footer live in `layout.tsx` (persistent) so header sigil stays mounted across routes — satisfies SPEC §10 #15.

**Acceptance criteria:**
- [x] `/` ↔ `/about` shows new page fading in over ~360ms.
- [x] Header sigil does NOT re-animate.
- [x] Under reduced-motion, pages swap instantly.

**Notes / gotchas:** Next.js App Router does not auto-mount `AnimatePresence` for `template.tsx` exits — current behavior is "fade-in on entry, instant exit". If true cross-fade required, wrap in `<AnimatePresence mode="wait">` (defer as Step 10.2).

The hero's CSS `animation-delay` will re-fire on re-mount when navigating back to `/`. SPEC §10 #15 forbids replay — if it occurs, gate the hero stagger behind `sessionStorage.alterHeroSeen`: on first mount set the flag and apply `altar-*` classes; on subsequent mounts render hero in final state.

---

## Phase 11 — Polish & QA

### Step 11.1 — Reduced-motion sweep  [x]

**Prerequisites:** all prior
**Outputs:** none (verification)

**Implementation:**
DevTools → Rendering → "prefers-reduced-motion: reduce". Reload `/` and `/about`. Verify:
- Hero fully revealed (no stagger, no stroke draw, no motes).
- GoldRules fully extended on first paint.
- MicroSigils final-state, no draw-in.
- `useReveal` content visible on mount, no fade-up.
- Route transitions instant.
- HeaderNav scrim transition on scroll is still acceptable (state change, not motion-for-motion's-sake).

**Acceptance criteria:**
- [x] All bullets verified; no console errors.

---

### Step 11.2 — Focus rings  [x]

**Prerequisites:** all prior
**Outputs:** none (verification + targeted fixes)

**Implementation:**
- Tab through `/` and `/about`. Every interactive element must show 2px gold @ 0.6 opacity focus ring.
- If any element shows no ring, add `:focus-visible` outline override (e.g. `focus-visible:outline-2 focus-visible:outline-[rgba(201,169,97,0.6)] focus-visible:outline-offset-2`).

**Acceptance criteria:**
- [x] All interactive elements show gold focus ring.
- [x] No element has `outline: none` without replacement.

---

### Step 11.3 — Responsive sweep  [x]

**Prerequisites:** all prior
**Outputs:** none (verification + targeted fixes)

**Implementation:**
Resize to 360, 640, 768, 1024, 1440px. At each verify:
- Hero inset frame: `inset-4` mobile, `inset-10` md+ (reduce from `inset-6` if cramped).
- H6 pillar column: single column at all sizes.
- H7 PriceCards: 1-col mobile, 2-col `md:`.
- H8 form: full-width on mobile.
- A4 credentials: numerals stay left; content wraps below if narrow without overlapping numeral column.
- Header: hamburger `<640px`, links `≥640px`; mobile overlay fills viewport.
- Footer NewsletterForm: compact row layout fits at 360px (no awkward wrap).
- Min ~6rem spacing between major sections on mobile (SPEC §8).

**Acceptance criteria:**
- [x] All breakpoints checked; no horizontal scroll; no text overflow; ≥6rem section spacing at 360px.

---

### Step 11.4 — Color-contrast spot-check  [x]

**Prerequisites:** all prior
**Outputs:** none (verification)

**Implementation:**
Reference ratios on ink-green bg:
- Parchment ≈ 12.4:1 (AA/AAA all sizes).
- Gold ≈ 5.6:1 (AA large only; never use for body).
- Gold-warm ≈ 7.0:1 (AA large; restricted to display + italic sublines + spaced-caps small lines per SPEC §7).

Manually inspect H5/footer-email/A5 links (gold-warm spaced-caps 0.78rem — acceptable decorative). If any body paragraph is rendered in gold/gold-warm, fix to parchment.

**Acceptance criteria:**
- [x] No body paragraph text uses gold or gold-warm.
- [x] Paragraph copy uses parchment (≥0.7 opacity).

---

### Step 11.5 — Lighthouse sanity check  [x]

**Prerequisites:** all prior
**Outputs:** none (informational)

**Implementation:**
- `npm run build && npm run start`. Run Lighthouse mobile profile on `/` and `/about` in incognito.
- Rough targets: Perf ≥85, A11y ≥95, Best Practices ≥90, SEO ≥90.

**Acceptance criteria:**
- [x] No critical a11y errors.
- [x] No console errors in prod mode.
- [x] Build succeeds with no TypeScript errors.

---

## End

All steps complete. The site should now match the SPEC: a two-page liturgical landing site for Adrianna Naílah with the Faithful Altar hero locked verbatim, expanded into a full procession down to the newsletter CTA, plus a depth-chamber About page that wraps with a tri-link closing stack.
