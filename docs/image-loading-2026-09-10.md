# Image-loading audit — 10 September 2026

Local version: `1a7d781`, preview at `http://127.0.0.1:3001`.

## Result

No broken images found. Image delivery is generally lightweight, but there are
worthwhile loading-priority and responsive-delivery improvements. No product
source, photography, cropping, compression settings or styling was changed in
this audit. Non-visual implementation approval was requested separately.

## Coverage and evidence

- All 53 sitemap routes returned HTTP 200. Their server-rendered markup contained
  164 image elements referencing 43 distinct local assets. All 43 assets existed,
  could be decoded and returned successful image responses.
- Visited all 53 routes at 390 × 844 and 1440 × 900 in the in-app browser: 106
  route/viewport checks. Inspected selected image URLs, completion, intrinsic
  size, displayed bounds and loading attributes.
- Four desktop treatment heroes were not complete at the immediate first
  observation. All completed successfully on subsequent inspection. This is not
  a measured delay in seconds, but their lazy-loading configuration is avoidable.
- Checked another 71 distinct responsive image responses selected for loaded,
  displayed images. All returned HTTP 200.
- Scrolled the homepage, treatments hub and consultant directory through seven
  viewport steps each. No incomplete visible images at the sampled observations.
- Opened the resources browse state; its visible logos loaded successfully.
- Reviewed image declarations across the source, including shared templates,
  resource logos, profile imagery, CSS/SVG graphics and unused prototypes.

## Findings

### 1. Treatment heroes start later than necessary

The treatments hub and all seven treatment-detail routes set `fetchPriority="high"`
but leave Next Image's default lazy loading in place. The installed Next 14.2.33
implementation confirms that fetch priority alone does not disable lazy loading.

Proposed fix: early, breakpoint-aware hero requests. Both layouts contain separate
mobile/desktop image nodes; simply making both eager or priority could download
two different sizes. Preserve the two existing crops and avoid preloading the
hidden copy.

Affected: `src/app/treatments/TreatmentHero.tsx` and
`src/components/treatments/TreatmentDetailHero.tsx`.

### 2. Fees hero bypasses responsive optimisation

Both fees hero copies use `unoptimized`, serving the same 2880 × 1614 WebP at
128,776 bytes to phones and desktops. This is not an enormous file, but is larger
than the other measured mobile hero downloads.

Proposed fix: responsive delivery, with careful allowance for `object-cover`.
The phone container is 680px tall: sizing solely to its narrow width would soften
the heavily cropped image. The image's aspect ratio implies an uncropped width
of roughly 1,214 CSS pixels at that height, before accounting for device pixel
ratio. Do not promise the 640px variant as a like-for-like phone replacement.
Preserve the existing masks, object positions and parallax.

Affected: `src/components/sections/tariffs/FeesHero.tsx`.

### 3. Cancer-types hero preloads a photograph hidden on phones

The `/specialities` hero photograph has `priority` inside a `hidden lg:block`
container. Its preload is not restricted by a media condition, so phones are
asked to fetch a photograph that they do not display.

Proposed fix: restrict early loading to the desktop breakpoint. Keep the current
desktop layout and image unchanged.

Affected: `src/components/sections/specialities/CancerTypesPrototype.tsx`.

### 4. Resource logos use original raster files

The resources browser uses lazy, asynchronously decoded ordinary image tags with
explicit dimensions, which is good for layout stability. Some originals are much
wider than their presentation: Macmillan is 1,280px / 59,459 bytes and Cancer Care
Map is 2,356px / 25,561 bytes, while compact versions display at around 120px.

Responsive logo delivery is a lower-priority improvement. Maintain the Sciensus
crop, transparent backgrounds and brand-colour rendering; do not blindly replace
all logos with lossy variants without a visual comparison.

Affected: `src/components/sections/resources/ResourceSearchLanding.tsx`.

## Selected measured downloads

Actual browser-selected image responses, requested with WebP support. Decimal kB,
rounded. These are image payloads, not total page weights or timings.

| Page | Phone visible images | Desktop visible images |
| --- | ---: | ---: |
| Home | 15.6 kB | 70.1 kB |
| Treatments | 15.6 kB | 31.9 kB |
| Patients | 13.9 kB | 24.6 kB |
| Contact | 16.2 kB | 52.0 kB |
| Fees | 128.8 kB | 128.8 kB |

The original homepage photograph is 1.32 MB, but visitors in these checks received
the much smaller responsive versions above. The largest fallback image response
in the HTTP inventory was 179.0 kB. There is no reason to replace the photography
or alter the approved visual design based on these findings.

## Limits and next validation

This is a local-development audit, with a reused browser cache and unthrottled
loopback requests. Browser timing APIs and network-throttling controls were not
available through the provided browser interface. Request durations are therefore
not presented as public-site or mobile-network performance.

Before claiming performance on slower phones, measure the production deployment
with a cold cache, realistic mobile network/CPU conditions and real device pixel
ratios. Record LCP, image request timing and layout shifts. This audit is not a
WCAG conformance review and did not change accessibility behaviour.

## Approved implementation and verification

The user subsequently approved the four delivery improvements. Implemented locally
on 10 September; no push or deployment performed.

- Added `MediaHeroImage`, using Next's `getImageProps` for the existing fill
  geometry and optimised candidates, inside a native media-gated `picture`.
  Visible heroes use eager loading and high fetch priority, without hydration.
  Inactive layouts use an inline transparent fallback and make no image request.
  An initial media-preload approach still allowed a hidden image request in the
  browser, so it was replaced with this stronger native source selection.
- Applied to the treatments hub, all seven treatment-detail heroes, the
  desktop-only cancer-types hero, and the two fees hero layouts. Breakpoints,
  photo positions, masks, parallax, dimensions, copy and alt text are unchanged.
- Fees has 1280px and 1920px whole-image derivatives, conservatively encoded at
  WebP quality 90. These are 61,862 and 110,562 bytes versus the original 128,776
  bytes (52% and 14% smaller). Its original 2880px image remains the highest-density
  candidate. `sizes` accounts for the tall cover crop: 1,214 CSS pixels on phones,
  with width/height-aware conservative minima on desktop. High-density displays
  may still receive the original to preserve sharpness. Other Next image quality
  settings remain unchanged at the existing default.
- Five resource logos have responsive lossless WebP derivatives, preserving
  transparency and every resized visible RGB pixel. Only candidates smaller than
  their originals are included. Original files remain the highest-size candidates;
  Sciensus's existing small image/crop is untouched. Explicit original aspect
  ratios prevent rounding of derivative heights changing the layout.
- For example, the compact Macmillan logo changes from 59,459 to 10,426 bytes
  (82% less), and Cancer Care Map from 25,561 to 8,454 bytes (67% less). Actual
  selection depends on density and the browser's reusable cached candidates.

Validation of the final implementation:

- Production build passed (61 generated pages); compilation, lint and type checks
  included. Build output isolated in `.next-image-check`, leaving the preview
  running. Removed the build's incidental tsconfig include afterwards.
- All 53 sitemap routes and all 462 rendered image candidates returned successful
  image responses. This includes every `source`/`srcset` candidate, not only the
  default `img` URL. Reproducible with `node scripts/check-image-responses.cjs`.
- Browser pass repeated for all 53 routes at 390 × 844 and 1440 × 900. No incomplete
  visible images in the changed heroes at the sampled observations. Deferred
  directory portraits finished on subsequent inspection; no broken images found.
- Browser asset inventory on mobile `/specialities` confirmed no hero photograph
  resource request; the hidden image selected the inline fallback. Treatment and
  fees inactive image copies also selected that fallback.
- Checked the changed templates at the tablet width of 768px as well. Inspected
  the fees image derivatives visually and retained the original crop positions.
- All six compact resource logo bounds matched the original measured dimensions
  exactly. Logos loaded successfully in the expanded browse state.
- `test-image-delivery.cjs` passed: native media selection, no network fallback
  srcset, existing Next optimisation, eager/high priority, cover-resolution guards,
  source retention, smaller derivative files, and decoded lossless logo pixels.
- Existing button-fill, corner-token, CTA-outline, hero-palette and phone-layout
  regression scripts all passed. No button or design token files changed.
- The full `npm run a11y` suite was not rerun: it launches an external Playwright
  browser, while this session's UI testing is restricted to the supplied in-app
  browser. No WCAG conformance claim is made.

Production cold-cache/slow-network testing remains outstanding as described above;
the measured byte savings are not a promised reduction in real-world seconds.
