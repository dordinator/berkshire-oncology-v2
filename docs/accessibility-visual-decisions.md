# Accessibility: decisions that change how the site looks

Everything in this file needs a ruling before it is built. Nothing here has been
changed. The invisible remediation is done and is recorded separately in
`docs/accessibility-audit-2026-09.md`.

Each item states the failure, the criterion, what was measured, the options and a
recommendation. Screenshots are in `docs/a11y/screens/`.

One fact worth carrying through all of it: **`/locations` and the carousels are
already switched off for visitors with Reduce Motion enabled.** The wheel and key
handlers never install, and the carousel interval never starts. That does not
make them conformant — SC 2.1.1 and 2.2.2 have to hold in the default
configuration — but it does mean the fixed version of each already ships and
demonstrably works. These are smaller changes than they look.

---

## 1. The focus indicator

**SC 2.4.7 Focus Visible (AA). Confirmed failure.**

`globals.css:151` sets `:focus-visible { outline: none }` for the whole site.
Commit `d06184d` records that this was done by request and calls the replacement
"weaker than a ring and a deliberate trade". Two CSS fallbacks remain — an
underline on `<a>` and on `<summary>` — and `rounded-full` links are explicitly
excluded from even that.

Measured:

- **23 live buttons have no focus indicator of any kind.** They include the
  numbered rail on `/consultants`, which is the only keyboard route into the
  portrait wall; the mobile drawer's search button; and seven controls on
  `/specialities`. Evidence: `docs/a11y/screens/01-focus-consultants-rail.png` —
  the control is focused in that image.
- Four of the six `Button` pill variants change only by a background wash. The
  difference between resting and focused, measured:

  | variant | change on focus |
  |---|---|
  | `ghost` | 1.10:1 |
  | `light` | 1.12:1 |
  | `onPhotoGhost` | 1.31:1 |
  | `sage` | 1.39:1 |

  `primary` and `onPhoto` also get a 2px border, which is a genuine indicator.
  The other four are, in practice, invisible.

**Options**

1. **A designed global ring.** One indicator, defined once — for example a 2px
   ink or accent ring with a 2px offset, keyboard-only via `:focus-visible`, so a
   mouse user never sees it. Conformant by construction and it survives new
   components. This is what an assessor expects to find.
2. **Complete the per-component approach.** Keep no global ring and add a
   `focus-visible:` style to each of the 23 buttons plus the four weak variants.
   Nothing that currently works changes appearance. Fragile: the next component
   silently fails, and it is much harder to evidence.
3. **A global ring as a backstop only.** Every existing bespoke focus style is
   kept exactly as designed; the global ring applies only where nothing else is
   defined. Nothing you have already styled changes; the gaps get covered.

**Recommendation: 3, then 1 if you like how it looks.** The backstop closes the
failure without touching a single control you have already designed, and it makes
the claim defensible. The original objection in `d06184d` was to the *browser
default* ring — painted in the visitor's OS accent colour, so blue on one machine
and amber on another. A defined ring does not have that problem.

> **DECIDED — 5 September 2026: no ring. Use the site's own idioms.**
>
> - Text controls underline on focus. One rule in `globals.css`, matching the
>   rule already there for links and `<summary>`, and excluding pills on the
>   same grounds.
> - Pills get a 2px line drawn just inside their own edge —
>   `box-shadow: inset 0 0 0 2px currentColor`. Inset so nothing changes size and
>   no ring appears outside the control; `currentColor` so it works on every
>   variant without a list, and inherits the label's contrast against the pill,
>   which clears SC 1.4.11 by construction.
> - The `light` pill inverts to ink and white, chosen deliberately over a border.
> - Two controls needed their own treatment: the header logo, whose wordmark sits
>   in an `inline-flex` span that text-decoration cannot cross, and the home page
>   cancer cards, where an inset shadow paints beneath the photograph and an
>   outside ring is clipped by `overflow-hidden`.
>
> **The scale was larger than the static scan suggested.** Reading the source
> found 23 `<button>` elements with no focus utility. Photographing every control
> found **58** — the difference being hand-rolled `rounded-full` links, which are
> not buttons and so were never in the earlier count. `scripts/a11y-focus-check.mjs`
> now does that photographically: it focuses each control with a real Tab press,
> compares the pixels before and after, and fails on any control that does not
> change.
>
> **Verified: 741 controls across 12 routes, zero without a visible focus
> indicator.**

---

## 2. `/locations` — captured arrow, page and space keys

**SC 2.1.1 Keyboard (A). Confirmed failure.**

`LocationsJourney.tsx:488-499` calls `preventDefault()` on `ArrowUp`, `ArrowDown`,
`PageUp`, `PageDown` and `Space` at the window, remapping each to a whole-viewport
jump. Across a 700svh page, a keyboard user cannot scroll by a line. The handler
bails when focus is on a form field, button or link, which has the perverse effect
that arrow keys stop working entirely once you tab onto a link in the panel.

Verified in the source, and verified switched off under Reduce Motion — the whole
effect early-returns at `LocationsJourney.tsx:384` when Lenis is absent.

**Options**

1. **Release the keys, keep the wheel stepper.** Arrow, Page and Space scroll the
   page natively as they do everywhere else. The mouse-wheel journey is untouched,
   so the page still feels the same to the visitors it was designed for.
2. Keep the capture but add a documented alternative route.
3. Remove the stepper for everyone.

**Recommendation: 1.** The browser owns those keys. Reduce Motion users already
get exactly this behaviour and the page works.

> **DECIDED — 5 September 2026: release the keys, and narrow the crossfade gap.**
> The `keydown` handler and its listener are removed from
> `LocationsJourney.tsx`; the wheel stepper is untouched. `FADE` went from 0.45
> to 0.49 to shrink the window in which neither panel is painted — it cannot go
> to 0.5 or above without two panels drawing over each other.
>
> Verified after the change: ArrowDown scrolls 40px, Space pages 830px — the
> same as `/patients` — and one wheel gesture still travels a full 900px lock,
> so mouse users see no difference at all. The fully blank window between two
> stops measures 18px, down from about 90px; the window where the text is too
> faint to read measures 60px, down from about 130px.

---

## 3. `/locations` — mandatory snap

**SC 2.1.1 and 1.4.10. Confirmed.**

`LocationsJourney.tsx:341` configures Lenis Snap with `type: "mandatory"`. A touch
user or anyone dragging the scrollbar cannot come to rest between stops. This is
also the mechanism most likely to fight a screen reader's virtual cursor, which
scrolls the page as it moves.

**Options: `proximity` instead of `mandatory`, or remove snapping.**

**Recommendation: `proximity`.** It keeps the settled, composed feel when a
gesture ends near a stop, and stops fighting anyone who wants to rest elsewhere.

---

## 4. `/locations` — the jump list disappears below 1024px

**SC 2.1.1. Confirmed.**

`LocationsJourney.tsx:138` wraps the six-location shortcut list in
`hidden … lg:block`. Below 1024px it is not rendered at all, and it only ever
appears on the first panel, so it is gone once you have scrolled past it.

Compare `docs/a11y/screens/03-locations-desktop-1440.png` — the list is there
under "Jump directly to a location" — with `03-locations-phone-375.png`, where it
is absent.

**Options**

1. **Show it at every width.** It becomes a visible list of six links on phones,
   where today there is none.
2. Keep it desktop-only and add a different mobile affordance.

**Recommendation: 1.** This is the only item on the list that *adds* something
visible to a layout you have signed off, which is why it needs your eye. It is
also the single change that most improves the page for a phone user, and roughly
nine in ten of your visitors are on a phone.

> **DECIDED — 5 September 2026: leave it desktop-only. No change.**
>
> Once items 2 and 3 were fixed this stopped being a failure. Arrow, Page and
> Space now scroll the page natively and snapping is no longer mandatory, so
> every location is reachable by ordinary scrolling on a phone, by keyboard and
> by touch. Each hospital is also listed elsewhere on the site. SC 2.4.5
> Multiple Ways concerns finding pages, not sections within one, so no criterion
> applies. Recorded here as a considered decision, not as a known issue.
>
> Both alternatives were built and measured at 375px before deciding: the full
> desktop block added 256px to the hero panel, a single scrolling row added 92px.
>
> **Noted while measuring, not acted on:** the hero panel on a phone already
> holds 581px of content in a 455px box, so a phone user is scrolling inside it
> today to reach the end of the intro copy. Not a conformance issue — the panel
> is a native scroll container and the content is reachable — but worth knowing
> if that hero is ever revisited.

---

## 5. `/locations` — the six locations exist only inside the journey

**Content availability. Judgement, not a clear-cut failure.**

Hidden panels are `visibility: hidden`, which correctly removes their links from
the tab order and the accessibility tree. The consequence is that the six
hospital descriptions, addresses and links cannot be browsed ahead of — a screen
reader reaches them only by scrolling the journey one lock at a time.

**Options**

1. **Add a conventional list below the journey.** All six locations with address
   and link, always present. This is what `/treatments` already does — it has a
   real `.treatment-static-overview` fallback, not a degraded one.
2. Leave it. Items 2–4 make the journey properly operable, which may be enough.

**Recommendation: 1 if you want the page to be unarguable, 2 if you would rather
not add a section.** With 2–4 fixed this is defensible either way; I would not
call it a failure on its own.

> **DECIDED — 5 September 2026: leave it. No change.**
>
> Not a failure. Every location is reachable in a logical order by ordinary
> scrolling, which now works by keyboard, touch and mouse. `visibility: hidden`
> is the correct technique for the inactive panels: it keeps their links out of
> the tab order rather than leaving invisible targets for a keyboard user to land
> on. No criterion requires content to be browsable ahead of its position in a
> scroll sequence, and every hospital is named and linked elsewhere on the site.
>
> Adding a static list below the journey would be a genuine improvement for
> anyone comparing locations rather than travelling through them. That is a
> design decision, not a compliance one, and is recorded here as such.

---

## 6. The two auto-rotating carousels

**SC 2.2.2 Pause, Stop, Hide (A). Confirmed failure.**

`ConsultantLocationsJourney.tsx:73` and `CancerTypesPrototype.tsx:765` advance
every 5,200ms while at least 35% of the section is on screen, ping-ponging
through the locations. They rotate real information — hospital names, addresses,
descriptions. There is no pause control anywhere on the site.

Clicking a location does not stop it. `chooseLocation()` increments
`rotationCycle`, which re-runs the effect and **restarts** the timer.

Frames six seconds apart: `docs/a11y/screens/04-carousel-frame-{1,2,3}.png`.

**Options**

1. **Stop permanently on first interaction, and add a visible pause control.**
   The animation still plays on arrival; any click or keyboard focus ends it for
   that visit.
2. **Remove auto-rotation.** The location tabs become ordinary controls.
3. Add a pause button and change nothing else.

**Recommendation: 2, with 1 as the fallback if you want to keep the movement.**
Nobody reading a hospital address wants it to change under them, and this is the
cheapest item on the list to make unarguable. Option 3 satisfies the letter of
the criterion but still interrupts a reader who has not found the button.

> **DECIDED — 5 September 2026: option 2, remove auto-rotation.** Implemented in
> `ConsultantLocationsJourney.tsx` and `CancerTypesPrototype.tsx`: the 5.2s
> interval, the visibility observer that armed it and the `rotationCycle` restart
> are gone, and `chooseLocation` now just sets the active location. The locations
> are driven only by the reader. No visual change at rest; the accordion, the map
> and the layout are untouched.

---

## 7. Colour contrast

**SC 1.4.3 (AA). Confirmed — 213 elements, 28 routes, three colour problems.**

axe reported 2,344 elements. That number was not usable. axe derives contrast
from the DOM and resolves the wrong backdrop when content is layered, so every
flagged element was re-measured from a screenshot of itself, at every width it
was flagged at, with the background taken from the rendered pixels and the text
colour from CSS, and with each element proven to be at full opacity first. That
reduced 2,344 to 213 real failures, which in turn came down to three colour
pairings:

| Rendered | Ratio | Elements |
|---|---|---|
| `ink-muted` `#5a6884` on `sage-panel` `#cbd3ce` | 3.67:1 | 93 |
| `ink-muted` on `sage-mist` `#e2e7e4` | 4.48:1 | 76 |
| `sage` `#5c7767` on `sage-wash` `#eff1f0` | 4.32:1 | 30 |
| `ink-muted` with opacity modifiers, three variants | 3.07–4.35:1 | 13 |
| `gold` `#c8992f` on `paper-soft` at 12px | 2.45:1 | 1 |

> **DECIDED — 5 September 2026: darken the text, leave every background alone.**
>
> - `ink.muted` `#5a6884` → `#4d5870` in `tailwind.config.ts`. The smallest
>   darkening that clears every ground the palette uses: 4.65:1 on the worst
>   panel, 5.7–6.9:1 elsewhere. Safe to change globally because `bg-ink-muted`
>   is only ever a decorative hairline.
> - New `sage.ink` `#587263` token for sage *text*, and the nine `text-sage`
>   usages switched to it. `sage.DEFAULT` is untouched, because it seeds every
>   sage background through `color-mix` — darkening it would have changed the
>   panels, which was explicitly not wanted.
> - The one 12px gold label on `/consultants` now uses the palette's existing
>   `gold-ink` `#8a6516` (4.99:1).
> - Follow-ups from the same decision: `text-ink/60` → `/70` on the
>   `/specialities` location tabs, and the `/75` opacity dropped from two image
>   credits on treatment pages — both were opacity modifiers pulling the newly
>   darkened colour back under the threshold.
>
> Verified: re-swept `/consultants`, `/consultants/joss-adams`,
> `/treatments/chemotherapy`, `/patients`, `/tariffs` and `/specialities` at five
> widths in both motion settings, then pixel-verified every remaining axe finding
> — **zero confirmed contrast failures**.

---

## 9. The hero panel scrolls, but not by keyboard

**SC 2.1.1 Keyboard (A). Confirmed failure. Not in the original audit — found
while measuring the panel overflow for item 4.**

The `/locations` panels are their own scroll containers. Below about 768px the
first one holds more than it can show, and the container was not focusable:

| Width | Content | Visible | Unreachable |
|---|---|---|---|
| 320px | 684px | 455px | 229px |
| 375px | 581px | 455px | 126px |

At those widths the panel contains no visible focusable element — the jump-list
links inside it are `display:none` below 1024px — so there was nothing to tab to
and no way to scroll it. The end of the intro copy and the "Scroll to explore
each location" cue could not be reached by keyboard at all. This is what axe
reported as `scrollable-region-focusable` in the baseline, which had been set
aside as minor until it was measured.

Only the hero panel is affected. The six location panels are exactly 455/455px
and each contains a link.

> **DECIDED — 5 September 2026: focusable when it overflows.**
>
> A `ResizeObserver` tracks which panels hold more than they can show, and only
> those take `tabIndex={0}`, so no dead tab stop appears on a panel that fits.
> The focus indicator is the same inset line the pills use. No role and no
> `aria-label`: the panel is a scroll container rather than a widget, and naming
> it would have meant inventing a name.
>
> Verified by keyboard at three widths — the panel is reached by Tab and the
> arrow keys scroll it the full hidden distance: 229px at 320px, 126px at 375px,
> 29px at 1440px.

## 10. Links in legal body text are blue and nothing else

**SC 1.4.1 Use of Color (A). Confirmed failure. Missed in the first pass —
`link-in-text-block` was in the baseline summary from the start and was not read
past the first row.**

`globals.css` styled legal-page links as `text-accent underline-offset-2
hover:underline`. The underline appeared **only on hover**, so at rest a link
inside a paragraph was marked by colour alone — no use to anyone who cannot
distinguish the two colours, and no use at all on a touchscreen.

Colour alone is permitted only where the link contrasts at least 3:1 with the
surrounding text and carries a non-colour cue on hover *and* focus. Measured:
**1.07:1** between `#1a4d8f` and `#37496a`.

Six links across `/accessibility`, `/privacy` and `/website-privacy`. One of the
affected pages is the accessibility statement itself.

> **DECIDED — 5 September 2026: underline at rest.**
>
> `hover:underline` became `underline` in the `.legal-prose a` rule. Affects the
> five legal pages only; links elsewhere on the site sit in headings, cards and
> buttons rather than inside prose, and are unaffected.

## 11. Touch targets under 24px

**SC 2.5.8 Target Size (Minimum), AA. Confirmed — 8 controls.**

Eight controls measure 19–21px tall against a 24px minimum, each with a
neighbour inside its 24px exclusion zone. They are width-dependent: some fail
only on a phone, some only on a desktop.

| Control | Height | Fails at | Route |
|---|---|---|---|
| Two jump-list links | 19px | 1024px | `/locations` |
| Five "Visit …" links | 20px | 320–1440px | `/links`, `/resources` |
| Practice email link | 21px | 1440px | `/tariffs` |

**This was reported clean twice before it was found.** The first measurement ran
at 375px only, so anything failing at another width was invisible. The second had
an over-broad rule excluding any neighbour whose box overlapped the target — added
to ignore stacked panels, it also excluded two genuinely adjacent controls that
merely graze each other, which is exactly the crowding the criterion describes.
Both are corrected in `scripts/a11y-manual-checks.mjs`: it now measures at five
widths and excludes only near-total overlaps.

> **DECIDED — 5 September 2026: grow the hit area with padding.**
>
> The `/tariffs` email link uses `inline-block py-2.5 -my-2.5`, the idiom already
> used by the two phone links directly above it: the padding grows the target and
> the negative margin cancels its effect on layout, so nothing moves.
>
> The `/locations` jump list takes real padding rather than a cancelled one. Its
> binding constraint is the 24px *spacing* between two stacked links, not their
> height, and a negative margin would put them straight back where they were.

## 12. Text discarded at 200% zoom

**SC 1.4.4 Resize Text, AA. Confirmed failure. Found only because the zoom check
was added late in the work — no earlier pass looked for it.**

On `/specialities`, the hospital description in the map card carried
`line-clamp-2`. A clamp discards whatever does not fit in two lines, and at 200%
zoom nothing fits — 45px of text vanished with no scrollbar and no way to reach
it.

> **DECIDED — 5 September 2026: remove the clamp and let the card grow.**
>
> The card is anchored to the bottom of the map and grows upward, so it has the
> room. Nothing changes at 100%, where the text already fits.

**Still open.** Six other `line-clamp` and `truncate` rules exist in the
codebase. The zoom check that found this one compared heights only, so it was
blind to horizontal truncation; it now measures both axes but has not yet been
run across every route. Until it has, whether any of those six lose content at
200% is unknown, and this criterion is not fully evidenced.

## 13. Entrance animations start text at 45% opacity

**Not a failure. No change.**

`PageMotion.tsx:218` and `:267` start elements at 45% and 30% opacity and animate
them to full as they scroll into view. Anything below the fold is therefore faded
at the moment a page loads, and axe measures that state: **234 contrast errors
across `/patients` and `/tariffs`**, 85% of everything the tool still reports on
the site.

Pixel verification confirms none of it is real. No visitor reads text at 45% —
the animation plays as the element arrives, and the settled state measures
6.88:1.

> **DECIDED — 6 September 2026: leave it. No change.**
>
> Consistent with items 6 and 8: it is not a criterion failure, so it does not get
> changed. The 0.45 was raised to 0.9 briefly and then reverted.
>
> **A correction belongs here.** The recommendation to change it rested partly on
> the claim that a JavaScript failure would leave text stranded at 45%, making it
> a genuine failure. **That claim was wrong.** No stylesheet touches `data-fx`
> elements; the opacity is applied only by `gsap.fromTo()` at runtime, GSAP is
> dynamically imported, and `PageMotion` is client-only. If the script does not
> run, no opacity is ever set and the text renders fully. The faded state cannot
> outlive the script that creates it, so there is no robustness argument — only
> the cosmetic one about what a tool reports before anyone investigates.
>
> The consequence to accept: an assessor running axe against `/patients` sees 152
> errors and `/tariffs` 82. `docs/accessibility-audit-2026-09.md` records the
> mechanism and the pixel measurements that clear them.

## Considered and dismissed

Three items did not survive checking, and are recorded here so the reasoning is
not lost.

**Target size (SC 2.5.8) passes — no failures.** The raw measurement flagged
1,367 instances. Applying the criterion's own exceptions takes that to zero: a
target inside a sentence is exempt, and so is one whose 24px circle reaches no
other target. The last few apparent failures were targets whose boxes *overlap* —
a collapsed panel or a crossfaded slide stacked on its neighbour, not two
controls a finger has to choose between. Nothing to fix.

**Reflow (SC 1.4.10) passes.** No page scrolls horizontally at 320px, including
`/locations` and `/treatments`. Worth recording, because a 700svh pinned stage is
exactly where reflow usually breaks.

**The mega-menu opening on focus is not a failure.** The concern was that tabbing
across the bar walks a keyboard user through every link in the site before they
reach the page. Measured on `/consultants` at 1440px: **21 tab presses from the
skip link to the first control in `<main>`.** The panels are conditionally
rendered, so their links are not in the DOM until a panel opens. With the skip
link present, SC 2.4.1 is satisfied.

**Scroll position opening the treatment accordion** (`CancerTypesPrototype.tsx:510`)
changes content without an explicit user action, which is uncomfortable, but it is
gated behind 1024px and no-reduced-motion, it has a keyboard equivalent with a
1,400ms manual override, and scrolling is a user action. Usability concern, not a
criterion failure. Not proposed for change.

---

## Evidence

Screenshots in `docs/a11y/screens/`. Each was taken against a real build at the
width stated, and the focused ones use a genuine `Tab` press — `:focus-visible`
does not apply to programmatic focus, so a scripted `.focus()` would photograph a
state no visitor ever sees.

| File | Shows |
|---|---|
| `01-focus-consultants-rail.png` | The `/consultants` numbered rail with keyboard focus on it, before the fix. Nothing visible. |
| `02-focus-home-pill.png` | A pill that did show focus, for comparison. |
| `ring-a-current.png` … `ring-d-dual.png` | Four focus treatments rendered on the same control: none, ink ring, accent ring, dual ring. Rendered by injecting CSS at runtime; no source changed. |
| `11-focus-rail.png`, `11-focus-logo.png`, `11-focus-pill.png`, `11-focus-card.png` | The four control types after the fix — underline, wordmark underline, inset pill line, card outline. |
| `08-carousel-1.png` … `08-carousel-3.png` | The consultant locations section at 0, 5.4 and 10.8 seconds, untouched. Three different hospitals. |
| `03-locations-desktop-1440.png`, `03-locations-phone-375.png` | The jump list present at 1440 and absent at 375. |
| `05-snap-mid-250ms.png`, `09-rest-midpoint.png` | `/locations` resting between two stops — the blank column that mandatory snapping and the key capture existed to prevent. |
| `10-contrast-before.png`, `10-contrast-after.png` | A consultant profile before and after the two palette values were darkened. |
| `12-jump-*.png`, `13-panel-*.png`, `14-foot-*.png` | The two mobile jump-list options built and measured at 375px before the decision to leave it alone. |
| `15-legal-before.png`, `15-legal-after.png` | The ICO link on `/privacy`, colour-only and then underlined. |
| `06-patients-element.png`, `00-probe-consultant-lede.png` | Individual elements captured while establishing that axe had resolved the wrong backdrop. |

`docs/a11y/*.md` holds the dated machine reports; the matching `.json` files are
the raw results, kept so any figure quoted here can be traced back.
