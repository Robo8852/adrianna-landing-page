"use client";

/**
 * The Altar Within — brand sigil (centerline DRAW-ON, fresh trace).
 *
 * Built from a clean skeletonization of the official knot-cross mark
 * (image-cache .../1.png): gold mask -> 3x upscale -> morphological close ->
 * Zhang–Suen skeleton -> sknw graph -> RDP-simplified open polylines, scaled
 * into a 1000x1000 viewBox. Each visible line is ONE open stroke (fill:none),
 * oriented to start at its center-end so it inks itself OUTWARD via
 * stroke-dashoffset (shared `.altar-sigil-trace` rule in globals.css). Strokes
 * are ordered CENTER-OUT by radius. The filled 4-point star at the middle is
 * drawn first via a quick fade/scale, then the lines radiate.
 *
 * 51 strokes, corner-aware smoothed into flowing curves (sharp corners — the
 * ornament squares, leaf tips, junctions — preserved). Faithful to the source
 * (chiral pinwheel, ~4-fold).
 */

interface SigilStroke { d: string; len: number; delay: number; dur: number; }

// Solid 4-point star, tips on the axes, sides curving CONCAVE toward center
// (tip radius ~80, waist ~42) to match the source mark's bold little star.
const STAR =
  "M 500 420 Q 521.2 478.8 580 500 Q 521.2 521.2 500 580 Q 478.8 521.2 420 500 Q 478.8 478.8 500 420 Z";

const SIGIL_STROKES: SigilStroke[] = [
  // NOTE: three center->tip stub strokes were removed here — they were
  // skeleton bridges gluing the filled star to the arms and ran over the
  // top/left/bottom star tips, blunting them. The star floats alone (as in
  // the source mark), so all four points now read sharp.
  { d: "M 550.9 905.8 C 550.9 905.8 552.1 862.9 553.0 816.0 C 553.9 769.1 553.8 662.2 556.3 624.5 C 558.8 586.8 562.6 600.6 568.2 589.8 C 573.8 579.0 583.1 566.0 589.8 559.5 C 596.5 553.0 589.6 553.1 608.2 550.9 C 626.8 548.7 661.8 547.6 701.3 546.5 C 740.8 545.4 797.6 544.8 845.2 544.4 C 892.8 544.0 987.0 544.4 987.0 544.4", len: 757.6, delay: 0.5, dur: 1.161 },
  { d: "M 902.6 444.8 C 902.6 444.8 772.7 444.6 725.1 443.7 C 677.5 442.8 644.0 444.8 616.9 439.4 C 589.8 434.0 574.9 423.2 562.8 411.3 C 550.7 399.4 548.0 398.9 544.4 368.0 C 540.8 337.1 541.6 267.5 541.1 226.2 C 540.6 184.9 540.9 155.3 541.1 120.1 C 541.3 84.9 542.2 15.2 542.2 15.2", len: 749.5, delay: 0.55, dur: 1.149 },
  { d: "M 94.2 551.9 C 94.2 551.9 310.4 554.8 360.4 556.3 C 410.3 557.8 384.0 557.5 393.9 560.6 C 403.8 563.7 412.5 569.7 419.9 574.7 C 427.3 579.8 432.9 582.8 438.3 590.9 C 443.7 599.0 449.3 575.8 452.4 623.4 C 455.5 671.0 456.2 817.1 456.7 876.6 C 457.2 936.1 456.9 961.5 455.6 980.5 C 454.3 999.5 449.1 990.3 449.1 990.3", len: 771.9, delay: 0.6, dur: 1.167 },
  { d: "M 442.6 94.2 C 442.6 94.2 443.6 311.1 440.5 364.7 C 437.4 418.3 433.8 401.0 424.2 415.6 C 414.6 430.2 451.5 445.4 383.1 452.4 C 314.8 459.4 14.1 457.8 14.1 457.8", len: 765.2, delay: 0.65, dur: 1.151 },
  { d: "M 629.9 496.8 C 629.9 496.8 909.1 491.3 909.1 491.3 C 909.1 491.3 912.4 463.4 911.3 455.6 C 910.2 447.9 902.6 444.8 902.6 444.8", len: 329.5, delay: 0.7, dur: 0.55 },
  { d: "M 491.3 369.0 C 491.3 369.0 494.6 87.7 494.6 87.7 C 494.6 87.7 467.6 84.4 458.9 85.5 C 450.2 86.6 442.6 94.2 442.6 94.2", len: 335.9, delay: 0.75, dur: 0.55 },
  { d: "M 501.1 632.0 C 501.1 632.0 504.3 911.3 504.3 911.3 C 504.3 911.3 531.2 914.3 539.0 913.4 C 546.8 912.5 550.9 905.8 550.9 905.8", len: 328.7, delay: 0.8, dur: 0.55 },
  { d: "M 368.0 504.3 C 368.0 504.3 88.7 505.4 88.7 505.4 C 88.7 505.4 85.7 535.5 86.6 543.3 C 87.5 551.0 94.2 551.9 94.2 551.9", len: 329.6, delay: 0.85, dur: 0.55 },
  { d: "M 615.8 608.2 L 624.5 614.7", len: 10.8, delay: 0.9, dur: 0.55 },
  { d: "M 678.6 306.3 C 678.6 306.3 646.4 312.6 637.4 316.0 C 628.4 319.4 628.6 321.4 624.5 326.8 C 620.4 332.2 614.8 340.2 612.6 348.5 C 610.4 356.8 611.5 376.6 611.5 376.6 C 611.5 376.6 633.2 376.8 642.9 372.3 C 652.6 367.8 663.9 360.6 669.9 349.6 C 675.9 338.6 678.6 306.3 678.6 306.3 Z", len: 224.8, delay: 1.05, dur: 0.55 },
  // Left-quadrant teardrops restored: the trace dropped these two small leaf
  // loops (leaving only stray fragments). We place clean copies of the
  // top-right teardrop above, rotated into position about center
  // (TL = 90deg CCW, BL = 180deg), so all four ornaments match.
  { d: "M 306.3 321.4 C 306.3 321.4 312.6 353.6 316.0 362.6 C 319.4 371.6 321.4 371.4 326.8 375.5 C 332.2 379.6 340.2 385.2 348.5 387.4 C 356.8 389.6 376.6 388.5 376.6 388.5 C 376.6 388.5 376.8 366.8 372.3 357.1 C 367.8 347.4 360.6 336.1 349.6 330.1 C 338.6 324.2 306.3 321.4 306.3 321.4 Z", len: 224.8, delay: 1.1, dur: 0.55 },
  { d: "M 321.4 693.7 C 321.4 693.7 353.6 687.4 362.6 684.0 C 371.6 680.6 371.4 678.6 375.5 673.2 C 379.6 667.8 385.2 659.8 387.4 651.5 C 389.6 643.2 388.5 623.4 388.5 623.4 C 388.5 623.4 366.8 623.2 357.1 627.7 C 347.4 632.2 336.1 639.4 330.1 650.4 C 324.2 661.4 321.4 693.7 321.4 693.7 Z", len: 224.8, delay: 1.15, dur: 0.55 },
  { d: "M 385.3 623.4 C 385.3 623.4 384.5 647.3 382.0 655.8 C 379.5 664.3 380.9 667.3 370.1 674.2 C 359.3 681.1 317.1 697.0 317.1 697.0", len: 113.2, delay: 1.1, dur: 0.55 },
  { d: "M 374.5 387.4 C 374.5 387.4 351.8 387.3 343.1 384.2 C 334.4 381.1 328.1 374.4 322.5 369.0 C 316.9 363.6 312.8 360.7 309.5 351.7 C 306.2 342.7 303.0 314.9 303.0 314.9", len: 116.8, delay: 1.15, dur: 0.55 },
  { d: "M 624.5 614.7 C 624.5 614.7 652.4 615.6 662.3 620.1 C 672.2 624.6 679.0 632.2 684.0 641.8 C 689.0 651.4 692.6 677.5 692.6 677.5", len: 106.4, delay: 1.2, dur: 0.55 },
  { d: "M 624.5 614.7 C 624.5 614.7 627.5 645.5 633.1 655.8 C 638.7 666.1 648.2 672.1 658.0 676.4 C 667.8 680.7 691.6 681.8 691.6 681.8", len: 109.2, delay: 1.25, dur: 0.55 },
  { d: "M 692.6 677.5 L 773.8 678.6", len: 81.2, delay: 1.3, dur: 0.55 },
  { d: "M 692.6 677.5 L 691.6 681.8", len: 4.5, delay: 1.35, dur: 0.55 },
  { d: "M 678.6 306.3 L 679.7 303.0", len: 3.4, delay: 1.4, dur: 0.55 },
  { d: "M 691.6 681.8 L 692.6 760.8", len: 79.0, delay: 1.45, dur: 0.55 },
  { d: "M 679.7 303.0 L 679.7 225.1", len: 77.9, delay: 1.5, dur: 0.55 },
  { d: "M 679.7 303.0 L 757.6 299.8", len: 78.0, delay: 1.55, dur: 0.55 },
  { d: "M 317.1 697.0 L 241.3 698.1", len: 75.8, delay: 1.6, dur: 0.55 },
  { d: "M 317.1 697.0 L 316.0 773.8", len: 76.8, delay: 1.65, dur: 0.55 },
  { d: "M 303.0 314.9 L 299.8 241.3", len: 73.7, delay: 1.7, dur: 0.55 },
  { d: "M 303.0 314.9 L 225.1 316.0", len: 77.9, delay: 1.75, dur: 0.55 },
  { d: "M 399.4 194.8 C 399.4 194.8 400.8 182.8 384.2 190.5 C 367.6 198.2 299.8 241.3 299.8 241.3", len: 118.6, delay: 1.8, dur: 0.55 },
  { d: "M 809.5 589.8 L 773.8 678.6", len: 95.7, delay: 1.85, dur: 0.55 },
  { d: "M 692.6 760.8 L 773.8 757.6", len: 81.2, delay: 1.9, dur: 0.55 },
  { d: "M 692.6 760.8 C 692.6 760.8 698.2 764.8 684.0 772.7 C 669.8 780.6 607.1 808.4 607.1 808.4", len: 101.5, delay: 1.95, dur: 0.55 },
  { d: "M 241.3 698.1 C 241.3 698.1 227.2 684.7 218.6 669.9 C 209.9 655.1 189.4 609.3 189.4 609.3", len: 103.6, delay: 2.0, dur: 0.55 },
  { d: "M 241.3 698.1 C 241.3 698.1 242.4 769.5 242.4 769.5 C 242.4 769.5 316.0 773.8 316.0 773.8", len: 145.1, delay: 2.05, dur: 0.55 },
  { d: "M 757.6 299.8 L 753.2 225.1", len: 74.8, delay: 2.1, dur: 0.55 },
  { d: "M 757.6 299.8 L 809.5 390.7", len: 104.7, delay: 2.15, dur: 0.55 },
  { d: "M 589.8 186.1 L 679.7 225.1", len: 97.9, delay: 2.2, dur: 0.55 },
  { d: "M 773.8 678.6 L 773.8 757.6", len: 79.0, delay: 2.25, dur: 0.55 },
  { d: "M 299.8 241.3 L 228.4 241.3", len: 71.4, delay: 2.3, dur: 0.55 },
  { d: "M 679.7 225.1 L 753.2 225.1", len: 73.6, delay: 2.35, dur: 0.55 },
  { d: "M 182.9 410.2 L 225.1 316.0", len: 103.2, delay: 2.4, dur: 0.55 },
  { d: "M 316.0 773.8 L 412.3 818.2", len: 106.0, delay: 2.45, dur: 0.55 },
  { d: "M 225.1 316.0 L 228.4 241.3", len: 74.7, delay: 2.5, dur: 0.55 },
  { d: "M 753.2 225.1 L 781.4 197.0", len: 39.8, delay: 2.55, dur: 0.55 },
  { d: "M 228.4 241.3 L 206.7 219.7", len: 30.6, delay: 2.6, dur: 0.55 },
  { d: "M 773.8 757.6 L 789.0 772.7", len: 21.4, delay: 2.65, dur: 0.55 },
  { d: "M 789.0 772.7 C 789.0 772.7 809.6 764.2 818.2 755.4 C 826.9 746.6 828.8 743.5 840.9 719.7 C 853.0 695.9 890.7 612.6 890.7 612.6", len: 194.8, delay: 2.7, dur: 0.55 },
  { d: "M 789.0 772.7 C 789.0 772.7 789.6 782.8 783.5 791.1 C 777.4 799.4 767.2 810.4 752.2 822.5 C 737.2 834.6 717.3 851.0 693.7 863.6 C 670.1 876.2 634.2 891.3 610.4 898.3 C 586.6 905.3 550.9 905.8 550.9 905.8", len: 286.1, delay: 2.75, dur: 0.55 },
  { d: "M 206.7 219.7 C 206.7 219.7 214.4 202.6 229.4 189.4 C 244.4 176.2 268.0 156.2 296.5 140.7 C 325.0 125.2 376.0 104.0 400.4 96.3 C 424.8 88.5 442.6 94.2 442.6 94.2", len: 277.1, delay: 2.8, dur: 0.55 },
  { d: "M 206.7 219.7 C 206.7 219.7 196.6 221.8 189.4 229.4 C 182.2 237.0 177.5 239.2 163.4 265.2 C 149.3 291.2 105.0 385.3 105.0 385.3", len: 198.1, delay: 2.85, dur: 0.55 },
  { d: "M 902.6 444.8 C 902.6 444.8 902.8 404.0 898.3 384.2 C 893.8 364.4 885.1 346.0 875.5 325.8 C 865.9 305.6 856.6 284.5 840.9 263.0 C 825.2 241.5 781.4 197.0 781.4 197.0", len: 284.4, delay: 2.9, dur: 0.55 },
  { d: "M 94.2 551.9 C 94.2 551.9 92.1 570.7 95.2 586.6 C 98.3 602.5 99.1 618.0 112.6 647.2 C 126.1 676.4 150.2 728.4 176.4 761.9 C 202.6 795.4 234.9 824.9 269.5 848.5 C 304.1 872.1 384.2 903.7 384.2 903.7", len: 484.7, delay: 2.95, dur: 0.744 },
  { d: "M 781.4 197.0 C 781.4 197.0 747.5 161.8 718.6 143.9 C 689.7 126.0 608.2 89.8 608.2 89.8", len: 205.4, delay: 3.0, dur: 0.55 },
];

export interface SigilDrawProps {
  size?: number;
  animated?: boolean;
  gold?: string;
  strokeWidth?: number;
  ariaLabel?: string;
  className?: string;
}

export function SigilDraw({
  size = 200,
  animated = true,
  gold = "#C9A961",
  strokeWidth = 19,
  ariaLabel = "The Altar Within sigil — interlocking-knot cross",
  className,
}: SigilDrawProps = {}) {
  const cls = animated ? "altar-sigil-trace" : undefined;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1000 1000"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      className={className}
      style={{ display: "block" }}
    >
      {/* center star — fades/scales in first */}
      <path
        d={STAR}
        fill={gold}
        className={animated ? "altar-sigil-star" : undefined}
      />
      <g
        stroke={gold}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {SIGIL_STROKES.map((s, i) => (
          <path
            key={i}
            className={cls}
            d={s.d}
            style={
              animated
                ? {
                    strokeDasharray: s.len,
                    strokeDashoffset: s.len,
                    animationDelay: `${s.delay}s`,
                    animationDuration: `${s.dur}s`,
                  }
                : undefined
            }
          />
        ))}
      </g>
    </svg>
  );
}
