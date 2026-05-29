"use client";

/**
 * The Altar Within \u2014 brand sigil.
 *
 * Centerline vector of the official brand mark (the woven interlocking cross
 * from landing-page-assets/photo_2026-05-10_18-36-19.jpg): the JPG was isolated,
 * skeletonized to single-pixel centerlines, and exported as open stroked paths
 * in a square 1072x1072 viewBox. Rendering as uniform strokes (not fills) keeps
 * the lines crisp AND lets each one "ink itself on" via stroke-dashoffset \u2014 the
 * same draw-on effect the original hand-authored sigil used.
 *
 * Backups: Sigil.filled.bak.tsx (filled-outline trace) and
 * Sigil.handcoded.bak.tsx (original hand-authored approximation). When a
 * higher-res source (2000px+ PNG or original vector) arrives, regenerate the
 * paths below \u2014 the props/API here can stay identical.
 */

export interface SigilProps {
  size?: number;
  /** Draw-on animation (each stroke inks in, staggered top-to-bottom). */
  animated?: boolean;
  gold?: string;
  /** Kept for API compatibility (unused). */
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
  strokeWidth = 16,
  ariaLabel = "The Altar Within sigil \u2014 woven interlocking cross",
  className,
}: SigilProps = {}) {
  void goldWarm;
  const pathClass = animated ? "altar-sigil-trace" : undefined;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1072 1072"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      className={className}
      style={{ display: "block" }}
    >
      <g
        stroke={gold}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path
          className={pathClass}
          d="M 627 570 L 646 543 L 650 522 L 650 192 L 647 181 L 608 167 L 595 148 L 591 110 L 584 105 L 568 103 L 485 107 L 479 113 L 478 141 L 468 162 L 455 172 L 427 179"
          style={
            animated
              ? { strokeDasharray: 713.3, strokeDashoffset: 713.3, animationDelay: "0.05s", animationDuration: "1.016s" }
              : undefined
          }
        />
        <path
          className={pathClass}
          d="M 537 230 L 533 395 L 523 409 L 511 415 L 443 415 L 433 410 L 424 398 L 421 216 L 426 180"
          style={
            animated
              ? { strokeDasharray: 510.2, strokeDashoffset: 510.2, animationDelay: "0.105s", animationDuration: "0.9s" }
              : undefined
          }
        />
        <path
          className={pathClass}
          d="M 362 250 L 273 251 L 247 262 L 227 281 L 216 305 L 213 391 L 208 405"
          style={
            animated
              ? { strokeDasharray: 274.1, strokeDashoffset: 274.1, animationDelay: "0.16s", animationDuration: "0.9s" }
              : undefined
          }
        />
        <path
          className={pathClass}
          d="M 695 250 L 801 251 L 818 257 L 844 281 L 855 308 L 857 389"
          style={
            animated
              ? { strokeDasharray: 271.6, strokeDashoffset: 271.6, animationDelay: "0.214s", animationDuration: "0.9s" }
              : undefined
          }
        />
        <path
          className={pathClass}
          d="M 535 480 L 507 461 L 487 456 L 158 456 L 144 463 L 135 494 L 125 505 L 114 511 L 77 515"
          style={
            animated
              ? { strokeDasharray: 498.0, strokeDashoffset: 498.0, animationDelay: "0.269s", animationDuration: "0.9s" }
              : undefined
          }
        />
        <path
          className={pathClass}
          d="M 605 457 L 570 458 L 535 480"
          style={
            animated
              ? { strokeDasharray: 78.4, strokeDashoffset: 78.4, animationDelay: "0.324s", animationDuration: "0.9s" }
              : undefined
          }
        />
        <path
          className={pathClass}
          d="M 870 571 L 719 570 L 703 565 L 696 558 L 691 544 L 691 481 L 703 462 L 714 459 L 914 457 L 928 460 L 936 494 L 945 504 L 969 514 L 997 515 L 1001 521 L 1001 625 L 951 634 L 937 647 L 927 679 L 917 685 L 578 685 L 553 676 L 536 662"
          style={
            animated
              ? { strokeDasharray: 1222.0, strokeDashoffset: 1222.0, animationDelay: "0.379s", animationDuration: "1.743s" }
              : undefined
          }
        />
        <path
          className={pathClass}
          d="M 535 480 L 535 570"
          style={
            animated
              ? { strokeDasharray: 92.0, strokeDashoffset: 92.0, animationDelay: "0.433s", animationDuration: "0.9s" }
              : undefined
          }
        />
        <path
          className={pathClass}
          d="M 418 503 L 423 509 L 427 549 L 445 571"
          style={
            animated
              ? { strokeDasharray: 78.4, strokeDashoffset: 78.4, animationDelay: "0.488s", animationDuration: "0.9s" }
              : undefined
          }
        />
        <path
          className={pathClass}
          d="M 68 525 L 77 515"
          style={
            animated
              ? { strokeDasharray: 15.5, strokeDashoffset: 15.5, animationDelay: "0.543s", animationDuration: "0.9s" }
              : undefined
          }
        />
        <path
          className={pathClass}
          d="M 68 525 L 70 623 L 73 627 L 108 630 L 124 636 L 138 652 L 143 679 L 154 685 L 312 686 L 360 683 L 376 665 L 381 645 L 381 607 L 374 584 L 367 576 L 358 574"
          style={
            animated
              ? { strokeDasharray: 551.2, strokeDashoffset: 551.2, animationDelay: "0.598s", animationDuration: "0.9s" }
              : undefined
          }
        />
        <path
          className={pathClass}
          d="M 184 570 L 344 570 L 357 573"
          style={
            animated
              ? { strokeDasharray: 175.3, strokeDashoffset: 175.3, animationDelay: "0.652s", animationDuration: "0.9s" }
              : undefined
          }
        />
        <path
          className={pathClass}
          d="M 445 571 L 534 571"
          style={
            animated
              ? { strokeDasharray: 91.0, strokeDashoffset: 91.0, animationDelay: "0.707s", animationDuration: "0.9s" }
              : undefined
          }
        />
        <path
          className={pathClass}
          d="M 445 571 L 425 598 L 421 616 L 423 961 L 458 970 L 475 992 L 477 1027 L 483 1037 L 582 1038 L 588 1036 L 593 1027 L 593 1005 L 598 986 L 615 971 L 647 960"
          style={
            animated
              ? { strokeDasharray: 723.5, strokeDashoffset: 723.5, animationDelay: "0.762s", animationDuration: "1.031s" }
              : undefined
          }
        />
        <path
          className={pathClass}
          d="M 626 571 L 536 571"
          style={
            animated
              ? { strokeDasharray: 92.0, strokeDashoffset: 92.0, animationDelay: "0.817s", animationDuration: "0.9s" }
              : undefined
          }
        />
        <path
          className={pathClass}
          d="M 535 661 L 535 572"
          style={
            animated
              ? { strokeDasharray: 91.0, strokeDashoffset: 91.0, animationDelay: "0.871s", animationDuration: "0.9s" }
              : undefined
          }
        />
        <path
          className={pathClass}
          d="M 648 639 L 647 602 L 627 572"
          style={
            animated
              ? { strokeDasharray: 75.1, strokeDashoffset: 75.1, animationDelay: "0.926s", animationDuration: "0.9s" }
              : undefined
          }
        />
        <path
          className={pathClass}
          d="M 466 688 L 505 683 L 535 662"
          style={
            animated
              ? { strokeDasharray: 77.9, strokeDashoffset: 77.9, animationDelay: "0.981s", animationDuration: "0.9s" }
              : undefined
          }
        />
        <path
          className={pathClass}
          d="M 548 733 L 562 727 L 611 725 L 632 729 L 646 745 L 650 762 L 648 958"
          style={
            animated
              ? { strokeDasharray: 322.4, strokeDashoffset: 322.4, animationDelay: "1.036s", animationDuration: "0.9s" }
              : undefined
          }
        />
        <path
          className={pathClass}
          d="M 532 908 L 535 903 L 535 760 L 537 748 L 548 733"
          style={
            animated
              ? { strokeDasharray: 181.6, strokeDashoffset: 181.6, animationDelay: "1.09s", animationDuration: "0.9s" }
              : undefined
          }
        />
        <path
          className={pathClass}
          d="M 219 741 L 213 765 L 215 836 L 235 871 L 267 890 L 363 896"
          style={
            animated
              ? { strokeDasharray: 271.5, strokeDashoffset: 271.5, animationDelay: "1.145s", animationDuration: "0.9s" }
              : undefined
          }
        />
        <path
          className={pathClass}
          d="M 857 745 L 855 838 L 845 860 L 828 878 L 800 891 L 706 891"
          style={
            animated
              ? { strokeDasharray: 268.8, strokeDashoffset: 268.8, animationDelay: "1.2s", animationDuration: "0.9s" }
              : undefined
          }
        />
      </g>
    </svg>
  );
}
