# styling — design language and tokens

## What
- **Palette**: ink-green (#0B3B36) page background, gold (#C9A961) primary accent, warm-gold (#D9BE7E) secondary, parchment (#F3EEDA) text, shadow (#061F1C) darkest depth.
- **Fonts**: Cormorant Garamond (300–600 weights, display/headings); EB Garamond (400–500, body/global default). Both loaded as CSS custom properties and Tailwind font families.
- **Motion**: gold focus ring (2px, rgba), animated reveals (sigil draw-on, fade-in on scroll), reduced-motion disables all animations and transitions.
- **Keyframes**: altar-sigil-draw (stroke-dashoffset animation), altar-sigil-star-in (scale/fade for sigil center), altar-reveal/altar-rule (fade/transform, scroll-triggered).
- **System**: tokens declared in CSS first, then aliased in Tailwind; both files define the same colors under different names for different use contexts.

## Where
`showcase/app/globals.css` — CSS custom properties (:root), base HTML/body styles, all keyframe definitions (altar-sigil-draw, altar-sigil-star-in), prefers-reduced-motion override block, focus ring styling.

`showcase/tailwind.config.ts` — Tailwind extend colors (ink-green, gold, gold-warm, parchment, shadow-ink) and font families (display, body) aliased to CSS variables.

`showcase/app/layout.tsx` — Google Fonts config (Cormorant_Garamond, EB_Garamond with weights/styles), variable names (--font-cormorant, --font-eb-garamond) injected into html element.

`showcase/lib/utils.ts` — cn() utility for conditional className merging.

## How
- Tokens are duplicated: CSS custom properties live in :root, Tailwind aliases in config. Rename or update color value in both files. --shadow (CSS) and shadow-ink (Tailwind) refer to same color (#061F1C).
- Codebase convention is inline `style={{color:"var(--token)"}}` for semantic colors, not Tailwind utility classes (e.g., text-gold); match the surrounding component's existing pattern to stay consistent.
- Every motion class used in components (altar-reveal, altar-sigil-reveal, altar-rule, altar-mote, altar-sigil-path, altar-sigil-trace, altar-sigil-star) must be listed in the prefers-reduced-motion block at the end of globals.css; omission breaks accessibility.
- Focus ring is hardcoded gold rgba in :focus-visible with !important; do not move to Tailwind utilities (the !important is intentional to override component specificity and ensure visibility).
- Animation timings and stroke-dash values on sigil paths are set inline via React style props, not CSS classes; keyframes in globals.css are reusable skeletons only.
