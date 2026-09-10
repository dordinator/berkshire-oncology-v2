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

### Consultant profile overview update — 9 September 2026

The approved profile layout is now shared by all ten consultants. Build,
TypeScript and lint pass. The navigation audit checks 346 destinations, eight
desktop dropdowns, ten mobile links and 103 redirects without issues or browser
errors, including the new named consultant request fragments.

The full axe sweep completed all 310 distinct route/width/motion combinations,
with HTTP 200 responses and no load errors. Consultant profiles and `/contact`
have no automated violations in any configuration. The wider sweep reports the
same 270 colour-contrast instances and 71 distinct route/rule/selector targets as
the earlier 9 September baseline, on the same eight unchanged routes. No new
targets were introduced. The command exits non-zero because those inherited
findings remain. See `a11y/2026-09-09-profile-overview.md` and its JSON.

Browser inspection checked the overview from 320 to 1600px, longer consultant
names and larger expertise lists at desktop and phone widths, direct hospital
fragments, keyboard activation of treatment controls and all ten named contact
destinations. No horizontal overflow or duplicate IDs were found in the checked
profiles. At a 720 × 450 CSS viewport, corresponding to 200% zoom from
1440 × 900, overview content reflows without horizontal overflow or clipped
text. This equivalent reflow check was not a manual browser-zoom session.
Accessibility-tree inspection confirmed named headings, links and fee labels;
unscored reviews do not announce a fabricated rating. Manual VoiceOver and
Safari testing remains outstanding. Scope and reproduction notes are in
`consultant-overview-2026-09-09.md`.

### Consultant contact-panel alignment — 10 September 2026

Codex balanced the existing top/bottom space, centred the review content and
centred each button's icon/label pair. Panel dimensions are unchanged at the
checked 1600, 1440, 768, 375 and 320px widths. Every checked button has a 12px
icon/label gap and a group-centre error below 0.01px. No clipping or horizontal
overflow was found, including at a 720 × 450 CSS viewport representing 200%
zoom from 1440 × 900. This was an equivalent reflow check, not manual zoom.
Keyboard Tab reaches “Call to book” with its existing accessible name and a
visible 2px outline. Build, lint and TypeScript pass. No new manual VoiceOver
or Safari pass was performed for this CSS-only adjustment.

The required `npm run a11y -- --label=profile-panel-alignment --workers=4`
completed all 310 distinct configurations with HTTP 200 responses and no load
errors. All ten consultant profiles have zero automated violations. The wider
site reports 270 contrast instances on eight unchanged routes, covering the same
71 distinct targets as the earlier profile-overview baseline; no new targets
were introduced. The command exits non-zero for these inherited findings.
See `a11y/2026-09-10-profile-panel-alignment.md` and its JSON.

### Consultant breadcrumb removal — 9 September 2026

Removed the breadcrumb and its unused responsive styles from the shared
consultant overview at the user's request. Codex browser inspection confirmed
the breadcrumb is absent and Ruth Davis's profile has no horizontal overflow at
1440, 720 and 320px. The 720 × 450 check represents the equivalent CSS viewport
for 200% zoom from 1440 × 900; no new manual zoom, keyboard or VoiceOver pass was
performed for this deletion.

`npm run a11y -- --label=profile-breadcrumb-removal --workers=4` passed its build,
lint and TypeScript stages, then completed all 310 distinct sweep configurations
with HTTP 200 responses and no load errors. All consultant profiles have zero
automated violations. The full site reports 260 contrast instances across eight
unchanged routes and exits non-zero; all 66 distinct targets were present in the
preceding profile-overview report. Five previous location-page targets were not
reported on this run; that page was not changed, so these are not claimed as
fixes. See `a11y/2026-09-09-profile-breadcrumb-removal.md` and its JSON.

### Simplified consultant profile design — 9 September 2026

Codex implemented the approved three-column overview across all ten profiles.
The portrait extends through the four-link navigation; the middle column contains
identity and cancer expertise, and the sage contact panel contains the request,
call and unscored review status. Fees have a dedicated destination below.

Production build, lint and TypeScript pass. The navigation audit checked eight
dropdowns, ten mobile links, 103 redirects, 59 documents/UI states and 285
destinations with no issues or browser errors. The full accessibility sweep
completed 310 distinct route/width/motion configurations, all HTTP 200, with no
load errors. All ten consultant profiles and `/contact` have zero automated
violations. The wider site reports 264 contrast instances on eight unchanged
routes. All 67 distinct route/rule/selector targets appeared in the earlier
profile-overview baseline. One location target reappeared compared with the
breadcrumb-removal run; that page was not changed. The sweep exits non-zero.
See `a11y/2026-09-09-profile-simplified.md` and its JSON.

Codex browser inspection covered Ruth Davis at 320–1600px and four additional
profiles with longer names or larger expertise lists at 320 and 1440px. No
horizontal overflow, clipped overview headings/links or duplicate IDs were
found. A 720 × 450 CSS viewport, equivalent to 200% zoom from 1440 × 900,
reflowed without clipping; this was not a manual browser-zoom session.
Keyboard Enter activation of all four profile-section links reaches and focuses
the correct destination below the fixed header, with visible control focus.
Accessibility-tree inspection confirms meaningful headings and named links,
including “Call to book”, and no invented review score. Manual VoiceOver and
Safari testing remains outstanding. Further implementation notes are in
`consultant-overview-2026-09-09.md`.


### About-first profile order and Treatments navigation — 10 September 2026

Codex moved About directly below the overview and added Treatments after About
in the shared section navigation. The new link uses the existing treatment
section and is only rendered when that section exists. Its capsule illustration
is decorative; the visible label supplies its accessible name.

Browser inspection confirmed the order overview → about → treatments → locations
→ fees and valid targets for every section link across all ten profiles. The
five-link navigation fits at 320, 375, 700, 768, 1024, 1100, 1280, 1440 and
1600px without clipping or horizontal overflow. At the 720 × 450 CSS viewport
equivalent to 200% zoom, navigation also reflows without clipping. This was an
equivalent reflow check, not a manual zoom session. Keyboard Enter activation
of Treatments at 320px updates the hash and active state, shows control focus
and focuses the treatment section; its heading remains below the fixed header.
About and Treatments were also checked on desktop. No new manual VoiceOver or
Safari pass was performed.

Build, lint and TypeScript pass. The required full sweep completed all 310
distinct route/width/motion configurations with HTTP 200 responses and no load
errors. All ten consultant profiles have zero automated violations. The wider
site still reports 270 contrast instances across the same 71 distinct targets
as the preceding panel-alignment report, with no new targets. The command exits
non-zero for these inherited findings. See
`a11y/2026-09-10-profile-about-first.md` and its JSON.


### Main navigation and CTA styling on WCAG — 10 September 2026

Codex integrated the approved shared navbar and button styles from main at
`5d3fac5` into the current WCAG implementation. The navbar and panels use 20px
corners, and buttons use 15px corners with main’s CTA borders, fills and focus
styles. Current routes, consultant section order and contextual booking links
were preserved.

Build, lint, TypeScript and main’s button-fill source checks pass. The browser
navigation audit passed eight dropdowns, ten mobile links, 103 redirects, 59
documents/UI states and 295 destinations without issues or browser errors.
The full sweep completed 310 distinct configurations with HTTP 200 responses,
no load errors and zero reported violations. The audit-script update pulled
from WCAG now filters colour-contrast findings from default-motion results;
contrast is included only in reduced-motion checks. This coverage differs from
the preceding reports, so the change in totals must not be claimed as proof
that all preceding contrast findings were fixed or that full WCAG conformance
has been established. See `a11y/2026-09-10-main-navigation-styling.md` and its JSON.

Codex inspected the homepage at 320, 375, 720, 768 and 1440px without horizontal
overflow; the 720 × 450 check is the CSS viewport equivalent of 200% zoom, not
a manual browser-zoom session. Search exposes its named combobox and popular
results, uses the matching panel corners and closes with Escape. The hero
primary action shows a 3px white keyboard-focus outline. At 1600px the
consultant portrait and navigation alignment, balanced contact-box padding,
centred reviews and About-first order are preserved. Manual VoiceOver/Safari
testing remains outstanding. Implementation scope is documented in
`main-navigation-styling-2026-09-10.md`.


### Oncologist role in Treatment experience — 10 September 2026

Codex added each consultant’s maintained role to the opening paragraph directly
under “Treatment experience”. The paragraph previously listed treatment
approaches without stating whether the consultant is a medical or clinical
oncologist. It now opens, for example, “Dr Davis is a consultant clinical
oncologist.” The shared component receives the role from `Consultant.role`;
the role is not inferred from treatment lists. Built HTML was checked for all
ten profiles against that source data.

Browser checks covered Dr Davis at 1440 × 900, Dr Eslamian at 320 × 780 and
Dr Bhattacharyya at 720 × 450. The paragraph reflows without horizontal
overflow. The latter viewport is the CSS equivalent of 200% zoom from
1440 × 900; this was not a manual browser-zoom session. Keyboard Enter on
the Treatments section link still focuses the treatment section with its
heading below the fixed header. Accessibility-tree inspection confirms that
the medical oncologist role appears directly after the section heading.
No controls or interaction behaviours were changed. Manual VoiceOver/Safari
testing remains outstanding.

Build, lint and TypeScript pass. The required accessibility sweep completed all
310 configurations with no reported violations; see
`a11y/2026-09-10-treatment-oncologist-role.md` and its JSON. As in the preceding
report, the audit excludes default-motion colour-contrast findings and includes
contrast only for reduced-motion checks. These results do not establish full
WCAG conformance.


### Exclusive Professional work panels — 10 September 2026

Codex grouped the native disclosures in the consultant “Professional work”
section with a shared `details` name. Opening Clinical leadership, Research
and publications, Achievements or Disclosures now closes the previously open
panel. The active panel can also be closed. The initial open state and the
separate About disclosures are preserved.

A production-browser interaction check covered all 36 panels across ten
consultant profiles with JavaScript disabled. It confirmed one open panel
after each selection, the ability to close the active panel and independence
from About. In the in-app browser, mouse selection and keyboard Enter/Space
activation were checked on Dr Davis’s profile at 1440px. At 320px,
Dr Bhattacharyya’s Research and publications panel opens by keyboard, closes
Clinical leadership and keeps the visible focus underline. The accessibility
tree exposes the corresponding expanded/collapsed states and the newly
visible text. There is no horizontal overflow at 320px or at the 720 × 450 CSS
viewport equivalent to 200% zoom. This was not a manual browser-zoom session.
Manual VoiceOver/Safari testing remains outstanding.

Build, lint and TypeScript pass. The required full accessibility sweep completed
310 configurations with zero reported violations; see
`a11y/2026-09-10-professional-work-accordion.md` and its JSON. The existing audit
method includes colour-contrast findings only in reduced-motion results;
default-motion contrast is excluded. This is automated evidence within that
scope, not proof of full WCAG conformance.


### Consultant overview viewport fit — 10 September 2026

Codex made the three-column consultant overview respond to available screen
height as well as width. Previously, width-based typography and spacing,
the portrait’s 36rem minimum height and the contact panel’s top margin could
push the section navigation below the first viewport. Desktop spacing and
type now have height-aware limits. The photo, identity and contact panel
share a top edge; identity and contact share a bottom edge, and the portrait
ends level with the navigation. The contact content retains equal space
above and below, and reviews and button contents stay centred.

The layout uses a viewport-based minimum height, not a fixed height or hidden
overflow. At narrow widths, very short heights or enlarged text, content can
grow and scroll. Text remains at least 1rem in the desktop body and controls.
The short-window refinement reduces gaps when the viewport is at most 700px
high rather than clipping the longer expertise lists.

Geometry checks covered every consultant at 18 sizes: 180 configurations.
All 120 desktop configurations fit within one viewport, with matching column
edges, no header overlap and no horizontal overflow. Those desktop sizes are
1100 × 650, 1100 × 700, 1280 × 650, 1280 × 720, 1366 × 768, 1440 × 650,
1440 × 900, 1483 × 1009, 1536 × 864, 1920 × 1080, 2560 × 900 and 2560 × 1440.
The additional checks at 320 × 780, 375 × 812, 720 × 450, 768 × 1024,
1024 × 768 and 1100 × 600 allow vertical growth and found no horizontal
overflow or clipped content. Measurements are recorded in
`a11y/2026-09-10-profile-overview-geometry.json`.

In-app visual checks included Dr Bhattacharyya at 1440 × 900 and 1366 × 768,
Dr Dallas at 1100 × 700 and Dr Hill at 1440 × 650. Keyboard Enter on Treatments
still focuses the correct section with its heading below the fixed header.
At 320px the accessibility tree exposes the consultant, all expertise links,
both booking controls, review status and every section link. A separate
1440 × 900 check with 200% root text size and then the WCAG text-spacing
overrides confirmed that the overview grows without horizontal overflow.
The 720 × 450 geometry check is the CSS viewport equivalent of 200% browser
zoom, not a manual browser-zoom session. Manual VoiceOver/Safari testing
remains outstanding.

Build, lint and TypeScript pass. The full 310-configuration sweep reports zero
violations (`a11y/2026-09-10-profile-viewport-fit.md`). After the short-window
spacing refinement, the final build also passed all 100 consultant
configurations (`a11y/2026-09-10-profile-viewport-fit-final.md`). The standard
sweep includes contrast findings only for reduced-motion checks.

An additional 60 checks covered every final consultant overview at 1100, 1280
and 1440px wide × 650px high in both motion settings. These checks include
colour contrast in both modes and await the finite opening text animations
before measuring. All passed; results are in
`a11y/2026-09-10-profile-short-height-a11y.json`. This is scoped automated
evidence, not a claim of full WCAG conformance.


### Patient and peer review section — 10 September 2026

Codex added a bottom-of-profile Reviews section with separate patient and peer
views, a sage patient-rating summary and the practice’s Call to book link.
The overview’s two review links now target this section, which has the only
`reviews` ID. The compact overview summary uses `review-summary` and retains
its existing layout. Review data is currently empty; there are no invented
quotes, scores, counts or provider endorsements.

The segmented selector uses native grouped radio inputs with visible focus
styling. Native arrow keys select the other review type, and Tab leaves the
group for the telephone link. No custom key interception is added. Both panels
remain in the DOM and the inactive one is hidden. A persistent polite status
region announces the selected view’s published count or empty state. Decorative
stars and unscored placeholders are hidden from the accessibility tree.

A production-browser check covered both views for all ten consultants at
1440 × 900, 720 × 450 and 320 × 780, with default and reduced motion: 120 scoped
accessibility checks, all passing, including colour contrast in both modes.
The same checks verify native keyboard switching, focus visibility, the
telephone destination, one visible review panel, the correct page order,
unique section IDs and both overview links. The 1440px overview still fits one
viewport. There was no horizontal overflow at any checked size, and panel and
button corners match the site tokens. Results are in
`a11y/2026-09-10-consultant-review-interactions.json`.

In-app checks on Dr Bhattacharyya’s profile confirmed the desktop and stacked
mobile layout, native keyboard selection, and that Enter on Reviews focuses
the new section below the fixed header. The accessibility tree exposes both
named options, the selected state, the active panel’s text and the named call
link without a fictitious rating. The 720 × 450 check is a CSS viewport
equivalent to 200% zoom, not a manual browser-zoom session. Manual VoiceOver and
Safari testing remains outstanding. Provider integration and actual review
content are outside these empty-state checks; see
`consultant-reviews-2026-09-10.md`.

Build, lint and TypeScript pass. The required full-site sweep completed 310
configurations with zero reported violations; see
`a11y/2026-09-10-consultant-patient-peer-reviews.md` and its JSON. The standard
sweep filters default-motion colour-contrast findings; the additional scoped
review checks include contrast in both motion settings. These automated
results do not establish full WCAG conformance.

### Review selectors lead the section — 10 September 2026

Codex removed the visible Reviews heading and its following layout margin so
Patient reviews and Peer reviews begin the section. A screen-reader-only h2,
Patient and peer reviews, preserves the section's accessible name and heading
hierarchy. The existing reviews anchor and native radio selector remain intact.

In-app checks on Dr Bhattacharyya's profile covered 1440 × 900, 320 × 780 and
720 × 450. The selector clears the fixed header, with no horizontal overflow.
Keyboard Enter on the profile's Reviews link focuses the section; native arrow
keys switch the selected review type and Tab reaches Call to book. The
accessibility tree exposes the h2, group name, selected option and active panel.
The 720 × 450 check is a CSS viewport equivalent of 200% zoom, not manual browser
zoom. Manual VoiceOver/Safari testing remains outstanding.

Build, lint and TypeScript pass. The full required sweep completed all 310
configurations with zero reported violations; see
`a11y/2026-09-10-consultant-reviews-heading.md` and its JSON. As above, the
standard sweep filters default-motion colour-contrast findings. This is scoped
automated evidence, not a full WCAG conformance assessment.
