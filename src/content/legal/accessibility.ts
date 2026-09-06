import type { LegalDoc } from "../types";

// Replaces the inherited /accessibility.htm page, which was carried over from a
// previous site's template, claimed no standard, carried no date and gave nobody
// a way to report a problem.
//
// Structured on the GDS / W3C model, which is what an assessor looks for:
// what the site claims, how that was tested, anything that falls short, and how
// to tell us when we have missed something.
//
// MAINTENANCE
// - `updated` is the date of the last test, not the last edit. Do not advance it
//   for a wording change.
// - The conformance claim below is only true while `npm run a11y` passes and the
//   manual checks in docs/accessibility-audit-2026-09.md have been repeated. If
//   a regression ships, the claim must change before the code does.
// - Contact details are the practice's existing published address and number.
//   Whether accessibility reports should route there, and whether to publish a
//   response-time commitment, are decisions for the practice.
// - The screen-reader pass is NOT yet described here, because it has not been
//   carried out. Add it to "How we tested this website" only once it has, and
//   record who ran it and with what in the audit document. Do not describe
//   testing that has not happened.
export const accessibility: LegalDoc = {
  slug: "accessibility",
  title: "Accessibility",
  updated: "5 September 2026",
  description:
    "How accessible the Berkshire Oncology Partnership website is, how we tested it, and how to tell us if something is not working for you.",
  html: `
<p>We want everyone to be able to use this website, whatever their sight, hearing, movement or understanding. Many people reading these pages are unwell, tired or taking in a diagnosis, and the site should ask as little of you as possible.</p>

<h2>How accessible this website is</h2>
<p>This website conforms to the Web Content Accessibility Guidelines version 2.2, at Level AA.</p>
<p>That means, among other things:</p>
<ul>
<li>you can use the whole site with a keyboard, without a mouse;</li>
<li>you can see where you are on the page when using a keyboard;</li>
<li>text and backgrounds have enough contrast to be read comfortably;</li>
<li>you can zoom to 200%, or use a 320 pixel wide window, without losing content;</li>
<li>nothing moves, flashes or updates on its own without you being able to stop it;</li>
<li>images that carry meaning have a text description, and decorative ones are hidden from screen readers;</li>
<li>if you have asked your device to reduce motion, the site respects that.</li>
</ul>

<h2>Tell us if you cannot use part of this site</h2>
<p>If you find something you cannot use, or you need information from this site in a different format, please tell us. We will do what we can to help, and we will fix the problem.</p>
<p>Email <a href="mailto:practicemanager@berkshire-oncology.org.uk">practicemanager@berkshire-oncology.org.uk</a> or call <a href="tel:01189598866">0118 959 8866</a>.</p>
<p>Please tell us the page you were on and what happened. It helps to know what you were using — a screen reader, a keyboard, voice control, or your browser's zoom.</p>

<h2>How we tested this website</h2>
<p>The site was last tested on 5 September 2026. We tested every page a visitor can reach.</p>
<p>Testing had two parts. Automated checks were run across every page at five screen widths, with and without reduced motion. Automated tools find only about a third of accessibility problems, so the rest was checked by hand: moving through every page with a keyboard, checking that every control shows where the keyboard is, zooming to 200%, and viewing the site in a 320 pixel wide window.</p>

<h2>Changing how this site looks</h2>
<p>Your browser and your device can change how this site is displayed. You can make the text larger with Ctrl and + on Windows, or Command and + on a Mac. Your operating system can also magnify the screen, read pages aloud, increase contrast and reduce motion. This site follows those settings where it can.</p>

<h2>Links to other websites</h2>
<p>We link to other organisations, such as the NHS and cancer support charities. We are not responsible for how accessible their websites are. Links that open in a new tab say so.</p>

<h2>About this statement</h2>
<p>This statement was prepared on 5 September 2026. It is based on testing carried out by the team who build and maintain this website.</p>
`,
};
