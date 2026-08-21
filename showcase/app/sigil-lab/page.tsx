"use client";

/**
 * Sigil lab — sandbox for iterating on the brand mark. Not linked anywhere.
 * Visit /sigil-lab.
 *
 * REVEAL is what ships (SigilEntrance): the clean artwork draws itself on
 * through a mask made of the original centerline strokes — old trajectory,
 * new art. OLD shows the retired SigilDraw skeleton for side-by-side timing.
 * STATIC is the resting mark. "show mask" paints the revealing strokes
 * themselves so you can check they cover every line of the art.
 *
 * Rejected here: a flubber centre-out morph (an inflation, not a drawing),
 * and an old->new crossfade hand-off (the old sigil appearing first was
 * never the brief).
 */

import { useState } from "react";
import { SigilDraw } from "@/components/primitives/SigilDraw";
import { SigilEntrance } from "@/components/primitives/SigilEntrance";
import { SigilMark } from "@/components/primitives/SigilMark";

type Mode = "reveal" | "old" | "static";

const GOLD = "#C9A961";

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
      {children}
    </div>
  );
}

function Slider({
  label, value, set, min, max, step = 1,
}: { label: string; value: number; set: (n: number) => void; min: number; max: number; step?: number }) {
  return (
    <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, whiteSpace: "nowrap" }}>
      <span style={{ opacity: 0.75, minWidth: 74 }}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(+e.target.value)} />
      <code style={{ minWidth: 52, textAlign: "right", opacity: 0.9 }}>{value}</code>
    </label>
  );
}

const btn = (active: boolean): React.CSSProperties => ({
  border: `1px solid rgba(201,169,97,${active ? 0.9 : 0.3})`,
  background: active ? "rgba(201,169,97,0.12)" : "transparent",
  color: GOLD, padding: "8px 14px", borderRadius: 4, cursor: "pointer",
  letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 12,
});

export default function SigilLab() {
  const [run, setRun] = useState(0);
  const [mode, setMode] = useState<Mode>("reveal");
  const [size, setSize] = useState(320);
  const [maskWidth, setMaskWidth] = useState(50);
  const [sweepAt, setSweepAt] = useState(3.6);
  const [showMask, setShowMask] = useState(false);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#061f1c",
        color: GOLD,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 26,
        padding: "3rem 1.5rem",
        fontFamily: "var(--font-eb-garamond), Georgia, serif",
      }}
    >
      <div key={run} style={{ minWidth: size, minHeight: size, display: "grid", placeItems: "center" }}>
        {mode === "reveal" && (
          <SigilEntrance size={size} color={GOLD} maskWidth={maskWidth} sweepAt={sweepAt} showMask={showMask} />
        )}
        {mode === "old" && <SigilDraw size={size} />}
        {mode === "static" && <SigilMark size={size} color={GOLD} />}
      </div>

      <Row>
        <button onClick={() => setRun((r) => r + 1)} style={btn(false)}>Replay</button>
        {(["reveal", "old", "static"] as Mode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)} style={btn(mode === m)}>{m}</button>
        ))}
        <button onClick={() => setShowMask((v) => !v)} style={btn(showMask)}>show mask</button>
      </Row>

      <Row>
        <Slider label="size" value={size} set={setSize} min={120} max={520} />
        <Slider label="mask width" value={maskWidth} set={setMaskWidth} min={10} max={60} />
        <Slider label="sweep at" value={sweepAt} set={setSweepAt} min={0} max={8} step={0.1} />
      </Row>
    </main>
  );
}
