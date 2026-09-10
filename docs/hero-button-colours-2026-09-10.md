# Hero button colour changes — 10 September 2026

Local review of the scheme approved in this task. Based on `5d3fac5`; not pushed
or deployed. Only the specified hero action buttons opt into the new colours.

## What changed

| Preview | Before | Now |
| --- | --- | --- |
| [Treatments](http://127.0.0.1:3001/treatments) | Two underlined text links | **Browse treatments** is navy-filled with white text; **How care is provided** is transparent with a navy border and label. Both use the approved shared button and side fill. |
| [Patients](http://127.0.0.1:3001/patients) | Older navy/blue primary and navy-outline secondary | Same button hierarchy and dimensions, using the approved homepage navy/blue. |
| [Fees](http://127.0.0.1:3001/tariffs) | Older navy/blue primary and older navy secondary label/border | Approved navy/blue primary; approved navy secondary label/border. The secondary retains its translucent-white resting surface and white side fill. |
| [Consultant profile example](http://127.0.0.1:3001/consultants/gelareh-eslamian) | Sage appointment button | Navy appointment button with blue fill and white text, across all 10 consultant profiles. Existing label, arrow setting and dimensions retained. |
| [Treatment detail example](http://127.0.0.1:3001/treatments/chemotherapy) | Sage **Contact the practice** button | Navy with blue fill and white text, across all 7 treatment detail pages. The adjacent plain telephone link remains unchanged. |

Primary resting face and border: `#0E2F55`. Primary liquid fill: `#164C88`.
Primary label: white throughout. Outlined secondary labels and borders:
`#0E2F55`. Patients/treatments secondary fill: a 5% tint of that navy.

The treatments links necessarily gain button padding and borders: measured at
52px high instead of 20px. Their two existing responsive placements, gaps,
surrounding layout, wording and anchor destinations are unchanged.

## Deliberately unchanged

- [Homepage](http://127.0.0.1:3001/) photo buttons, including the single-mask
  anti-fringe fix, white primary rest state, phone treatment and visible borders.
- 15px button corners, 20px panel/navbar corners, 2px borders, and the existing
  500ms left-to-right fill and arrow motion.
- All button wording and destinations; clinical and other page copy.
- Headings, text outside these controls, page/section backgrounds, sage panels,
  global navbar, non-hero buttons, search, navigation cards and plain phone links.
- Existing keyboard-focus indicators and reduced-motion rules.
- No preview toggle added; no unrelated accessibility or copy changes.

## Verification

- Local browser comparison across `/`, `/treatments`, `/patients`, `/tariffs`,
  `/treatments/chemotherapy` and `/consultants/gelareh-eslamian`: all 338 sampled
  visible controls retain their labels and destinations. The six existing edited
  hero buttons retain their measured dimensions and 15px corners; only the two
  converted treatments text links grow. Lower-page scroll animations can affect
  bounding boxes between captures, so this is not a blanket geometry claim for
  every unrelated control.
- Treatments checked at 320, 375, 1279, 1280 and 1440px viewport widths: one
  visible pair at each width, no horizontal overflow, neither label clipped.
- Both new treatments buttons were activated and reached their unchanged
  anchors (`#treatment-index` and `#what-we-do-not-provide`) with focus handed
  to the destination section. The temporary viewport override was reset.
- Native keyboard checks cover the new treatments pair, patients primary, both
  fees buttons, and representative consultant/treatment-detail primaries. The
  approved navy border stays in the filled focus state; fees secondary retains
  its navy inset focus shadow and white fill. The original utility-focus border
  conflict was caught and fixed by the opt-in selector specificity.
- The production build generated all 61 pages. Rendered build outputs confirm
  the new primary opt-in on all 10 consultant and 7 treatment detail pages.
- Existing corner, fill and CTA-outline regression tests pass unchanged; the new
  `scripts/test-hero-cta-palette.cjs` checks colour-only opt-ins, preserved default
  families, responsive placements, destinations and solid white-label contrast.
- Lint and `git diff --check` pass. Independent read-only source review found no
  scope/copy/geometry issue.

Screenshots are in `artifacts/2026-09-10-hero-palette/`.

This is targeted styling verification, not a full WCAG conformance assessment.
The full `npm run a11y` browser sweep was not rerun: browser interaction in this
task uses the in-app browser tools, while that script launches a separate
Playwright browser. Reduced-motion hooks were checked at source level; this
pass does not claim a screen-reader, all-route keyboard or cross-browser audit.
The public accessibility qualification remains unchanged.

Build housekeeping: network access was required for the existing Google Fonts.
Five pre-existing empty duplicate `node_modules/@types` directories (`json5 2`,
`node 2`, `prop-types 2`, `react 2`, `react-dom 2`) prevented type checking. They
were moved intact to `/private/tmp/berkshire-hero-build.CjImPC/`; no package or
lockfile was changed. The build's temporary tsconfig include was removed.
