# Consultant profile audit — 30 August 2026

## Scope

All ten consultant profiles were checked against the corresponding live
Berkshire Oncology Partnership profile and the live consultants listing. The
page structure was also compared with current HCA Healthcare UK consultant
profiles. HCA was used for information hierarchy and presentation patterns,
not as a source for Berkshire Oncology facts.

The redesigned profiles retain the Berkshire Oncology source material while
presenting the information in a calmer, more scannable structure: full
consultant title, short clinical summary, labelled credentials, cancer
expertise, treatment experience, verified locations, professional work and a
clear appointment route.

## Profile-by-profile result

| Consultant | Berkshire profile | Result |
| --- | --- | --- |
| Dr Joss Adams | `consultant-dr-joss-adams.htm` | Role, Reading appointment year, training, cancer focus, trials, leadership, publications, achievements and disclosures represented. |
| Dr Madhumita Bhattacharyya | `consultant-dr-madhumita-bhattacharyya.htm` | Role, Reading appointment year, training, systemic-treatment focus, cancer focus, trials, education, publications, achievement and disclosures represented. Radiotherapy removed from the redesigned treatment list; see legacy conflict below. |
| Dr Nicola Dallas | `consultant-dr-nicola-dallas.htm` | Role, Reading appointment year, training, cancer focus, radiotherapy interests, trials, leadership, publications and disclosures represented. |
| Dr Ruth Davis | `consultant-dr-ruth-davis.htm` | Role, Reading appointment year, training, radiotherapy leadership, research, publication, achievement and disclosures represented. Cancer and treatment details are supplemented by the current Frimley Health profile cited in the content data. |
| Dr Gelareh Eslamian | `consultant-dr-gelareh-eslamian.htm` | Medical-oncology role, Reading appointment year, training, cancer focus, systemic treatments, multidisciplinary work, leadership, research and disclosures represented. The live profile's Clinical Oncologist page heading conflicts with its own Medical Oncologist statement and the consultants listing; the redesigned page uses Medical Oncologist. |
| Dr Alice Freebairn | `consultant-dr-alice-freebairn.htm` | Role, Reading appointment year, training, cancer focus, multidisciplinary work, leadership, research, achievements and disclosures represented. |
| Dr Esme Hill | `consultant-dr-esme-hill.htm` | Role, Reading appointment year, training, cancer focus, acute oncology, multidisciplinary work, research, publications, achievements and disclosure represented. Hormone treatment removed from the redesigned treatment list because it is absent from the live consultants listing. |
| Dr Ayman Madi | `consultant-dr-ayman-madi.htm` | Medical-oncology role, training, 2022 move to the Royal Berkshire Hospital, cancer focus, research leadership, achievements, publications and disclosures represented. |
| Dr Helen O'Donnell | `consultant-dr-helen-odonnell.htm` | Role, Reading appointment year, training, cancer focus, prostate brachytherapy, leadership, research and publications represented. Empty achievements and disclosures from the old page are not turned into claims. |
| Dr Paul Rogers | `consultant-dr-paul-rogers.htm` | Role, Reading appointment year, training, cancer and treatment focus, prizes, research, publications, memberships-derived professional context, achievements and disclosures represented. |

## Legacy-site conflicts and confirmation points

The current Berkshire site contains a small number of conflicting or stale
fields. They should not be silently presented as equally reliable.

1. Dr Madhumita Bhattacharyya's qualifications are shown as `FRCP` on the main
   consultants listing but as `MRCP` on a cancer-speciality listing. The
   redesigned site currently retains `MRCP`, matching its archived content
   record. The practice should confirm the current post-nominals.
2. Dr Bhattacharyya's main consultants listing omits radiotherapy and her
   biography describes systemic treatment, while at least one older
   cancer-speciality listing includes radiotherapy. The redesigned page now
   follows the main listing and biography and does not show radiotherapy.
3. Dr Gelareh Eslamian's live profile has a `Consultant Clinical Oncologist`
   heading but states `Consultant Medical Oncologist since 2019`; the main
   consultants listing also says Medical Oncologist. The redesigned site uses
   Consultant Medical Oncologist.
4. Dr Esme Hill's live consultants listing does not include hormone treatment.
   It has therefore been removed from the redesigned treatment list.
5. Some live biographies contain time-sensitive wording such as `currently`,
   references to trials that were being set up, or future-tense service changes
   from 2018. The redesigned summaries avoid carrying those stale tenses into
   prominent patient-facing copy. Historical detail remains available in the
   professional-work disclosures where appropriate.

## HCA presentation patterns adopted

- A prominent consultant portrait and name.
- The full consultant role, not an abbreviated specialty label.
- A short, factual summary before the longer biography.
- Clearly labelled qualifications and GMC registration.
- Scannable condition, treatment and location groups.
- An obvious appointment action near the top and again after the profile.

Fees, ratings, reviews and years-of-experience claims were not copied from HCA.
Those elements require Berkshire Oncology's own verified data and approvals.

## Sources

- Berkshire Oncology Partnership: all ten live consultant pages and the live
  consultants listing, checked 30 August 2026.
- HCA Healthcare UK: current consultant profile patterns, checked 30 August
  2026.
- Additional current provider sources are recorded per consultant in
  `src/content/consultantProfileCopy.ts` and `src/content/consultantSites.ts`.
