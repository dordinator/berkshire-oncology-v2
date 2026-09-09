# Navigation and locations audit — 9 September 2026

**Branch:** `WCAG`, verified against `origin/WCAG` at `a36a5bd` before changes.

## Changes

- All cancer links now select the current cancer finder view used by the homepage. This includes dropdowns, search, profile specialities, treatment-page chips and dormant components.
- Removed the 18 old cancer-page views and four old consultant browse pages. Old URLs redirect into the current cancer finder or consultant filters.
- Retired duplicate `/links` and `/contact-concept` routes in favour of `/resources` and `/contact`.
- All 14 supported cancer groups use the same location accordion and map as consultant profiles. The lists are the union of the verified practising sites of the relevant consultants. They are not a new assertion that every treatment is available at every listed site. NHS sites are labelled; the practice confirms each patient’s site.
- Sarcoma retains its existing guidance to contact the practice because no current consultant is listed.
- Fixed same-page cancer selection and contact-intent navigation, and close dropdowns when a link is followed.
- Kept full consultant profile spacing fixed at Balanced and removed the selector.

## Verification

- Production build, lint and TypeScript checks passed.
- 8 desktop dropdowns, 63 dropdown entries and 10 mobile links checked.
- 251 internal destinations across 59 rendered documents and UI states: no stale links, missing anchors, failed routes or browser errors.
- All 103 configured redirects returned 308 and the exact intended destination.
- All 14 populated cancer location lists matched the maintained consultant-site records. Every accordion was activated.
- Consultant role and treatment filters, A–Z ordering, same-page selection, Back navigation and contact options checked in a real browser.
- Location keyboard activation and horizontal reflow checked at 320, 375, 768 and 1440px. 200% zoom reflow was checked using the corresponding 720px CSS viewport; no horizontal overflow.
- Direct location links placed the heading below the fixed header in default and reduced motion.
- 80 supplemental axe checks on selected cancer locations, consultant filters and contact options: zero violations.

The full route sweep completed 310 checks (31 routes × five widths × two motion settings), with no load errors. It exited non-zero for **270 colour-contrast findings** across eight routes. All 71 unique route/selector targets also occur in the repository’s committed 5–6 September reports; none are new targets from this work. These are recorded findings, not a claim of complete WCAG conformance. The 80 scoped checks above cover the final selected views after the last navigation refinements.

## Dropdown destination matrix

### about

| Link | Current destination |
|---|---|
| About the partnership | `/#partnership` |
| Our consultants | `/consultants` |
| Referring professionals | `/contact#referral` |
| Professional and career enquiries | `/contact#professional` |

### patients

| Link | Current destination |
|---|---|
| I'm newly diagnosed | `/patients#newly-diagnosed` |
| I'm looking for a second opinion | `/patients#second-opinion` |
| I'm looking for private treatment | `/patients#private-treatment` |
| I'm already receiving treatment | `/patients#receiving-treatment` |
| I'm supporting someone with cancer | `/patients#supporting-someone` |
| What to expect at your first appointment | `/patients#first-appointment` |
| Frequently asked questions | `/patients#faqs` |
| Patient resources and support | `/resources` |

### cancer-types

| Link | Current destination |
|---|---|
| Bladder Cancer | `/specialities?type=bladder-and-kidney#specialists` |
| Brain Cancer | `/specialities?type=brain-and-spinal#specialists` |
| Breast Cancer | `/specialities?type=breast#specialists` |
| Cancer of Unknown Primary (CUP) | `/specialities?type=cancer-of-unknown-primary#specialists` |
| Bowel (Colorectal) Cancer | `/specialities?type=colorectal#specialists` |
| Gynaecological Cancer | `/specialities?type=gynaecological#specialists` |
| Head and Neck Cancer | `/specialities?type=head-and-neck#specialists` |
| Kidney (Renal) Cancer | `/specialities?type=bladder-and-kidney#specialists` |
| Liver Cancer | `/specialities?type=liver-and-pancreatic#specialists` |
| Lung Cancer | `/specialities?type=lung#specialists` |
| Lymphoma | `/specialities?type=lymphoma#specialists` |
| Oesophageal Cancer | `/specialities?type=upper-gi#specialists` |
| Pancreatic Cancer | `/specialities?type=liver-and-pancreatic#specialists` |
| Prostate Cancer | `/specialities?type=prostate#specialists` |
| Skin Cancer | `/specialities?type=skin-and-melanoma#specialists` |
| Stomach (Gastric) Cancer | `/specialities?type=upper-gi#specialists` |
| Testicular Cancer | `/specialities?type=testicular#specialists` |
| Sarcoma | `/specialities?type=sarcoma#specialists` |

### treatments

| Link | Current destination |
|---|---|
| Chemotherapy | `/treatments/chemotherapy` |
| Immunotherapy | `/treatments/immunotherapy` |
| Targeted therapies | `/treatments/targeted-therapies` |
| Hormone therapy | `/treatments/hormone-therapy` |
| Radiotherapy | `/treatments/radiotherapy` |
| Brachytherapy | `/treatments/brachytherapy` |
| Radioisotope therapy | `/treatments/radioisotope-therapy` |
| Palliative radiotherapy | `/treatments/radiotherapy#palliative-radiotherapy` |

### consultants

| Link | Current destination |
|---|---|
| Find a consultant | `/consultants` |
| Browse by cancer type | `/specialities` |
| Browse by treatment | `/consultants?view=treatments#consultant-list` |
| Consultant clinical oncologists | `/consultants?role=clinical#consultant-list` |
| Consultant medical oncologists | `/consultants?role=medical#consultant-list` |
| Consultant profiles | `/consultants?sort=az#consultant-list` |

### locations

| Link | Current destination |
|---|---|
| Browse all locations | `/locations` |
| Treatment locations | `/resources#treatment-locations` |
| Confirm where to go | `/contact#guidance` |

### fees

| Link | Current destination |
|---|---|
| Tariff details | `/tariffs#request` |
| Self-funding treatment | `/tariffs#self-funding` |
| Private medical insurance | `/tariffs#insurance` |
| Tariffs | `/tariffs#tailored` |
| How estimates work | `/tariffs#estimates` |
| Checking insurance cover | `/tariffs#authorisation` |
| Insurance shortfalls | `/tariffs#shortfalls` |
| Payment questions | `/tariffs#faqs` |

### resources

| Link | Current destination |
|---|---|
| Browse resources and support | `/resources` |
| Trusted organisations | `/resources#trusted-organisations` |
| Treatment information | `/treatments` |
| Your first appointment | `/patients#first-appointment` |
| Support for carers and families | `/patients#supporting-someone` |
| Treatment locations | `/resources#treatment-locations` |
| Fees and insurance | `/tariffs` |
| External organisations | `/resources#trusted-organisations` |

## Re-run the navigation check

Start the site, then run `npm run audit:links`. Use `AUDIT_BASE` to select a different local server. The script needs Playwright Chromium; this run used `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/berkshire-playwright`.

The saved regression check is `scripts/navigation-audit.cjs`. The default report directory is `.next-navigation-audit`, or set `NAV_AUDIT_OUTPUT`.

These checks verify routing and the stated accessibility scopes. No new manual screen-reader pass was performed.
