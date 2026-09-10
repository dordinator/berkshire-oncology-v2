# Accessibility/design merge — 9 September 2026

## Scope and provenance

Merge the existing design branch (`main`, `00c4ccc`) with `origin/WCAG`
(`a36a5bd`), whose common base is `5c0f12d`. Neither lineage alone contained
both sets of work. No deployment or push is part of this task.

The target remains WCAG 2.2 AA, **not a certification or full-conformance claim**.
Older reports describe earlier source revisions, not this merged build.

## Reconciliation

- Retained 15px button and 20px panel/navbar corners.
- Retained the current shared button wipe and the hero's single masked paint
  surface/white complementary wipe, rather than reinstating the old scale fill.
- Preserved the new cancer directory and refined testimonial layout, their
  transitions, content warnings and currently approved timers.
- Kept incoming navigation, mobile focus handling, decorative-icon semantics,
  live-region, contrast and reduced-motion improvements.
- Adapted global focus rules to the current `.site-button` and `.ink-cta`
  classes. Their inset indicator is allowed to yield to more-specific hero
  and chapter focus styles; the old light-button inversion is not restored.
- No corner/spacing/comparison controls restored. No CTA wording or
  appointment, referral, consultant or contact destination changes made.
- Corrected `/accessibility` to disclose incomplete assessment rather than
  repeating the incoming branch's unsupported full-conformance claim.
- Hardened the automated sweep: execution errors and bad HTTP statuses fail
  the run, incomplete coverage is not described as clean, and optional bounded
  workers use isolated contexts with deterministic report ordering.

## Coordinated concurrent work

The task **Run Berkshire Oncology locally (2)** had separately approved,
partially implemented 2px CTA borders. Its owner paused and authorised
preservation/inclusion of the changes in `globals.css`, `Button.tsx`,
`HomeHero.module.css`, `FeesHero.tsx` and the new `FeesHero.module.css`.
Hero border test expectations now reflect that approval (navy on filled states).
The remaining bespoke-button rollout and its aesthetic verification belong to
that task and are **not represented as finished by this merge**. Nothing is pushed.

## Verification

- `npm run lint`: pass, no warnings/errors.
- Production build with `NEXT_DIST_DIR=.next-wcag-audit`: pass, including type checking.
- `test-button-fills.cjs`, `test-corner-tokens.cjs`,
  `test-cancer-directory.cjs`, `test-testimonial-preview.cjs`: pass.
- `git diff --check`: pass; all source conflict markers removed.
- Full automated sweep: **550 unique route × width × motion checks**, no missing
  or duplicate checks and no execution errors. 540 responses were HTTP 200;
  10 were the intentional HTTP 307 `/contact-concept` redirect to `/contact`.
  [Raw JSON](./a11y/2026-09-09-merged-design.json) and
  [readable report](./a11y/2026-09-09-merged-design.md).
- The sweep exits **1**, with 270 `color-contrast` instances and no other
  violation rules. It is not a clean automated pass.

### Contrast triage

| Category | Prior WCAG report | Merged report |
| --- | ---: | ---: |
| Patients, default motion | 152 | 152 |
| Tariffs, default motion | 82 | 82 |
| Locations, default motion | 23 | 16 |
| Partnership sub-wordmark | 0 | 20 |

The patient/tariff instances match the prior findings by width, motion, HTML
and reported ratio. Locations retains the same eleven target identities, with
seven narrow-width instances absent. These 250 are recurring candidates for
the documented offscreen/animation sampling issue, not newly cleared passes.

The 20 additional instances concern only the “Partnership” suffix in the
typographic brand lockup on five legal pages at 768/1024px, in both motion modes.
The 3.69:1 ratio matches the earlier documented logo finding. Source inspection
confirms this is the brand lockup, so the
[SC 1.4.3 logotype exception](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
applies; it is not a general exception for other brand-coloured text.

No homepage violation or other new violation rule was reported. The raw report
also retains **16,181 indeterminate contrast node-instances across all 550
checks**; these are neither confirmed failures nor passes. Full contrast
conformance is not established by the explicit-violation triage above.

Representative visible-state check: the first patient guidance panel at 1280px
settled to opacity 1, with `rgb(6,28,70)` heading/link text on
`color(srgb 0.884941 0.904 0.892706)`, giving 13.24:1. Its 75%-opaque body text
composites to 6.61:1. This supports the documented sampling explanation for that
panel; it does **not** clear every remaining flagged state. Screenshot:
`screens/merge-2026-09-09/patient-panel-visible.png` within `docs/a11y/`.

After the full sweep, only the accessibility statement's test-date/results
sentence and non-rendering whitespace/documentation were refined. The final
production build passed again, and the updated public statement was verified
in the local browser. The full sweep was not rerun after that wording-only change.

Manual browser checks are performed by the Codex agent in the in-app browser,
not by a screen-reader user. Screenshots live in `docs/a11y/screens/merge-2026-09-09/`.
They cover sampled interactions, not every state of every page.

Observed checks: hero primary/phone keyboard focus and 15px computed radius;
Tab into the next section; testimonial Next button activation; mobile menu
keyboard opening, Escape dismissal and focus return; mobile cancer directory
focus and breast-type link destination; cancer combobox ArrowDown/Enter selection
of lung with updated consultant results. Homepage and cancer-finder checks at
375px and 1280px showed no horizontal page overflow.
The consultant appointment CTA was also checked at 1280px: white label and
white 2px inset focus indicator over the sage face, 15px corners. Site-wide
search opens by keyboard, announces the result count, shows the gold-ink input
indicator, and Escape returns focus to the search trigger. These are DOM/visual
observations, not a claim that announcements were tested with VoiceOver.

## Outstanding limitations / release gate

1. The homepage cancer link auto-updates every five seconds and quotations
   advance every seven seconds. Hover, focus, hidden-page and reduced-motion
   pauses are retained, but there is no persistent user stop mechanism. The
   user previously removed pause controls, so a choice between an explicit
   pause/play control and manual-only changes has been requested, not silently
   imposed. This remains a known SC 2.2.2 issue until that choice is implemented.
   [W3C explanation](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).
2. The complete keyboard, actual browser/text zoom, cross-browser and
   assistive-technology journeys still need completion. Existing scripts that
   approximate zoom with viewport/DPR or sample a few headings do not establish
   those checks. No Safari/VoiceOver pass is claimed here.
3. Any new automated contrast findings require triage for each affected state;
   older pixel adjudications do not automatically clear the merged version.
4. The separate CTA/regulatory-content proposal remains pending approval.
   Placeholder quotations and the intentionally disabled contact form are not
   made production-ready by an accessibility merge.
5. A pre-existing layout issue was observed at 1280px on
   `/specialities?type=lung#specialists`: the single consultant biography becomes
   a very narrow column beside the fixed cancer-focus track. The same grid is
   present in both parent branches. This was flagged to the separate design
   task; no additional layout redesign is included here.

[W3C on evaluation tools](https://www.w3.org/WAI/test-evaluate/tools/selecting/)
explains why automated checks cannot establish accessibility on their own.
