# v1 — Faithful Altar

Aesthetic: a consecrated object. Hero reads like a chapel-door panel or
illuminated frontispiece, not a wellness site. Liturgical restraint over editorial cleverness.

## Palette logic
- `--ink-green #0B3B36` is the dominant ground (monastery green / Coptic icon panel).
- `--gold #C9A961` is the load-bearing accent: sigil strokes, frame inset, divider, button border.
- `--gold-warm #D9BE7E` is reserved for highlights — inner glyph marks, motto, italic subline, motes.
- `--parchment #F3EEDA` carries the brand title and tagline; warm cream, never pure white.
- `--shadow #061F1C` powers the vignette so edges drop into deeper green.

## Typography
- Cormorant Garamond for the title and motto — high-contrast renaissance serif with the right ecclesiastical voice. The motto uses 0.4em tracking, all-caps, with em-dashes.
- EB Garamond for the tagline, italic subline, positioning copy, and the email input — softer book serif that sits humbly under the display.
- No sans-serif anywhere.

## Sigil structure
Hand-authored SVG: four rounded-square lobes arranged on a cross axis (N/E/S/W) with a central square where they intersect. Each lobe holds a small inner glyph (U-shape, inverted-U, two C-shapes) like illuminated nails. A small central cross plus four diagonal tick-bars in the inner square echo the reference's nested marks. All strokes 1.5px in gold, drawn in via `stroke-dasharray` over ~2.2s.

## Motion
Strict stagger: sigil scales+fades and strokes draw (0–2.2s) → brand (~1.05s) → motto (~1.55s) → hairline divider extends from center (~1.95s) → tagline / subline / positioning (~2.25–2.7s) → CTA (~3.0s). Six gold motes drift upward at 22–32s each — barely perceptible candle-smoke.

## CTA
Brass-nameplate button: sharp corners, single hairline gold border, inset 1px shadow, spaced uppercase Cormorant. The email input is a transparent bordered field with italic placeholder, no rounding — a votive inscription line.
