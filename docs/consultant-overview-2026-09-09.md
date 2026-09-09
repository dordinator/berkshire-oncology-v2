# Consultant profile overview — 9 September 2026

## Approved simplified design

The final three-column design replaces the earlier D4 overview on all ten consultant profiles. The left column is the maintained consultant portrait, extending to the bottom of the navigation row. The middle column contains identity, qualifications, a short introduction and cancer expertise links. The right column is the shared homepage sage panel with “Request an appointment”, “Call to book” and the unscored patient-review status.

The four icon links — About, Locations, Fees and Reviews — span only the last two columns. Custom outline illustrations show a person, folded map, pound receipt and quotation marks. Buttons have 15px corners; the green panel and portrait have 20px corners. At the inspected 1600 × 1000 viewport the portrait and navigation both end at 908px, and the contact panel is 529px high. The panel uses `--brand-sage-panel` directly, the same token as the homepage. Fonts, navy and canvas also use the shared site styles.

The overview reflows to two columns on tablets and a compact photo beside identity on phones, with expertise and contact actions below. Longer names and larger expertise lists grow naturally. The removed breadcrumb and section-spacing toggle remain absent; detail sections retain balanced spacing.

## Content and connections

- Existing summaries, qualifications, photographs and cancer relationships are retained. No new clinical, treatment, hospital, price or review claims are introduced.
- GMC registration moves from the overview into About’s professional details. The first viewport now concentrates on the consultant, their expertise and contacting the practice.
- Cancer links open the selected cancer information on the current hub. Existing treatment experience, hospital accordions/maps, biography and professional work remain below.
- Fees move from the first viewport into a dedicated section reached by the Fees link. Both consultation prices remain “On request”, with a link to the current fees and insurance page.
- Appointment links retain the consultant’s validated slug and show that consultant on the contact page. The contact page’s external booking integration remains unconnected; this redesign does not change it.
- The telephone link uses the maintained practice number and the user’s requested visible label “Call to book”. Its accessible name includes the consultant and number.
- Patient reviews remain “Awaiting verified reviews”. Empty stars and the unscored placeholder are decorative, and no rating is announced to assistive technology.
- Section links use real anchors and the shared anchor controller, which positions content below the fixed header and focuses the destination. Active styling follows hash navigation and Back/Forward.

## Verification

Production build, lint and TypeScript pass. The browser navigation audit checked eight desktop dropdowns, ten mobile links, 103 redirects, 59 documents/UI states and 285 internal destinations, with no issues or browser errors. The count is lower than the previous overview because repeated first-viewport hospital and fee links have moved into their detail sections.

Codex inspected Ruth Davis’s profile at 320, 375, 768, 1024, 1100, 1280, 1440 and 1600px. No horizontal overflow or clipped overview links/headings were found. Madhumita Bhattacharyya, Nicola Dallas, Paul Rogers and Gelareh Eslamian also passed desktop and phone checks with no duplicate IDs. The 720 × 450 CSS viewport, equivalent to 200% zoom from 1440 × 900, reflows without clipping; this is not a manual browser-zoom session.

Keyboard Enter activation of About, Locations, Fees and Reviews reaches the correct destination, updates the active navigation item and leaves the heading below the fixed header. Focus styling was inspected. Accessibility-tree inspection exposes the consultant, expertise, named appointment/call actions, review status and fee labels; it does not announce an invented review score. Manual VoiceOver and Safari testing remains outstanding.

The full `npm run a11y -- --label=profile-simplified --workers=4` run completed 310 distinct route/width/motion configurations with HTTP 200 responses and no load errors. All ten consultant profiles and `/contact` have zero automated violations. The wider site reports 264 contrast instances on eight unchanged routes, covering 67 distinct route/rule/selector targets. All 67 were present in the earlier profile-overview baseline. One location target reappeared compared with the intervening breadcrumb-removal run; the location page was not modified. The full sweep therefore exits non-zero and is not a site-wide accessibility pass. Results are in `docs/a11y/2026-09-09-profile-simplified.md` and its JSON.
