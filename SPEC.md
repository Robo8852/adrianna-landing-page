# SPEC — The Altar Within

A specification for the two-page landing site for psychotherapist Adrianna Naílah, in the **Faithful Altar** aesthetic (v1, already locked).

This document describes **what** the site contains, not **how** it is built. A separate `IMPLEMENTATION.md` will follow. All copy is sourced verbatim from `landing-page-copy.md`; section IDs (H1–H8, A1–A5) are used as anchors throughout.

Cross-references:
- Copy: `landing-page-copy.md`
- Hero reference: `concepts/v1-faithful-altar/page.tsx`
- Aesthetic notes: `concepts/v1-faithful-altar/NOTES.md`
- Pages live at `showcase/app/page.tsx` (Home) and `showcase/app/about/page.tsx` (About).

---

## 1. Purpose & scope

The Altar Within is the public-facing landing site for Adrianna Naílah — a Transpersonal & Integration Psychotherapist. The site exists to introduce her practice to prospective clients (CPTSD and post-traumatic growth seekers, conscious leadership candidates, psychedelic-integration referrals) and to **convert that initial interest into a long-form, low-pressure relationship through the newsletter** rather than into an immediate booking. The newsletter signup is the single primary CTA across the entire site; everything else (services, pillars, credentials) serves to earn the email.

The site is **two pages**: Home (`/`) and About (`/about`). Both share a header nav and a footer. There is no blog, no booking, no client portal in this iteration.

**Build approach: mobile-first.** All layout, typographic scale, and component composition originate from the smallest viewport and scale upward via Tailwind breakpoints. Generous spacing is preserved on mobile (no cramped collapse); large-screen layouts expand from the mobile baseline rather than the desktop layout shrinking down. See Section 8 for specifics.

---

## 2. Information architecture

### 2.1 Site map

- `/` — Home (the funnel: hero → epigraph → teaser bio → pillars condensed → services → newsletter CTA)
- `/about` — About (the depth: heading → her story → her practice + pillars full → credentials → secondary CTA)

### 2.2 Shared chrome

- **Header nav** — present on both pages, identical. Links: **Home · About · [CTA button]**. The CTA button anchors-scrolls to the on-page newsletter form on Home, and navigates to Home `#newsletter` from About.
- **Footer** — present on both pages, identical. Contains: newsletter form (repeat of H8), email contact link, motto restatement (`LUX · VERITAS · FORMA`), copyright line, and optional small Latin epigram.

---

## 3. Home page sections (top-to-bottom)

The Home page is a single vertically scrolling document. Every section is **centered, narrow-column, generously spaced** — a procession down a chapel aisle, not a magazine layout. The dominant ground is `--ink-green`; gold is structural; parchment carries the reading copy.

### 3.1 H1 — Header Nav

- **Copy block ID:** H1
- **What lives here:** `Home · About · [CTA: Newsletter]`
- **Layout intent:** A thin band at the very top of the viewport, transparent over the hero's ink-green, with a hairline gold rule along its bottom edge. The brand mark (a small version of the hero sigil + the wordmark "The Altar Within") sits left; nav links and the CTA sit right. **Sticky on scroll, with the band acquiring a faint shadow/scrim as the page leaves the hero** so the gold links remain legible over varied section grounds.
- **Aesthetic anchors:** Mini-sigil from the hero (~28px), Cormorant Garamond at small caps with `0.32em` tracking, gold hairline bottom border, brass-plaque CTA button reusing the Vespers button style at ~75% scale.
- **New visual elements:** A miniature, non-animated, static-stroke version of the quatrefoil sigil for the brand lockup.

### 3.2 H2 + H3 — Hero (tagline + positioning)

- **Copy block ID:** H2, H3
- **What lives here:** The existing hero from `concepts/v1-faithful-altar/page.tsx`, **kept verbatim**. Sigil, brand title "The Altar Within", motto `— LUX · VERITAS · FORMA —`, gold hairline divider, tagline (H2), italic practitioner subline "with Adrianna Naílah", positioning copy (H3), and a Vespers newsletter form.
- **Layout intent:** Full-viewport-height consecrated stack, centered, framed by the thin inset gold panel border. **No changes to the hero composition, motion stagger, or copy.** The form in the hero is the *first* of two newsletter touchpoints on Home (the second is H8).
- **Aesthetic anchors:** All v1 elements as authored — sigil stroke-draw, motto, gold rule extending from center, parchment-on-green typography, drifting gold motes, vignette, film grain, inset chapel-door frame.
- **New visual elements:** None — the hero is locked. **The only adjustment is that the header nav (3.1) overlays the hero's top edge; the inset frame must accommodate it without clipping.**

### 3.3 H4 — Epigraph (Rumi)

- **Copy block ID:** H4
- **What lives here:**
  > *"Maybe you are searching among the branches for what only appears in the roots."* — Rumi
- **Layout intent:** A breath after the hero. A single centered italic line, set in EB Garamond italic at ~1.25rem on a narrow max-width, parchment color at ~80% opacity. **Flanked above and below by short gold hairline rules (~96px) with center-out reveal on scroll-into-view.** The attribution "— Rumi" sits one line below in spaced-caps Cormorant at ~0.7rem, gold-warm.
- **Aesthetic anchors:** Gold hairline rules (the same divider primitive as the hero), EB Garamond italic, generous vertical padding (~12rem total section height on desktop).
- **New visual elements:** None — reuses `GoldRule` and standard typography.

### 3.4 H5 — Teaser Intro

- **Copy block ID:** H5
- **What lives here:** One paragraph of teaser bio + a link to the About page: *"I facilitate and assist beings from all walks of faith in demystifying psychospiritual psychology and guiding their journey toward integration through neuroscience and embodied awareness."* Followed by `Read full bio →` linking to `/about`.
- **Layout intent:** Centered, max-width ~36rem, parchment body in EB Garamond at ~1.1rem with relaxed leading. The "Read full bio" link sits below the paragraph as a spaced-caps Cormorant link in gold-warm, with a small right-pointing gold arrow glyph (hand-drawn SVG, ~12px) that draws-in on hover.
- **Aesthetic anchors:** EB Garamond body, gold-warm link color, spaced-caps treatment for the link (`0.28em` tracking, uppercase, ~0.78rem) — the same vocabulary as the motto and the Vespers button.
- **New visual elements:** A small **hand-drawn `ArrowGlyph` SVG** — a thin gold pen-stroke arrow, no fill, ~12px, used throughout the site for "continue reading" affordances.

### 3.5 H6 — Pillars (condensed)

- **Copy block ID:** H6
- **What lives here:** Heading **"The Pillars of My Practice"** plus five named pillars with one-line distillations (Compassion, Love, Resilience, Integrity, Partnership & Humor), and a trailing link `Read more about each pillar →` to `/about#pillars`.
- **Layout intent:** A small illuminated section header (`PillarsOfMyPractice` rendered in Cormorant ~2.25rem, with a center-flanking gold rule above and below), then **five vertically stacked `PillarCard` entries on desktop, arranged in a single centered column at max-width ~40rem** — a litany, not a feature grid. Each card is centered, with: a micro-sigil glyph (gold, ~36px), the pillar name in Cormorant small-caps with wide tracking, a thin gold hairline beneath the name, and the one-line distillation in EB Garamond at ~1.05rem. **Reject the temptation to make this a 3+2 or 5-column responsive grid** — the liturgical reading rhythm is column-stacked.
- **Aesthetic anchors:** Cormorant for pillar names, EB Garamond for distillations, gold hairlines beneath each name, hand-drawn micro-sigil per pillar.
- **New visual elements:** **Five distinct micro-sigils** — one per pillar — drawn in the same vocabulary as the hero sigil (1.5px gold stroke, draws-in on scroll-into-view, single-glyph not quatrefoil). Suggested motifs:
  - Compassion — a downward-tilted vessel / chalice silhouette
  - Love — a stylized double-arc heart / vesica piscis
  - Resilience — an upward-branching vine or three-rising-marks
  - Integrity — a plumb-line with a small anchor weight
  - Partnership & Humor — two interlocking small lobes (echo of the quatrefoil)
  - ❓ confirm motif set with the user before authoring final SVGs.

### 3.6 H7 — Service Fees

- **Copy block ID:** H7
- **What lives here:** Section heading "Services & Offerings" (❓ confirm exact heading wording — copy file does not specify; default proposed: **"Services & Offerings"**), followed by four service entries (Introductory Meeting — Free; 1:1 Psychotherapy Session — $120; 3-Session Package — $270; Psychotherapy with Coaching — $200), plus an Insurance note and a Financial Flexibility note.
- **Layout intent:** **Four gold-bordered "plates"** arranged in a 2-column grid on desktop (`md:grid-cols-2`), single column on mobile, centered, max-width ~52rem. Each `PriceCard` is a vertical card with: a narrow gold hairline frame (the same inset-chapel-door border treatment), the service name in Cormorant at ~1.5rem, a thin centered gold rule, the duration as a spaced-caps Cormorant line, the price as a Cormorant display number (~2rem, gold-warm), and the descriptive paragraph in EB Garamond. **Insurance and Financial Flexibility are NOT cards** — they appear below the grid as two short stacked notes set off by small `+` gold ornaments, in a quieter type size.
- **Aesthetic anchors:** Gold hairline frames (reusing the hero's chapel-door inset language), Cormorant for headlines and prices, EB Garamond for body, gold rules as in-card dividers.
- **New visual elements:** `PriceCard` component with its inset gold border; small `+` gold ornament used to flag the Insurance and Financial Flexibility notes. **Financial Flexibility body copy is missing from source — render a single-line placeholder** *"Sliding-scale options are available — write directly to inquire."* and ❓ confirm wording.

### 3.7 H8 — Primary CTA (newsletter)

- **Copy block ID:** H8
- **What lives here:** Headline **"Stay close to the work."**, supporting line "Join the newsletter for reflections, practices, and announcements from Adrianna.", the email input + Subscribe button, and a quieter line "Prefer to write directly? [email contact link]".
- **Layout intent:** A consecrated closing stack mirroring the hero's composition: a small gold rule above the headline, the headline in Cormorant at ~3rem parchment, the supporting line in EB Garamond, the `NewsletterForm` (same component as the hero's), and the email-contact fallback line beneath. Centered, max-width ~36rem, generous vertical padding (~14rem). **This section anchors to `#newsletter` for the header CTA link.**
- **Aesthetic anchors:** Gold rule, Cormorant display headline, EB Garamond body, Vespers brass-plaque button reused verbatim.
- **New visual elements:** None — entirely reuses `GoldRule`, `NewsletterForm`, and the established button.

---

## 4. About page sections (top-to-bottom)

The About page is **the depth chamber**. It is denser than Home but must hold the same liturgical restraint — long reading passages are broken by illuminated section markers, drop-caps, a centerpiece pull-quote, and the same gold-rule grammar.

### 4.1 A1 — Page heading

- **Copy block ID:** A1
- **What lives here:** **"About Adrianna Naílah"**
- **Layout intent:** A full-width header band, but quieter than the Home hero — no sigil, just the page title in Cormorant at ~4rem parchment over ink-green, with a single centered gold rule beneath. Vertical padding ~10rem. The header nav remains overhead.
- **Aesthetic anchors:** Cormorant display, single GoldRule beneath.
- **New visual elements:** None.

### 4.2 A2 — Her Story (personal bio)

- **Copy block ID:** A2 (3 paragraphs + embedded pull-quote)
- **What lives here:** Three paragraphs of personal biography, plus the embedded pull-quote *"To be loved but not seen is comforting but superficial; not to be known and not loved is our greatest fear. To be fully known and truly loved is to be loved by the Almighty."* (attribution ❓ unverified — copy says "Tk. T 5,53").
- **Layout intent:** Section heading **"Her Story"** in Cormorant small-caps with center-flanking gold rules. Below it, a single centered text column at **max-width ~34rem** in EB Garamond at ~1.1rem with relaxed leading. **The first paragraph opens with a gold drop-cap** ("A" of "Adrianna Naílah's journey…") rendered in Cormorant at ~5rem, gold-warm, with a 3-line drop. Between paragraphs 2 and 3, the **pull-quote is rendered as a full-width centerpiece** — set off by a gold rule above and below, in EB Garamond italic at ~1.5rem parchment, max-width ~42rem, centered, with the quotation marks rendered in gold-warm at display scale. After paragraph 3, an **illuminated section marker** (a single small `+` gold ornament or a horizontal triplet of gold dots) closes the section before transitioning to A3.
- **Aesthetic anchors:** Drop-cap, illuminated section marker, GoldRule above/below pull-quote, EB Garamond italic for the quote, Cormorant for the section heading.
- **New visual elements:** **`DropCap` treatment** (CSS, no SVG); **`IlluminatedMarker`** — a small gold ornament (single `+` or three dots) used as inter-section breath. **`PullQuote` block** — a centerpiece composition with gold rules and oversized italic.

### 4.3 A3 — Her Practice (professional + Pillars full)

- **Copy block ID:** A3 (six paragraphs of professional bio + a Pillars sub-block with five full-paragraph pillars).
- **What lives here:** Six paragraphs introducing the practice, modalities, and Conscious Leadership Coaching. Then a sub-heading "The Pillars and Values of My Service" followed by an intro paragraph and **five full pillar paragraphs** (Compassion, Love, Resilience, Integrity, Partnership & Humor), and a closing summary paragraph.
- **Layout intent:** Section heading **"Her Practice"** in Cormorant small-caps with center-flanking gold rules. The six professional paragraphs sit in the same centered ~34rem reading column as A2, EB Garamond ~1.1rem. **Every second paragraph is preceded by a small illuminated marker** (the `+` or triplet-dot ornament) to break density without imposing visible subheadings. **No pull-quote** in A3 — paragraphs flow as plain reading copy; the pull-quote treatment is reserved for A2's personal quote only.

  The Pillars sub-block begins with an anchored `#pillars` target, a `GoldRule`, and the sub-heading **"The Pillars and Values of My Service"** in Cormorant at ~2.5rem. The intro paragraph follows. **Then the five pillars are laid out vertically, one per "panel"**, each panel containing: the pillar's micro-sigil (the same SVG from H6, larger here at ~64px), the pillar name in Cormorant at ~2rem with wide tracking, a gold rule beneath the name, and the full paragraph in EB Garamond. **Each panel is generously spaced (≥6rem between panels)** so each pillar reads as a discrete contemplation, not a list item. The closing summary paragraph follows the last pillar, separated by a final illuminated marker.
- **Aesthetic anchors:** Same as A2 plus the H6 micro-sigils enlarged. Gold rules beneath pillar names, illuminated markers between paragraph groups.
- **New visual elements:** None new beyond what H6 and A2 already define — micro-sigils, GoldRule, IlluminatedMarker, optional PullQuote.

### 4.4 A4 — Credentials

- **Copy block ID:** A4
- **What lives here:** Certificate Number (#241254106), followed by **nine credential entries** — each with a degree/certification title, year(s), institution, optional specialization line.
- **Layout intent:** Section heading **"Credentials"** in Cormorant small-caps with center-flanking gold rules. Beneath, the Certificate Number rendered as a small spaced-caps Cormorant line in gold-warm, set off by a thin gold rule. Then the nine entries rendered as a **vertical list of `CredentialRow` items**, each row formatted: an enumerated index in gold Cormorant numerals (I, II, III…) on the left, the title in Cormorant ~1.15rem parchment, the year range in EB Garamond italic parchment-dim beneath, the institution in EB Garamond parchment, and the specialization (where present) in EB Garamond italic in gold-warm. **Rows are separated by short hairline gold rules** at ~30% opacity. Max-width ~40rem, left-aligned within a centered column (one of the few left-aligned blocks on the site — the credentials are inherently a register).
- **Aesthetic anchors:** Roman numerals in gold (an illuminated-manuscript ledger feel), short hairline rules between rows, mixed Cormorant + EB Garamond hierarchy.
- **New visual elements:** **`CredentialRow`** component — single row with roman numeral, title, year, institution, optional spec line. The **Roman-numeral rendering should be hand-set in the markup** (not auto-numbered via CSS `counter()`), to avoid losing accessibility and so each row's numeral can carry the proper gold styling. **DBT certifying body remains flagged** ❓ in entry V — the spec file accepts the existing placeholder "Beck Institute…" + the "verify DBT certifying body" annotation already in copy.

### 4.5 A5 — Secondary CTA

- **Copy block ID:** A5
- **What lives here:** *"Continue the conversation — return to Home, book a free intro call, or join the newsletter."*
- **Layout intent:** A closing stack mirroring H8's structure but quieter: a small gold rule, the line itself rendered as a single centered EB Garamond paragraph at ~1.15rem (max-width ~36rem), and **three small linked actions beneath, rendered as a horizontal row of spaced-caps Cormorant links separated by gold mid-dots (`·`)**:
  - `← Return Home` (links to `/`)
  - `Free Intro Call` (anchors `/#services` — the Introductory Meeting card in H7)
  - `Join the Newsletter` (anchors `/#newsletter` — section H8)
- **Aesthetic anchors:** GoldRule, EB Garamond body, spaced-caps Cormorant link row, gold mid-dot separators.
- **New visual elements:** None — reuses existing typography and the `ArrowGlyph` for the "← Return Home" link.

---

## 5. Cross-page elements

### 5.1 Header nav

- **Design intent:** **Minimal and static-feeling, even when sticky.** Left side: a brand lockup pairing a **non-animated miniature of the hero's quatrefoil sigil** (~28px) with the wordmark "The Altar Within" in Cormorant at ~1.15rem parchment, both linking to `/`. Right side: nav links `Home · About` rendered as spaced-caps Cormorant (~0.78rem, `0.28em` tracking, parchment) separated by a gold mid-dot, followed by the brass-plaque CTA button labeled **"Newsletter"** (reusing the Vespers button styling, at ~75% scale). The band has **transparent fill over the hero** (the hero's inset frame remains the visual top edge), and acquires a **scrim — a 1px gold hairline bottom border + a faint ink-green-to-transparent gradient backdrop blur** once the page scrolls past the hero. **Decision: sticky.** The CTA must remain reachable from any section.
- **Active states:** The current page's nav link reads in `--gold-warm` instead of parchment; hover state on inactive links lifts them from parchment to gold-warm with a 200ms ease.

### 5.2 Footer

- **Design intent:** A quiet closing band. Centered single-column composition on `--ink-green`, separated from the page body above by a center-origin gold rule. From top to bottom:
  1. The motto restated: `— LUX · VERITAS · FORMA —` in spaced-caps Cormorant, gold-warm with gold em-dashes (identical to the hero's motto treatment).
  2. A condensed **`NewsletterForm`** — same component used in the hero and in H8, with a slightly smaller scale (compact mode).
  3. Email contact line: *"Write directly — [email]"* in EB Garamond italic, gold-warm link. ❓ Adrianna's email is unspecified.
  4. Optional small Latin epigram beneath, in EB Garamond italic at ~0.85rem parchment-dim. Proposed default: *"Ora et labora"* — ❓ confirm with user, or replace with a chosen line.
  5. Copyright line: *"© 2026 Adrianna Naílah · The Altar Within"* in EB Garamond at ~0.75rem parchment at 50% opacity.
- **Aesthetic anchors:** Gold motto treatment carried from the hero, NewsletterForm reused, EB Garamond italic for warmth.

### 5.3 Newsletter CTA

- **Component:** A single `NewsletterForm` is used in three places: **the hero (H2–H3 stack), section H8, and the footer.** All three use the same component; the hero and H8 render it in default scale, the footer in a compact variant.
- **Fields:** Email input (italic placeholder "your email"), brass-plaque submit button. The hero/H8 button reads **"Join the Vespers"**; the footer button may be shortened to **"Subscribe"** to fit the compact width — ❓ confirm whether to keep "Join the Vespers" in the footer too.
- **Validation:** HTML5 email type with required attribute; on invalid submission, a gold-warm hairline appears beneath the input with a brief italic message *"a valid email, please"* — ❓ confirm wording.
- **Success state:** On successful submission, the form is replaced in-place by a brief liturgical confirmation message rendered in EB Garamond italic parchment at ~1.1rem, flanked by short gold rules:

  > *Inscribed. A response will arrive in due time.*

  **Decided** for first build. User flagged the wording as *"sounds very elitist"* — revisit copy after first preview if it reads cold in context. Alternative proposals on hold: *"Received in the register."* / *"Your name is set down. Watch for the next vespers."*

### 5.4 Transitions between pages

- **Decision: a brief cross-fade on navigation** (~280ms ease-out on exit, ~360ms ease-in on entry). **The sigil mark in the header nav does not re-animate per route** — it draws in once on first page load only, then remains static across navigation so the chrome feels like a continuous reliquary.
- The hero's full stagger animation runs only on first arrival at `/`. On return navigation from `/about → /`, the hero presents fully revealed (no stagger replay) — ❓ confirm preference; an alternative is to always replay the stagger.

---

## 6. Component inventory

Reusable components the site needs (names + purpose only; no implementation):

- **`HeaderNav`** — top-of-page navigation; brand lockup left, links + CTA right; sticky with scroll-aware scrim.
- **`Footer`** — closing band with motto, newsletter, email contact, optional Latin epigram, copyright.
- **`Sigil`** — the hero's hand-authored quatrefoil cross SVG, parameterized for size, animation (on/off), and color.
- **`MicroSigil`** — single-glyph variants per pillar (five distinct motifs), drawn in the same stroke vocabulary.
- **`ArrowGlyph`** — small hand-drawn gold arrow SVG used in "read more" links and the Return Home action.
- **`GoldRule`** — the gold hairline divider; supports center-origin reveal animation and width parameter.
- **`IlluminatedMarker`** — small inter-paragraph ornament (single `+` or triplet of gold dots) used in About to break dense passages.
- **`PullQuote`** — centerpiece quote composition with gold rules above and below.
- **`DropCap`** — gold drop-cap treatment for first paragraphs in About sections.
- **`NewsletterForm`** — email input + brass-plaque submit button, with success and error states. Used in hero, H8, and Footer (compact variant).
- **`PillarCard`** — used 5x in H6 (micro-sigil + name + hairline + one-line distillation).
- **`PillarPanel`** — used 5x in A3 (micro-sigil + name + hairline + full paragraph; larger and more spaced than `PillarCard`).
- **`PriceCard`** — used 4x in H7 (gold-bordered plate with service name, duration, price, description).
- **`PriceNote`** — used 2x in H7 (small note for Insurance and Financial Flexibility, flagged by a `+` ornament).
- **`CredentialRow`** — used 9x in A4 (roman numeral + title + year + institution + optional specialization).
- **`SectionHeading`** — Cormorant small-caps heading flanked by center-out gold rules; used at the top of H6, H7, H8, A2, A3, A4, A5.
- **`MottoLine`** — spaced-caps Cormorant motto with gold em-dash flourishes (the `LUX · VERITAS · FORMA` primitive), reused in the hero and footer.

---

## 7. Typography & palette tokens (locked from v1)

Canonical CSS variables (from `concepts/v1-faithful-altar/page.tsx`):

```
--ink-green: #0B3B36    /* dominant ground; page background */
--gold:      #C9A961    /* load-bearing accent: sigil, rules, frames, button borders */
--gold-warm: #D9BE7E    /* highlight: motto, inner glyphs, italic sublines, motes */
--parchment: #F3EEDA    /* brand title, tagline, body display copy; never pure white */
--shadow:    #061F1C    /* vignette and deep edge */
```

Typography:
- **Cormorant Garamond** (`--font-cormorant`) — brand title, section headings, motto, pillar/service names, all spaced-caps treatments, nav links, button labels, drop-caps, roman numerals in credentials, page-level display.
- **EB Garamond** (`--font-eb-garamond`) — body paragraphs, tagline, italic sublines, email input, pull-quote text, Latin epigram, credential body lines.
- **No sans-serif anywhere on the site.**

Spaced-caps treatment standards:
- Motto: `0.4em` tracking.
- Nav links, button labels, "read more" links, in-card duration lines, pillar names in cards, roman numerals: `0.28em–0.32em` tracking, uppercase, Cormorant.

Reduced color contrast guidance:
- Body copy is **parchment on ink-green**, not gold on ink-green. **Gold is reserved for display, rules, borders, sigils, and small affordances** — never for paragraph body text.

---

## 8. Accessibility & responsive behaviour

**Build approach is mobile-first** (restated from Section 1). All Tailwind utilities apply at the smallest viewport by default; `sm:` / `md:` / `lg:` breakpoints add desktop refinements. Components are designed to *expand* on larger viewports, not the inverse.

- **Reduced motion:** All stroke-draw animations (`altar-sigil-path`), fade-up stagger (`altar-reveal`, `altar-sigil-reveal`), and rule extensions (`altar-rule`) must respect `prefers-reduced-motion: reduce` and present in their final state with no animation. The drifting gold motes must be hidden entirely under reduced motion (they have no informational value).
- **Color contrast:** Parchment (`#F3EEDA`) on ink-green (`#0B3B36`) measures comfortably above AA for body text. **Gold (`#C9A961`) on ink-green is below AA for body text** and is therefore restricted to display sizes (≥1.5rem) and decorative strokes. Gold-warm (`#D9BE7E`) on ink-green is marginal — restrict to display and italic sublines. **Body text never uses gold.**
- **Mobile reflow (≤640px):**
  - The centered liturgical composition collapses to a single column with reduced max-widths and proportionally tightened (but still generous) vertical padding — keep at least 6rem between major sections.
  - The hero's inset chapel-door frame uses `inset-4` instead of `inset-6/10`.
  - The four `PriceCard` plates in H7 stack vertically.
  - The pillar list in H6 is already a single column — no change.
  - The Credentials list in A4 keeps roman numerals on the left of each row; the title and metadata may wrap.
- **Header nav on mobile:** **Hamburger icon (☰).** The brand lockup remains visible at left; the right side replaces the link row with a small gold hamburger icon (three hairline gold rules ~22px wide, gold-warm). Tapping it opens a full-viewport overlay in `--ink-green` with the inset gold frame and the nav links + CTA stacked centered. Closing the overlay uses a small gold `×` glyph top-right.
- **Forms & semantics:** All form inputs have associated `<label>` elements (visually hidden if the placeholder carries the label). Focus rings on inputs and buttons are explicit — a 2px gold outline at `0.6` opacity (no removal of focus indicators). The credentials list is marked up as a semantic `<ol>` so screen readers convey the enumeration; the visual roman numerals are presentational and `aria-hidden`. Heading hierarchy: `<h1>` for the page title (the hero brand on Home, the A1 heading on About), `<h2>` for major sections, `<h3>` for sub-sections like the Pillars in A3.

---

## 9. Out-of-scope (this iteration)

- No CMS, no headless content service — copy is hard-coded from the source markdown.
- No blog, no articles archive, no individual pillar detail pages.
- No booking integration (Calendly, Acuity, etc.). The Free Intro Call link in A5 routes to the H7 services block on Home, not to a scheduler.
- No client portal, no payment integration.
- No internationalization or locale switching — English only.
- No analytics or tracking pixels.
- No A/B testing infrastructure.
- The "Financial Flexibility" body copy is missing from the source and is unblocked for build: a placeholder line is acceptable.
- The DBT certifying body in credential V remains as currently written in copy (with the inline "verify…" annotation removed from the rendered view).

---

## 10. Resolved decisions (answered 2026-05-10)

All 18 questions are answered. Items still pending external input are flagged **Deferred**.

| # | Question | Decision |
|---|---|---|
| 1 | Newsletter backend | **Deferred — no backend this iteration.** Form submits to a placeholder/no-op handler; success state still renders for visual review. |
| 2 | Adrianna's email | **Deferred** — render `[email]` placeholder until supplied. |
| 3 | Logo lockup | Use the miniature quatrefoil sigil + wordmark *for now* as defined in 3.1. **Adrianna has a separate brand asset that will be converted to SVG and replace this lockup later.** |
| 4 | H6 pillar distillations | **Approved as written** in copy file. |
| 5 | Financial Flexibility copy | **Approved:** *"Sliding-scale options are available — write directly to inquire."* |
| 6 | Personal quote attribution ("Tk. T 5,53") | **Confirmed** — keep attribution as-is. |
| 7 | DBT certifying body | **Deferred** — keep current "Beck Institute…" placeholder. Revisit later. |
| 8 | Stylistic Ð characters | **Confirmed as typos** — normalized to D throughout. |
| 9 | Pillar micro-sigil motifs | **Approved:** vessel / vesica / vine / plumb-line / interlocking lobes. |
| 10 | H7 section heading | **Approved default:** "Services & Offerings". |
| 11 | Newsletter success message | **Approved default:** *"Inscribed. A response will arrive in due time."* — user flagged tonally as "sounds very elitist"; revisit after first preview. |
| 12 | Invalid email message | **Approved default:** *"a valid email, please"*. |
| 13 | Footer Latin epigram | **Approved default:** *"Ora et labora"*. |
| 14 | Footer button label | **"Join the Vespers"** matching hero (changeable later). |
| 15 | Hero animation on return navigation | **First arrival only** — full stagger does not replay on return from `/about → /`. |
| 16 | Mobile nav pattern | **Hamburger icon** (☰) — conventional, not typographic "Menu". |
| 17 | Pull-quote in A3 | **No** — render the professional bio as plain paragraphs, no centerpiece quote. |
| 18 | Copyright year | **2026.** |

### New directive (added with answers)

- **Mobile-first build.** Restated in Sections 1 and 8 — all layouts and components are authored from the smallest viewport up.

### Items still pending external input (do not block build)

- Adrianna's email — placeholder in markup until supplied.
- Final logo SVG asset — placeholder lockup until supplied.
- DBT certifying body — placeholder retained.
- Newsletter success wording — built with default, may be revised after preview.

### Build-mechanics decisions (answered 2026-05-10)

| # | Question | Decision |
|---|---|---|
| B1 | Where do brand colors live — CSS vars only, or also in Tailwind config? | **Both.** Mirror the palette into `showcase/tailwind.config.ts` under `theme.extend.colors` so classes like `bg-ink-green`, `text-gold`, `bg-gold/60`, `ring-gold` work natively. Keep the same tokens as CSS variables in `showcase/app/globals.css` so the hero's existing `@keyframes` (which reference `var(--gold)`, `var(--ink-green)`, etc.) continue to resolve. Token names: `ink-green`, `gold`, `gold-warm`, `parchment`, `shadow`. |
| B2 | Is the hero already its own component? | **No — extract it as build step 1.** `showcase/app/page.tsx` currently inlines the full hero (471 lines, near-duplicate of `concepts/v1-faithful-altar/page.tsx`). Lift it into `showcase/components/sections/Hero.tsx` as a self-contained component. `app/page.tsx` then composes `<Hero />` + H4 + H5 + H6 + H7 + H8. The component owns its own `<style jsx global>` keyframes block. |
| B3 | Route-transition mechanism between `/` and `/about` | **Framer Motion.** Use `motion.div` with a parent `AnimatePresence` (likely in `app/template.tsx`) for the ~280/360ms cross-fade specified in §5.4. The persistent header sigil stays mounted across routes so it does not re-animate per route (per §10 #15). |
| B4 | MicroSigil scope reconfirmed | **Five hand-authored single-glyph SVGs**, one per pillar — vessel / vesica / vine / plumb-line / interlocking lobes (motifs locked in §10 #9). They are **separate** from the main quatrefoil hero `Sigil`. Rendered at **~36px in H6** (PillarCard) and at **~64px in A3** (PillarPanel) — same five SVGs, two sizes. Stroke vocabulary matches the hero: 1.5px gold stroke, draws-in on scroll-into-view. |
