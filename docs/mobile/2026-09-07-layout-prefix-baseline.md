# Mobile layout sweep — 2026-09-07

Chromium at 320, 360, 375, 390, 430px (portrait, touch emulation on) over 55 routes — 275 page loads, each measured settled.

Findings are deduplicated across widths: one row is one defect, with the widths it appears at. Checks are deliberately conservative — see the header comment in `scripts/mobile-audit.mjs` for what is excluded and why.

## Summary

| Finding | Count |
|---|---:|
| Routes with more than 10 text styles | 53 |
| Text below the readable minimum | 30 |
| Text overlapping text | 17 |
| Images distorted or overwide | 2 |
| Routes with uneven section rhythm | 1 |

## By route

### `/`

- **Text overlapping text** — 1
  - `-gutter.w-full > div.flex.flex-wrap > p.type-body.text-white/70 > span` — "Appointments and enquiries:" over "0118 959 8866" (100%) · 320px
- **Text below the readable minimum** — 2
  - `ex > span.min-w-0.flex-1 > span.mt-2.5.flex > span.rounded-full.border` — 11px — "Breast" · all widths
  - `hidden > div.relative.overflow-hidden > p.pointer-events-none.absolute` — 10px — "© OpenStreetMap contributors" · all widths
- **Section rhythm uneven** — gaps between sections range 116px to 734px (734, 116, 303, 231, 156)
- **16 distinct text styles** on one page — `14px, 14px, 17px, 18px, 12px, 33.6px…`

### `/accessibility`

- **Text overlapping text** — 1
  - `article.min-w-0.max-w-3xl > div.legal-prose > p > a` — "practicemanager@berkshire-oncology.org.u" over "0118 959 8866" (81%) · 320/360/375/390px
- **11 distinct text styles** on one page — `14px, 15px, 24px, 12px, 20.8px, 36px…`

### `/consultants`

- **12 distinct text styles** on one page — `14px, 18px, 14px, 12px, 36px, 20.8px…`

### `/consultants/alice-freebairn`

- **Text below the readable minimum** — 1
  - `elative.border > div.absolute.inset-0 > p.pointer-events-none.absolute` — 8px — "Source: Office for National Statistics licensed under the Op" · all widths
- **14 distinct text styles** on one page — `14px, 12px, 24px, 18px, 15px, 44px…`

### `/consultants/ayman-madi`

- **Text below the readable minimum** — 1
  - `elative.border > div.absolute.inset-0 > p.pointer-events-none.absolute` — 8px — "Source: Office for National Statistics licensed under the Op" · all widths
- **14 distinct text styles** on one page — `14px, 24px, 12px, 15px, 44px, 14px…`

### `/consultants/by-treatment`

- **12 distinct text styles** on one page — `14px, 15px, 12px, 14px, 24px, 15px…`

### `/consultants/clinical-oncologists`

- **12 distinct text styles** on one page — `14px, 14px, 18px, 12px, 20.8px, 18px…`

### `/consultants/esme-hill`

- **Text below the readable minimum** — 1
  - `elative.border > div.absolute.inset-0 > p.pointer-events-none.absolute` — 8px — "Source: Office for National Statistics licensed under the Op" · all widths
- **14 distinct text styles** on one page — `14px, 12px, 24px, 18px, 15px, 44px…`

### `/consultants/gelareh-eslamian`

- **Text below the readable minimum** — 1
  - `elative.border > div.absolute.inset-0 > p.pointer-events-none.absolute` — 8px — "Source: Office for National Statistics licensed under the Op" · all widths
- **14 distinct text styles** on one page — `14px, 12px, 24px, 18px, 15px, 44px…`

### `/consultants/helen-odonnell`

- **Text below the readable minimum** — 1
  - `elative.border > div.absolute.inset-0 > p.pointer-events-none.absolute` — 8px — "Source: Office for National Statistics licensed under the Op" · all widths
- **14 distinct text styles** on one page — `14px, 12px, 24px, 18px, 15px, 44px…`

### `/consultants/joss-adams`

- **Text below the readable minimum** — 1
  - `elative.border > div.absolute.inset-0 > p.pointer-events-none.absolute` — 8px — "Source: Office for National Statistics licensed under the Op" · all widths
- **14 distinct text styles** on one page — `14px, 12px, 24px, 18px, 15px, 44px…`

### `/consultants/madhumita-bhattacharyya`

- **Text below the readable minimum** — 1
  - `elative.border > div.absolute.inset-0 > p.pointer-events-none.absolute` — 8px — "Source: Office for National Statistics licensed under the Op" · all widths
- **14 distinct text styles** on one page — `14px, 24px, 12px, 15px, 44px, 18px…`

### `/consultants/medical-oncologists`

- **12 distinct text styles** on one page — `14px, 12px, 14px, 18px, 20.8px, 18px…`

### `/consultants/nicola-dallas`

- **Text below the readable minimum** — 1
  - `elative.border > div.absolute.inset-0 > p.pointer-events-none.absolute` — 8px — "Source: Office for National Statistics licensed under the Op" · all widths
- **14 distinct text styles** on one page — `14px, 12px, 24px, 18px, 15px, 44px…`

### `/consultants/paul-rogers`

- **Text below the readable minimum** — 1
  - `elative.border > div.absolute.inset-0 > p.pointer-events-none.absolute` — 8px — "Source: Office for National Statistics licensed under the Op" · all widths
- **14 distinct text styles** on one page — `14px, 12px, 24px, 18px, 15px, 44px…`

### `/consultants/profiles`

- **12 distinct text styles** on one page — `14px, 24px, 18px, 12px, 14px, 20.8px…`

### `/consultants/ruth-davis`

- **Text below the readable minimum** — 1
  - `elative.border > div.absolute.inset-0 > p.pointer-events-none.absolute` — 8px — "Source: Office for National Statistics licensed under the Op" · all widths
- **14 distinct text styles** on one page — `14px, 12px, 24px, 18px, 15px, 44px…`

### `/contact`

- **Image distorted or overwide** — 1
  - `#main-content > section.relative.isolate > img.object-cover` — 339px wide · all widths

### `/contact-concept`

- **Image distorted or overwide** — 1
  - `#main-content > section.relative.isolate > img.object-cover` — 339px wide · all widths

### `/cookies`

- **12 distinct text styles** on one page — `14px, 15px, 12px, 20px, 15px, 20.8px…`

### `/links`

- **Text below the readable minimum** — 4
  - `div.mx-auto.mt-8 > div.px-2.pb-3 > div.flex.items-center > span` — 11.5px — "Suggested searches" · all widths
  - `auto.mt-8 > div.px-2.pb-3 > div.flex.items-center > span.text-gold-ink` — 11.5px — "Start anywhere" · all widths
  - `hidden > div.relative.overflow-hidden > p.pointer-events-none.absolute` — 10px — "© OpenStreetMap contributors" · all widths
  - `low-hidden > div.pointer-events-none.absolute > p.mt-1.5.leading-tight` — 13px — "hospitals and cancer centres across Berkshire & Oxford" · all widths
- **20 distinct text styles** on one page — `14px, 14px, 12px, 18px, 20px, 15px…`

### `/locations`

- **Text below the readable minimum** — 1
  - `iv.sticky.top-0 > div.relative.w-full > p.pointer-events-none.absolute` — 9px — "Source: Office for National Statistics licensed under the Op" · all widths
- **11 distinct text styles** on one page — `14px, 12px, 18px, 20.8px, 24px, 9px…`

### `/patients`

- **14 distinct text styles** on one page — `14px, 15px, 14px, 18px, 17px, 24px…`

### `/privacy`

- **11 distinct text styles** on one page — `14px, 15px, 20px, 24px, 12px, 14px…`

### `/resources`

- **Text below the readable minimum** — 4
  - `div.mx-auto.mt-8 > div.px-2.pb-3 > div.flex.items-center > span` — 11.5px — "Suggested searches" · all widths
  - `auto.mt-8 > div.px-2.pb-3 > div.flex.items-center > span.text-gold-ink` — 11.5px — "Start anywhere" · all widths
  - `hidden > div.relative.overflow-hidden > p.pointer-events-none.absolute` — 10px — "© OpenStreetMap contributors" · all widths
  - `low-hidden > div.pointer-events-none.absolute > p.mt-1.5.leading-tight` — 13px — "hospitals and cancer centres across Berkshire & Oxford" · all widths
- **20 distinct text styles** on one page — `14px, 14px, 12px, 18px, 20px, 15px…`

### `/specialities`

- **Text below the readable minimum** — 9
  - `div.max-w-2xl > div.mt-8.border > div.px-1 > p.mt-1.text-xs` — 12px — "Enter a cancer type to see possible matches." · all widths
  - `.border-ink/15 > a.group.grid > div > span.tabular-nums.text-ink-muted` — 10px — "01" · all widths
  - `div.site-gutter.w-full > div.grid.w-full > div > p.mt-6.max-w-sm` — 12px — "This is general information, not a treatment recommendation." · all widths
  - `#treatment-accordion-0 > span.pt-1.tabular-nums` — 10px — "01" · all widths
  - `#treatment-accordion-1 > span.pt-1.tabular-nums` — 10px — "02" · all widths
  - `#treatment-accordion-2 > span.pt-1.tabular-nums` — 10px — "03" · all widths
  - `te.bottom-5 > div.flex.items-center > span.tabular-nums.text-ink-muted` — 10px — "01 / 06" · all widths
  - `elative.border > div.absolute.inset-0 > p.pointer-events-none.absolute` — 8px — "Source: Office for National Statistics licensed under the Op" · all widths
  - …and 1 more
- **18 distinct text styles** on one page — `14px, 18px, 11px, 12px, 12px, 24px…`

### `/specialities/bladder`

- **15 distinct text styles** on one page — `14px, 12px, 12px, 14px, 15px, 18px…`

### `/specialities/brain`

- **15 distinct text styles** on one page — `14px, 12px, 14px, 15px, 20px, 18px…`

### `/specialities/breast`

- **Text overlapping text** — 3
  - `#clinical-review > p.mt-2 > span > a.underline-offset-2` — "NICE NG101: Early and locally advanced b" over ";" (39%) · all widths
  - `#clinical-review > p.mt-2 > span > a.underline-offset-2` — "NICE NG101: Early and locally advanced b" over "NICE CG81: Advanced breast cancer: diagn" (39%) · all widths
  - `#clinical-review > p.mt-2 > span` — ";" over ";" (43%) · all widths
- **16 distinct text styles** on one page — `14px, 15px, 12px, 20px, 12px, 14px…`

### `/specialities/cancer-unknown-primary`

- **Text overlapping text** — 2
  - `#clinical-review > p.mt-2 > span > a.underline-offset-2` — "NICE CG104: Metastatic malignant disease" over ";" (43%) · all widths
  - `#clinical-review > p.mt-2 > span > a.underline-offset-2` — "NICE CG104: Metastatic malignant disease" over "Cancer Research UK: cancer of unknown pr" (43%) · 320/390/430px
- **16 distinct text styles** on one page — `14px, 15px, 12px, 20px, 14px, 18px…`

### `/specialities/colorectal`

- **15 distinct text styles** on one page — `14px, 12px, 14px, 15px, 18px, 20px…`

### `/specialities/gynaecology`

- **15 distinct text styles** on one page — `14px, 12px, 14px, 15px, 18px, 12px…`

### `/specialities/head-and-neck`

- **15 distinct text styles** on one page — `14px, 12px, 14px, 15px, 12px, 18px…`

### `/specialities/kidney`

- **15 distinct text styles** on one page — `14px, 12px, 12px, 14px, 15px, 18px…`

### `/specialities/liver`

- **15 distinct text styles** on one page — `14px, 12px, 14px, 15px, 18px, 20px…`

### `/specialities/lung`

- **15 distinct text styles** on one page — `14px, 12px, 14px, 15px, 20px, 18px…`

### `/specialities/lymphoma`

- **15 distinct text styles** on one page — `14px, 12px, 14px, 15px, 20px, 18px…`

### `/specialities/oesophagus`

- **15 distinct text styles** on one page — `14px, 12px, 14px, 15px, 18px, 20px…`

### `/specialities/pancreas`

- **15 distinct text styles** on one page — `14px, 12px, 14px, 15px, 18px, 20px…`

### `/specialities/prostate`

- **Text overlapping text** — 2
  - `#clinical-review > p.mt-2 > span > a.underline-offset-2` — "NICE NG131: Prostate cancer: diagnosis a" over ";" (43%) · all widths
  - `#clinical-review > p.mt-2 > span > a.underline-offset-2` — "NICE NG131: Prostate cancer: diagnosis a" over "Cancer Research UK: prostate cancer" (43%) · all widths
- **16 distinct text styles** on one page — `14px, 15px, 12px, 20px, 12px, 14px…`

### `/specialities/sarcoma`

- **14 distinct text styles** on one page — `14px, 14px, 12px, 15px, 18px, 20px…`

### `/specialities/skin`

- **15 distinct text styles** on one page — `14px, 12px, 14px, 15px, 18px, 20px…`

### `/specialities/stomach`

- **15 distinct text styles** on one page — `14px, 12px, 14px, 15px, 20px, 18px…`

### `/specialities/testicular`

- **15 distinct text styles** on one page — `14px, 12px, 14px, 12px, 15px, 18px…`

### `/tariffs`

- **Text overlapping text** — 1
  - `div > div.space-y-1.5.text-lg > p > a.inline-block.py-2.5` — "0118 959 8866" over "07928 888662" (29%) · all widths
- **12 distinct text styles** on one page — `14px, 18px, 14px, 18px, 12px, 44px…`

### `/terms`

- **11 distinct text styles** on one page — `14px, 15px, 24px, 12px, 20.8px, 36px…`

### `/treatments`

- **14 distinct text styles** on one page — `14px, 12px, 18px, 15px, 24px, 14px…`

### `/treatments/brachytherapy`

- **Text overlapping text** — 1
  - `lative.mx-auto > div.relative.overflow-hidden > span.absolute.bottom-3` — "Illustrative image" over "On this page" (86%) · all widths
- **15 distinct text styles** on one page — `14px, 14px, 24px, 17px, 18px, 44px…`

### `/treatments/chemotherapy`

- **Text overlapping text** — 1
  - `lative.mx-auto > div.relative.overflow-hidden > span.absolute.bottom-3` — "Illustrative image" over "On this page" (86%) · all widths
- **16 distinct text styles** on one page — `14px, 14px, 24px, 17px, 18px, 44px…`

### `/treatments/hormone-therapy`

- **Text overlapping text** — 1
  - `lative.mx-auto > div.relative.overflow-hidden > span.absolute.bottom-3` — "Illustrative image" over "On this page" (86%) · all widths
- **16 distinct text styles** on one page — `14px, 14px, 24px, 17px, 18px, 44px…`

### `/treatments/immunotherapy`

- **Text overlapping text** — 1
  - `lative.mx-auto > div.relative.overflow-hidden > span.absolute.bottom-3` — "Illustrative image" over "On this page" (86%) · all widths
- **16 distinct text styles** on one page — `14px, 14px, 24px, 17px, 18px, 44px…`

### `/treatments/radioisotope-therapy`

- **Text overlapping text** — 1
  - `lative.mx-auto > div.relative.overflow-hidden > span.absolute.bottom-3` — "Illustrative image" over "On this page" (86%) · all widths
- **16 distinct text styles** on one page — `14px, 14px, 24px, 17px, 18px, 44px…`

### `/treatments/radiotherapy`

- **Text overlapping text** — 1
  - `lative.mx-auto > div.relative.overflow-hidden > span.absolute.bottom-3` — "Illustrative image" over "On this page" (86%) · all widths
- **17 distinct text styles** on one page — `14px, 14px, 24px, 17px, 18px, 44px…`

### `/treatments/targeted-therapies`

- **Text overlapping text** — 1
  - `lative.mx-auto > div.relative.overflow-hidden > span.absolute.bottom-3` — "Illustrative image" over "On this page" (86%) · all widths
- **16 distinct text styles** on one page — `14px, 14px, 24px, 17px, 18px, 44px…`

### `/website-privacy`

- **11 distinct text styles** on one page — `14px, 15px, 24px, 12px, 20.8px, 14px…`
