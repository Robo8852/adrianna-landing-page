# sections

> **What this covers:** The large per-section narrative blocks that compose the Home (`H*`) and About (`A*`) pages.

## What
- **Sections** are the big top-level content blocks of a page. Each is a default-exported React component rendering a single `<section>`, composed in order inside a page's `<main>`. They hold the copy, layout, and the page's vertical rhythm; they delegate small repeated UI to composites/primitives.
- **Naming convention** (verified from the page imports):
  - `H*` = **Home** page sections. `showcase/app/page.tsx` imports `Hero, H4, H5, H6, H7, H8`.
  - `A*` = **About** page sections. `showcase/app/about/page.tsx` imports `A1, A2, A3, A4, A5`.
  - `Hero` is the only non-numeric name; it is the first Home section (effectively "H-hero"). The numeric suffixes are sequence/ordering hints, not a contiguous global counter (Home jumps Hero → H4..H8; About runs A1..A5).
- **How they fit into pages:** pages are thin — each page file is just an import list plus a `<main>` that renders the sections top-to-bottom in array order. All visual/content logic lives in the section files. Both pages render against a shared dark "ink green" / "parchment" / "gold" palette delivered via CSS variables (`--ink-green`, `--parchment`, `--gold`, `--gold-warm`) and serif font variables (`--font-cormorant`, `--font-eb-garamond`); `Hero` additionally sets `--font-eb-garamond` family inline.

## Where
Home page (`showcase/app/page.tsx`), in render order:
- `showcase/components/sections/Hero.tsx` — **#1 Home.** Full-screen consecrated hero: `Sigil` brand mark with draw-on/fade-scale animation, brand title "The Altar Within", LUX·VERITAS·FORMA motto, practitioner taglines for Adrianna Naílah, plus a wired `<NewsletterForm source="hero" />` CTA (button label "Join the Vespers"). The form sits in an `altar-reveal` wrapper (`animationDelay: "3.0s"`, full width capped at `maxWidth: "28rem"`) — the bespoke `<form>`/raw email input was removed; signup is real and routed through `NewsletterForm`. Heavy bespoke styling: scoped `<style jsx global>` keyframes (fade-up, fade-scale, rule-extend, gold mote drift), SVG film-grain overlay, vignette, animated gold motes, inset gold frame.
- `showcase/components/sections/H4.tsx` — **#2 Home.** Rumi pull-quote block: two `GoldRule`s framing an italic blockquote ("Maybe you are searching among the branches…") attributed to Rumi.
- `showcase/components/sections/H5.tsx` — **#3 Home.** Short "facilitate / integration" mission paragraph with a "Read full bio" `Link` to `/about` plus `ArrowGlyph`.
- `showcase/components/sections/H6.tsx` — **#4 Home.** "The Pillars of My Practice": `SectionHeading` + 5 `PillarCard`s (Compassion, Love, Resilience, Integrity, Partnership & Humor, each with a `MicroSigilMotif` + one-line distillation), and a "Read more about each pillar" `Link` to `/about#pillars`.
- `showcase/components/sections/H7.tsx` — **#5 Home.** `id="services"` pricing/offerings: `SectionHeading` + responsive 2-col grid of 4 `PriceCard`s (Intro Meeting/Free, 1:1 Session/$120, 3-Session Package/$270, Psychotherapy w/ Coaching/$200) followed by 2 `PriceNote`s (Insurance, Financial Flexibility).
- `showcase/components/sections/H8.tsx` — **#6 Home.** `id="newsletter"` CTA: `GoldRule`, "Stay close to the work." heading, blurb, a wired `<NewsletterForm source="h8" />`, then a nested `<div id="contact">` wrapper holding an italic "Prefer to write directly?" lead-in and a wired `<ContactForm source="contact-h8" />`. The `id="contact"` wrapper is the in-page target for the Footer's "write directly" link; the old `mailto:[email]` placeholder is gone.

About page (`showcase/app/about/page.tsx`), in render order:
- `showcase/components/sections/A1.tsx` — **#1 About.** Page intro: "About Adrianna Naílah" title, `GoldRule`, and a `next/image` bio photo (`/bio-pic.jpg`, `priority`).
- `showcase/components/sections/A2.tsx` — **#2 About.** "Her Story": `SectionHeading`, `DropCap` opening paragraph + body paragraphs, a `PullQuote` (Tk. T 5,53), closing paragraph, and an `IlluminatedMarker` (variant `plus`).
- `showcase/components/sections/A3.tsx` — **#3 About.** "Her Practice": `SectionHeading` + 7 practice paragraphs (data array) with `IlluminatedMarker`s interleaved after every 2nd paragraph; then `id="pillars"` "The Pillars and Values of My Service" heading, intro paragraph, 5 full `PillarPanel`s (same five motifs/pillars as H6 but long-form bodies), a marker, and a closing paragraph.
- `showcase/components/sections/A4.tsx` — **#4 About.** "Credentials": `SectionHeading`, certificate-number line + `GoldRule`, and an `<ol>` of 9 `CredentialRow`s (Roman numerals I–IX, degree/cert + year + institution, some with specialization) from a data array.
- `showcase/components/sections/A5.tsx` — **#5 About.** Closing CTA: `GoldRule`, "continue the conversation" line, and three `Link`s — Return Home (`/`, with left `ArrowGlyph`), Free Intro Call (`/#services`), Join the Newsletter (`/#newsletter`), dot-separated.

## How
- **Every section file is a Client Component** — all 11 begin with `"use client"`. (Hero needs it for `<style jsx>` + its `NewsletterForm`; others largely for `next/link`/`next/image` interactivity and consistency. Note: most A*/H* sections have no interactivity beyond `Link`, so the `"use client"` is conservative and could be relaxed where unused.)
- **Default export, one `<section>` per file.** Layout is overwhelmingly inline `style` objects (flex column, centered, `gap`, large vertical `padding` like `5rem–10rem`), not Tailwind — exceptions: `Hero` and `H7` use a few Tailwind utility classes (`grid grid-cols-1 md:grid-cols-2`, etc.).
- **Adding a new section + wiring it in:**
  1. Create `showcase/components/sections/<Name>.tsx` (`"use client"` if it needs client features; default-export a component returning one `<section>`). Follow the prevailing naming: `H*` for Home, `A*` for About — pick the next free number.
  2. Import it in the relevant page (`showcase/app/page.tsx` or `showcase/app/about/page.tsx`) and place it in `<main>` at the desired position. Order in the JSX *is* the on-page order.
  3. Reuse the palette CSS vars and serif font vars rather than hardcoding colors/fonts.
- **Dependency map (sections → other domains):**
  - **Primitives** (`@/components/primitives/*`): `Sigil` (Hero), `GoldRule` (A1, A4, A5, H4, H8), `SectionHeading` (A2, A3, A4, H6, H7), `DropCap` & `PullQuote` (A2), `IlluminatedMarker` (A2, A3), `ArrowGlyph` (A5, H5, H6), `MicroSigil`/`MicroSigilMotif` type (A3, H6).
  - **Composites** (`@/components/composites/*`): `PillarPanel` (A3, long-form), `PillarCard` (H6, compact), `CredentialRow` (A4), `PriceCard` + `PriceNote` (H7), `NewsletterForm` (Hero `source="hero"`, H8 `source="h8"`, Footer chrome `source="footer"`), `ContactForm` (H8 `source="contact-h8"`).
  - **Next.js**: `next/image` (A1), `next/link` (A5, H5, H6; Footer chrome → `/#contact`).
- **Shared patterns / conventions:**
  - **Data-array-then-map:** A3, A4, H6, H7 hoist content into a module-level typed array and `.map` it into composites — the canonical way to add/edit list content (pillars, credentials, services). The five pillars are duplicated between H6 (distillations) and A3 (full bodies); keep their `name`/`motif` pairs in sync.
  - **Pillar motif vocabulary** (shared `MicroSigilMotif`): `vessel`, `vesica`, `vine`, `plumb-line`, `interlocking-lobes` → Compassion, Love, Resilience, Integrity, Partnership & Humor.
  - **Reveal-on-scroll:** there is **no** scroll-triggered reveal in these sections. The only animation is in `Hero`, done via CSS keyframes + staggered `animationDelay` (a self-contained intro choreography), not a shared hook or IntersectionObserver.
  - **Anchor IDs for in-page nav:** `H7` exposes `id="services"`, `H8` exposes `id="newsletter"` (and a nested `id="contact"` on its `ContactForm` wrapper), and `A3`'s pillars block exposes `id="pillars"`. These are the targets of cross-page links (e.g. A5 → `/#services`, `/#newsletter`; H6 → `/about#pillars`; Footer chrome → `/#contact`).
  - **Typography:** display/headings use `var(--font-cormorant)`; body/prose use `var(--font-eb-garamond)`; small uppercase labels use Cormorant with wide `letter-spacing` (~`0.28em`) in `--gold-warm`.
- **Gotchas:**
  - **No `mailto:[email]` / `[email]` placeholder tokens remain anywhere** in the sections or chrome. Every email/contact affordance is wired: Hero, H8, and the Footer chrome render real `NewsletterForm`s; H8 renders a real `ContactForm`; and the Footer's "write directly" line is now a real `<Link href="/#contact">` to H8's contact form (no surface silently discards input).
  - `Hero` injects `<style jsx global>` keyframes — those keyframe/class names (`altar-*`) are global; avoid collisions if added elsewhere.
  - A3's marker cadence is index-driven (`i % 2 === 1 && !isLast`); changing the number of `practiceParagraphs` shifts where markers land.
