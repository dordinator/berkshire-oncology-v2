# Approved Main and WCAG merge — 10 September 2026

The user compared both running versions and selected Main for decisions 1–3
and WCAG for decisions 4–10, then authorised the merge.

## Sources and decisions

Main: `5d3fac5`. Local WCAG work: `0e7a245`. Upstream WCAG: `bbae997`.
The upstream WCAG documentation was merged first. Main was then merged into
that history, retaining both branches' ancestry.

1. Homepage cancer directory: Main.
2. Homepage care expectations section: Main.
3. Homepage feedback section: Main, including the visible prototype labels.
4. Consultant opening layout: WCAG.
5. Consultant patient and peer reviews: WCAG.
6. Consultant treatment experience: WCAG.
7. Cancer-page locations: WCAG.
8. Dropdown destinations, filters and retirement redirects: WCAG.
9. Link arrival and section selection: WCAG.
10. Cookies, patient privacy notice and website privacy: WCAG. GitHub verified
    Haza1410 as author and committer of their most recent changes (`bc70bf1`
    and `d97f528`). Push actor was not independently verified.

## Resolution

The consultant page, consultant About and Locations components, cancer hub,
and accessibility runner conflicts retain the local WCAG implementations.
The old standalone cancer page remains deleted with its redirects retained.
The CSS conflict only concerned a comment; all current geometry is retained.
Main's shared corner and patient CTA refinements merge without conflicts.
The homepage uses Main's components and the WCAG canonical cancer-link helper.

The CTA source regression check no longer expects the intentionally retired
standalone cancer page. The navigation audit verifies retirement redirects.
The arrival audit now explicitly includes the restored homepage sections.

## Scope and limitations

This merge preserves the selected versions; it does not approve clinical or
legal copy for publication. Homepage quotations remain visibly illustrative.
Main's known lack of a persistent pause control for automatic homepage content
remains documented in its qualified accessibility statement. The selected cookie
copy still mentions the removed consultant spacing preference; the policy
source also records outstanding practice confirmation of the controller list.
These existing issues are retained rather than silently rewriting the choices.

The pre-merge local work is saved as
`backup/wcag-before-approved-merge-20260910`. The separate Main preview remains
at `5d3fac5`; the combined site is served at `http://127.0.0.1:3000/`.

## Validation

The required `npm run a11y -- --workers=4 --label=approved-merge` completed
31 routes × five widths × two motion settings: all 310 configurations pass
with zero reported violations. Evidence: `a11y/2026-09-10-approved-merge.md`
and its JSON. The existing runner excludes default-motion contrast findings;
the reduced-motion pass includes contrast. This is automated evidence, not a
claim of full conformance or resolution of the documented limitations above.

Production build (including TypeScript) and lint pass. The five imported
homepage/CTA checks pass: cancer-directory rotation, testimonial preview,
corner tokens, button fills and CTA outlines. The CTA check was updated only
to remove its reference to the retired standalone cancer page.

The navigation audit passes all eight dropdowns, ten mobile links, 103 legacy
redirects, 60 documents/states and 320 destinations, without issues or page
runtime errors. Evidence:
`a11y/2026-09-10-approved-merge-navigation/link-audit.json`.

All 36 homepage arrival cases pass: six headings at 1440 × 900, 720 × 450
and 320 × 780, each with default and reduced motion. Evidence:
`a11y/2026-09-10-approved-merge-homepage-arrivals.json`.

Codex inspected the merged homepage in the in-app browser, including the
restored care section, cancer directory and visibly labelled feedback. Keyboard
Enter advances the quotation and the updated text appears in the accessibility
tree. The focused control has a visible ring. The consultant overview retains
the request/call/review panel and keyboard Enter on Treatments navigates to its
section. No new manual VoiceOver or actual browser-zoom pass was performed;
720 × 450 is a reduced CSS viewport, not a claim of manual 200% zoom testing.
