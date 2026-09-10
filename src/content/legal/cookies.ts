import type { LegalDoc } from "../types";

// Rewritten September 2026. The previous version was a verbatim carry-over from
// the old PHP site and documented cookies this build does not set: Google
// Analytics Classic (ga.js, and the _utma/_utmb/_utmc/_utmz set, retired by
// Google around 2014) and PHPSESSID, on a site that runs no PHP. A notice that
// names cookies which do not exist fails the "informed" limb of UK GDPR Art 13
// as squarely as one that omits cookies which do.
//
// Everything below was checked against the build rather than rewritten from the
// old copy. The three storage keys are the ones in GraphicMode.tsx,
// TreatmentMode.tsx and ConsultantSpacingControl.tsx; all three are written only
// from their setter, never on load. The map tiles are the OpenStreetMap request
// in RegionMap.tsx. Fonts are self-hosted through next/font, so there is no
// third-party font request to declare. If any of that changes, this page changes
// with it.
//
// The storage table carries tabindex="0": .legal-prose styles tables as
// display:block with overflow-x:auto, so at 320px this one scrolls, and a
// scrollable region has to be keyboard-reachable (SC 2.1.1). The same latent
// issue applies to any future legal-page table wide enough to overflow.
//
// Deliberately not covered here: routine hosting/server logs. Those belong in
// the Website Privacy Policy and cannot be written accurately until the
// practice's hosting arrangement is settled.
//
// FLAGGED FOR THE PRACTICE'S LEGAL REVIEW before go-live.
export const cookies: LegalDoc = {
  slug: "cookies",
  title: "Cookies Information",
  updated: "9 September 2026",
  description:
    "This website sets no cookies. What it stores on your device, and the one outside organisation whose content it loads.",
  html: `
<p><strong>This website does not use cookies.</strong></p>

<p>We set no cookies of our own. The site carries no analytics, no advertising tags and no social media tracking, so nothing you read here is used to build a picture of you or passed to an advertising network. That matters more on a site like this one than on most: the pages someone chooses to read on an oncology practice's website can suggest something about their health, and we would rather that stayed with them.</p>

<p>Cookies are small files a website asks your browser to keep, so it can recognise your device on a later visit. Some sites use them to make a service work; many use them to follow what you look at. This page sets out the small amount of information this site does keep on your device, and the one outside organisation whose content it loads.</p>

<h2 class="legal-subhead">What this site stores on your device</h2>

<p>Three display settings are remembered, so a choice you make is still in place when you move between pages or come back later. They are held in your browser's local storage rather than in cookies. They stay on your device, they are never sent to us or to anyone else, and none of them identifies you.</p>

<table tabindex="0" aria-label="What this website stores in your browser">
<thead><tr><th>What it remembers</th><th>Stored as</th></tr></thead>
<tbody>
<tr><td>Your illustration style on the cancer and patient pages — Quiet, Integrated or Expressive</td><td>bop:graphic-mode</td></tr>
<tr><td>Your illustration style on the treatment pages</td><td>bop:treatment-mode</td></tr>
<tr><td>Your spacing preference on consultant profiles — Compact, Balanced or Spacious</td><td>bop:consultant-section-spacing</td></tr>
</tbody>
</table>

<p>Nothing is written until you actively change one of these settings. If you never touch them, this site stores nothing on your device at all.</p>

<h2 class="legal-subhead">Content loaded from another organisation</h2>

<p>The maps on the home page and the resources page are drawn with map tiles from OpenStreetMap, a not-for-profit mapping project. When a map scrolls into view your browser fetches those tiles from OpenStreetMap directly, which means OpenStreetMap can see your device's IP address and the address of the page you are on. The tiles set no cookies and are not used to track visitors. The OpenStreetMap Foundation publishes its privacy policy at osmfoundation.org.</p>

<p>Maps are the only content on this site loaded from a third party. There are no embedded videos, social media feeds, advertisements, chat widgets or externally hosted fonts.</p>

<h2 class="legal-subhead">Managing what is stored</h2>

<p>You can see and delete everything this site has stored through your browser's privacy or site data settings, usually reached from the padlock icon in the address bar. Because the site sets no cookies and depends on no tracking, clearing it will not lock you out of anything. The only effect is that the three display settings above return to their defaults.</p>

<h2 class="legal-subhead">If this ever changes</h2>

<p>If the practice adds something that does set cookies — website statistics, or an online booking or enquiry service, for example — this page will be updated before that service goes live, and where the law requires your consent we will ask for it rather than assume it.</p>

<h2 class="legal-subhead">Questions about this page</h2>

<p>Our Practice Manager can be contacted on 0118 959 8866 or by email — <a href="mailto:practicemanager@berkshire-oncology.org.uk">practicemanager@berkshire-oncology.org.uk</a>. How the practice handles patient information more generally is set out in our <a href="/privacy">Privacy Notice</a>, and how this website handles information you send through it is set out in our <a href="/website-privacy">Website Privacy Policy</a>.</p>
`,
};
