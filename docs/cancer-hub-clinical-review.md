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

| Page | Status | Reviewer | Credentials | Last review | Next review |
|---|---|---|---|---|---|
| Breast — `/specialities/breast` | Draft, awaiting review | | | | |
| Prostate — `/specialities/prostate` | Draft, awaiting review | | | | |
| Cancer of Unknown Primary — `/specialities/cancer-unknown-primary` | Draft, awaiting review | | | | |
| Remaining 15 cancer types | Not yet written | — | — | — | — |

The hub has a separate treatment-only draft for every group whose full guide is
not yet written. These drafts do not make the unfinished detail pages appear
complete.

| Hub treatment guide | Status | Reviewer | Credentials | Last review | Next review |
|---|---|---|---|---|---|
| Bladder and Kidney | Draft, awaiting review | | | | |
| Bowel (colorectal) | Draft, awaiting review | | | | |
| Lung | Draft, awaiting review | | | | |
| Head and Neck | Draft, awaiting review | | | | |
| Gynaecological | Draft, awaiting review | | | | |
| Brain and Spinal | Draft, awaiting review | | | | |
| Upper GI | Draft, awaiting review | | | | |
| Liver and Pancreatic | Draft, awaiting review | | | | |
| Skin and Melanoma | Draft, awaiting review | | | | |
| Testicular | Draft, awaiting review | | | | |
| Lymphoma | Draft, awaiting review | | | | |
| Sarcoma — specialist-service information only | Draft, awaiting review | | | | |

To mark a full guide as reviewed, set `reviewedBy`, `reviewerCredentials`,
`reviewedOn` and `nextReviewOn` on that entry in `src/content/cancerInfo.ts`.
For a treatment-only draft, use the same fields in
`src/content/cancerTreatmentGuides.ts`. A name and last-review date are required
before the page changes from draft to reviewed; credentials and the next-review
date are then displayed when supplied. Do not invent a missing review field.

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
| Bladder and Kidney | [NICE NG2 — Bladder cancer](https://www.nice.org.uk/guidance/ng2), [NICE NG256 — Kidney cancer](https://www.nice.org.uk/guidance/ng256), [NHS — Bladder cancer treatment](https://www.nhs.uk/conditions/bladder-cancer/treatment/), [Cancer Research UK — Kidney cancer treatment](https://www.cancerresearchuk.org/about-cancer/kidney-cancer/treatment/decisions) | Bladder/kidney distinction, local treatment, radiotherapy and systemic treatment |
| Lung | [NICE NG122 — Lung cancer](https://www.nice.org.uk/guidance/ng122), [NHS — Lung cancer treatment](https://www.nhs.uk/conditions/lung-cancer/treatment/), [Cancer Research UK — Lung cancer treatment](https://www.cancerresearchuk.org/about-cancer/lung-cancer/treatment) | Non-small-cell/small-cell distinction and surgery, radiotherapy and systemic treatment |
| Head and Neck | [NICE NG36 — Cancer of the upper aerodigestive tract](https://www.nice.org.uk/guidance/ng36), [NHS — Mouth cancer treatment](https://www.nhs.uk/conditions/mouth-cancer/treatment/), [Cancer Research UK — Head and neck cancer](https://www.cancerresearchuk.org/about-cancer/head-neck-cancer) | Site-specific treatment and rehabilitation needs |
| Gynaecological | [Cancer Research UK — Gynaecological cancers](https://www.cancerresearchuk.org/about-cancer/womens-cancer), [NHS — Ovarian cancer treatment](https://www.nhs.uk/conditions/ovarian-cancer/treatment/), [Cancer Research UK — Womb cancer treatment](https://www.cancerresearchuk.org/about-cancer/womb-cancer/treatment/decisions-about-treatment), [NHS — Cervical cancer treatment](https://www.nhs.uk/conditions/cervical-cancer/treatment/), [Cancer Research UK — Vulval cancer treatment](https://www.cancerresearchuk.org/about-cancer/vulval-cancer/treatment), [Cancer Research UK — Vaginal cancer treatment](https://www.cancerresearchuk.org/about-cancer/vaginal-cancer/treatment/treatment-decisions) | Differences between ovarian, womb, cervical, vulval and vaginal treatment pathways |
| Brain and Spinal | [NICE NG99 — Primary brain tumours and brain metastases](https://www.nice.org.uk/guidance/ng99), [NHS — Malignant brain tumour treatment](https://www.nhs.uk/conditions/malignant-brain-tumour/treatment/), [Cancer Research UK — Secondary brain cancer](https://www.cancerresearchuk.org/about-cancer/secondary-cancer/secondary-brain-cancer/treatment), [Cancer Research UK — Primary spinal cord tumours](https://www.cancerresearchuk.org/about-cancer/brain-tumours/types/treatment-spinal-cord-tumours) | Primary brain, primary spinal-cord and secondary-brain distinctions; surgery, radiotherapy and medicine treatment |
| Upper GI | [NICE NG83 — Oesophago-gastric cancer](https://www.nice.org.uk/guidance/ng83), [Cancer Research UK — Oesophageal cancer treatment](https://www.cancerresearchuk.org/about-cancer/oesophageal-cancer/treatment/decisions-about-your-treatment), [Cancer Research UK — Stomach cancer treatment](https://www.cancerresearchuk.org/about-cancer/stomach-cancer/treatment) | Oesophageal/junctional/stomach distinctions and combined treatment pathways |
| Liver and Pancreatic | [NICE NG85 — Pancreatic cancer](https://www.nice.org.uk/guidance/ng85), [Cancer Research UK — Primary liver cancer](https://www.cancerresearchuk.org/about-cancer/liver-cancer/treatment/treatment-options), [Cancer Research UK — Pancreatic cancer](https://www.cancerresearchuk.org/about-cancer/pancreatic-cancer/treatment/treatment-decisions), [Cancer Research UK — Bile-duct cancer](https://www.cancerresearchuk.org/about-cancer/bile-duct-cancer/treatment/treatment-options) | Primary-site distinction, liver-directed treatment and systemic treatment |
| Skin and Melanoma | [NICE NG14 — Melanoma](https://www.nice.org.uk/guidance/ng14), [Cancer Research UK — Melanoma treatment](https://www.cancerresearchuk.org/about-cancer/melanoma/treatment/treatment-decisions), [Cancer Research UK — Non-melanoma skin cancer](https://www.cancerresearchuk.org/about-cancer/skin-cancer/treatment) | Melanoma/BCC/SCC distinctions and local or systemic treatment |
| Testicular | [NHS — Testicular cancer treatment](https://www.nhs.uk/conditions/testicular-cancer/treatment/), [Cancer Research UK — Testicular cancer treatment](https://www.cancerresearchuk.org/about-cancer/testicular-cancer/treatment) | Seminoma/non-seminoma distinction, surgery, surveillance, chemotherapy and radiotherapy |
| Lymphoma | [NICE NG52 — Non-Hodgkin lymphoma](https://www.nice.org.uk/guidance/ng52), [NHS — Hodgkin lymphoma treatment](https://www.nhs.uk/conditions/hodgkin-lymphoma/treatment/), [NHS — Non-Hodgkin lymphoma treatment](https://www.nhs.uk/conditions/non-hodgkin-lymphoma/treatment/) | Subtype and growth-rate distinctions, monitoring and specialist treatments |
| Sarcoma | [NICE QS78 — Sarcoma](https://www.nice.org.uk/guidance/qs78), [NHS — Soft-tissue sarcoma treatment](https://www.nhs.uk/conditions/soft-tissue-sarcoma/treatment/), [Cancer Research UK — Primary bone cancer](https://www.cancerresearchuk.org/about-cancer/bone-cancer/treatment/treatment-options-for-bone-cancer) | Specialist sarcoma MDT requirement and broad bone/soft-tissue treatment distinctions |
| Prostate | [NICE NG131 — Prostate cancer: diagnosis and management](https://www.nice.org.uk/guidance/ng131) (published 9 May 2019, last updated 15 Dec 2021) | mpMRI before biopsy, transperineal biopsy, Gleason/grade group, risk stratification, treatment options by risk group |
| Prostate | [Cancer Research UK — prostate cancer](https://www.cancerresearchuk.org/about-cancer/prostate-cancer) | Plain-English register; active surveillance explanation |
| CUP | [NICE CG104 — Metastatic malignant disease of unknown primary origin in adults](https://www.nice.org.uk/guidance/cg104) (published 26 Jul 2010, last updated 26 Apr 2023) | MUO → provisional CUP → confirmed CUP terminology, immunohistochemistry, imaging sequence, specialist MDT |
| CUP | [Cancer Research UK — cancer of unknown primary](https://www.cancerresearchuk.org/about-cancer/cancer-unknown-primary-cup) | Plain-English register |

All source links in the clinical content returned HTTP 200 when checked on
30 August 2026. They should be checked again as part of each review round.

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

The cancer hub deliberately does not turn a site's generic treatment capability
into a cancer-specific location claim. Its all-cancers view can show the known
site list, but a selected cancer shows an unconfirmed state until the practice
supplies a cancer × treatment × site mapping. The older full detail pages still
use `privateCareSites` to suggest sites from treatment category, so those claims
remain part of the practice review below.

---

## Open questions for the practice

1. **Which cancers and consultants are covered at which site?** The hub now
   avoids inferring this. The existing full detail pages still present private
   sites from general treatment capability. Supply a verified cancer ×
   consultant × treatment × site mapping before making that routing specific.
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
6. **Combined cancer groups.** Confirm that one treatment overview is helpful
   for Bladder and Kidney, Gynaecological, Upper GI, Liver and Pancreatic, and
   Skin and Melanoma. The drafts state the important differences, but they do
   not replace a subtype-specific consultation.
7. **Liver and pancreatic scope.** Confirm whether “liver” includes secondary
   liver cancer and whether pancreatic neuroendocrine tumours or gallbladder
   cancer belong in this group. The draft currently separates secondary liver
   disease and excludes pancreatic neuroendocrine tumours from its overview.
8. **Skin consultant coverage.** Confirm which consultants cover melanoma,
   basal cell carcinoma and squamous cell carcinoma. The group does not assume
   that every listed skin-cancer consultant covers every subtype.
9. **Testicular and lymphoma pathways.** Confirm who oversees testicular
   surveillance and which lymphoma subtypes and systemic treatments the
   partnership manages. The draft marks surveillance, transplant and CAR-T as
   specialist-team care rather than partnership-delivered treatment.

---

## Not done yet

- The other 15 cancer types still have no **full** written clinical guide. The
  hub now has sourced treatment-only drafts for every group, but diagnosis,
  staging, support and full-page content remain to be written and reviewed.
- No photography. The pages currently carry the ten real consultant portraits
  and nothing else. See the note in the handover about art direction before any
  stock is added.
