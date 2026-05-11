"use client";

export interface SigilProps {
  size?: number;
  animated?: boolean;
  gold?: string;
  goldWarm?: string;
  strokeWidth?: number;
  ariaLabel?: string;
  className?: string;
}

export function Sigil({
  size = 148,
  animated = true,
  gold = "#C9A961",
  goldWarm = "#D9BE7E",
  strokeWidth = 1.5,
  ariaLabel = "The Altar Within sigil — quatrefoil cross",
  className,
}: SigilProps = {}) {
  const pathClass = animated ? "altar-sigil-path" : undefined;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      className={className}
      style={{ display: "block" }}
    >
      {/* Faint outer halo */}
      <circle
        cx="100"
        cy="100"
        r="86"
        stroke={gold}
        strokeOpacity="0.08"
        strokeWidth="1"
      />

      {/* North lobe (top) */}
      <path
        className={pathClass}
        d="M88 26 H112 A8 8 0 0 1 120 34 V70 A8 8 0 0 1 112 78 H88 A8 8 0 0 1 80 70 V34 A8 8 0 0 1 88 26 Z"
        stroke={gold}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={animated ? { animationDelay: "0.25s" } : undefined}
      />
      {/* South lobe (bottom) */}
      <path
        className={pathClass}
        d="M88 122 H112 A8 8 0 0 1 120 130 V166 A8 8 0 0 1 112 174 H88 A8 8 0 0 1 80 166 V130 A8 8 0 0 1 88 122 Z"
        stroke={gold}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={animated ? { animationDelay: "0.35s" } : undefined}
      />
      {/* West lobe (left) */}
      <path
        className={pathClass}
        d="M26 88 V112 A8 8 0 0 0 34 120 H70 A8 8 0 0 0 78 112 V88 A8 8 0 0 0 70 80 H34 A8 8 0 0 0 26 88 Z"
        stroke={gold}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={animated ? { animationDelay: "0.45s" } : undefined}
      />
      {/* East lobe (right) */}
      <path
        className={pathClass}
        d="M122 88 V112 A8 8 0 0 0 130 120 H166 A8 8 0 0 0 174 112 V88 A8 8 0 0 0 166 80 H130 A8 8 0 0 0 122 88 Z"
        stroke={gold}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={animated ? { animationDelay: "0.55s" } : undefined}
      />

      {/* Central square frame where lobes meet */}
      <path
        className={pathClass}
        d="M80 80 H120 V120 H80 Z"
        stroke={gold}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={animated ? { animationDelay: "0.7s" } : undefined}
      />

      {/* Inner glyph marks in each lobe — small ticks, like illuminated nails */}
      {/* North inner U-mark */}
      <path
        className={pathClass}
        d="M95 42 V58 A5 5 0 0 0 100 63 A5 5 0 0 0 105 58 V42"
        stroke={goldWarm}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={animated ? { animationDelay: "0.95s" } : undefined}
      />
      {/* South inner inverted-U-mark */}
      <path
        className={pathClass}
        d="M95 158 V142 A5 5 0 0 1 100 137 A5 5 0 0 1 105 142 V158"
        stroke={goldWarm}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={animated ? { animationDelay: "1.05s" } : undefined}
      />
      {/* West inner C-mark */}
      <path
        className={pathClass}
        d="M58 95 H42 A5 5 0 0 0 37 100 A5 5 0 0 0 42 105 H58"
        stroke={goldWarm}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={animated ? { animationDelay: "1.15s" } : undefined}
      />
      {/* East inner reverse-C-mark */}
      <path
        className={pathClass}
        d="M142 95 H158 A5 5 0 0 1 163 100 A5 5 0 0 1 158 105 H142"
        stroke={goldWarm}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={animated ? { animationDelay: "1.25s" } : undefined}
      />

      {/* Central small cross */}
      <path
        className={pathClass}
        d="M100 88 V112 M88 100 H112"
        stroke={goldWarm}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        style={animated ? { animationDelay: "1.4s" } : undefined}
      />

      {/* Diagonal cross-bars within the central square (subtle X) */}
      <path
        className={pathClass}
        d="M86 86 L94 94 M114 86 L106 94 M86 114 L94 106 M114 114 L106 106"
        stroke={gold}
        strokeOpacity="0.55"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        style={animated ? { animationDelay: "1.55s" } : undefined}
      />
    </svg>
  );
}
