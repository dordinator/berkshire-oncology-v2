# Accessibility tree audit — 2026-09-06

What assistive technology is handed on each of 55 routes: every control's name and role, heading structure, page titles and reading order.

This is the automatable part of a screen-reader pass. It cannot judge whether an announcement makes sense — only whether one exists and is coherent.

**Routes successfully audited: 55 of 55.**

## Controls with no accessible name

Every button, link, image and form control exposes a name.

## Names that tell a listener nothing

No control is named only by punctuation, a bare URL, or a single character.

## Heading structure

Every route has exactly one h1 and no skipped levels.

## SC 1.3.2 Meaningful Sequence

| Route | Reads after | But appears above | By |
|---|---|---|---|
| `/treatments` | Types of cancer treatment. | Treatments using medicines | 150px |

## SC 2.4.2 Page Titled

Every route has a meaningful title.
