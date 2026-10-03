import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GoldRule } from "@/components/primitives/GoldRule";
import { useReveal } from "./useReveal";

let reducedMotion: boolean;
let listeners: Set<() => void>;
let observe: ReturnType<typeof vi.fn>;
let disconnect: ReturnType<typeof vi.fn>;
let notifyIntersection: (entries: { isIntersecting: boolean }[]) => void;

function Probe() {
  const { ref, revealed } = useReveal();
  return <div ref={ref} data-testid="probe">{String(revealed)}</div>;
}

function changeMotion(value: boolean) {
  act(() => {
    reducedMotion = value;
    listeners.forEach((listener) => listener());
  });
}

beforeEach(() => {
  reducedMotion = false;
  listeners = new Set();
  observe = vi.fn();
  disconnect = vi.fn();
  vi.stubGlobal("matchMedia", vi.fn(() => ({
    get matches() { return reducedMotion; },
    addEventListener: (_event: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_event: string, listener: () => void) => listeners.delete(listener),
  })));
  vi.stubGlobal("IntersectionObserver", vi.fn(function (callback) {
    notifyIntersection = callback;
    return { observe, disconnect };
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("useReveal reduced motion", () => {
  it("reveals immediately without observing when reduced motion is enabled", () => {
    reducedMotion = true;
    render(<Probe />);
    expect(screen.getByTestId("probe")).toHaveTextContent("true");
    expect(observe).not.toHaveBeenCalled();
  });

  it("reacts to preference changes and cleans up subscriptions", () => {
    const { unmount } = render(<Probe />);
    expect(screen.getByTestId("probe")).toHaveTextContent("false");
    expect(observe).toHaveBeenCalledTimes(1);
    changeMotion(true);
    expect(screen.getByTestId("probe")).toHaveTextContent("true");
    expect(disconnect).toHaveBeenCalledTimes(1);
    changeMotion(false);
    expect(observe).toHaveBeenCalledTimes(2);
    act(() => notifyIntersection([{ isIntersecting: true }]));
    expect(screen.getByTestId("probe")).toHaveTextContent("true");
    unmount();
    expect(listeners.size).toBe(0);
  });

  it("preserves normal scroll-triggered reveals", () => {
    render(<Probe />);
    expect(screen.getByTestId("probe")).toHaveTextContent("false");
    act(() => notifyIntersection([{ isIntersecting: true }]));
    expect(screen.getByTestId("probe")).toHaveTextContent("true");
    expect(disconnect).toHaveBeenCalled();
  });

  it("gives gold dividers the CSS reduced-motion fallback and preserves custom classes", () => {
    const { container } = render(<GoldRule className="custom-rule" />);
    expect(container.firstChild).toHaveClass("altar-rule", "custom-rule");
  });
});
