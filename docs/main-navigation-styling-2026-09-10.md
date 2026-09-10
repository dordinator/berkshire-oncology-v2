# Approved navigation and button styling — 10 September 2026

The rounded rectangular navbar shown in the reference was on `main` at `5d3fac59e152e438f44bba4360e0f12716b76a28`, not remote `WCAG` at `bc70bf155b72328d72e0bb2d3702f8da960edb49`. Pulling WCAG alone therefore did not provide that design.

The shared design styles are now integrated into WCAG: 15px button corners, 20px panel/navbar corners, matching dropdown and search-panel edges, and the approved CTA borders, colours, hover fills and keyboard-focus indicators. The homepage hero and fees buttons use their styles from main. Other existing CTA call sites use the corresponding border and padding changes from that branch.

Changes were combined with the current WCAG code rather than replacing its page implementations. This retains the current canonical routes, contextual appointment links, shared care-location section and approved consultant layout. Where main styled older versions of About and locations, the equivalent radius change was applied to the maintained components.

## Verification

- Production build, lint and TypeScript pass.
- Main’s existing `scripts/test-button-fills.cjs` was executed from a temporary copy against the integrated source. Its shared fill, hero paint structure, hover/focus colour and reduced-motion assertions pass.
- Homepage inspection at 1440, 768, 720, 375 and 320px found no horizontal overflow. The navbar computes to 20px corners and the primary hero button to 15px at every width. The 720 × 450 CSS viewport represents 200% zoom from 1440 × 900; it was not a manual browser-zoom session.
- The open search bar has 20px top corners and the results panel has 20px bottom corners. Search focuses its named combobox, exposes five popular results and closes with Escape.
- Keyboard focus on the hero primary action has a 3px white outline with 5px offset.
- At 1600 × 1000, the consultant portrait and section navigation still end at 908px. The contact panel is still 529px high with 64px top/bottom padding and centred reviews; About remains first below the overview.

The full audit uses the audit-script update previously pulled from WCAG: colour contrast is reported only for reduced-motion runs. Default-motion colour-contrast findings are filtered out. Its totals must not be presented as directly comparable to the preceding reports that counted contrast in both modes, or as proof of full WCAG conformance. Manual VoiceOver/Safari testing remains outstanding.

The navigation audit passed eight desktop dropdowns, ten mobile links, 103 redirects, 59 documents/UI states and 295 destinations without issues or browser errors. The full accessibility sweep completed 310 distinct configurations with HTTP 200 responses throughout, no load errors and zero reported violations under the current script’s coverage. Results are in `docs/a11y/2026-09-10-main-navigation-styling.md` and its JSON.
