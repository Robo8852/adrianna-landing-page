# Handoff — Brand Sigil & the Mobile Draw-On Animation Bug

**Date:** 2026-05-29
**Repo:** `/home/leo-kings/Adrianna landing page` (GitHub: `Robo8852/adrianna-landing-page`, branch `main`)
**Last commit on this work:** `d107892` — *feat(sigil): replace placeholder mark with traced brand logo + draw-on animation* (pushed to `origin/main`)

---

## 1. TL;DR — where we are

- The site's logo (the "sigil") **used to be a hand-authored SVG approximation** — it did not match the real brand mark.
- We **replaced it with a vector trace of the real logo** (the woven interlocking cross from `landing-page-assets/photo_2026-05-10_18-36-19.jpg`) and restored a **"draw-on" animation** where each line inks itself in.
- ✅ The new logo renders correctly on **both desktop and mobile** (header + hero).
- ✅ The draw-on animation **works on desktop**.
- ❌ **OPEN BUG: the draw-on animation does NOT play on mobile.** The logo shows up fully-drawn (static) instead of inking on. **This is the thing to fix next.**

---

## 2. ⚠️ Important correction about "verification"

In the previous session I claimed I had "verified the animation works on mobile." **That claim was wrong.** I captured mobile screenshots using headless Chrome with `--virtual-time-budget=6000`, which **fast-forwards to the animation's finished state**. A static screenshot can only prove the logo *appears* — it **cannot** prove the animation *plays*. So I only ever verified the end state, not the motion.

**The user observed on a real device that the effect does not play on mobile. Trust that.** Do not "verify" animation with static screenshots again — it must be observed live (real device or browser devtools device emulation with the page actually loading).

---

## 3. The leading hypothesis (most likely cause)

The `prefers-reduced-motion: reduce` media query in `showcase/app/globals.css` disables the animation:

```css
@media (prefers-reduced-motion: reduce) {
  .altar-sigil-path,
  .altar-sigil-trace {
    stroke-dashoffset: 0 !important;   /* forces logo fully drawn */
    animation: none !important;        /* kills the draw-on */
  }
}
```

Many mobile contexts report `prefers-reduced-motion: reduce`:
- **iOS:** Settings → Accessibility → Motion → **Reduce Motion** (on by default for some users / after certain settings).
- **iOS Low Power Mode** can also trigger reduced motion.
- **Android** battery saver / "Remove animations" accessibility setting.

If the user's phone has any of these on, the logo will be **fully drawn with no animation** — exactly the reported symptom. This perfectly explains "works on desktop, static on mobile."

**First thing to check next session:** ask the user whether Reduce Motion / Low Power Mode is ON on their phone. If yes — that's almost certainly it.

### Other hypotheses (check if reduced-motion is ruled out)
1. **Animation already finished before they looked.** The hero sigil draws on at page load (delays 0.05–1.2s, durations ~0.9–2.2s, so it's done by ~3.4s). If mobile load is slow and they look after it finishes, they'd see it static. Less likely to read as "not doing the effect," but possible.
2. **iOS Safari SVG quirk** with `stroke-dashoffset` + `animation-fill-mode: forwards` + per-element `animation-delay`. Generally works, but worth testing on real Safari.
3. **The Hero wrapper** `.altar-sigil-reveal` (opacity/scale fade) is separate and is also disabled under reduced-motion — but that's the fade, not the draw.

---

## 4. How to diagnose properly (do this with the user watching their phone)

1. **Ask the user:** is "Reduce Motion" (iOS) or battery saver / remove-animations (Android) enabled? Toggle it OFF and reload `https://<deployed-url>` — does the draw-on now play? If yes → confirmed.
2. **Reproduce in desktop devtools** with reduced-motion emulation:
   - Chrome DevTools → Cmd/Ctrl-Shift-P → "Show Rendering" → "Emulate CSS prefers-reduced-motion" → `reduce`. Reload. The logo will be static. That confirms the CSS path.
3. **Live mobile observation** (not screenshots): use real device, or BrowserStack, or Chrome devtools device mode with a hard reload and watch the hero.

---

## 5. Likely fix (decide WITH the user — it's a real a11y tradeoff)

The reduced-motion rule is **intentional accessibility behavior** — respecting it is correct and good practice. So "just delete the rule" is not automatically right. Options:

- **Option A (recommended, accessible):** Keep respecting reduced-motion, but make sure that when motion IS allowed, it actually plays on mobile. If the bug is purely reduced-motion, then on a phone with motion enabled it should already work — verify that first. If it does, arguably **there is no code bug** — the user's phone just has reduce-motion on, and the static logo is the *correct* behavior. Confirm whether the user wants to override that.
- **Option B (force animation regardless):** If the user explicitly wants the draw-on to ALWAYS play (even with reduce-motion), remove `.altar-sigil-trace` from the reduced-motion block in `globals.css`. ⚠️ This overrides a user accessibility preference — only do it if the user insists, and consider a gentler/shorter animation as a compromise.
- **Option C (gentler reduced-motion variant):** Under reduced-motion, replace the stroke draw with a simple fade-in (less vestibular trigger) instead of fully disabling.

If the bug turns out NOT to be reduced-motion, then investigate the iOS Safari SVG rendering path (hypothesis #2).

---

## 6. Files & exact mechanism

**The component:** `showcase/components/primitives/Sigil.tsx`
- Renders the mark as **22 open stroked `<path>` elements** (centerlines), inside a `<g>` with `stroke={gold}`, `strokeWidth=16`, round caps/joins, in `viewBox="0 0 1072 1072"`.
- Props (unchanged API): `size`, `animated`, `gold`, `goldWarm` (unused), `strokeWidth`, `ariaLabel`, `className`.
- When `animated` is true: each path gets `className="altar-sigil-trace"` and inline style:
  ```js
  { strokeDasharray: <len>, strokeDashoffset: <len>, animationDelay: "<d>s", animationDuration: "<dur>s" }
  ```
  (each stroke's dash length = its own path length, so it draws evenly; delays stagger 0.05s → 1.2s top-to-bottom).
- When `animated` is false (the header use): no class, no dash → renders fully drawn & static.

**The CSS:** `showcase/app/globals.css`
```css
@keyframes altar-sigil-draw { to { stroke-dashoffset: 0; } }
.altar-sigil-trace {
  animation-name: altar-sigil-draw;
  animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
  animation-fill-mode: forwards;
}
/* ...and the reduced-motion override quoted in section 3 */
```

**Where the Sigil is used (only two places — both shared across mobile & desktop, no mobile-specific fork):**
- `showcase/components/sections/Hero.tsx:~140` → `<Sigil />` (size 148, animated). Wrapped in `.altar-sigil-reveal` (fade-scale entrance).
- `showcase/components/chrome/HeaderNav.tsx:172` → `<Sigil size={28} animated={false} ariaLabel="" />` (static, shows on mobile + desktop; it's outside the `hidden sm:flex` desktop block).

**Backups (one-step revert):**
- `showcase/components/primitives/Sigil.filled.bak.tsx` — filled-outline trace (potrace), keeps the literal over-under weave at center, **no animation possible** (filled shapes can't stroke-draw).
- `showcase/components/primitives/Sigil.handcoded.bak.tsx` — the original hand-authored approximation.

---

## 7. How the logo was produced (so it can be regenerated / improved)

Source image: `landing-page-assets/photo_2026-05-10_18-36-19.jpg` (1017×1018, compressed JPG — this low res is the quality bottleneck).

Pipeline (Python + tools that ARE installed: `potrace`, `mkbitmap`, ImageMagick `magick`, `rsvg-convert`, and Python `skimage`, `scipy`, `cv2`, `PIL`):
1. Detect gold strokes vs green background by color, find the mark's bounding box (excluding the "The Altar Within" wordmark).
2. Square, mark-centered crop; upscale 4×; isolate gold → black-on-white bitmap.
3. **For the centerline version (current):** `skimage.morphology.skeletonize` → walk the skeleton graph into polylines → prune short spurs (<14px) → simplify (`cv2.approxPolyDP`) → 22 open paths in a 1072×1072 viewBox. Compute each path length for the dash animation.
4. **For the filled version (backup):** `potrace -s` traces the strokes as filled outlines.

⚠️ The working files (crops, bitmaps, intermediate SVGs) were in `.logo-trace/` at repo root. That folder is now **gitignored** (`.gitignore`). It may still exist on disk — `rm` was blocked by a permission rule in the previous session, so it was never deleted. Safe to delete manually: `rm -rf ".logo-trace"`.

---

## 8. ⭐ The real long-term fix for logo quality

The current logo is traced from a **268px region of a compressed JPG**, so strokes carry faint waviness and the center weave is slightly simplified. **Get the original vector (`.ai`/`.eps`/`.svg`/`.pdf`) or a 2000px+ PNG from whoever designed the logo.** Then regenerate the centerline paths from that — the `Sigil.tsx` props/API stays identical, so it's a drop-in replacement.

---

## 9. Environment / how to run

- App is a **Next.js 15** project in the **`showcase/`** subdirectory (NOT repo root). `cd showcase && npm run dev`.
- `node_modules` already installed. Dev server ran on **http://localhost:3001** (port 3000 was busy).
- Type-check: `cd showcase && npx tsc --noEmit` (currently passes clean).
- Deploy: Vercel auto-deploys from `main`. The handoff `.md` files at repo root are not part of the `showcase/` build.
- `rm` was blocked by a permission rule last session — if cleanup commands fail, ask the user to run them via the `! <command>` prefix.

---

## 10. Suggested first actions for the next session

1. Read this file and `git log -1` to confirm state (`d107892`).
2. Ask the user: **is Reduce Motion / Low Power Mode on your phone?** (Section 3.) This likely resolves it immediately.
3. Reproduce with Chrome DevTools reduced-motion emulation (Section 4.2) to confirm the mechanism.
4. Decide the fix WITH the user (Section 5) — respecting reduced-motion is correct a11y; only override if they insist.
5. **Do not** declare it fixed based on a static screenshot. Observe the motion live.
