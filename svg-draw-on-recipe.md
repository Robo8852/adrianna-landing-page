# Recipe: turn a logo/mark into a "self-drawing" SVG animation

A reusable, project-agnostic playbook for the effect we built for the Altar
Within sigil: take a raster logo (PNG/JPG), trace it into clean **centerline
strokes**, and animate each stroke so the mark **draws itself on** — plus a
throwaway **"lab" page** with a Replay button and live sliders so you can tune
it before shipping.

You can hand this whole file to an AI assistant on a new project and say "do
this with `logo.png`," or follow it by hand.

---

## 0. Vocabulary (so you can google it later)

- **Self-drawing SVG / SVG line-drawing animation** — the "pen draws the line"
  effect. Done with `stroke-dasharray` + `stroke-dashoffset` animated to 0.
- **Centerline trace** — converting artwork into *single open strokes* down the
  middle of each line (vs. an *outline/filled* trace that draws a closed shape
  around both edges).
- **Skeletonization** — the image-processing step that reduces a thick shape to
  a 1px-wide centerline.
- **Component lab / preview harness** — a disposable route (e.g. `/sigil-lab`)
  that renders just the component with controls (replay, sliders) for tuning.

---

## 1. The one idea that makes or breaks it

> **The draw-on effect only works on OPEN, STROKED paths — never on filled shapes.**

A filled trace (what `potrace` gives you, what most "SVG logo" exports are) is a
*closed outline* — there's no single line to run a pen along, so it can't draw
itself on. You can only fade/scale/wipe it.

A **centerline** trace gives you one open path per visible line. Each is a real
stroke you can animate. So step one is always: **get centerlines, not fills.**

How the animation itself works, in three lines of CSS:

```css
/* dasharray = the path's own length makes one big "dash" = the whole line.
   dashoffset = that same length pushes the dash entirely off the path (invisible).
   animate offset -> 0 and the line "draws" in. */
path { stroke-dasharray: <len>; stroke-dashoffset: <len>; }
@keyframes draw { to { stroke-dashoffset: 0; } }
path { animation: draw 1s ease forwards; }
```

The only hard part is getting good centerline paths + their lengths. That's the
pipeline below.

---

## 2. Toolchain (one-time setup)

Python with the scientific-imaging stack. Use a venv so you don't pollute the
system Python:

```bash
python3 -m venv .trace-venv
.trace-venv/bin/pip install numpy scipy scikit-image sknw pillow
echo ".trace-venv/" >> .gitignore   # don't commit the venv
```

- `scikit-image` — thresholding + **skeletonize** (Zhang–Suen).
- `sknw` — turns a skeleton bitmap into a **graph** (nodes + edges as polylines).
- `numpy/scipy/pillow` — array + image plumbing.

---

## 3. The trace pipeline (image → SVG stroke data)

Save as `trace.py`, run with `.trace-venv/bin/python trace.py logo.png`. It
writes `strokes.json` (the path data the component consumes).

```python
import sys, json, numpy as np
from PIL import Image
from skimage.morphology import skeletonize, closing, disk
from skimage.transform import resize
import sknw

SRC = sys.argv[1]
VB  = 1000.0            # output viewBox is 0..VB square
UP  = 3                 # upscale factor before skeletonizing (smoother lines)

# --- 1. load + build a foreground mask -------------------------------------
# Tune this to YOUR art. Here: "gold-ish on dark" = warm pixels.
# For black-on-white just use brightness < threshold, etc.
im = np.array(Image.open(SRC).convert("RGB")).astype(int)
R, G, B = im[:, :, 0], im[:, :, 1], im[:, :, 2]
mask = (R > 110) & (G > 80) & (R - B > 35) & (G - B > 10)

# --- 2. crop to the mark's bounding box (square it for symmetry) -----------
ys, xs = np.where(mask)
x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
sub = mask[y0:y1 + 1, x0:x1 + 1]
H, W = sub.shape

# --- 3. upscale + close small gaps + skeletonize to 1px centerlines --------
up = resize(sub.astype(float), (H * UP, W * UP), order=1) > 0.5
up = closing(up, disk(2))            # heal antialiasing nicks
sk = skeletonize(up)

# --- 4. skeleton -> graph of polylines -------------------------------------
graph = sknw.build_sknw(sk)

# stroke width estimate (filled area / centerline length); for a uniform-line
# mark this is your strokeWidth, scaled to the viewBox.
stroke_w_vb = round(up.sum() / sk.sum() / (H * UP) * VB, 1)

# --- 5. simplify each edge (Ramer–Douglas–Peucker) + scale to viewBox ------
def rdp(pts, eps):
    if len(pts) < 3: return [pts[0], pts[-1]]
    s, e = np.array(pts[0]), np.array(pts[-1]); d = e - s; L = np.hypot(*d)
    if L == 0: ds = [np.hypot(*(np.array(p) - s)) for p in pts]
    else: ds = [abs(d[0]*(p[1]-s[1]) - d[1]*(p[0]-s[0]))/L for p in pts]
    i = int(np.argmax(ds))
    return rdp(pts[:i+1], eps)[:-1] + rdp(pts[i:], eps) if ds[i] > eps else [pts[0], pts[-1]]

def to_vb(pt):                         # (row, col) -> (x, y) in 0..VB
    r, c = pt
    return (round(c / (W*UP) * VB, 1), round(r / (H*UP) * VB, 1))

C = (VB/2, VB/2)
def dist(p): return np.hypot(p[0]-C[0], p[1]-C[1])

strokes = []
for u, v in graph.edges():
    pts = graph[u][v]["pts"]
    if len(pts) < 2: continue
    xy = [to_vb(p) for p in rdp([tuple(p) for p in pts], 1.5 * UP)]
    if len(xy) < 2: continue
    L = sum(np.hypot(xy[i+1][0]-xy[i][0], xy[i+1][1]-xy[i][1]) for i in range(len(xy)-1))
    # orient so the path STARTS at the end nearest center -> it inks OUTWARD
    if dist(xy[-1]) < dist(xy[0]): xy = xy[::-1]
    d = "M " + " L ".join(f"{x} {y}" for x, y in xy)
    strokes.append({"d": d, "len": round(L, 1), "r": round(min(dist(p) for p in xy), 1)})

# --- 6. order CENTER-OUT and assign staggered timing -----------------------
strokes.sort(key=lambda s: s["r"])     # nearest-to-center draws first
STAGGER, START = 0.05, 0.35            # START leaves room for a center element
for i, s in enumerate(strokes):
    s["delay"] = round(START + i * STAGGER, 3)
    s["dur"]   = round(max(0.55, min(1.6, s["len"] / 650)), 3)  # long lines take longer
    del s["r"]

json.dump({"strokeWidth": stroke_w_vb, "strokes": strokes}, open("strokes.json", "w"))
print(f"{len(strokes)} strokes, suggested strokeWidth ~{stroke_w_vb}, "
      f"finishes ~{strokes[-1]['delay'] + strokes[-1]['dur']:.1f}s")
```

### Validate before you trust it
Skeletons can grow spurs or merge lines. **Always re-render the strokes back to
a PNG and eyeball it against the source.** Quick check: draw every polyline with
PIL at the estimated stroke width and compare. If it's noisy, raise `UP`, raise
the RDP `eps`, or drop tiny edges (`len < N AND near-center`) — those are usually
skeleton junk.

---

## 4. Things the skeleton gets wrong (and the fixes we used)

| Symptom | Why | Fix |
|---|---|---|
| Small **filled** detail (a star, a dot, a solid square) becomes a "plus" or blob | skeletonizing a *filled* region collapses it to its medial axis | **Don't trace it** — drop those tiny central edges and redraw the shape *explicitly* as its own path (see star below). |
| Hundreds of tiny jagged segments | RDP `eps` too low / source too low-res | raise `UP` (3→4), raise `eps`, `closing()` with a bigger disk |
| Lines that should be one stroke split at every junction | skeleton graph breaks edges at every node | acceptable for draw-on (more strokes = finer animation); merge later only if motion looks too busy |
| Whole mark looks "hand-drawn"/wobbly | RDP kinks + low source res | raise source resolution; or accept it as charm |

**Explicit shapes beat traced ones for small solid features.** Example — a solid
4-point star with *concave* sides, built parametrically (tips on the axes at
radius ~80, waist pulled in to ~42 via quadratic control points):

```
M 500 420 Q 521.2 478.8 580 500 Q 521.2 521.2 500 580
          Q 478.8 521.2 420 500 Q 478.8 478.8 500 420 Z
```

Give it its own quick fade+scale intro so it leads the animation, then let the
traced strokes radiate out around it.

---

## 5. The React component (centerline strokes + draw-on)

Pattern (Next.js/React; adapt freely). Data comes from `strokes.json`.

```tsx
"use client";
interface Stroke { d: string; len: number; delay: number; dur: number; }
const STROKES: Stroke[] = [ /* paste strokes.json here, or import it */ ];
const STAR = "M 500 420 Q ... Z";   // explicit small solid shape, optional

export function DrawOnMark({ size = 200, strokeWidth = 19, gold = "#C9A961",
                            animated = true, ariaLabel = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 1000 1000" fill="none"
         role="img" aria-label={ariaLabel} style={{ display: "block" }}>
      {/* explicit solid feature: fades/scales in first */}
      <path d={STAR} fill={gold} className={animated ? "draw-star" : undefined} />
      <g stroke={gold} strokeWidth={strokeWidth}
         strokeLinecap="round" strokeLinejoin="round" fill="none">
        {STROKES.map((s, i) => (
          <path key={i} d={s.d}
            className={animated ? "draw-stroke" : undefined}
            style={animated ? {
              strokeDasharray: s.len,
              strokeDashoffset: s.len,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.dur}s`,
            } : undefined} />
        ))}
      </g>
    </svg>
  );
}
```

Global CSS:

```css
@keyframes draw-on { to { stroke-dashoffset: 0; } }
.draw-stroke {
  animation-name: draw-on;
  animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
  animation-fill-mode: forwards;   /* hold the finished state */
}

@keyframes star-in { from { opacity: 0; transform: scale(0.55); }
                     to   { opacity: 1; transform: scale(1); } }
.draw-star {
  opacity: 0;
  transform-box: fill-box;         /* so transform-origin: center = the star's own box */
  transform-origin: center;
  animation: star-in 0.5s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
}

/* accessibility: never animate for users who opted out */
@media (prefers-reduced-motion: reduce) {
  .draw-stroke { stroke-dashoffset: 0 !important; animation: none !important; }
  .draw-star   { opacity: 1 !important; transform: none !important; animation: none !important; }
}
```

**Gotchas that cost real time:**
- `transform-box: fill-box` is required for `transform-origin: center` to mean
  the *shape's* center inside an SVG. Don't also set an inline `transformOrigin`
  in user units — they fight each other.
- `animation-fill-mode: forwards` — without it the lines snap back to invisible
  when the animation ends.
- Put the path length (`s.len`) in BOTH `strokeDasharray` and
  `strokeDashoffset`. They must match the real path length or the line
  over/under-draws.

---

## 6. The component lab / preview harness

A disposable route that renders ONLY the component with controls. This is the
part that made tuning fast. Two tricks:

1. **Replay = remount.** Bumping a `key` throws the element away and rebuilds it,
   restarting all CSS animations from zero. No animation-replay API needed.
2. **Sliders** for the props you're unsure about (size, strokeWidth, timing).

```tsx
"use client";
import { useState } from "react";
import { DrawOnMark } from "@/components/DrawOnMark";

export default function MarkLab() {
  const [run, setRun] = useState(0);          // replay counter
  const [size, setSize] = useState(260);
  const [stroke, setStroke] = useState(19);
  return (
    <main style={{ minHeight: "100vh", background: "#061f1c", color: "#C9A961",
                   display: "flex", flexDirection: "column", alignItems: "center",
                   justifyContent: "center", gap: 28 }}>
      <div key={run}>{/* remount on replay */}
        <DrawOnMark size={size} strokeWidth={stroke} />
      </div>
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <button onClick={() => setRun(r => r + 1)}>Replay</button>
        <label>size {size}
          <input type="range" min={120} max={420} value={size}
                 onChange={e => setSize(+e.target.value)} /></label>
        <label>stroke {stroke}
          <input type="range" min={8} max={34} value={stroke}
                 onChange={e => setStroke(+e.target.value)} /></label>
      </div>
    </main>
  );
}
```

Visit `/mark-lab` (or whatever you name the folder). **Delete it before
shipping** — it's a workshop, not a feature.

---

## 7. Tuning knobs, ranked by impact

1. **strokeWidth** — set it so lines have breathing room and don't merge.
   Start from the script's estimate; nudge with the slider.
2. **Stagger (`STAGGER`)** — gap between consecutive strokes starting. Smaller =
   faster, more simultaneous; larger = more deliberate "one line at a time."
3. **Draw order** — we used `r` (distance from center) for a center-out radiate.
   Alternatives: top-to-bottom (`sort by y`), or hand-author an order for a
   single continuous "one pen" gesture.
4. **Outward vs inward** — the `if dist(last) < dist(first): reverse` line makes
   every stroke ink *away* from center. Flip the comparison for inward.
5. **Per-stroke duration** — `len / K`: long lines take longer so the "pen
   speed" feels constant. Lower K = faster.
6. **Easing** — `cubic-bezier(0.65,0,0.35,1)` is a smooth ease-in-out. Try
   `ease-out` for a confident-start feel.

---

## 8. End-to-end checklist for a new site

1. `python3 -m venv .trace-venv && .trace-venv/bin/pip install numpy scipy scikit-image sknw pillow`
2. Drop in `trace.py`, edit the **mask** for your art's colors.
3. `.trace-venv/bin/python trace.py logo.png` → `strokes.json`.
4. **Re-render to PNG and compare to source.** Iterate `UP` / `eps` / mask.
5. Replace any small *filled* details with explicit hand-authored paths.
6. Paste data into the component; add the CSS keyframes (incl. reduced-motion).
7. Build the lab route; tune size / stroke / stagger / order with sliders.
8. Lock the numbers in as the component defaults; delete the lab route.

---

*Provenance: distilled from building the draw-on sigil for The Altar Within —
faithful centerline trace of a gold knot-cross on dark ink-green, 54 strokes,
center-out radiate with an explicit concave 4-point star leading.*
