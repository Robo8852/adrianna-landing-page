"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Sigil } from "@/components/primitives/Sigil";
import { useScrolled } from "@/lib/hooks/useScrolled";
import { bookingUrl, useCalendly } from "@/features/calendly";

const linkStyle = (active: boolean): CSSProperties => ({
  fontFamily: "var(--font-cormorant), Georgia, serif",
  fontSize: "0.78rem",
  letterSpacing: "0.28em",
  textTransform: "uppercase",
  color: active ? "var(--gold-warm)" : "var(--parchment)",
  textDecoration: "none",
  transition: "color 200ms ease",
});

const brassPlaqueStyle: CSSProperties = {
  backgroundColor: "transparent",
  color: "var(--gold-warm)",
  border: "1px solid var(--gold)",
  padding: "0.55rem 1.1rem",
  fontFamily: "var(--font-cormorant), Georgia, serif",
  letterSpacing: "0.32em",
  textTransform: "uppercase",
  fontSize: "0.65rem",
  boxShadow: "inset 0 0 0 1px rgba(201,169,97,0.18)",
  textDecoration: "none",
  transition: "color 200ms ease, background-color 200ms ease",
};

const mobileBrassPlaqueStyle: CSSProperties = {
  ...brassPlaqueStyle,
  fontSize: "0.78rem",
  padding: "0.85rem 1.6rem",
};

export function HeaderNav() {
  const pathname = usePathname();
  const scrolled = useScrolled(80);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { open: openBooking } = useCalendly();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const isHome = pathname === "/";
  const isAbout = pathname === "/about" || pathname.startsWith("/about/");

  const overlay = menuOpen ? (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        backgroundColor: "var(--ink-green)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "1rem",
          border: "1px solid rgba(201,169,97,0.18)",
          pointerEvents: "none",
        }}
      />
      <button
        type="button"
        onClick={() => setMenuOpen(false)}
        aria-label="Close menu"
        style={{
          position: "absolute",
          top: "1.25rem",
          right: "1.5rem",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "1.5rem",
          color: "var(--gold-warm)",
          padding: "0.5rem",
          lineHeight: 1,
        }}
      >
        ×
      </button>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
        }}
      >
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          style={mobileBrassPlaqueStyle}
        >
          Home
        </Link>
        <Link
          href="/about"
          onClick={() => setMenuOpen(false)}
          style={mobileBrassPlaqueStyle}
        >
          About
        </Link>
        <Link
          href="/#newsletter"
          onClick={() => setMenuOpen(false)}
          style={{ ...linkStyle(false), fontSize: "0.95rem" }}
        >
          Newsletter
        </Link>
        <button
          type="button"
          onClick={() => {
            setMenuOpen(false);
            openBooking(bookingUrl("session"));
          }}
          style={{ ...mobileBrassPlaqueStyle, cursor: "pointer" }}
        >
          Book a Session
        </button>
      </div>
    </div>
  ) : null;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        padding: "0.9rem 1.5rem",
        backgroundColor: scrolled ? "rgba(11,59,54,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(8px)" : undefined,
        WebkitBackdropFilter: scrolled ? "blur(8px)" : undefined,
        borderBottom: scrolled
          ? "1px solid rgba(201,169,97,0.35)"
          : "1px solid transparent",
        transition: "background-color 250ms ease, border-bottom-color 250ms ease",
      }}
    >
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "72rem",
          margin: "0 auto",
        }}
      >
        <Link
          href="/"
          aria-label="The Altar Within — home"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "0.7rem",
            textDecoration: "none",
          }}
        >
          <Sigil size={28} animated={false} ariaLabel="" />
          <span
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "1.5rem",
              color: "var(--parchment)",
              letterSpacing: "0.04em",
            }}
          >
            The Altar Within
          </span>
        </Link>

        {/* Desktop links */}
        <div
          className="hidden sm:flex"
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: "1.2rem",
          }}
        >
          <Link
            href="/"
            style={linkStyle(isHome)}
            onMouseEnter={(e) => {
              if (!isHome) e.currentTarget.style.color = "var(--gold-warm)";
            }}
            onMouseLeave={(e) => {
              if (!isHome) e.currentTarget.style.color = "var(--parchment)";
            }}
          >
            Home
          </Link>
          <span aria-hidden="true" style={{ color: "var(--gold)" }}>
            ·
          </span>
          <Link
            href="/about"
            style={linkStyle(isAbout)}
            onMouseEnter={(e) => {
              if (!isAbout) e.currentTarget.style.color = "var(--gold-warm)";
            }}
            onMouseLeave={(e) => {
              if (!isAbout) e.currentTarget.style.color = "var(--parchment)";
            }}
          >
            About
          </Link>
          <Link
            href="/#newsletter"
            style={linkStyle(false)}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--gold-warm)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--parchment)";
            }}
          >
            Newsletter
          </Link>
          <button
            type="button"
            onClick={() => openBooking(bookingUrl("session"))}
            style={{ ...brassPlaqueStyle, cursor: "pointer" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(201,169,97,0.08)";
              e.currentTarget.style.color = "var(--parchment)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--gold-warm)";
            }}
          >
            Book a Session
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          className="flex sm:hidden flex-col items-center justify-center"
          style={{
            gap: "4px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "0.4rem",
          }}
        >
          <span
            style={{
              display: "block",
              width: "22px",
              height: "1px",
              backgroundColor: "var(--gold-warm)",
            }}
          />
          <span
            style={{
              display: "block",
              width: "22px",
              height: "1px",
              backgroundColor: "var(--gold-warm)",
            }}
          />
          <span
            style={{
              display: "block",
              width: "22px",
              height: "1px",
              backgroundColor: "var(--gold-warm)",
            }}
          />
        </button>
      </nav>
      {mounted && overlay ? createPortal(overlay, document.body) : null}
    </header>
  );
}
