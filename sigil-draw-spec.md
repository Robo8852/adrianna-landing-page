# sigil-draw-spec — The Altar Within: make the new knot-cross sigil a *drawn* (ink-on) SVG

A specification for converting the new brand mark — the **circular interlocking-knot cross with a four-pointed center star** — from a raster PNG into an **open-centerline SVG that inks itself on**, the same per-stroke draw-on the original woven-cross sigil used. The deliverable replaces the current *filled-outline* trace in `Sigil.tsx` with **animatable line-art** while keeping the `Sigil` component's public API byte-for-byte identical.

This describes **what** must be true and **why**, not the line-by-line **how** (that goes in a companion `sigil-draw-imp.md`).

Cross-references:
- Component to replace: `showcase/components/primitives/Sigil.tsx` (currently potrace filled outlines).
- Backups of prior approaches: `Sigil.lineart.bak.tsx` (the original woven-cross *centerline* sigil — the reference implementation for this spec), `Sigil.filled.bak.tsx`, `Sigil.handcoded.bak.tsx`.
- Animation machinery (already shipped — reuse, do not reinvent): `showcase/app/globals.css` → `@keyframes altar-sigil-draw`, the `.altar-sigil-trace` rule, and the `prefers-reduced-motion` override.
- Wrapper reveal that coexists with the draw-on: `.altar-sigil-reveal` in `showcase/components/sections/Hero.tsx`.
- Source raster: `landing-page-assets/altar-sigil-knot.png` (the new mark, committed alongside the filled trace).
- Primitive conventions this must honor: `spec/primitives.md` (§ "Sigil specifics").

---

## 1. Purpose & scope

The new knot-cross mark currently renders as **filled vector shapes** (an auto-trace of the PNG via `potrace`). That is crisp and on-palette, but it is the wrong *kind* of geometry for our signature animation: a filled region has no "line" to draw, so the mark can only fade/scale in — it cannot **ink itself on stroke by stroke** the way the original sigil did.

This phase produces a **centerline (skeletonized) line-art** version of the same mark: a set of **open stroked `<path>`s** following the *middle* of each line in the artwork, rendered as uniform gold strokes with round caps. Because each path is an open stroke, it can be animated with `stroke-dasharray` / `stroke-dashoffset` and drawn on in sequence.

**In scope:**
- A repeatable **raster → centerline → ordered open paths** pipeline (§4), documented well enough to re-run when a higher-res source arrives.
- A new `Sigil.tsx` that renders those open paths and **re-activates the draw-on** through the existing `.altar-sigil-trace` machinery (§5), with the **same `SigilProps` API** (§6).
- Per-path **precomputed lengths** + a **draw order** + **stagger timing** that read as a single deliberate "inscription" (§5).
- Correct behavior under `prefers-reduced-motion` and at multiple sizes (§7).

**Out of scope:**
- Changing the *design* of the mark (this is a rendering/animation change, not a redraw of the artwork).
- Changing the `Sigil` public API, or touching call sites (`Hero.tsx`, `concepts/v1-faithful-altar/page.tsx`, etc.). They must keep working untouched.
- The newsletter/Convex/intake work (`intake-spec.md`, `spec/convex.md`) — unrelated.

---

## 2. The invariant this phase establishes

> **The brand sigil renders the new knot-cross mark as open gold centerline strokes that ink themselves on in a deliberate, staggered sequence — crisp at any size, gold on the dark hero, and snapping to fully-drawn under `prefers-reduced-motion` — all behind the unchanged `Sigil` component API.**

The deliverable is both the **regenerated `Sigil.tsx`** and the **documented pipeline** (so the mark can be re-traced from a better source without re-deriving the method).

---

## 3. Why the current (filled-outline) approach can't animate

Background so the implementer doesn't repeat the dead end:

- **`potrace` traces *boundaries*.** Given the black artwork it emits the *outline* of every inked region as a closed, filled path. Stroking-and-dashing such a path animates the *perimeter of the ink*, not a line down the middle of it — visually it looks like a crawling outline, not a pen drawing the mark.
- **The draw-on effect needs a centerline.** `stroke-dashoffset` animation works on a path whose **stroke** *is* the visible line. That means the path must follow the **skeleton** (medial axis) of each stroke in the artwork, drawn with `stroke-width ≈ the line's thickness`, `fill="none"`, round caps/joins — exactly how `Sigil.lineart.bak.tsx` was built for the woven cross.
- **Therefore:** we must skeletonize the artwork to single-pixel centerlines first, *then* vectorize those centerlines into open paths. potrace alone is insufficient; see §4 for the centerline route.

---

## 4. The pipeline: raster → centerline → ordered open paths

The crux of this phase. The artwork is interwoven knotwork, so clean centerlines are the hard part; budget for manual cleanup. Produce the steps in `sigil-draw-imp.md`; the required *shape* of the pipeline is:

1. **Get the best available source.** Current source is `landing-page-assets/altar-sigil-knot.png` at **293×205** — low-res, which limits centerline accuracy. **Strongly prefer** a higher-res raster (≥2000px) or, ideally, the original vector. Record which source was used. (See §9 — this is an open question to resolve *before* tracing, not after.)
2. **Binarize.** Grayscale → threshold to clean black/white (the filled trace used `-threshold 55%`); de-speckle. Square the canvas and pad so the mark sits centered with margin.
3. **Skeletonize to single-pixel centerlines.** Reduce every stroke to a 1px medial line. Candidate tools (implementer picks + justifies one in the imp): ImageMagick `-morphology Thinning` / `Skeleton`, `autotrace --centerline`, or a skeletonization pass (e.g. Zhang–Suen) before vectorizing. **Acceptance for this step:** the skeleton preserves the knot's over/under reading and the center star — it must not merge crossings into blobs.
4. **Vectorize the skeleton into open paths.** Trace the 1px centerlines into `<path>` data (not closed outlines). Expect to **split the skeleton into a handful of meaningful strokes** (the 4 arms, the ring, the central star, the corner lobes) rather than one giant path — discrete strokes are what make the staggered ink-on read well.
5. **Normalize geometry.** Uniform integer-ish coordinate space, a **square `viewBox` with padding** (the lineart backup used `1072×1072`; the filled trace used `-12 -12 201 201`). `fill="none"`, `stroke-linecap="round"`, `stroke-linejoin="round"`.
6. **Compute per-path length** for each `<path>` (the dash length). This is what `stroke-dasharray`/`stroke-dashoffset` are seeded with; if a path's `d` later changes, its length must be recomputed (a known gotcha — `spec/primitives.md`).
7. **Decide draw order + stagger** (§5).

> **Honesty clause:** if a usable centerline can't be derived from the 293×205 source at acceptable fidelity, the spec is **not** met by shipping a rough skeleton. Either obtain a better source (§9) or escalate — do not silently degrade the mark. Note any coverage/quality compromise explicitly (don't let a partial trace read as "done").

---

## 5. Animation wiring (reuse what exists)

The draw-on infrastructure is already in the codebase — **reuse it, do not duplicate it**:

- Each animated `<path>` gets `className="altar-sigil-trace"` and **inline** `strokeDasharray` + `strokeDashoffset` (both = that path's precomputed length) plus a staggered `animationDelay` and a per-path `animationDuration`.
- The shared `@keyframes altar-sigil-draw` (animates `stroke-dashoffset → 0`) and the `.altar-sigil-trace` rule (timing-function + `fill-mode: forwards`) live in `showcase/app/globals.css`. The implementation **must not** redefine these.
- **Draw order is a design choice, state it explicitly.** The original inked roughly top-to-bottom. For a *radial* mark, a **center-star-outward** or **ring-then-arms** order likely reads more intentionally — pick one, justify it, and tune delays so the total sequence lands in a similar window to the old one (~1.2–1.8s of staggered draw; check `Sigil.lineart.bak.tsx` for the reference cadence).
- The wrapper's `.altar-sigil-reveal` (fade + scale) still wraps the sigil in the hero and should **coexist** with the per-stroke draw — the mark scales in *while* its strokes ink.
- **`prefers-reduced-motion`** is already handled: the global override snaps `.altar-sigil-trace` to `stroke-dashoffset: 0` and disables the animation. The new paths inherit this for free **as long as they use the `.altar-sigil-trace` class** — verify, don't assume.

---

## 6. Component contract (API unchanged)

`Sigil.tsx` keeps the **exact** `SigilProps` it has today so every call site is untouched:

```ts
interface SigilProps {
  size?: number;          // default 148
  animated?: boolean;     // default true — MUST drive the draw-on (see note)
  gold?: string;          // default "#C9A961" — stroke color
  goldWarm?: string;      // API-compat, unused (void it)
  strokeWidth?: number;   // default 16 — now MEANINGFUL again (it's the line weight)
  ariaLabel?: string;     // role="img" label
  className?: string;
}
```

Behavioral requirements:
- **`animated` must actually mean something again.** In the current filled version it is `void`-ed (the wrapper does all the motion). Here, `animated` toggles whether paths get the `.altar-sigil-trace` class + inline dash props. `animated={false}` → fully-drawn static mark (no dash offset), matching how the lineart backup behaved.
- **`strokeWidth` is live again** — it is the visible line weight of the centerlines. Keep `16` sensible against the chosen `viewBox` scale so default `size={148}` looks right.
- `gold` colors the strokes; `goldWarm` stays accepted-but-unused (`void goldWarm`) for stability.
- `"use client"` (the draw-on is client animation), `role="img"`, `aria-label` from `ariaLabel`, `display: block`.
- Preserve the existing **backup discipline**: keep `Sigil.lineart.bak.tsx` (woven-cross reference) and the current filled trace as a backup before overwriting. Update the file's doc comment + `spec/primitives.md` "Sigil specifics" to describe the new mark and pipeline.

---

## 7. Acceptance criteria

The phase is done when **all** hold:

1. **Fidelity** — the rendered sigil is visually recognizable as the new knot-cross mark (ring, four arms, center star, corner lobes), matching `landing-page-assets/altar-sigil-knot.png` in proportion and the knot's over/under reading.
2. **It draws on** — with `animated` (default), the strokes ink in a staggered sequence (per the §5 order), ending fully drawn; total cadence comparable to the old sigil.
3. **Crisp & scalable** — vector strokes, sharp at `size` 36 → 300+; no raster blur.
4. **On-palette** — gold (`#C9A961`) strokes read correctly on the dark ink-green hero.
5. **Reduced motion** — under `prefers-reduced-motion: reduce`, the mark appears **fully drawn, immediately**, no animation.
6. **API-stable** — `SigilProps` unchanged; `Hero.tsx` and all other call sites render with no edits; `animated={false}` yields a clean static mark; `strokeWidth` visibly changes line weight.
7. **Docs synced** — `Sigil.tsx` doc comment + `spec/primitives.md` updated; the pipeline is captured in `sigil-draw-imp.md` and is re-runnable.
8. **No regressions** — existing tests pass; if `Sigil` has/needs a test, it asserts open `<path stroke>` (not `fill`) geometry and the presence/absence of `.altar-sigil-trace` per `animated`.

---

## 8. Verification

- **Visual:** run `npm run dev` (showcase), load `/`, watch the hero sigil ink on; compare side-by-side with `altar-sigil-knot.png`. Toggle OS "reduce motion" and reload — must snap to fully drawn.
- **Static render check (CI-friendly):** render the component's emitted SVG to PNG on the dark background (as was done for the filled trace) and eyeball fidelity before wiring.
- **API:** grep call sites; confirm none changed. Render with `animated={false}` and with a non-default `strokeWidth` to confirm both behave.
- **Lint/build:** `npm run lint` and `npm run build` clean.

---

## 9. Open questions / decisions (resolve before tracing)

1. **Source resolution — blocking.** The committed PNG is 293×205. Centerline skeletonization of low-res interwoven knotwork is error-prone. **Can a higher-res raster (≥2000px) or the original vector be provided?** This single input dominates output quality; resolve first.
2. **Stroke decomposition.** How many discrete `<path>`s? (Fewer = simpler, but coarser stagger; more = richer ink-on, more hand-tuning.) Propose a count in the imp from the skeleton's natural segments (ring / 4 arms / star / 4 lobes is a natural ~10).
3. **Draw order aesthetic.** Center-out, ring-first, or arms-first? Pick and justify (§5).
4. **One sigil or a variant?** Should this replace `Sigil` outright, or ship as a sibling (e.g. `SigilDrawn`) so the filled version stays available? Default: **replace**, with the filled version kept as a `.bak`.
5. **Tooling choice for centerline** (ImageMagick thinning vs `autotrace --centerline` vs scripted skeletonization) — pick in the imp with a one-line rationale; the *output contract* (§4–§6) is what matters, not the tool.

---

## 10. Build notes

- Lowest-risk path: **start from the better source** (resolve §9.1), reuse the **exact** animation CSS already in `globals.css`, and mirror the structure of `Sigil.lineart.bak.tsx` (open paths + inline dash props + `.altar-sigil-trace`) — only the path data, lengths, order, and `viewBox` differ.
- Keep the generated path `d`/length pairs in a small array the component maps over (as the current `Sigil.tsx` does with `SIGIL_PATHS`) so a future re-trace is a data swap, not a rewrite.
- Do not hand-merge potrace *outline* output into this — it is the wrong geometry (§3). Centerlines only.
