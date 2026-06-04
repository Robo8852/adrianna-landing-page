"use client";

/**
 * The Altar Within — brand sigil.
 *
 * Vector trace of the official brand mark: a circular interlocking-knot cross
 * with a four-pointed star at the center. The source raster
 * (landing-page-assets/altar-sigil-knot.png) was thresholded to clean
 * black/white and auto-traced with potrace into filled outline paths, then
 * recolored to brand gold so it reads on the dark ink-green hero.
 *
 * Unlike the earlier centerline line-art (Sigil.lineart.bak.tsx), these are
 * filled shapes — so there is no per-stroke "ink-on" draw animation. The
 * mark still fades + scales in via the wrapper's `.altar-sigil-reveal`.
 *
 * Backups: Sigil.lineart.bak.tsx (centerline trace w/ draw-on),
 * Sigil.filled.bak.tsx, Sigil.handcoded.bak.tsx. When a higher-res source
 * arrives, re-run potrace and replace SIGIL_PATHS below — the props/API here
 * can stay identical.
 */

/** potrace output, normalized to single-line `d` strings. */
const SIGIL_PATHS = [
  "M1550 1575 c0 -315 1 -338 20 -375 11 -21 33 -48 50 -60 61 -43 108 -50 357 -50 180 0 233 -3 233 -12 0 -10 -45 -12 -197 -11 -109 2 -222 0 -251 -3 -51 -5 -53 -7 -50 -32 l3 -27 275 0 275 0 -3 75 c-13 315 -254 612 -554 684 -26 6 -28 4 -28 -23 0 -27 5 -31 63 -50 163 -55 302 -176 380 -332 58 -118 83 -198 62 -205 -7 -3 -116 -4 -242 -2 -199 3 -233 5 -266 22 -66 33 -67 36 -67 406 l0 330 -30 0 -30 0 0 -335z",
  "M1375 1775 c-227 -41 -432 -195 -535 -403 -43 -86 -64 -152 -52 -164 22 -22 47 -2 67 52 24 66 77 164 110 205 l25 30 0 -71 c0 -59 -5 -83 -30 -135 -16 -35 -32 -79 -36 -96 -6 -31 -5 -33 22 -33 27 0 31 5 47 59 27 87 40 101 90 101 40 0 44 -2 62 -42 27 -58 74 -88 136 -88 44 0 49 2 49 23 0 12 -11 46 -25 75 -21 46 -32 56 -75 75 -48 21 -50 23 -50 64 0 39 4 45 40 68 22 14 58 32 80 41 22 9 40 20 40 24 0 21 -14 40 -29 40 -21 0 -116 -45 -148 -70 -20 -16 -40 -20 -92 -20 l-66 1 51 48 c29 26 87 66 130 88 82 42 178 76 188 66 11 -11 6 -437 -5 -478 -6 -21 -26 -54 -44 -72 l-33 -33 -336 0 -336 0 0 -30 0 -30 333 0 c325 0 334 1 377 23 36 17 51 34 74 79 l29 57 -1 233 c-1 128 1 241 4 251 3 9 12 17 20 17 12 0 14 -40 14 -251 l0 -250 28 3 27 3 3 278 2 277 -42 -1 c-24 0 -74 -7 -113 -14z m-247 -362 c-3 -36 -5 -38 -40 -41 l-38 -3 0 40 0 41 41 0 40 0 -3 -37z m99 -115 c28 -32 36 -48 23 -48 -14 0 -60 46 -60 60 0 17 15 12 37 -12z",
  "M1641 1592 c-12 -23 -3 -37 29 -47 14 -4 46 -16 73 -27 47 -20 47 -21 47 -68 0 -46 -2 -49 -37 -67 -52 -26 -75 -62 -81 -128 -5 -62 2 -66 69 -43 54 18 86 45 109 93 21 44 24 46 62 43 35 -2 44 -7 66 -43 14 -22 32 -57 40 -77 10 -25 21 -38 34 -38 42 0 33 45 -29 152 -29 49 -33 65 -33 127 l0 71 -79 0 c-66 0 -89 5 -142 29 -90 41 -116 45 -128 23z m289 -152 c0 -39 -1 -40 -34 -40 -41 0 -53 25 -37 78 1 1 17 2 36 2 34 0 35 -1 35 -40z m-140 -120 c0 -5 -10 -18 -22 -30 -37 -34 -51 -23 -22 18 15 22 44 30 44 12z",
  "M1486 1156 c-8 -44 -39 -82 -84 -105 l-36 -19 40 -20 c38 -19 71 -66 88 -124 8 -28 26 -21 26 10 0 39 35 90 75 109 43 20 44 27 5 43 -38 16 -69 59 -77 105 -7 45 -29 45 -37 1z",
  "M740 991 c0 -78 46 -237 98 -336 87 -166 256 -310 421 -359 58 -17 75 -12 69 20 -2 13 -23 26 -63 40 -127 43 -226 115 -310 224 -78 101 -161 304 -130 316 7 3 119 4 248 2 230 -3 234 -3 270 -28 24 -16 41 -37 47 -60 6 -20 10 -175 10 -353 l0 -318 28 3 27 3 3 318 c1 194 -2 334 -8 357 -14 52 -42 84 -98 112 -45 22 -58 23 -299 26 -211 3 -253 6 -253 18 0 12 40 14 250 14 l250 0 0 25 0 25 -280 0 -280 0 0 -49z",
  "M1659 947 c-19 -12 -45 -44 -59 -72 -24 -49 -25 -57 -28 -302 -3 -207 -7 -253 -18 -253 -11 0 -14 45 -16 248 l-3 247 -27 3 -28 3 0 -280 0 -281 49 0 c60 0 160 22 248 55 188 71 355 247 430 453 25 69 24 82 -11 82 -20 0 -27 -11 -51 -76 -25 -73 -101 -204 -117 -204 -5 0 -8 29 -8 64 0 50 7 78 29 127 17 35 31 78 33 94 3 26 -1 30 -24 33 -22 3 -27 -1 -33 -30 -9 -39 -43 -110 -59 -120 -6 -4 -27 -8 -47 -8 -32 0 -38 4 -54 41 -25 54 -66 82 -132 87 -48 4 -53 2 -53 -15 0 -64 53 -146 105 -163 36 -12 36 -12 33 -63 l-3 -52 -73 -35 c-58 -28 -72 -39 -70 -55 5 -32 59 -23 140 24 59 34 80 41 124 41 30 0 54 -4 54 -9 0 -12 -82 -80 -139 -115 -43 -27 -139 -67 -193 -80 l-28 -6 0 238 c0 227 1 240 23 282 16 34 31 48 57 57 24 8 135 12 358 12 l322 1 0 25 0 25 -349 0 c-344 0 -348 0 -382 -23z m140 -184 c12 -14 19 -28 17 -30 -8 -8 -45 17 -56 37 -17 31 14 26 39 -7z m161 -128 l0 -45 -40 0 -40 0 0 45 0 45 40 0 40 0 0 -45z",
  "M938 849 c-16 -9 -16 -13 6 -64 13 -29 36 -71 50 -92 22 -32 26 -49 26 -110 l0 -73 78 0 c67 0 88 -4 138 -29 32 -16 76 -33 97 -37 38 -6 38 -6 35 21 -3 24 -12 31 -68 52 -84 32 -90 38 -90 87 0 38 3 42 41 61 57 27 79 60 86 128 6 55 5 57 -18 57 -36 0 -125 -45 -143 -72 -8 -13 -18 -35 -21 -50 -7 -25 -11 -28 -51 -28 -42 0 -46 3 -74 47 -16 25 -34 61 -41 80 -11 34 -22 39 -51 22z m333 -91 c-7 -20 -50 -52 -58 -44 -11 10 41 63 64 66 1 0 -1 -10 -6 -22z m-113 -150 l3 -38 -40 0 -41 0 0 41 0 40 38 -3 c35 -3 37 -5 40 -40z",
];

export interface SigilProps {
  size?: number;
  /** Kept for API compatibility (the wrapper handles the fade/scale reveal). */
  animated?: boolean;
  gold?: string;
  /** Kept for API compatibility (unused). */
  goldWarm?: string;
  /** Kept for API compatibility (filled mark — unused). */
  strokeWidth?: number;
  ariaLabel?: string;
  className?: string;
}

export function Sigil({
  size = 148,
  animated = true,
  gold = "#C9A961",
  goldWarm = "#D9BE7E",
  strokeWidth = 16,
  ariaLabel = "The Altar Within sigil — interlocking-knot cross",
  className,
}: SigilProps = {}) {
  void goldWarm;
  void strokeWidth;
  void animated;

  return (
    <svg
      width={size}
      height={size}
      viewBox="-12 -12 201 201.132845"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      className={className}
      style={{ display: "block" }}
    >
      <g
        transform="translate(-62.000000,191.000000) scale(0.100000,-0.100000)"
        fill={gold}
        stroke="none"
      >
        {SIGIL_PATHS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}
