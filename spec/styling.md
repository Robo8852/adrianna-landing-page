# styling

> **What this covers:** The visual design language — color palette (gold/parchment on ink-green), the two-serif typographic system, theme tokens (CSS variables + Tailwind theme), and the `cn()` class-merge helper.

## What
- A dark, ceremonial brand palette: deep **ink-green** background with **parchment** (warm off-white) text and **gold** accents. The product is "The Altar Within" — a transpersonal psychotherapy site, so the language is muted, warm, and serif-forward.
- Typography is a **two-serif system**: a **display** serif (Cormorant Garamond) for headings and a **body** serif (EB Garamond) for running text. Both are loaded as Google fonts in `app/layout.tsx` and exposed as CSS variables.
- Tokens are defined in **two parallel places** that must be kept in sync: raw CSS custom properties in `globals.css` (`:root`) and the Tailwind `theme.extend` in `tailwind.config.ts`. In practice the codebase leans heavily on **inline `style={{ color: "var(--parchment)" }}`** using the CSS vars rather than Tailwind color classes.

## Where
- `showcase/app/globals.css` — Tailwind directives, the `:root` CSS custom properties (color tokens), global `html/body` base styles, focus-visible ring, and the brand sigil draw-on `@keyframes` / reduced-motion rules.
- `showcase/tailwind.config.ts` — Tailwind theme: the same colors re-declared as Tailwind color utilities + the `display` / `body` `fontFamily` aliases.
- `showcase/app/layout.tsx` — loads the two Google fonts (`Cormorant_Garamond`, `EB_Garamond`) and binds them to CSS variables on `<html>`.
- `showcase/lib/utils.ts` — the `cn()` helper (clsx + tailwind-merge).
- `showcase/postcss.config.mjs` — PostCSS pipeline (tailwindcss + autoprefixer). Reference only; build/tooling spec owns this.

## How

### Color tokens
Two sources, **same hex values**, keep them in sync. The CSS-var name and the Tailwind name differ in one case (note `--shadow` vs `shadow-ink`).

| Meaning | CSS variable (`globals.css` `:root`) | Tailwind name (`tailwind.config.ts`) | Hex |
|---|---|---|---|
| Primary background / brand dark green | `--ink-green` | `ink-green` | `#0B3B36` |
| Primary gold accent | `--gold` | `gold` | `#C9A961` |
| Warm/lighter gold (hover, highlights) | `--gold-warm` | `gold-warm` | `#D9BE7E` |
| Warm off-white text on dark | `--parchment` | `parchment` | `#F3EEDA` |
| Deepest shadow ink | `--shadow` (CSS) / `shadow-ink` (Tailwind) | `shadow-ink` | `#061F1C` |

Global defaults applied to `html, body` in `globals.css`: `background-color: var(--ink-green)`, `color: var(--parchment)`, `font-family: var(--font-eb-garamond), Georgia, serif`. So the page is ink-green/parchment by default and you only override per element.

`:focus-visible` draws a gold ring: `outline: 2px solid rgba(201, 169, 97, 0.6)` (that rgba is `--gold` at 60%) with `outline-offset: 2px`, both `!important`.

### Font tokens
Loaded in `app/layout.tsx` via `next/font/google` and attached to `<html className={cormorant.variable + " " + ebGaramond.variable}>`:

| CSS variable | Font | Role | Weights | Notes |
|---|---|---|---|---|
| `--font-cormorant` | Cormorant Garamond | **display** serif (headings) | 300, 400, 500, 600 | `display: "swap"` |
| `--font-eb-garamond` | EB Garamond | **body** serif (running text, the global default) | 400, 500 | normal + italic styles; `display: "swap"` |

Tailwind aliases (`tailwind.config.ts` → `fontFamily`):
- `font-display` → `["var(--font-cormorant)", "Georgia", "serif"]`
- `font-body` → `["var(--font-eb-garamond)", "Georgia", "serif"]`

Both fall back to `Georgia, serif`. The body font is also the document default via the `html, body` rule in `globals.css`, so you only need `font-display` (or the var) for headings.

### Tailwind classes vs inline CSS vars — the real convention
- This codebase **frequently uses inline styles with the CSS vars**, e.g. `style={{ color: "var(--parchment)" }}`, `style={{ backgroundColor: "var(--ink-green)" }}`, `style={{ borderColor: "var(--gold)" }}`. This is intentional and common — match it when editing existing components.
- Tailwind color utilities (`text-parchment`, `bg-ink-green`, `text-gold`, `bg-shadow-ink`, …) also exist because the colors are in `theme.extend.colors`. Either approach is valid; prefer matching the surrounding file.
- For fonts, use the Tailwind alias classes `font-display` / `font-body`, or the raw var in an inline style.

### Adding a new token
A token must be added in **both** places to be usable both ways:
1. Add the CSS custom property to `:root` in `showcase/app/globals.css` (e.g. `--gold-deep: #...;`).
2. Add the matching entry under `theme.extend.colors` in `showcase/tailwind.config.ts` (e.g. `"gold-deep": "#..."`) so a `text-gold-deep` / `bg-gold-deep` utility is generated.
- Keep the names aligned. The existing `--shadow` (CSS) vs `shadow-ink` (Tailwind) mismatch is a gotcha — when you reference the shadow color inline write `var(--shadow)`, but the Tailwind class is `shadow-ink`.

### `cn()` helper
`showcase/lib/utils.ts`:
```ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
- `clsx` resolves conditional/array/object class inputs; `tailwind-merge` then dedupes conflicting Tailwind utilities (last-wins, e.g. `cn("p-2", cond && "p-4")` → `p-4`).
- Use it anywhere you compose class strings, especially when a base class can be overridden by a `className` prop: `className={cn("text-parchment", className)}`.
- Import: `import { cn } from "@/lib/utils";`.

### Animation / motion tokens (in globals.css)
- `@keyframes altar-sigil-draw` + `.altar-sigil-trace` drive the brand sigil "draw-on" (animates `stroke-dashoffset` to `0`; per-stroke dash length/delay/duration are set inline by the Sigil component). Timing function `cubic-bezier(0.65, 0, 0.35, 1)`, fill `forwards`.
- A `@media (prefers-reduced-motion: reduce)` block neutralizes motion: kills durations, forces `.altar-reveal` / `.altar-sigil-reveal` / `.altar-rule` to their resting state, snaps `.altar-sigil-path` / `.altar-sigil-trace` to `stroke-dashoffset: 0`, and hides `.altar-mote`. Any new entrance/motion class should add itself here.

### Gotchas
- Tokens live in two files — editing only `globals.css` or only `tailwind.config.ts` leaves the other half broken.
- `--shadow` (CSS var) ≠ `shadow-ink` (Tailwind class) — same color, different name.
- Body text color/font come from the global `html, body` rule, not from a wrapper component; overriding `color`/`font-family` at the root would cascade everywhere.
- Inline `var(...)` styles bypass tailwind-merge, so `cn()` can't dedupe them — don't mix an inline color override and a Tailwind color class on the same element expecting one to win.
