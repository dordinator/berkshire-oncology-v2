# Cancer-type hub — clinical review and sign-off

**Status: DRAFT. Not approved for publication.**

Every clinical statement on the cancer-type pages was written from published UK
guidance, not from the practice's own material. None of it has been read by a
consultant yet. This document exists so that review is a short, concrete job
rather than "read the website".

Where content lives: `src/content/cancerInfo.ts` (full clinical guides),
`src/content/cancerTreatmentGuides.ts` (treatment-only drafts),
`src/content/careDelivery.ts` (which site does what),
`src/content/cancerGroups.ts` (how the hub is grouped).

---

## What needs a signature

| Page | Status | Reviewer | Date |
|---|---|---|---|
| Breast — `/specialities/breast` | Draft, awaiting review | | |
| Prostate — `/specialities/prostate` | Draft, awaiting review | | |
| Cancer of Unknown Primary — `/specialities/cancer-unknown-primary` | Draft, awaiting review | | |
| Remaining 15 cancer types | Not yet written | — | — |

The cancer-type hub also contains a treatment-only bowel cancer draft in
`src/content/cancerTreatmentGuides.ts`. It is awaiting clinical review and does
not make the unfinished bowel cancer detail page appear complete.

To mark a full guide as reviewed, set `reviewedBy` and `reviewedOn` on that entry
in `src/content/cancerInfo.ts`. For a treatment-only draft, set the same fields
in `src/content/cancerTreatmentGuides.ts`. The page then replaces the "awaiting
clinical review" line with the reviewer's name and date automatically — there
is no second place to update.

---

## Rules the drafted copy follows

Kept deliberately, and worth holding any future page to:

1. No survival figures, no prognosis, no "success rates".
2. No drug names, no doses, no "you will be given" — only *may*, *usually*,
   *your consultant will discuss*.
3. Where something is done by another specialist it says so. Surgery on the
   breast and prostate pages is explicitly flagged as not carried out by our
   consultants.
4. Where the partnership's cover is thin, the page says so rather than implying
   more (see the CUP page's note about Dr Hill, and the Sarcoma page).
5. Nothing claims a specific site provides a service unless that site publishes
   it. See the sources table below.

---

## Sources behind the clinical content

| Page | Source | Used for |
|---|---|---|
| Breast | [NICE NG101 — Early and locally advanced breast cancer](https://www.nice.org.uk/guidance/ng101) (published 18 Jul 2018, last updated 14 Apr 2025) | Diagnostic pathway, receptor testing, sequencing of surgery / chemo / radiotherapy / endocrine therapy |
| Breast | [NICE CG81 — Advanced breast cancer](https://www.nice.org.uk/guidance/cg81) | Framing of secondary breast cancer as control of disease and symptoms |
| Breast | [Cancer Research UK — breast cancer](https://www.cancerresearchuk.org/about-cancer/breast-cancer) | Plain-English register for stage/grade/TNM explanation |
| Bowel | [NICE NG151 — Colorectal cancer](https://www.nice.org.uk/guidance/ng151) (published 29 Jan 2020, last reviewed 29 Apr 2026) | Colon/rectal distinction, surgery, systemic therapy, molecular biomarkers and metastatic disease |
| Bowel | [NHS — Treatment for bowel cancer](https://www.nhs.uk/conditions/bowel-cancer/treatment/) | Individual treatment factors and plain-English overview of surgery, chemotherapy, radiotherapy and selected medicines |
| Bowel | [Cancer Research UK — Treatment for bowel cancer](https://www.cancerresearchuk.org/about-cancer/bowel-cancer/treatment) (last reviewed 10 Jan 2025) | Plain-English distinction between colon and rectal treatment pathways |
| Prostate | [NICE NG131 — Prostate cancer: diagnosis and management](https://www.nice.org.uk/guidance/ng131) (published 9 May 2019, last updated 15 Dec 2021) | mpMRI before biopsy, transperineal biopsy, Gleason/grade group, risk stratification, treatment options by risk group |
| Prostate | [Cancer Research UK — prostate cancer](https://www.cancerresearchuk.org/about-cancer/prostate-cancer) | Plain-English register; active surveillance explanation |
| CUP | [NICE CG104 — Metastatic malignant disease of unknown primary origin in adults](https://www.nice.org.uk/guidance/cg104) (published 26 Jul 2010, last updated 26 Apr 2023) | MUO → provisional CUP → confirmed CUP terminology, immunohistochemistry, imaging sequence, specialist MDT |
| CUP | [Cancer Research UK — cancer of unknown primary](https://www.cancerresearchuk.org/about-cancer/cancer-unknown-primary-cup) | Plain-English register |

Every external link on the pages was checked and returns HTTP 200 as of
31 July 2026.

---

## Where care is delivered — sourced, not assumed

`src/content/locations.ts` deliberately leaves `services` empty because the
practice has not confirmed it. That has not been changed. `careDelivery.ts` is a
separate, sourced view used to tell a patient what normally happens where, and
every line traces to the host site's own published service list:

| Site | What it provides | Source |
|---|---|---|
| Spire Dunedin Hospital, Reading | Consultations, chemotherapy in a dedicated oncology unit, cancer tests and scans, one-stop breast clinic. **No radiotherapy.** | [Spire Dunedin — cancer investigations and treatments](https://www.spirehealthcare.com/spire-dunedin-hospital/treatments/cancer-investigations-and-treatments/) |
| The Princess Margaret Hospital, Windsor | Consultations, day-unit chemotherapy, scalp cooling, on-site pharmacy, rapid breast clinic. **No radiotherapy.** | [Circle Health — private cancer care centre, Windsor](https://www.circlehealthgroup.co.uk/hospitals/the-princess-margaret-hospital/private-cancer-care-centre-windsor) |
| GenesisCare Windsor | Radiotherapy (VMAT, SGRT, DIBH, prostate spacers), SACT, immunotherapy, hormone and targeted therapy, theranostics, CT/MRI/PET-CT, mammography, biopsy | [GenesisCare Windsor](https://www.genesiscare.com/uk/our-centres/windsor) |
| GenesisCare Oxford | Radiotherapy (MR Linac, SABR, IGRT, SGRT, VMAT, DIBH, prostate spacers), SACT, CT/MRI/PET-CT, biopsy | [GenesisCare Oxford](https://www.genesiscare.com/uk/our-centres/oxford) |
| Royal Berkshire Hospital | NHS only — Berkshire Cancer Centre: four linear accelerators, brachytherapy, chemotherapy day unit, Macmillan information centre | [Royal Berkshire NHS FT — cancer services](https://www.royalberkshire.nhs.uk/services-and-departments/cancer) |

**The one claim to check with the practice:** the pages tell patients that
radiotherapy happens only at the two GenesisCare centres and that drug treatment
is available at all four private sites. That is true of what those sites
publish. It is not necessarily true of where *our consultants personally*
practise. If any partner does not treat at one of these sites, that site should
be removed from `privateCareSites` for the relevant pages.

---

## Open questions for the practice

1. **Which of our consultants work at which site?** The pages currently present
   all four private sites for every cancer type with cover. Per-consultant
   location data would make this precise instead of general.
2. **"Brain and Spinal" grouping.** The practice asked for this label, but only
   brain is in the data and only Dr Davis lists it. No partner currently lists
   spinal tumours. Either confirm spinal cover, or the group should be relabelled
   "Brain" before publication. (`src/content/cancerGroups.ts`, `brain-and-spinal`.)
3. **Sarcoma.** No partner lists it. The page now says so plainly and routes to
   the practice. Confirm that is the wanted behaviour rather than a redirect.
4. **Dr Ruth Davis's treatments.** Her profile lists specialities but no
   treatment modalities, so the pathway diagram connects her to drug treatment
   only and never to radiotherapy — an unlisted modality is not treated as
   evidence of one. If she does provide radiotherapy, add it to
   `src/content/modalities.ts` and the diagram corrects itself.
5. **CUP cover.** Dr Hill is the only partner listing it. The page says so. Is
   that still current?

---

## Not done yet

- The other 15 cancer types have no written clinical content. Their pages still
  work — real consultants, treatments, locations, next steps — and say plainly
  that the clinical guide is being written.
- No photography. The pages currently carry the ten real consultant portraits
  and nothing else. See the note in the handover about art direction before any
  stock is added.
