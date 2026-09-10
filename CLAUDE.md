# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`AGENTS.md` is the authority on content, voice, clinical safety (YMYL/E-E-A-T) and the
accessibility commitment. Read it before writing any copy. This file covers the
mechanics it doesn't: commands, and the architecture you'd otherwise have to
reconstruct from several files.

## Commands

```bash
npm run dev        # dev server, port 3000
npm run build      # production build
npm run start      # serve the build
npm run lint       # next lint (jsx-a11y/recommended, not just core-web-vitals)
```

There is no unit test suite. The audit scripts are the test suite. They need browsers
installed first — CI does this explicitly and the cache is easily lost:

```bash
npx playwright install chromium
```

```bash
npm run a11y             # next build && full axe sweep. Exits non-zero on any violation.
npm run a11y:sweep       # the sweep alone, against an existing build
npm run a11y:announce    # what a screen reader says, step by step, through the widgets
npm run a11y:voiceover   # drives real VoiceOver — macOS only, needs accessibility permission
npm run mobile           # layout sweep at phone widths
npm run mobile:shots     # screenshots; mobile:frames renders them in device frames
```

Scope a sweep while iterating — the full run is 550 page loads and takes ~20 minutes:

```bash
node scripts/a11y-audit.mjs --routes=/cookies,/patients --base=http://localhost:3000
```

Other scripts in `scripts/` cover what axe can't: `a11y-focus-check` (SC 2.4.7, proved by
screenshot), `a11y-criteria-check` (AA criteria nothing else covers), `a11y-tree-audit`
(what AT is actually handed), `a11y-contrast-verify` (pixel verification of axe findings),
`a11y-manual-checks` (the measurable half of the manual pass).

Reports land dated in `docs/a11y/` and `docs/mobile/` and are committed as the evidence
behind the published conformance claim.

`.claude/launch.json` defines `berkshire-dev` (3000), `berkshire-prod` (3210) and
`berkshire-phone` (3400, bound to 0.0.0.0 for a real handset).

## Architecture

**Next.js 14 App Router, TypeScript, Tailwind. Everything is static.** No CMS, no
database, no auth. Content is plain TypeScript modules in `src/content/`, typed by
`src/content/types.ts`, and that is the single source of truth. Change data there, never
in a component.

**Consultants and cancer types are a many-to-many relation.** `treatments.ts` holds the
edges (`{ consultant, speciality, modality? }`); `queries.ts` reads it in both directions
so a consultant page and a cancer-type page can never disagree about who treats what.
Never hard-code either side of that relationship in a component — go through `queries.ts`.

**Old URLs are load-bearing.** `next.config.mjs` 301-redirects every `.htm` path from the
previous site, plus routes retired during rebuilds, to preserve rankings and inbound
links. The `specialities` and `consultants` arrays there must stay in sync with
`src/content`. Removing a page means adding a redirect, not deleting a route.

**Legal pages are a separate content type.** `LegalDoc` (slug, title, optional `updated`,
html) rendered by `LegalLayout` via `dangerouslySetInnerHTML`. The body text is
deliberately verbatim from the practice's approved documents — source comments record
every deviation, and several carry `FLAGGED FOR THE PRACTICE'S LEGAL REVIEW`. Don't
paraphrase, tidy or "improve" legal copy. Setting `updated` renders a "Last updated" line,
so it asserts that a review happened.

**The site sets no cookies.** No analytics, no tag manager, no advertising or social
embeds; fonts are self-hosted through `next/font`. The only third-party request is
OpenStreetMap tiles in `RegionMap.tsx`. Three `localStorage` keys hold display
preferences, written only from their setter: `bop:graphic-mode`, `bop:treatment-mode`,
`bop:consultant-section-spacing`. `/cookies` documents exactly this, so anything that adds
a cookie, a third-party request or a storage key makes a published statement untrue.
Speciality and treatment URLs name a diagnosis, so a third-party request from those pages
leaks health data — keep them clean.

**Display modes** (`GraphicMode`, `TreatmentMode`) are three-way — quiet / integrated /
expressive. The server renders the default and the stored preference is applied after
mount, so hydration matches; components use `ready` to avoid animating in on a mode the
user didn't pick.

**Animation stack**: Lenis smooth scroll, `Reveal` (framer-motion, `once: true`), GSAP for
scroll-linked work. Some sections animate opacity against scroll progress, which has a
consequence for testing — see below. `prefers-reduced-motion` is honoured throughout.

**API routes barely exist.** `/api/contact` deliberately returns 503: the prototype must
not accept or log patient information until the practice approves a clinical
communications workflow. `/api/copy-review` is an internal review tool.

## Gotchas

**Contrast is measured in the reduced-motion pass only.** Sections that fade against
scroll progress rest part-faded while the page sits at the top (`/tariffs #self-funding`
is 0.45 there, 1.0 once scrolled to). axe walks the whole DOM regardless of what's on
screen and reports contrast against a state no reader meets. That produced ~250 phantom
findings whose count wandered between runs. Waiting longer cannot fix it — an element
parked by scroll position is perfectly settled. `prefers-reduced-motion` switches those
animations off and leaves every element at its authored colour. A genuine contrast failure
is a choice of colour and fails in **both** passes; if a finding appears only under default
motion, suspect the harness before the palette.

**`.legal-prose table` is `display:block; overflow-x:auto`**, so any legal-page table wide
enough to overflow becomes a scrollable region and needs `tabindex="0"` plus a label to
stay keyboard-reachable (SC 2.1.1).

**The navbar pill is 70% white**, so whatever scrolls behind it tints the ground for text
on top. On the legal pages that's the navy title band, which is why the brand wordmark
needs `ink-soft` rather than `ink-muted`.

**`Hospitals.tsx` and `MapEmbed.tsx` are dead** — imported by nothing. `MapEmbed` is a
Google Maps iframe; wiring it up would set Google cookies and contradict `/cookies`. Check
whether a component is actually rendered before reasoning about its behaviour.

**`www.berkshire-oncology.org.uk` is not this repo.** It still serves the legacy
Dreamweaver site. Nothing pushed here reaches it.

## Commits

Subject is a sentence-case imperative that says what changed in the product, not the file
touched. The body is prose — no bullet lists — explaining why the previous state was
wrong, what was measured, and what was deliberately left alone. Numbers and measurements
belong in the message. See `git log` for the established register.
