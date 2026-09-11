# BOP concept proposal deployment

Shareable address: https://bopconceptdemo.vercel.app/

Vercel project: `bopconceptdemo`, in `valinorsystems26-8317s-projects`.
This is a public proposal preview, separate from the practice's live domain.
It does not require a Vercel account to view. Contact submissions remain
disabled by the existing prototype endpoint.

## Indexing configuration

The project has `SITE_NOINDEX=true` in both Production and Preview environments.
Keep it enabled for all proposal deployments. Rebuild after changing this value:
Next.js generates metadata and response configuration during the build.

- Every route sends `X-Robots-Tag: noindex, nofollow, noarchive`.
- HTML pages inherit matching robots metadata from the root layout.
- The sitemap is empty and robots.txt does not advertise a sitemap or live host.
- robots.txt allows crawling so search engines can read the noindex directive.

Noindex is an instruction to search engines, not password protection. The URL
can be opened by anyone who receives it. Builds without `SITE_NOINDEX=true`
retain the existing live-site indexing configuration.

## Publishing updates

The approved source is maintained on `main`. This proposal was deployed through
the Vercel CLI; Git-triggered deployments are not configured.

```sh
npx vercel link --yes --project bopconceptdemo --scope valinorsystems26-8317s-projects
npx vercel deploy --prod --yes --scope valinorsystems26-8317s-projects
```

`vercel.json` selects Next.js. `.vercelignore` excludes local builds, dependency
directories, environment files and audit reports. Local Vercel credentials and
project linkage are ignored by Git. `outputFileTracingRoot` confines tracing
to this repository rather than an unrelated parent workspace.

## Framework compatibility

Next.js and its ESLint configuration were updated to 15.5.24 after the hosting
build exposed the old framework's security warnings. The newer
[Next.js image-optimization advisory](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4)
requires 15.5.24 or a patched 16.x release; 14.2.35 alone is insufficient.
Consultant, cancer and treatment routes now await their route parameters in
accordance with the Next.js 15 API. TypeScript targets ES2017. Approved page
content and styling are preserved.

## Verification — 11 September 2026

- Local and Vercel production builds passed, including lint and type checks.
- The final accessibility sweep passed all 310 configurations; see
  `a11y/2026-09-11-proposal-final.md` and JSON.
- Navigation checks passed eight dropdowns, ten mobile links, 103 redirects,
  60 documents/states and 320 destinations with no issues or runtime errors.
- 37 unauthenticated checks on the public domain passed: all 31 audited pages,
  three filtered pages, robots.txt, sitemap.xml and a consultant image. All
  returned HTTP 200 with noindex headers, and HTML pages had noindex metadata.
  See `a11y/2026-09-11-proposal-public-indexing.json`.
- The hosted homepage and desktop Ruth Davis profile were inspected in the
  in-app browser. The profile had no horizontal overflow at 1728px.

The initial deployment using the older framework was removed after the patched
deployment succeeded. Existing accessibility limitations remain documented in
`accessibility-audit-2026-09.md`; automated checks do not certify conformance.
