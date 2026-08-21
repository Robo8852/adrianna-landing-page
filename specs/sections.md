# sections — the two pages and their narrative blocks

## What
Each page is a flat, ordered list of section components. Sections own page content and layout;
they compose from composites and primitives and contain the actual copy. `H*`/`A*` names are
positional (Home/About + order), not semantic.

## Where
Sections live in `showcase/components/sections/`. Page composition:

`showcase/app/page.tsx` — Home (`/`):
- `Hero.tsx` — fullscreen hero, sigil draw-on, embedded NewsletterForm
- `H4.tsx` — St. John Chrysostom pull quote between gold rules
- `H5.tsx` — intro paragraph + "Read full bio" link to /about
- `H6.tsx` — "The Pillars of My Practice": 5 PillarCards
- `H7.tsx` — services + pricing: 3 PriceCards (with BookButtons); 3-session package and insurance/sliding-scale notes removed 2026-07-05 pending client confirmation
- `H8.tsx` — "Stay close to the work" newsletter CTA
- `ContactSection.tsx` — "Write to Adrianna" + ContactForm (`id="contact"`)
- plus page-level: `NewsletterModal` (50% scroll) and `ConfirmedBanner` (?confirmed=)

`showcase/app/about/page.tsx` — About (`/about`):
- `A1.tsx` — heading + bio image
- `A2.tsx` — "Her Story": DropCap + multipart bio
- `A3.tsx` — practice description + 5 expanded PillarPanels
- `A4.tsx` — "Credentials": 9 CredentialRows
- `A5.tsx` — closing CTA: Return Home, Free Intro Call (BookButton), Join the Newsletter

Shell: `showcase/app/layout.tsx` (fonts, ConvexClientProvider, HeaderNav, Footer),
`showcase/app/template.tsx` (route fade, reduced-motion aware).

## How
- To reorder or add a section, edit the page file's list — sections are independent blocks.
- Footer links to the contact form via `/#contact`; keep that id on ContactSection.
- Copy lives inside the section files (and data arrays for pillars/services within them).

## Session addendum 2026-08-21 — hero copy pivot (owner present, dictated)

Tagline: "Traditional Psychology • Spiritual Resilience • Conservative
Counseling" (was Spiritual Direction). Positioning line REPLACED CPTSD line:
"Estrangement, Reconciliation & Restoration — the complex dynamics of family
rupture, forgiveness, boundaries, and the difficult path back to one another."
Practice direction: estrangement/restoration/forgiveness (what pulls on her
Facebook). UNRESOLVED: A3.tsx:13 bio still leads with PTSD/CPTSD expertise —
hero promises estrangement, bio promises trauma; decide whether to reframe
trauma cred as foundation for estrangement work. Same tension A2.tsx:45.
