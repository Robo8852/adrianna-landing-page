import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom does not implement matchMedia; several hooks (e.g. useReveal) rely on
// it for prefers-reduced-motion. Provide a minimal stub so components render.
if (!window.matchMedia) {
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
if (!("IntersectionObserver" in window)) {
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
