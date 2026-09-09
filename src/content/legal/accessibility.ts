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
// - Do not replace the qualified target below with a conformance claim until
//   automated findings and the manual checks in the audit have been resolved.
//   Passing an automated sweep alone is not evidence of full conformance.
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
  updated: "9 September 2026",
  description:
    "How accessible the Berkshire Oncology Partnership website is, how we tested it, and how to tell us if something is not working for you.",
  html: `
<p>We want everyone to be able to use this website, whatever their sight, hearing, movement or understanding. Many people reading these pages are unwell, tired or taking in a diagnosis, and the site should ask as little of you as possible.</p>

<h2>How accessible this website is</h2>
<p>We aim to meet the Web Content Accessibility Guidelines version 2.2, at Level AA. Accessibility improvements and automated checks have been carried out, but assessment of this version, including testing with assistive technologies, is not yet complete. We are not currently claiming full conformance.</p>
<p>The site has been designed to support:</p>
<ul>
<li>keyboard navigation and visible keyboard focus;</li>
<li>readable text and background contrast;</li>
<li>layouts that adapt to narrow windows;</li>
<li>text descriptions for meaningful images, with decorative images hidden from screen readers;</li>
<li>your device's reduced-motion preference.</li>
</ul>
<p>Some homepage content changes automatically. It pauses while you interact with it and when reduced motion is enabled, but a persistent stop control is not yet available. This is a known accessibility limitation.</p>

<h2>Tell us if you cannot use part of this site</h2>
<p>If you find something you cannot use, or you need information from this site in a different format, please tell us. We will do what we can to help, and we will fix the problem.</p>
<p>Email <a href="mailto:practicemanager@berkshire-oncology.org.uk">practicemanager@berkshire-oncology.org.uk</a> or call <a href="tel:01189598866">0118 959 8866</a>.</p>
<p>Please tell us the page you were on and what happened. It helps to know what you were using — a screen reader, a keyboard, voice control, or your browser's zoom.</p>

<h2>How we tested this website</h2>
<p>Automated checks were run on 9 September 2026 across 55 routes at five screen widths, with and without reduced motion. The checks reported contrast findings that need further assessment. Testing of this version is not yet complete.</p>
<p>Automated checks cannot establish full accessibility. Further keyboard, browser zoom and screen-reader testing is needed before we can make a conformance claim.</p>

<h2>Changing how this site looks</h2>
<p>Your browser and your device can change how this site is displayed. You can make the text larger with Ctrl and + on Windows, or Command and + on a Mac. Your operating system can also magnify the screen, read pages aloud, increase contrast and reduce motion. This site follows those settings where it can.</p>

<h2>Links to other websites</h2>
<p>We link to other organisations, such as the NHS and cancer support charities. We are not responsible for how accessible their websites are. Links that open in a new tab say so.</p>

<h2>About this statement</h2>
<p>This statement was prepared on 5 September 2026. It is based on testing carried out by the team who build and maintain this website.</p>
`,
};
