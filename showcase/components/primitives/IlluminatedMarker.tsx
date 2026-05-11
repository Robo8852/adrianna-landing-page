export interface IlluminatedMarkerProps {
  variant?: "plus" | "triplet";
  color?: string;
  size?: number;
  className?: string;
}

export function IlluminatedMarker({
  variant = "plus",
  color = "var(--gold)",
  size = 14,
  className,
}: IlluminatedMarkerProps = {}) {
  if (variant === "triplet") {
    return (
      <div
        aria-hidden="true"
        className={className}
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: "12px",
          opacity: 0.7,
        }}
      >
        <span
          style={{
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: color,
            display: "inline-block",
          }}
        />
        <span
          style={{
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: color,
            display: "inline-block",
          }}
        />
        <span
          style={{
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: color,
            display: "inline-block",
          }}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        width: "100%",
        textAlign: "center",
        fontFamily: "var(--font-cormorant), Georgia, serif",
        fontSize: size,
        color,
        opacity: 0.85,
        letterSpacing: "0.2em",
      }}
    >
      +
    </div>
  );
}
