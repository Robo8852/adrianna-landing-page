"use client";

import { useReveal } from "@/lib/hooks/useReveal";

export type MicroSigilMotif =
  | "vessel"
  | "vesica"
  | "vine"
  | "plumb-line"
  | "interlocking-lobes";

export interface MicroSigilProps {
  motif: MicroSigilMotif;
  size?: number;
  gold?: string;
  strokeWidth?: number;
  className?: string;
  ariaLabel?: string;
}

export function MicroSigil({
  motif,
  size = 36,
  gold = "#C9A961",
  strokeWidth = 1.5,
  className,
  ariaLabel,
}: MicroSigilProps) {
  const { ref, revealed } = useReveal<HTMLDivElement>({ threshold: 0.5 });
  const pathClass = `micro-path${revealed ? " revealed" : ""}`;

  const commonPath = {
    stroke: gold,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
    className: pathClass,
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        display: "inline-block",
        width: size,
        height: size,
      }}
    >
      <style jsx>{`
        @keyframes micro-sigil-draw {
          from {
            stroke-dashoffset: 200;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        :global(.micro-path) {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
        }
        :global(.micro-path.revealed) {
          animation: micro-sigil-draw 1.8s cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.micro-path),
          :global(.micro-path.revealed) {
            stroke-dashoffset: 0 !important;
            animation: none !important;
          }
        }
      `}</style>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={ariaLabel ?? `${motif} sigil`}
        style={{ display: "block" }}
      >
        {motif === "vessel" && (
          <>
            <path {...commonPath} d="M 16 22 Q 32 18 48 22" />
            <path
              {...commonPath}
              d="M 16 22 Q 18 36 28 38 L 36 38 Q 46 36 48 22"
            />
            <path {...commonPath} d="M 32 38 V 50" />
            <path {...commonPath} d="M 22 52 H 42" />
          </>
        )}
        {motif === "vesica" && (
          <>
            <path {...commonPath} d="M 32 16 A 16 18 0 0 0 32 52" />
            <path {...commonPath} d="M 32 16 A 16 18 0 0 1 32 52" />
            <circle cx="32" cy="34" r="1" stroke={gold} fill={gold} />
          </>
        )}
        {motif === "vine" && (
          <>
            <path {...commonPath} d="M 32 52 V 22" />
            <path {...commonPath} d="M 32 36 Q 22 34 18 24" />
            <path {...commonPath} d="M 32 30 Q 42 28 46 18" />
            <path {...commonPath} d="M 32 22 V 16" />
            <path {...commonPath} d="M 18 24 V 18" />
            <path {...commonPath} d="M 46 18 V 12" />
          </>
        )}
        {motif === "plumb-line" && (
          <>
            <path {...commonPath} d="M 22 14 H 42" />
            <path {...commonPath} d="M 32 14 V 44" />
            <path {...commonPath} d="M 32 44 L 38 50 L 32 56 L 26 50 Z" />
          </>
        )}
        {motif === "interlocking-lobes" && (
          <>
            <path
              {...commonPath}
              d="M 18 24 H 32 A 6 6 0 0 1 38 30 V 40 A 6 6 0 0 1 32 46 H 18 A 6 6 0 0 1 12 40 V 30 A 6 6 0 0 1 18 24 Z"
            />
            <path
              {...commonPath}
              d="M 32 18 H 46 A 6 6 0 0 1 52 24 V 34 A 6 6 0 0 1 46 40 H 32 A 6 6 0 0 1 26 34 V 24 A 6 6 0 0 1 32 18 Z"
            />
            <path {...commonPath} d="M 30 32 L 34 32" />
          </>
        )}
      </svg>
    </div>
  );
}
