# Consultant profile overview — 9 September 2026

The approved D4 concept replaces the shared consultant profile opening with three columns: portrait and review status; identity, credentials and cancer expertise; and a sage appointment panel with the request action first, side-by-side consultation fees and verified hospital locations. The shared navigation and brand remain in place.

The layout is used by all ten consultant profiles. It reflows to two columns at tablet widths and a compact portrait beside the consultant's name on phones. Text and lists grow naturally for longer names or additional cancer specialisms; nothing is truncated to force a fixed viewport height.

The breadcrumb above the overview was subsequently removed at the user's request. The portrait, profile and appointment panel now start directly beneath the main navigation.

## Content and connections

- Hero summaries shorten the existing maintained biographies. Ruth Davis uses the approved wording about breast cancer and adult brain and spinal tumours. No new treatment, hospital, price or review claims are introduced.
- Qualifications and GMC registration now sit beneath the role. Medical-school details and the year of appointment in Reading remain available in About.
- Cancer expertise is visible immediately. Each cancer links into its selected information on the current cancer-types hub, rather than back to the consultant listing.
- A hospital link opens and focuses that hospital's existing accordion and map. Direct fragments and Back/Forward also restore the relevant hospital. The same declared hospital order is used in the overview and map section.
- Appointment links retain the consultant's validated slug in a URL fragment. The contact page shows the selected consultant and a return link. Existing query cleanup remains in place.
- The contact page remains a prototype: its external booking integration is not connected by this change. Fees remain “On request”; the review area remains unscored and says “Awaiting verified reviews”.
- Section links connect Overview, Cancer expertise, Treatments, Locations, Fees, About and Reviews. The remaining profile follows with treatment experience, locations, biography, professional work and the contextual contact section.
- Cancer expertise is no longer duplicated in an About accordion. Treatment panels remain on the reader's selection instead of changing with scrolling. The duplicate shared contact section is suppressed on full profiles.

## Verification

- Production build, TypeScript and lint pass.
- Browser navigation audit: 8 dropdowns, 10 mobile navigation links, 103 redirects, 59 documents/UI states and 346 internal destinations; no issues or browser errors.
- CUA browser inspection: Ruth Davis at 320, 375, 768, 1024, 1100, 1280, 1440 and 1600px; no horizontal overflow. All four hospitals remain visible in the first viewport at 1280 × 800.
- Longer names and larger specialism lists: Madhumita Bhattacharyya, Nicola Dallas and Paul Rogers at 1440 and 320px; no horizontal overflow or duplicate IDs.
- All ten named appointment links show the correct consultant after the contact view has loaded.
- Princess Margaret selection and direct Royal Berkshire fragments open the correct hospital panel. Keyboard Enter/Space activation checked on treatment navigation and the radiotherapy panel.
- At the 720 × 450 CSS viewport corresponding to 200% zoom from 1440 × 900, no horizontal overflow or clipped overview text was found. This was an equivalent reflow check, not a manual browser-zoom or VoiceOver session.
- The accessibility tree exposes the consultant name, section headings, fee labels, review status and named links. Stars and arrows are decorative; no invented score is announced.

The full repository accessibility sweep completed all 310 distinct route/width/motion combinations with HTTP 200 responses and no load errors. All ten consultant profiles and the contact page had zero automated violations across five widths and both motion settings. The wider site still reports 270 colour-contrast instances across eight unchanged routes: exactly the same 71 route/rule/selector targets as the earlier 9 September baseline, with no new targets. The audit therefore exits non-zero; this is not a site-wide accessibility pass.

The full results are recorded in `docs/a11y/2026-09-09-profile-overview.md` and its JSON. The optional audit worker setting runs each width/motion combination in its own browser context and retains all 310 checks and deterministic result ordering; its default remains sequential. A manual VoiceOver and Safari pass remains outstanding.
