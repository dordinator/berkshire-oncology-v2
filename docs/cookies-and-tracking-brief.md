# Cookies and tracking on a medical website

A short brief for the practice. Written 10 September 2026 alongside the rewrite of
`/cookies` and `/website-privacy`. Not legal advice — the practice's own adviser should
confirm the position before launch.

## Why a cancer practice is not an ordinary website

The rules below apply to every UK website. Three things make them bite harder here.

**The URL is the diagnosis.** Our pages are `/specialities/prostate`,
`/specialities/lymphoma`, `/treatments/chemotherapy`, `/patients#newly-diagnosed`. Any
third party that receives the page address — as a referrer, in an analytics hit, in an
advertising pixel — receives, in substance, *"this device is reading about prostate cancer
on an oncology practice's site."* Under UK GDPR that is special category data, because it
permits an inference about someone's health. It does not become anonymous just because no
name is attached.

**That raises the consent bar.** An ordinary site needs consent under PECR for a
non-essential cookie. A site where the cookie carries a health inference needs that *plus*
explicit consent under Article 9. A generic "we use cookies to improve your experience /
Accept All" banner does not clear the second bar.

**The audience is vulnerable.** Many readers are newly diagnosed or supporting someone who
is. Consent must be genuinely freely given, and a persistent cookie that records what
someone read is a disclosure risk on a shared or work computer in a way it isn't on a
retail site. There is a plain confidentiality dimension here — GMC guidance and the
common-law duty — quite apart from data protection law.

**The precedent is real.** The 2022–24 enforcement wave in the US was almost entirely
hospital websites leaking page URLs to Meta Pixel and Google Analytics. It is the
best-documented failure mode for exactly this category of site.

## The rules that apply

| | |
|---|---|
| **PECR 2003, reg 6** | Consent required before storing or reading anything on a device, unless strictly necessary for a service the user asked for. Analytics is **not** strictly necessary — the ICO has been explicit and repeated about this. Covers `localStorage`, not just cookies. |
| **UK GDPR Art 6 / Art 9** | A lawful basis for the processing. Health inferences need Art 9 explicit consent. |
| **UK GDPR Art 5(1)(a), Art 13** | The notice must describe what actually happens. A notice naming cookies that don't exist fails this as squarely as one omitting cookies that do. |

## What was wrong

**The cookie notice described a different website.** `/cookies` was carried over verbatim
from the old PHP site. It documented `ga.js` and the `_utma` / `_utmb` / `_utmc` / `_utmz`
set — Google Analytics Classic, retired by Google around 2014 — plus `PHPSESSID`, a PHP
session cookie, on a build that runs no PHP and loads no analytics at all. Every cookie
named on the page was fictional. It also used the "Category 1 / Category 2" scheme
withdrawn years ago, promised a list of cookies that never followed, and linked to
`aboutcookies.org`, which no longer exists.

**The privacy policy claimed analytics we don't run.** `/website-privacy` stated the
practice uses Google Analytics for visitor statistics, and that cookies are set. Neither
was true of this build.

**Nothing had a review date.** Three of the five legal pages rendered no "last updated"
line, so a reader had no way to judge whether any of it was current.

**Separately — and still unfixed — the live site is in breach.** `www.berkshire-oncology.org.uk`
still serves the old site, which loads `gtag.js` for property `UA-132559994-1` on its
homepage with no consent mechanism of any kind. That sets a `_ga` cookie before anyone
agrees to anything: a straightforward PECR reg 6 breach. The property stopped processing
data in July 2023, so the tag has been collecting nothing while carrying the full legal
exposure for over three years. **The fix is to delete nine lines from that site's
`index.htm`.** It is not in this repository and needs whoever maintains that server.

## What changed

`/cookies` was rewritten from the build outward rather than edited. It now says, truthfully:

- **The site sets no cookies at all.** No analytics, no tag manager, no advertising,
  no social embeds. Fonts are self-hosted.
- **Three display preferences** are stored in `localStorage` — `bop:graphic-mode`,
  `bop:treatment-mode`, `bop:consultant-section-spacing` — written only when the reader
  uses that control, never on page load. These are exempt from consent as user-chosen
  preferences, but they are disclosed anyway.
- **One third-party request**: OpenStreetMap map tiles, on the home and resources pages
  only. They set no cookies. OpenStreetMap receives the IP address and page address.
- **How to clear it**, and that nothing breaks if you do.
- **A commitment** that the page will be updated before anything cookie-setting goes live,
  and consent asked for where the law requires it.

`/website-privacy` had the Google Analytics claim removed and its cookies section replaced.
Both pages now carry a date.

**Verified, not assumed.** The claims were checked against a production build across
eleven pages including `/specialities/prostate` and `/treatments/chemotherapy`: zero
cookies, one third-party host, nothing written to storage without interaction. The clinical
pages contact no third party at all.

## The rules to hold to

1. **No third-party requests on `/specialities/*` or `/treatments/*`.** Those URLs name a
   diagnosis. This is the single most important line to hold.
2. **Any new tag, embed, chat widget or font host makes `/cookies` untrue** — update the
   page in the same change, or don't ship it.
3. **Treat requests for Meta Pixel, LinkedIn Insight or GA4 as decisions for the practice,
   not the developer.** Each would transmit speciality-page URLs to a third party. If
   visitor numbers are genuinely needed, a cookieless tool (Plausible, Fathom) avoids the
   consent question entirely.
4. **When the contact form is connected**, spam protection must not set cookies — Turnstile
   or a server-side honeypot, not reCAPTCHA.

## Still outstanding

- Delete the `gtag` block from the live legacy site.
- Server and hosting logs are not yet disclosed anywhere; that belongs in
  `/website-privacy` and can't be written until hosting is chosen.
- The contact form's lawful basis, retention period and transport.
- Legal review of all five documents.
- Beyond the website: ICO fee registration, an Article 30 record of processing, Article 28
  contracts with the host and anyone doing secretarial or billing work, a retention
  schedule and a breach procedure.
