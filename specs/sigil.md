# sigil — brand mark pipeline (SHIPPED, two loose ends)

Last updated: 2026-08-21. Source of truth for the mark; supersedes anything in
old chat logs.

## What shipped (hero is live with this)

`components/sections/Hero.tsx` renders `<SigilEntrance size={200} />`:
the OLD 51-stroke centerline draw-on (`SigilDraw`) plays in full — star first,
strokes ink outward — then crossfades into the clean outline artwork
(`SigilMark`). Entrance = old behaviour, resting state = corrected artwork.

## File map (components/primitives/)

- `SigilEntrance.tsx` — production component. Crossfade skeleton→mark;
  skeleton layer UNMOUNTS at fade end; honors prefers-reduced-motion.
- `sigilMarkPaths.ts` — SINGLE SOURCE OF TRUTH for mark geometry.
  7 compound paths, 17 rings, ABSOLUTE coords (rewritten from relative —
  don't regenerate from the Downloads SVG without re-applying the fixes below).
  `MARK_VIEWBOX = "9.539 54.089 87.822 87.822"` is MEASURED (getBBox both
  marks, skeleton stroke half-width 9.5 included, fill fraction 0.9963) — not
  eyeballed. Derivation comment in SigilMark.tsx.
- `SigilMark.tsx` — static clean mark, imports from sigilMarkPaths.
- `SigilDraw.tsx` — old skeleton trace. KEEP: SigilEntrance depends on it.
- `SigilGrow.tsx` — flubber grow-from-star morph. LOSING OPTION, unused by
  hero. Retire + `npm rm flubber` when confirmed. (types/flubber.d.ts too.)
- `Sigil*.bak.tsx` ×6 — pre-existing graveyard, untouched, ~110KB.

## Three artwork defects found & fixed (source SVG in ~/Downloads was flawed)

1. Source viewBox "4 55.1 99 86" clipped right/lower arms AND was non-square
   (letterbox scale error when drawn into square) → replaced with measured box.
2. Top-right teardrop rendered SOLID: its hole ring EXISTED but was parented
   to the bottom-right ornament's path — evenodd only punches holes within the
   same path, so it drew as an invisible same-color filled leaf. Moved ring
   from path 1 → path 6 (centroid-verified 65.9,84.3).
3. Center star was a wobbly raster trace, 13.5×16.8 (asymmetric!). Replaced
   with the OLD SigilDraw parametric star rescaled ×0.087822: r=7.026,
   Q-ctrl=1.862, centered on MARK_CENTER (53.45, 98.0). Perfect 14.1 square.
   Bonus: crossfade star region is now mathematically invisible.

## Loose end 1 — OWNER'S TUNED VALUES NEVER CAPTURED

Hero ships PLACEHOLDERS: fadeAt=3.15, fadeDur=1.0. Leo tuned real values in
/sigil-lab but they lived only in his browser tab. ASK for the "fade at" /
"fade dur" numbers and set them in Hero's <SigilEntrance>. (Old draw-on
finishes ~3.55s: last stroke delay 3.0 + dur 0.55.)

## Loose end 2 — cleanup pending Leo's confirmation

Retire SigilGrow + flubber + types/flubber.d.ts. /sigil-lab stays (unlinked
sandbox: HANDOFF/GROW/STATIC modes, registration + fade sliders).

## Landmines

- A PARALLEL Claude session wrote SigilGrow/sigilMarkPaths on Aug 18. If any
  other session touches these files, tell it coords are now ABSOLUTE and the
  star/teardrop fixes exist, or it may resurrect the defects.
- rAF is frozen in occluded/automation tabs (visibility:hidden) — animations
  "stuck at first frame" in headless checks are the tab, not the code.
- getBBox() ignores stroke width — the 9.5 correction matters if re-deriving.
