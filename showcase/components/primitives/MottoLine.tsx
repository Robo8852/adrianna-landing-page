export interface MottoLineProps {
  text?: string;
  size?: string;
  className?: string;
}

export function MottoLine({
  text = "LUX · VERITAS · FORMA",
  size = "0.78rem",
  className,
}: MottoLineProps = {}) {
  return (
    <p
      className={className}
      style={{
        fontFamily: "var(--font-cormorant), Georgia, serif",
        fontSize: size,
        color: "var(--gold-warm)",
        letterSpacing: "0.4em",
        textTransform: "uppercase",
        margin: 0,
      }}
    >
      <span style={{ color: "var(--gold)" }}>{"—  "}</span>
      {text}
      <span style={{ color: "var(--gold)" }}>{"  —"}</span>
    </p>
  );
}
