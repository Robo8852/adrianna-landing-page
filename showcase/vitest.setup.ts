import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Convex suites run in edge-runtime (see environmentMatchGlobs), where there
// is no `window` — all the DOM shims below are jsdom-only.
const hasDom = typeof window !== "undefined";

// jsdom does not implement matchMedia; several hooks (e.g. useReveal) rely on
// it for prefers-reduced-motion. Provide a minimal stub so components render.
if (hasDom && !window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// jsdom also lacks IntersectionObserver, which useReveal uses to trigger.
if (hasDom && !("IntersectionObserver" in window)) {
  class MockIntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn(() => []);
    root = null;
    rootMargin = "";
    thresholds = [];
  }
  // @ts-expect-error - assigning a test stub to the global
  window.IntersectionObserver = MockIntersectionObserver;
  globalThis.IntersectionObserver = MockIntersectionObserver;
}

afterEach(() => {
  cleanup();
});
