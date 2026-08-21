"use client";

/**
 * The Altar Within — the brand sigil's production entrance.
 *
 * The CLEAN artwork (sigilMarkPaths) draws itself on, stroke by stroke, along
 * the ORIGINAL draw-on trajectory. How: SigilDraw's 51 centerline strokes and
 * its centre star are rendered inside an SVG <mask> — white, with the exact
 * same stroke-dashoffset / star-in animations they always had — and the
 * filled mark is painted through that mask. A stroke inking itself white
 * reveals the art beneath it. So: same order, same timing, same star-first,
 * same centre-out radiation as the old sigil — but what appears is the
 * corrected outline artwork, not the skeleton.
 *
 * The skeleton lives in a 1000-box; the mark in viewBox "9.539 54.089 87.822
 * 87.822". They're registered (see SigilMark.tsx), so the mark is simply
 * scaled/translated into the 1000-box here and the centerlines land on it.
 *
 * maskWidth: how fat each revealing stroke is, in 1000-box units. MEASURED
 * (2026-08-21, rasterised art vs mask): the old centerlines sit a few units
 * off the new art's centres, so at 30 a full 13.8% of the art was never
 * drawn and only appeared via the sweep — a visible fade at the end. At 50
 * the uncovered remainder is 0.3% (invisible), so the sweep is OFF by
 * default: the entrance is purely the old choreography, nothing fades.
 * `sweep` remains available as an opt-in safety net.
 */

import { useId } from "react";
import { SIGIL_STROKES, STAR } from "./SigilDraw";
import { MARK_PATHS } from "./sigilMarkPaths";

// mark viewBox -> 1000-box
const K = 1000 / 87.822;
const MARK_TRANSFORM = `scale(${K}) translate(-9.539 -54.089)`;
/** The old SigilDraw stroke width — the size of its entrance "stars". */
const STAR_DOT_WIDTH = 19;

export interface SigilEntranceProps {
  size?: number;
  color?: string;
  /** Width of the revealing mask strokes, in 1000-box units. */
  maskWidth?: number;
  /** Opt-in full-frame fade after the last stroke; unnecessary at maskWidth>=50. */
  sweep?: boolean;
  /** When the safety sweep starts (s). Last stroke finishes ~3.55s. */
  sweepAt?: number;
  sweepDur?: number;
  animated?: boolean;
  className?: string;
  /** Debug: paint the mask itself instead of using it. */
  showMask?: boolean;
}

export function SigilEntrance({
  size = 200,
  color = "var(--gold, #C9A961)",
  maskWidth = 50,
  sweep = false,
  sweepAt = 3.6,
  sweepDur = 0.5,
  animated = true,
  className,
  showMask = false,
}: SigilEntranceProps) {
  const id = useId();
  const maskId = `sigil-mask-${id}`;

  const maskContent = (
    <>
      {/* centre star — fades/scales in first, exactly as the old sigil did */}
      <path d={STAR} fill="#fff" className={animated ? "altar-sigil-star" : undefined} />
      {/* Two layers per stroke, same dash animation:
          - FAT: does the revealing. Its dash is parked 1 unit before the
            path start so nothing paints at t=0 — otherwise its round cap
            would leak a 50-wide blob of art before the line starts drawing.
          - THIN (the old sigil's width 19), round-capped: exists ONLY to
            reproduce the old entrance's "stars" — the little round dots that
            appear at each stroke's start a beat before it inks. Those were
            the round caps of zero-length dashes on 19-wide strokes; same
            width here gives the same dots, revealing a dot of art beneath. */}
      {[
        { key: "reveal", w: maskWidth, dots: false },
        { key: "stars", w: STAR_DOT_WIDTH, dots: true },
      ].map(({ key, w, dots }) => (
        <g key={key} stroke="#fff" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none">
          {SIGIL_STROKES.map((s, i) => (
            <path
              key={i}
              d={s.d}
              className={animated ? "altar-sigil-trace" : undefined}
              style={
                animated
                  ? dots
                    ? {
                        // zero-length dash + round cap = the old "star" dot
                        strokeDasharray: s.len,
                        strokeDashoffset: s.len,
                        animationDelay: `${s.delay}s`,
                        animationDuration: `${s.dur}s`,
                      }
                    : {
                        // dash parked 1 unit BEFORE the path start, gap longer
                        // than the path: nothing is painted at t=0, so no fat
                        // dot leaks; round caps still cover the art's line ends.
                        strokeDasharray: `${s.len} ${s.len + 200}`,
                        strokeDashoffset: s.len + 1,
                        animationDelay: `${s.delay}s`,
                        animationDuration: `${s.dur}s`,
                      }
                  : undefined
              }
            />
          ))}
        </g>
      ))}
      {/* safety sweep — whole frame goes white after the last stroke */}
      {sweep && <rect
        x={0}
        y={0}
        width={1000}
        height={1000}
        fill="#fff"
        style={
          animated
            ? {
                opacity: 0,
                animation: `altar-sigil-sweep ${sweepDur}s ease-out ${sweepAt}s forwards`,
              }
            : undefined
        }
      />}
    </>
  );

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1000 1000"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", overflow: "visible" }}
      aria-hidden="true"
      focusable="false"
    >
      {showMask ? (
        <g style={{ color: "#fff" }}>{maskContent}</g>
      ) : (
        <>
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse" x={-50} y={-50} width={1100} height={1100}>
              {maskContent}
            </mask>
          </defs>
          {/* mask and transform MUST be on separate groups: with
              maskUnits=userSpaceOnUse the mask is resolved in the referencing
              element's own user space, so putting it on the scaled group would
              scale the mask 11x away from the art and hide everything. */}
          <g mask={`url(#${maskId})`}>
            <g fill={color} fillRule="evenodd" transform={MARK_TRANSFORM}>
              {MARK_PATHS.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>
          </g>
        </>
      )}
    </svg>
  );
}
