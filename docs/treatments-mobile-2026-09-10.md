# Treatments mobile hero — 10 September 2026

Local-only follow-up to `94c86be`, implementing the four approved adjustments.
Preview: [Treatments](http://127.0.0.1:3001/treatments).

## Changes below 768px only

- The two hero actions now follow the introduction, before the photograph.
- Both buttons stretch to the width of the longer label, not the full screen.
  At the tested widths they are both 225.14px wide and remain 52px high.
- The photograph aligns with the text/container gutter and uses the shared
  20px radius on all four corners. The image, object-position and aspect-ratio
  rules are unchanged.
- Hero bottom padding reduces from 128px to 104px. The following card still
  overlaps the hero boundary by 40% of its own height, so this reduces the
  visible gap by 24px without changing that card or the body section layout.

Tablet (768–1279px) and desktop (1280px+) retain their previous layouts.
Header, wording, links, colours, 15px button corners, 2px borders, focus styles
and side-fill animations are unchanged. No preview toggle or other changes.

## Checks

Performed by Codex in the local in-app browser:

| Width | Equal buttons before photo | Photo corners | Gap before card |
| --- | --- | --- | --- |
| 320px | Yes | 20px all four | 15.9px |
| 375px | Yes | 20px all four | 25.8px |
| 640px | Yes | 20px all four | 35.55px |
| 767px | Yes | 20px all four | 35.55px |

- One visible action pair at each tested width; no horizontal overflow.
- Before/after DOM measurements at 768, 1024, 1279, 1280 and 1440px match
  exactly for the hero, heading, introduction, image, buttons and route card.
- Mobile keyboard order: Browse treatments → How care is provided → Browse
  cancer types. All show focus; the hidden copy does not enter the tab order.
- Production build passed, generating all 61 pages; lint passed.
- Corner, fill, border and hero-palette tests pass. The palette test's two
  placement assertions were updated for the approved responsive change; all
  paint/geometry safeguards remain. Added a phone-layout regression test.
- Screenshot: `artifacts/2026-09-10-treatment-mobile/mobile-375.png`.

This is a targeted mobile-layout check, not full WCAG certification. The full
`npm run a11y` sweep was not rerun because it launches a separate browser;
this task uses the in-app browser tools. No screen-reader, enlarged-text or
cross-browser assessment is claimed. Existing public accessibility wording is
unchanged. The temporary viewport override and build tsconfig include were
removed after checking. Not pushed or deployed.
