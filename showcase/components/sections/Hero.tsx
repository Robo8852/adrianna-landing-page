"use client";

import { Button } from "@/components/ui/button";
import { SigilDraw } from "@/components/primitives/SigilDraw";

export default function Hero() {
  return (
    <section
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        backgroundColor: "var(--ink-green)",
        color: "var(--parchment)",
      }}
    >
      {/* Palette + keyframes scoped to this hero */}
      <style jsx global>{`
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
        {/* Sigil — centerline trace of the official brand mark; inks itself on */}
        <div>
          <SigilDraw size={200} />
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
          Traditional Psychology&nbsp;•&nbsp;Spiritual Direction&nbsp;•&nbsp;Conservative Counseling
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
          with Judith Adrianna Naílah
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
            Subscribe to Our Newsletter
          </Button>
        </form>
      </section>
    </section>
  );
}

