# hooks

> **What this covers:** The two custom React hooks that drive scroll-triggered reveal animation (`useReveal`) and scroll-position state (`useScrolled`).

## What
- `useReveal` — gives a component a `ref` to attach to a DOM node and a boolean `revealed` flag that flips from `false` to `true` the first time that node scrolls into the viewport. Consumers drive enter animations (a line extending, an SVG path drawing) off `revealed`. It respects `prefers-reduced-motion`: when reduced motion is requested it skips the IntersectionObserver entirely and sets `revealed = true` immediately, so content is shown in its final state with no motion.
- `useScrolled` — returns a boolean that is `true` once the window has scrolled past a pixel threshold (default `80px`). Used to toggle scrolled-vs-top chrome styling on the sticky header.
- Both are client-only (`"use client"`) and SSR-safe: they guard on `typeof window === "undefined"` and start in the un-triggered state (`false`), so server render and first client paint agree (no hydration mismatch).

## Where
- `showcase/lib/hooks/useReveal.ts` — `useReveal<T extends HTMLElement = HTMLDivElement>(options?: UseRevealOptions): { ref: React.RefObject<T>; revealed: boolean }`. Options: `{ threshold = 0.2, rootMargin = "0px 0px -10% 0px", once = true }`. Returns a `ref` to attach and the `revealed` boolean.
  - Consumed by `showcase/components/primitives/GoldRule.tsx` — `useReveal<HTMLDivElement>({ threshold: 0.4 })`; `revealed` (via `extended`) drives a `scaleX(0) → scaleX(1)` transform on a gold horizontal rule.
  - Consumed by `showcase/components/primitives/MicroSigil.tsx` — `useReveal<HTMLDivElement>({ threshold: 0.5 })`; `revealed` toggles a `revealed` CSS class that runs the `micro-sigil-draw` stroke-dashoffset draw-on animation on the SVG paths.
- `showcase/lib/hooks/useScrolled.ts` — `useScrolled(threshold = 80): boolean`. Returns `scrolled`, true when `window.scrollY > threshold`.
  - Consumed by `showcase/components/chrome/HeaderNav.tsx` — `useScrolled(80)`; `scrolled` switches the header between its top and scrolled appearance.
- Test stubs that exist because of these hooks: `showcase/vitest.setup.ts` (jsdom `matchMedia` + `IntersectionObserver` stubs).
- Lint rule tied to these hooks: `showcase/eslint.config.mjs` (`react-hooks/set-state-in-effect` downgraded to `warn`).

## How

### Using `useReveal`
1. Call the hook in a client component: `const { ref, revealed } = useReveal<HTMLDivElement>({ threshold: 0.4 });`
2. Attach `ref` to the element whose visibility should trigger the animation: `<div ref={ref}>`.
3. Drive your animation off `revealed` — e.g. a CSS `transform`/`transition` that changes when `revealed` is true (see `GoldRule`), or a conditional class name that starts a keyframe animation (see `MicroSigil` toggling `micro-path` → `micro-path revealed`).

Mechanics:
- The effect runs once mounted. If `window` is undefined it bails (SSR guard). It then checks `window.matchMedia("(prefers-reduced-motion: reduce)").matches`; if reduced motion is on, it calls `setRevealed(true)` and returns early — no observer is created.
- Otherwise it reads `ref.current`; if null it bails. It creates an `IntersectionObserver` with `{ threshold, rootMargin }`. On each entry: if `isIntersecting` it calls `setRevealed(true)`, and when `once` (default) it `observer.disconnect()`s so the reveal is permanent. When `once: false`, leaving the viewport (`!isIntersecting`) flips `revealed` back to `false`, making the animation re-trigger on every entry.
- Cleanup disconnects the observer. The effect dependency array is `[threshold, rootMargin, once]`.
- Defaults: `threshold = 0.2` (20% of the node visible), `rootMargin = "0px 0px -10% 0px"` (fires slightly before the node reaches the very bottom edge), `once = true`.

### Using `useScrolled`
- `const scrolled = useScrolled(80);` then branch chrome/styling on `scrolled`.
- Mechanics: SSR guard, then defines `onScroll = () => setScrolled(window.scrollY > threshold)`, calls it once immediately (so initial state is correct even if the page loads already scrolled), and registers a `passive` scroll listener. Cleanup removes the listener. Dependency array is `[threshold]`.

### Gotchas / test + lint relationship
- **jsdom lacks `matchMedia` and `IntersectionObserver`.** `useReveal` calls both, so any component using it would throw under jsdom. `showcase/vitest.setup.ts` provides minimal stubs: a `window.matchMedia` mock that returns `matches: false` (i.e. reduced motion OFF, so the observer path is exercised), and a `MockIntersectionObserver` class assigned to `window`/`globalThis`. If you add a hook or component that touches another unimplemented browser API, extend this setup file the same way.
- **`react-hooks/set-state-in-effect` warning is intentional.** Both hooks call `setState` synchronously inside their `useEffect` (the `matchMedia`/reduced-motion early return in `useReveal`, the initial `onScroll()` call in `useScrolled`, plus the SSR "mounted" guard pattern used elsewhere). react-hooks v7 flags this. It is downgraded from error to `warn` in `showcase/eslint.config.mjs` so CI is not blocked by this accepted, idiomatic pattern. Expect the warning; do not "fix" it by removing the synchronous set, which would break the reduced-motion / initial-position behavior.

### Adding reveal animation to a new component
1. Add `"use client";` at the top of the component (the hook requires the client runtime).
2. Import and call: `import { useReveal } from "@/lib/hooks/useReveal";` → `const { ref, revealed } = useReveal<HTMLElementType>({ threshold });`.
3. Attach `ref` to the element to observe.
4. Define both a hidden and a revealed visual state, and switch on `revealed` — either a `transform`/`opacity` with a `transition` (CSS-property approach, like `GoldRule`) or a conditional class that triggers a keyframe animation (class approach, like `MicroSigil`).
5. Always supply a reduced-motion fallback in your CSS so that when `useReveal` short-circuits to `revealed = true`, the element renders in its final state with `animation: none` / no transform (see the `@media (prefers-reduced-motion: reduce)` block in `MicroSigil`).
6. Pick `once` deliberately: leave default `true` for one-shot enter animations; pass `once: false` if you want the animation to replay each time the element re-enters the viewport.
