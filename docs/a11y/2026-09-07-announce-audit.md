# What a screen reader is handed, mid-interaction

Base: `http://localhost:3210`

The tree audit reads each route at rest. This drives the interactive parts
and records what is announced after every action.

**This models a screen reader; it is not one.** Real AT differs in order and
verbosity, and nothing here judges whether the wording is *good*. It catches
regressions, not bad design.

| | |
|---|---:|
| Journeys run | 3 |
| Journeys skipped | 1 |
| **Findings** | **0** |

## Skipped

A journey that never found its widget proves nothing. These did not run:

- **treatments disclosure** — could not move focus to the control (page re-rendered or focus is held elsewhere)

## Focus lost to the page body

Focus stayed on a real control through every step.

## Live regions that announced nothing

Every live-region update carried text.

## aria-activedescendant pointing nowhere

Every activedescendant resolved to a rendered element.

## Disclosure state that never changed

Every disclosure flipped aria-expanded when activated.

## Names with two words run together

No accessible name fused two words.

## Focus stops with no name

Every focus stop announced what it was.

## Transcripts

What a listener would hear, step by step.

### site search

| Step | Focus announces | Active option | Live region says |
|---|---|---|---|
| open search | Search the site, combobox, expanded | Find a consultant Ten independent consultant oncologists. Find the right one by cancer type, by treatment, or browse every profile. | — |
| focus lands in the field | Search the site, combobox, expanded | Find a consultant Ten independent consultant oncologists. Find the right one by cancer type, by treatment, or browse every profile. | — |
| type "breast" | Search the site, combobox, expanded | Breast Cancer Consultants, treatments and appointments for breast cancer. | 1 result for breast. |
| arrow to first result | Search the site, combobox, expanded | Breast Cancer Consultants, treatments and appointments for breast cancer. | — |
| arrow to second result | Search the site, combobox, expanded | Breast Cancer Consultants, treatments and appointments for breast cancer. | — |
| escape closes | Search this site, button | — | — |

### fees disclosure

| Step | Focus announces | Active option | Live region says |
|---|---|---|---|
| focus the control | What is a shortfall?, button, collapsed | — | — |
| activate it | What is a shortfall?, button, expanded | — | — |
| activate again | What is a shortfall?, button, collapsed | — | — |

### treatments disclosure

| Step | Focus announces | Active option | Live region says |
|---|---|---|---|
| focus the control | Search this site, button | — | — |

### mobile navigation

| Step | Focus announces | Active option | Live region says |
|---|---|---|---|
| open the menu | Site menu, dialog | — | — |
| escape closes it | Open menu, button, collapsed | — | — |
