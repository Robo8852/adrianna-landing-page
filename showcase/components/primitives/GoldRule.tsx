"use client";

import { useReveal } from "@/lib/hooks/useReveal";

export interface GoldRuleProps {
  width?: string;
  opacity?: number;
  className?: string;
  animate?: boolean;
}

export function GoldRule({
  width = "16rem",
  opacity = 0.85,
  className,
  animate = true,
}: GoldRuleProps = {}) {
  const { ref, revealed } = useReveal<HTMLDivElement>({ threshold: 0.4 });

  const extended = !animate || revealed;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{
        width,
        height: "1px",
        background: `linear-gradient(to right, transparent 0%, rgba(201,169,97,${opacity}) 50%, transparent 100%)`,
        transformOrigin: "center",
        transform: extended ? "scaleX(1)" : "scaleX(0)",
        transition: animate
          ? "transform 1s cubic-bezier(0.22,0.61,0.36,1)"
          : undefined,
      }}
    />
  );
}
