# CTA outline consistency — 9 September 2026

## Scope and hand-off

Continued from merge `35ce21e` after the other task explicitly handed back the
shared checkout. Its five partial approved styling files were preserved. This
pass completes the bespoke CTA border rollout and restores the fees secondary
button's existing inset keyboard-focus treatment.

Approved constraints: 2px CTA borders, 15px button corners, 20px panels/navbar,
existing liquid side-fill animation, unchanged copy, destinations and behaviour.
No changes to unrelated contrast findings, typography, layouts, timers, contact
integrations or the qualified public accessibility statement.

## Implementation

- Explicit `data-cta-outline` opt-ins on the footer, patient pathways,
  professional routes, closing band, consultant-profile actions, mobile phone
  action, cancer-detail phone action, external treatment information action,
  cancer-finder recovery actions and disabled contact actions.
- Existing 1px borders become 2px with 1px removed from each padded side;
  previously borderless buttons lose 2px of padding per side. Minimum-height
  controls with no vertical padding retain their existing height.
- Light contexts use the approved navy border; transparent dark-context actions
  use white. The treatment-information action retains its sage hover family.
- The fees secondary keeps `rounded-full` as the merged focus-style hook; its
  actual computed radius remains 15px through the shared token. This avoids
  accidentally replacing its inset focus indicator with a text underline.
- The hero's previously approved single masked paint surface remains intact:
  its 2px navy border has a 13px inner radius inside the unchanged 15px mask.

## Checks performed

Performed by Codex in the in-app browser against `http://127.0.0.1:3001`.

- Compared 101 sampled DOM controls before and after this rollout on `/`,
  `/tariffs`, `/patients`, `/consultants` and `/treatments/chemotherapy` in the
  same normal preview. No label/destination mismatch and no width/height change
  above 0.02px. This sample includes unchanged controls as well as edited CTAs.
- Confirmed 2px borders and 15px corners on the edited, rendered CTAs.
- Additional computed-style checks on `/specialities/breast`, `/contact`,
  `/resources`, `/locations` and `/consultants/gelareh-eslamian`. Contact's
  disabled integration action remains disabled. Both contact hash URLs were
  visited; this is not a complete test of every contact-intent state.
- Desktop 1440×900 and mobile 375×812 visual checks for homepage/fees buttons.
  Temporary viewport override was reset afterwards.
- Captured the hero during and after the liquid fill; inspected 3× crops. Navy
  border stays continuous; no old white fringe at the completed blue endpoint.
  The phone's white-filled endpoint uses navy text and border.
- Native keyboard Tab/Shift+Tab confirmed both homepage hero controls retain
  their white 3px focus indicator and fixed 15px corners. Fees secondary focus
  retains its 2px navy inset shadow, no underline, and completed white fill.
- Mobile-menu telephone action measured 48px high, with 2px border/15px radius.
- TypeScript AST comparison against `35ce21e` confirmed all eleven edited TSX
  files differ only in `className` and `data-cta-outline` attributes. Labels,
  URLs, handlers, disabled states, ARIA, tab order and copy-review hooks remain.
- Independent read-only review found no blocking scope or geometry issues.

Commands passed:

```text
node scripts/test-corner-tokens.cjs
node scripts/test-button-fills.cjs
node scripts/test-cta-outlines.cjs
npm run lint
NEXT_DIST_DIR=.next-button-outlines npm run build
git diff --check
```

Production build generated all 61 pages. The first sandboxed build could not
fetch the existing Google Fonts; the network-enabled retry succeeded. Its
generated tsconfig include was removed so this pass leaves no config change.

## Evidence and limits

Screenshots: [moving hero, 3×](../artifacts/2026-09-09-cta-outlines/hero-moving-3x.png),
[settled hero, 3×](../artifacts/2026-09-09-cta-outlines/hero-settled-3x.png),
[fees keyboard focus](../artifacts/2026-09-09-cta-outlines/fees-keyboard-desktop.png),
[mobile hero](../artifacts/2026-09-09-cta-outlines/hero-mobile.png),
[mobile fees](../artifacts/2026-09-09-cta-outlines/fees-mobile.png).
These are browser screenshots, with nearest-neighbour enlargement for edge
inspection; they are not evidence for every browser's rasterisation.

This is a targeted styling/interaction check, not a WCAG conformance audit.
The repository's full `npm run a11y` sweep was not rerun in this pass: browser
interaction for this task was restricted to the in-app browser tools. The
preceding merge's automated report and known findings remain documented in
[the merge record](accessibility-merge-2026-09-09.md); they are not a pass for
this newer revision. No screen-reader, complete keyboard, all-route state,
reduced-motion browser or cross-browser sweep is claimed here. Reduced-motion
hooks were checked at source level. The public qualification is unchanged.

No push or deployment was performed.
