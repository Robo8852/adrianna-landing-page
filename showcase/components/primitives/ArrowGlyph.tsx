export interface ArrowGlyphProps {
  size?: number;
  direction?: "right" | "left";
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export function ArrowGlyph({
  size = 12,
  direction = "right",
  color = "currentColor",
  strokeWidth = 1.5,
  className,
}: ArrowGlyphProps = {}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        transform: direction === "left" ? "scaleX(-1)" : undefined,
      }}
    >
      <path
        d="M2 8 H13"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M9 4 L13 8 L9 12"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
