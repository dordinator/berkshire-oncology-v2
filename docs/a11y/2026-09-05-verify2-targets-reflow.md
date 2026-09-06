# Target size and reflow — 2026-09-05

Two AA criteria that axe does not evaluate. Measured with Playwright: targets at 375px, reflow at 320px. The target-size figures apply the criterion's own exceptions: a target inside a sentence is exempt, and so is one whose 24px circle reaches no other target. Only crowded, undersized targets are listed.

## SC 2.5.8 Target Size (Minimum) — 24×24 CSS px

No undersized targets. Inline targets within a sentence are exempt and were excluded.

## SC 1.4.4 Resize Text — 200% zoom (640×512)

No horizontal scrolling, and no text clipped by a fixed-height container. `sr-only` text is excluded: it is clipped deliberately.

## SC 1.4.10 Reflow — 320 CSS px, no horizontal scroll

No page scrolls horizontally at 320px.
