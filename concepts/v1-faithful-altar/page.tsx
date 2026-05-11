import { Cormorant_Garamond, EB_Garamond } from "next/font/google";
import { Button } from "@/components/ui/button";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-eb-garamond",
  display: "swap",
});

export default function FaithfulAltarHero() {
  return (
    <main
      className={`${cormorant.variable} ${ebGaramond.variable} relative min-h-screen w-full overflow-hidden`}
      style={{
        backgroundColor: "var(--ink-green)",
        color: "var(--parchment)",
      }}
    >
      {/* Palette + keyframes scoped to this hero */}
      <style jsx global>{`
        :root {
          --ink-green: #0b3b36;
          --gold: #c9a961;
          --gold-warm: #d9be7e;
          --parchment: #f3eeda;
          --shadow: #061f1c;
        }

        @keyframes altar-fade-up {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes altar-fade-scale {
          from {
            opacity: 0;
            transform: scale(0.94);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes altar-stroke-draw {
          from {
            stroke-dashoffset: 1400;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes altar-rule-extend {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }

        @keyframes altar-mote-drift {
          0% {
            transform: translate3d(0, 0, 0);
            opacity: 0;
          }
          15% {
            opacity: 0.55;
          }
          85% {
            opacity: 0.55;
          }
          100% {
            transform: translate3d(8px, -180px, 0);
            opacity: 0;
          }
        }

        .altar-reveal {
          opacity: 0;
          animation: altar-fade-up 1.6s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        }

        .altar-sigil-reveal {
          opacity: 0;
          animation: altar-fade-scale 1.6s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        }

        .altar-rule {
          transform: scaleX(0);
          transform-origin: center;
          animation: altar-rule-extend 1.4s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        }

        .altar-sigil-path {
          stroke-dasharray: 1400;
          stroke-dashoffset: 1400;
          animation: altar-stroke-draw 2.2s cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }

        .altar-mote {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 9999px;
          background: var(--gold-warm);
          filter: blur(0.4px);
          opacity: 0;
          animation: altar-mote-drift linear infinite;
          pointer-events: none;
        }
      `}</style>

      {/* Film grain (SVG noise) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] mix-blend-overlay"
        style={{
          opacity: 0.08,
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.79  0 0 0 0 0.66  0 0 0 0 0.38  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundSize: "240px 240px",
        }}
      />

      {/* Vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(6,31,28,0) 0%, rgba(6,31,28,0) 45%, rgba(6,31,28,0.55) 80%, rgba(6,31,28,0.85) 100%)",
        }}
      />

      {/* Slow gold motes */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[3]">
        <span className="altar-mote" style={{ left: "12%", bottom: "8%", animationDuration: "22s", animationDelay: "1s" }} />
        <span className="altar-mote" style={{ left: "28%", bottom: "14%", animationDuration: "28s", animationDelay: "5s" }} />
        <span className="altar-mote" style={{ left: "52%", bottom: "6%", animationDuration: "30s", animationDelay: "9s" }} />
        <span className="altar-mote" style={{ left: "68%", bottom: "12%", animationDuration: "26s", animationDelay: "3s" }} />
        <span className="altar-mote" style={{ left: "82%", bottom: "9%", animationDuration: "32s", animationDelay: "14s" }} />
        <span className="altar-mote" style={{ left: "40%", bottom: "18%", animationDuration: "24s", animationDelay: "11s" }} />
      </div>

      {/* Thin gold frame inset, like a chapel door panel */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-6 z-[4] md:inset-10"
        style={{
          border: "1px solid rgba(201, 169, 97, 0.18)",
          boxShadow: "inset 0 0 0 1px rgba(201, 169, 97, 0.06)",
        }}
      />

      {/* Centered consecrated stack */}
      <section
        className="relative z-[5] mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-48 text-center"
        style={{ fontFamily: "var(--font-eb-garamond), Georgia, serif" }}
      >
        {/* Sigil — hand-authored quatrefoil cross */}
        <div className="altar-sigil-reveal" style={{ animationDelay: "0.05s" }}>
          <Sigil />
        </div>

        {/* Brand */}
        <h1
          className="altar-reveal mt-12 text-5xl font-light leading-none tracking-[0.01em] md:text-6xl"
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            color: "var(--parchment)",
            animationDelay: "1.05s",
            textShadow: "0 1px 0 rgba(6,31,28,0.45)",
          }}
        >
          The Altar Within
        </h1>

        {/* Motto with em-dash flourishes */}
        <p
          className="altar-reveal mt-5 text-[0.78rem] md:text-sm"
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            color: "var(--gold-warm)",
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            animationDelay: "1.55s",
          }}
        >
          <span style={{ color: "var(--gold)" }}>—&nbsp;&nbsp;</span>
          LUX&nbsp;·&nbsp;VERITAS&nbsp;·&nbsp;FORMA
          <span style={{ color: "var(--gold)" }}>&nbsp;&nbsp;—</span>
        </p>

        {/* Hairline divider — extends from center */}
        <div
          className="altar-rule mt-10 h-px w-64"
          style={{
            background:
              "linear-gradient(to right, transparent 0%, rgba(201,169,97,0.0) 0%, rgba(201,169,97,0.85) 50%, rgba(201,169,97,0.0) 100%)",
            animationDelay: "1.95s",
          }}
        />

        {/* Tagline */}
        <p
          className="altar-reveal mt-10 max-w-xl text-base leading-relaxed md:text-lg"
          style={{
            color: "var(--parchment)",
            opacity: 0.92,
            animationDelay: "2.25s",
            letterSpacing: "0.02em",
          }}
        >
          Transpersonal Psychotherapist&nbsp;·&nbsp;Psychedelic Integration Specialist&nbsp;·&nbsp;Conscious Leadership Mentor
        </p>

        {/* Practitioner subline */}
        <p
          className="altar-reveal mt-3 text-base italic md:text-lg"
          style={{
            color: "var(--gold-warm)",
            animationDelay: "2.45s",
            letterSpacing: "0.04em",
          }}
        >
          with Adrianna Naílah
        </p>

        {/* Brief positioning */}
        <p
          className="altar-reveal mt-8 max-w-lg text-sm leading-relaxed md:text-[0.95rem]"
          style={{
            color: "rgba(243,238,218,0.72)",
            animationDelay: "2.7s",
          }}
        >
          CPTSD and Post-Traumatic Growth Educator — demystifying maladaptive learned
          behaviors and complex mental health disharmonies.
        </p>

        {/* CTA */}
        <form
          className="altar-reveal mt-14 flex w-full max-w-md flex-col items-stretch gap-3 sm:flex-row sm:items-center"
          style={{ animationDelay: "3.0s" }}
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder="your email"
            aria-label="your email"
            style={{
              flex: 1,
              backgroundColor: "transparent",
              border: "1px solid rgba(201,169,97,0.35)",
              color: "var(--parchment)",
              padding: "0.85rem 1rem",
              fontFamily: "var(--font-eb-garamond), Georgia, serif",
              fontStyle: "italic",
              fontSize: "0.95rem",
              letterSpacing: "0.04em",
              outline: "none",
              borderRadius: 0,
            }}
            onFocus={(e) => {
              e.currentTarget.style.border = "1px solid rgba(201,169,97,0.75)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.border = "1px solid rgba(201,169,97,0.35)";
            }}
          />
          <Button
            type="submit"
            variant="ghost"
            style={{
              backgroundColor: "transparent",
              color: "var(--gold-warm)",
              border: "1px solid var(--gold)",
              borderRadius: 0,
              fontFamily: "var(--font-cormorant), Georgia, serif",
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              fontSize: "0.78rem",
              padding: "0.85rem 1.6rem",
              height: "auto",
              boxShadow: "inset 0 0 0 1px rgba(201,169,97,0.18)",
              transition: "background-color 350ms ease, color 350ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(201,169,97,0.08)";
              e.currentTarget.style.color = "var(--parchment)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--gold-warm)";
            }}
          >
            Join the Vespers
          </Button>
        </form>
      </section>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hand-authored quatrefoil cross sigil                                       */
/*  Four rounded-square lobes arranged on a cross axis, with inner glyph marks */
/*  (a small central cross + tick marks in each lobe), echoing the reference.  */
/* -------------------------------------------------------------------------- */
function Sigil() {
  const gold = "#C9A961";
  const goldWarm = "#D9BE7E";
  const stroke = 1.5;

  return (
    <svg
      width="148"
      height="148"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="The Altar Within sigil — quatrefoil cross"
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
        className="altar-sigil-path"
        d="M88 26 H112 A8 8 0 0 1 120 34 V70 A8 8 0 0 1 112 78 H88 A8 8 0 0 1 80 70 V34 A8 8 0 0 1 88 26 Z"
        stroke={gold}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ animationDelay: "0.25s" }}
      />
      {/* South lobe (bottom) */}
      <path
        className="altar-sigil-path"
        d="M88 122 H112 A8 8 0 0 1 120 130 V166 A8 8 0 0 1 112 174 H88 A8 8 0 0 1 80 166 V130 A8 8 0 0 1 88 122 Z"
        stroke={gold}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ animationDelay: "0.35s" }}
      />
      {/* West lobe (left) */}
      <path
        className="altar-sigil-path"
        d="M26 88 V112 A8 8 0 0 0 34 120 H70 A8 8 0 0 0 78 112 V88 A8 8 0 0 0 70 80 H34 A8 8 0 0 0 26 88 Z"
        stroke={gold}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ animationDelay: "0.45s" }}
      />
      {/* East lobe (right) */}
      <path
        className="altar-sigil-path"
        d="M122 88 V112 A8 8 0 0 0 130 120 H166 A8 8 0 0 0 174 112 V88 A8 8 0 0 0 166 80 H130 A8 8 0 0 0 122 88 Z"
        stroke={gold}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ animationDelay: "0.55s" }}
      />

      {/* Central square frame where lobes meet */}
      <path
        className="altar-sigil-path"
        d="M80 80 H120 V120 H80 Z"
        stroke={gold}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ animationDelay: "0.7s" }}
      />

      {/* Inner glyph marks in each lobe — small ticks, like illuminated nails */}
      {/* North inner U-mark */}
      <path
        className="altar-sigil-path"
        d="M95 42 V58 A5 5 0 0 0 100 63 A5 5 0 0 0 105 58 V42"
        stroke={goldWarm}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ animationDelay: "0.95s" }}
      />
      {/* South inner inverted-U-mark */}
      <path
        className="altar-sigil-path"
        d="M95 158 V142 A5 5 0 0 1 100 137 A5 5 0 0 1 105 142 V158"
        stroke={goldWarm}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ animationDelay: "1.05s" }}
      />
      {/* West inner C-mark */}
      <path
        className="altar-sigil-path"
        d="M58 95 H42 A5 5 0 0 0 37 100 A5 5 0 0 0 42 105 H58"
        stroke={goldWarm}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ animationDelay: "1.15s" }}
      />
      {/* East inner reverse-C-mark */}
      <path
        className="altar-sigil-path"
        d="M142 95 H158 A5 5 0 0 1 163 100 A5 5 0 0 1 158 105 H142"
        stroke={goldWarm}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ animationDelay: "1.25s" }}
      />

      {/* Central small cross */}
      <path
        className="altar-sigil-path"
        d="M100 88 V112 M88 100 H112"
        stroke={goldWarm}
        strokeWidth={stroke}
        strokeLinecap="round"
        style={{ animationDelay: "1.4s" }}
      />

      {/* Diagonal cross-bars within the central square (subtle X) */}
      <path
        className="altar-sigil-path"
        d="M86 86 L94 94 M114 86 L106 94 M86 114 L94 106 M114 114 L106 106"
        stroke={gold}
        strokeOpacity="0.55"
        strokeWidth={stroke}
        strokeLinecap="round"
        style={{ animationDelay: "1.55s" }}
      />
    </svg>
  );
}
