"use client";

/**
 * The Altar Within — brand mark, CLEAN OUTLINE version.
 *
 * Source: `make_an_svg_of_the_logo_...svg` (Arrow / QuiverAI vectorization of
 * the official knot-cross mark). Unlike `SigilDraw`, this is the mark as FILLED
 * outline paths — true circles, symmetric ornaments, sharp star points, and
 * none of the skeletonization debt that file carries.
 *
 * Because the paths are filled (not open centerlines), this CANNOT dash-draw.
 * It is the static/resting form: use it for the favicon, OG image, small sizes,
 * and as the hand-off target at the end of the SigilDraw animation.
 *
 * VIEWBOX IS REGISTERED, NOT EYEBALLED. The source viewBox ("4 55.1 99 86") is
 * non-square and off-centre, so the mark landed at the wrong scale and offset
 * when stacked on SigilDraw. Measured with getBBox():
 *   skeleton  bbox 972.9 x 977.33 in a 1000 box, +9.5 stroke half-width each
 *             side => fills 0.9963 of its box, centred (500.55, 503.86)
 *   this mark bbox  87.5 x 86.0, centred (53.45, 98.0)
 * A square viewBox of side max(87.5,86)/0.9963 = 87.822 centred on the mark's
 * own centre makes the two coincide at scale(1) translate(0 0). Verified in
 * /sigil-lab at mix 0.5 — they superimpose as one mark.
 * Re-derive this if the artwork ever changes.
 */

import { MARK_PATHS, MARK_VIEWBOX } from "./sigilMarkPaths";

export interface SigilMarkProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Extra transform applied to the mark group — used by /sigil-lab to register
   *  this mark against the SigilDraw skeleton. */
  transform?: string;
  opacity?: number;
}

export function SigilMark({
  size = 200,
  color = "var(--gold, #C9A961)",
  className,
  style,
  transform,
  opacity = 1,
}: SigilMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={MARK_VIEWBOX}
      className={className}
      style={{ overflow: "visible", opacity, ...style }}
      aria-hidden="true"
      focusable="false"
    >
      <g fill={color} transform={transform}>
        {MARK_PATHS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}
