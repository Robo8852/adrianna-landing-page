# components — composites, chrome, and primitives

## What
- **Composites**: self-contained interactive units (forms, buttons, cards, modals) that own their state and API calls. Handle validation, Turnstile verification, and backend communication.
- **Chrome**: shell components (header, footer) that frame pages; applied at layout.tsx level. Layout, sticky behavior, and global navigation.
- **Primitives**: small, stateless brand marks and text flourishes (sigils, dividers, decorative glyphs); never own interaction. Pure presentational.
- Layering rule: primitives → composites/chrome → sections → pages. Lower layers never import higher ones.

## Where
`showcase/components/composites/` — ConfirmedBanner.tsx (double opt-in landing banner; displays on ?confirmed=1 or ?expired, auto-dismisses 8s); PriceCard.tsx (service card with optional BookButton from `features/calendly`); PillarCard.tsx (compact practice pillar for Home H6); PillarPanel.tsx (expanded pillar for About A3); CredentialRow.tsx (single credential item); PriceNote.tsx (callout/aside block; currently unused — H7's insurance/sliding-scale notes were pulled pending client confirmation, see landing-page-copy.md open items).

`showcase/components/chrome/` — HeaderNav.tsx (sticky header with useScrolled shadow, mobile hamburger variant), Footer.tsx (gold rule divider, motto text, "Write to Adrianna" link anchors to /#contact).

`showcase/components/primitives/` — Sigil.tsx (brand mark centerline), SigilDraw.tsx (animated draw-on sigil for Hero), MicroSigil.tsx (5-motif compact sigil, reveal animation), SectionHeading.tsx (H2/H3 with left gold accent), GoldRule.tsx (divider), PullQuote.tsx (blockquote with drop cap), DropCap.tsx (illuminated first letter), ArrowGlyph.tsx (navigation chevron), MottoLine.tsx (brand motto text), IlluminatedMarker.tsx (highlighted text block).

`showcase/components/ui/button.tsx` — shadcn-style base button (unused in layout, kept for reference).

NewsletterForm and NewsletterModal live in `showcase/features/newsletter/`; ContactForm lives in `showcase/features/contact/` — see `newsletter.md` and `contact.md`. (ConfirmedBanner stays a composite even though it's part of the newsletter opt-in flow.)

BookButton and useCalendly live in `showcase/features/calendly/` — see `calendly.md`.

`showcase/lib/hooks/` — useTurnstile (lazy-load, arm/getToken, no-op if key missing), useScrolled (binary scroll depth), useScrollDepth (latching depth percent), useReveal (IntersectionObserver fade-in), useMediaQuery (SSR-safe media query).

## How
- Sigil.*.bak.tsx are intentional archive versions (Sigil.filled, Sigil.lineart, Sigil.centerline, etc.); do not delete or bulk-replace.
- Editing Sigil.tsx centerline paths requires recomputing stroke-dasharray length and animation delay to preserve draw-on timing (not auto-calculated).
- button.tsx uses shadcn/ui theme tokens, not brand gold; do not change its token colors to match the design system.
- useTurnstile is a safe no-op when NEXT_PUBLIC_TURNSTILE_SITE_KEY is undefined (dev mode, no Cloudflare integration).
- useMediaQuery returns false on initial SSR render, hydrates to true/false after mount (wrap motion queries in Client Components or guard with typeof window).
