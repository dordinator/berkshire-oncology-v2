# Accessibility audit and remediation record

**Site:** Berkshire Oncology Partnership
**Standard:** WCAG 2.2 Level AA
**Period:** September 2026
**Status:** remediation complete; manual assistive-technology pass outstanding

This is the internal record behind the conformance claim published at
`/accessibility`. It is not published. It exists so that the claim can be
substantiated if it is ever questioned, and so that the reasoning behind each
decision survives the people who made it.

Visual decisions and their rationale are recorded separately in
[`accessibility-visual-decisions.md`](./accessibility-visual-decisions.md), which
carries a dated ruling against each item.

---

## 1. Scope

The claim covers the site as a visitor can reach it: 55 routes, comprising the
home page, the eight section landings, ten consultant profiles, eighteen cancer
type pages, seven treatment pages, the browse pages and the legal pages. Every
route in `src/app/sitemap.ts` plus every static route in `src/app`.

**Out of scope, and why.**

*Unreachable components.* Forty-three component files have no importer and cannot
be rendered by any route, confirmed by transitive import analysis from every
Next.js file-convention entry point. They include `Cursor.tsx`, `Magnetic.tsx`,
`Marquee.tsx`, `ParticleField.tsx`, `TreatmentsExplorer.tsx`, `TypesJourney.tsx`
and most of the specialities visuals. A conformance claim describes what a
visitor can reach, so these are excluded. Two caveats are worth recording: their
CSS still ships in `globals.css`, and `ParticleField.tsx` and `HairlineWaves.tsx`
are each a single import away from being live.

*The contact service.* `src/app/api/contact/route.ts` is a stub returning 503
with no caller, and the only form on the site is a disabled preview. SC 3.3.1 to
3.3.4 and 4.1.3 for error handling are therefore untested surface that will land
whole when a real contact service is connected. The form's markup has been
prepared — real labels, correct `autocomplete` tokens, a form landmark — but the
behaviour cannot be tested until there is behaviour.

---

## 2. Method

Automated testing detects roughly a third of WCAG issues. It is used here as a
sweep, not as the evidence, and every automated finding was verified before being
treated as real.

### 2.1 The automated sweep

`npm run a11y` builds the site, serves it, and runs axe-core against
`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` and `wcag22aa` over every route at
five widths (320, 375, 768, 1024, 1440) in two motion settings — default and
`prefers-reduced-motion: reduce`. That is 550 page loads per run. Reduced motion
is swept as well because it is a supported configuration, not a fallback.

Each page is measured in a settled state: scrolled end to end so every
`IntersectionObserver` has fired, returned to the top, then held until running
animations finish. A previous manual pass (commit `84597a1`) recorded roughly 27
false contrast failures caused by measuring entrance animations before they had
played; the script exists partly to stop that recurring.

### 2.2 Verifying what the sweep reports

**axe's contrast findings were not usable as reported.** axe derives contrast
from the DOM: it walks for a backdrop, and on a site with layered and absolutely
positioned content it can resolve the wrong one. The baseline sweep reported
2,344 violating elements. Spot-checking the largest group found text axe scored
at 3.66:1 which measures **5.26:1** in the rendered pixels.

`scripts/a11y-contrast-verify.mjs` therefore re-measures every flagged element
from a screenshot of itself, at every width it was flagged at:

- the **background** is the most common colour inside the element's own box, so
  it is what is actually painted rather than what the DOM implies;
- the **foreground** is the computed `color`, composited over that background if
  it carries alpha — mining the image for the text colour proved unreliable,
  because anti-aliasing, a heading in a different colour and a decorative rule
  all produce plausible dark pixels that are not the text being judged;
- the element must reach full opacity before it is measured, or it is reported as
  unverified rather than guessed at.

That reduced 2,344 reported elements to **213 real failures**, which resolved to
three colour pairings.

### 2.3 Focus visibility, proved photographically

This site has no global focus ring, so whether a control shows focus depends on
whether one was written for it. Reading the source found 23 `<button>` elements
with no focus style. That number was wrong: it missed hand-rolled `rounded-full`
links, which are not buttons.

`scripts/a11y-focus-check.mjs` photographs every focusable control twice —
unfocused, then focused with a real `Tab` press, because `:focus-visible` does
not apply to programmatic focus — and compares the pixels. Anything that does not
change has no indicator. That found **58** controls, not 23.

### 2.4 Criteria axe does not evaluate

`scripts/a11y-manual-checks.mjs` measures SC 2.5.8 Target Size and SC 1.4.10
Reflow directly. The target-size check applies the criterion's own exceptions —
inline targets within a sentence, and the 24px spacing circle — and excludes
overlapping boxes, which are stacked variants of the same content rather than two
targets a finger must choose between. Without those exceptions the raw count is
1,367 instances; with them it is zero.

**Corrected 7 September 2026.** That last exception is too broad. It holds where
two boxes are stacked variants of one destination, but it also silenced a real
failure. On `/tariffs` the landline, mobile and email links each carried
`py-2.5 -my-2.5` to lift a 21px target over the 24px minimum, while sitting 34px
apart in a `space-y-1.5` stack. Each hit area became 48px, so consecutive
targets overlapped by 14px, and hit-testing gave the shared band to the lower
link: the bottom of the landline dialled the mobile. Three probes inside the
band, at 390px and again at 1440px, all resolved to `tel:07928888662`. Two
different destinations are precisely the case the exception was not meant to
cover. Padding is now capped at 3px, consuming the 6px gap and leaving a 34px
target that still clears the minimum and cannot overlap its neighbour. Found by
`scripts/mobile-audit.mjs` during the mobile pass, not by this suite.

---

## 3. Tooling now in the repository

| Command | What it does |
|---|---|
| `npm run a11y` | Build, serve, sweep every route at five widths in two motion settings. Exits non-zero on any violation. |
| `npm run a11y:sweep` | The sweep alone, against a server already running. |
| `node scripts/a11y-contrast-verify.mjs` | Pixel-verifies contrast findings from a sweep report. |
| `node scripts/a11y-focus-check.mjs` | Photographs every control focused and unfocused. |
| `node scripts/a11y-manual-checks.mjs` | Target size and reflow. |
| `npm run lint` | `jsx-a11y/recommended`, not the six-rule subset `next/core-web-vitals` enables alone. |
| `.github/workflows/accessibility.yml` | Lint and sweep on every push and pull request. |

Contributor guidance is in the Accessibility section of `AGENTS.md`.

All four scripts launch Chromium with `--use-mock-keychain`. Without it, macOS
raises a keychain password dialog on every launch and **the run blocks behind it
until someone dismisses the prompt** — which on a headless or CI machine means it
simply hangs. The browser contexts are throwaway and store no credentials, so
there is nothing the real keychain would be protecting.

---

## 4. Corrections made during this work

Recorded because the corrections matter as much as the findings, and because an
assessor who repeats this work should reach the same numbers.

| Reported | Actual | Why |
|---|---|---|
| 2,344 contrast failures | 213 | axe resolved the wrong backdrop on layered content. |
| 1,367 target-size failures | 0 | The criterion's own exceptions were not applied. |
| 23 controls with no focus indicator | 58 | The source scan looked at `<button>` only, missing pill links. |
| 34 unreachable components | 43 | The reachability scan missed Next.js route conventions. |
| Mega-menu "walks ~150 links" | 21 tab presses | Panel links are not in the DOM until a panel opens. Measured, not inferred. |

Two findings were dismissed after measurement rather than fixed: target size and
reflow both pass. Two were dismissed as not being criterion failures: the
desktop-only jump list on `/locations`, and the fact that its locations cannot be
browsed ahead of. One failure was found that no audit had reported — the hero
panel on `/locations` scrolled but could not be scrolled by keyboard — and it
surfaced only from measuring something else.

---

## 5. Results

Final sweep: **550 page loads** — 55 routes, five widths, two motion settings —
plus the dedicated focus, target-size and reflow checks. Reports are in
`docs/a11y/`, dated and diffable against the pre-remediation baseline.

| Check | Baseline | After |
|---|---|---|
| Contrast (SC 1.4.3), pixel-verified | 213 elements failing | **0** |
| Focus visibility (SC 2.4.7), photographed | 58 controls with no indicator | **0 of 741** |
| Reflow at 320px (SC 1.4.10) | passing | passing |
| Resize text to 200% (SC 1.4.4) | 6 elements losing text | **0** |
| Target size (SC 2.5.8) | 8 controls | **0** |
| Use of colour (SC 1.4.1) | 6 links failing | **0** |
| Keyboard operation (SC 2.1.1) | 3 failures | **0** |
| Pause, stop, hide (SC 2.2.2) | 2 failures | **0** |
| Identify input purpose (SC 1.3.5) | 4 fields failing | **0** |
| Status messages (SC 4.1.3) | 2 regions silent | **0** |

### Criteria requiring particular note

**SC 2.2.2 Pause, Stop, Hide.** Two carousels advanced every 5.2 seconds through
real information — hospital names, addresses, descriptions — with no way to stop
them; clicking a location restarted the timer rather than stopping it.
Auto-rotation was removed. Verified by photographing the section twice, twelve
seconds apart: pixel-identical.

**SC 2.1.1 Keyboard.** Three separate failures on `/locations`. Arrow, Page and
Space were captured at the window and remapped to whole-viewport jumps, so a
keyboard user could not scroll a 700svh page by a line. Mandatory snapping
prevented touch and scrollbar users resting anywhere but a stop. And the hero
panel scrolled internally with no way to reach its overflow — 229px unreachable
at 320px. All three fixed and verified by keyboard.

**SC 2.4.7 Focus Visible.** The site has no global focus ring; it was removed by
request in commit `d06184d`, with the intention that each control would show
focus by changing itself. That intention was only half implemented. It is now
complete, using the site's own idioms rather than a ring: text controls
underline, pills draw a line just inside their own edge in their label's colour.

**SC 1.4.4 Resize Text.** Two separate failures, both found late and both by a
check that had to be corrected first. A `line-clamp-2` on the `/specialities` map
card discarded 45px of a hospital description at 200% zoom. Five location tab
names on the same page were truncated horizontally, losing up to 119px of a name.
The second was invisible to the check until it was widened to measure both axes —
it had only ever compared heights. Both fixed by letting the text wrap.

**SC 2.5.8 Target Size.** Eight controls at 19–21px against a 24px minimum,
each with a neighbour inside its exclusion zone. **Reported clean twice before
being found**: the first measurement ran at one width only, and the second
excluded any overlapping neighbour, which also excluded genuinely adjacent
controls. Both faults are corrected in the script.

**SC 1.4.1 Use of Color.** Links inside legal-page prose were marked by colour
alone at 1.07:1 against the surrounding text, with the underline appearing only
on hover. Missed in the first pass despite appearing in the baseline summary.

**SC 1.4.3 Contrast.** Two palette values were darkened — `ink.muted` and a new
`sage.ink` for sage text — plus the existing `gold-ink` token for one label. No
background colour was changed.

### The remaining criteria, tested 6 September

Nine criteria that none of the earlier passes had covered. Five are measured by
`scripts/a11y-criteria-check.mjs`; four were resolved by inspection.

| Criterion | Result | How |
|---|---|---|
| 1.4.12 Text Spacing | Pass | Required overrides applied across 55 routes; no clipping or overlap |
| 2.5.3 Label in Name | Pass | Every `aria-label` contains its control's visible text |
| 2.4.11 Focus Not Obscured | Pass | Tabbed 45 controls per route; none hidden behind sticky content |
| 1.3.4 Orientation | Pass | Renders in portrait and landscape, no rotate prompt |
| 3.2.3 Consistent Navigation | Pass | Identical primary nav order on every route |
| 2.5.7 Dragging Movements | Pass | No pointer-drag handler in any reachable component |
| 3.1.2 Language of Parts | Pass | `en-GB` throughout; no foreign-language passages |
| 1.4.5 Images of Text | Pass | One logotype, which the criterion exempts; the wordmark is real text |
| 1.4.13 Content on Hover or Focus | Pass | The mega-menu is dismissible, hoverable and persistent |
| 3.2.4 Consistent Identification | Pass | Repeated functions share labels |

**The first run of that script reported failures against three of the five, and
all three were faults in the checks rather than in the site.** `1.4.12` flagged a
link clipped inside a collapsed panel rendered at `opacity: 0`. `2.5.3` reported
87 mismatches because `textContent` runs adjacent inline elements together, so
the two-part wordmark read as "berkshire oncologypartnership" — a string no
accessible name could contain. `2.4.11` hit-tested coordinates read while a
horizontal scroller was still animating. Each was corrected in the script and the
re-run is clean. A screenshot of the supposedly obscured control is at
`docs/a11y/screens/16-focus-tab20.png`, plainly visible and correctly focused.

One observation recorded and deliberately not acted on: the numbered rail on
`/consultants` announces "01" before each consultant's name. Marking those
ordinals decorative would be an improvement, but it is not a failure.

### Accessibility tree audit, 6 September

`scripts/a11y-tree-audit.mjs` reads the accessibility tree over CDP on all 55
routes — the same computed names and roles Chrome hands a screen reader.

**Every control exposes an accessible name. None is named only by punctuation, a
bare URL or a single character. Every route has a title. Reading order matches
visual order.**

Two notes on the method, because the first two runs of this script were wrong in
ways that mattered. It originally used `page.accessibility`, which no longer
exists in this Playwright version; every route threw, and because the findings
arrays were empty the report printed a clean pass for 55 routes it had never
read. The script now records how many routes it actually audited, lists any it
could not, refuses to print a pass where coverage is incomplete, and exits
non-zero in that case. Its visibility test also read only an element's own
`display`, so headings hidden by an ancestor at another breakpoint counted as
visible at 0×0 and appeared to reverse the reading order; visibility is now taken
from the rendered box.

### Not applicable

SC 1.2.1–1.2.5 (time-based media): the site contains no audio or video — no
media elements, no embeds, no media files. SC 2.2.1 Timing Adjustable: no time
limits or auto-refresh. SC 3.3.7 Redundant Entry and SC 3.3.8 Accessible
Authentication: no multi-step process and no authentication. SC 2.3.1 and 2.3.2
(flashing): nothing cycles faster than 0.5 Hz, against a 3 Hz threshold.

---

## 6. Manual testing record

| Pass | Status | Date | By |
|---|---|---|---|
| Automated sweep, 5 widths × 2 motion settings | Complete | 5 Sep 2026 | Automated, `npm run a11y` |
| Focus visibility, 741 controls photographed | Complete | 5 Sep 2026 | Automated, `a11y-focus-check.mjs` |
| Target size and reflow | Complete | 5 Sep 2026 | Automated, `a11y-manual-checks.mjs` |
| Keyboard traversal of core journeys | Complete | 5 Sep 2026 | Scripted, verified per fix |
| 200% zoom (SC 1.4.4) | Complete | 5 Sep 2026 | Automated, `a11y-manual-checks.mjs` |
| Remaining nine criteria | Complete | 6 Sep 2026 | `a11y-criteria-check.mjs` and inspection |
| Accessibility tree, all 55 routes | Complete | 6 Sep 2026 | `a11y-tree-audit.mjs` |
| Mobile layout, 55 routes × 5 phone widths | Complete | 7 Sep 2026 | Automated, `npm run mobile` |
| Screen reader (VoiceOver + Safari) | **Outstanding** | — | — |

The screen-reader pass is scripted in
[`accessibility-screen-reader-script.md`](./accessibility-screen-reader-script.md).
**The published conformance claim is not fully substantiated until it has been
carried out and attributed here.** The statement at `/accessibility` deliberately
does not describe screen-reader testing, and must not until this row is filled
in.


### Navigation and cancer locations update — 9 September 2026

The current canonical site has 31 page routes after retiring the 18 legacy
cancer views, four consultant browse routes and two duplicate routes. Query-based
cancer selections and consultant filters remain available through the current
hubs; old URLs redirect directly into them.

Codex ran the production build, the browser navigation audit, the full axe
route sweep and supplemental checks on selected UI states. The full sweep
completed all 310 loads without a load error, and reported 270 colour-contrast
instances. All 71 distinct route/selector targets were already present in the
committed 5–6 September sweep reports. See `a11y/2026-09-09.md` and its JSON.

The supplemental selected-state audit covers every supported cancer group's
location section, consultant filters and all five contact intents at 320px and
1440px (both motion settings for cancer locations): 80 checks, zero violations.
See `a11y/2026-09-09-navigation-states.md` and its JSON.

Scripted keyboard activation of location accordions and reflow checks passed at
320, 375, 768 and 1440px. The corresponding CSS viewport for 200% browser zoom
also passed. This was not a new manual VoiceOver pass. Navigation results and
reproduction instructions are in `navigation-audit-2026-09.md`.
