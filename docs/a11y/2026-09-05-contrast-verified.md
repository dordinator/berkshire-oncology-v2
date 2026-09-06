# Colour contrast — pixel verification

Source: `docs/a11y/2026-09-05-final.json`

axe reported **65 distinct elements** as failing SC 1.4.3.
Each was re-measured from a screenshot of itself, at every width axe flagged it at.

| | elements |
|---|---:|
| **Confirmed failures** | **0** |
| Cleared — pixels pass | 62 |
| Unverified | 3 |

axe resolves the backdrop from the DOM, which is not always the colour that
ends up behind the text. Where the two disagree, the pixels are what the
reader sees, and the pixels decide.

## Cleared

axe flagged these; the rendered pixels meet the threshold.

| Route | Element | axe said | Measured | Size |
|---|---|---|---|---|
| `/locations` | `.body-lg.max-w-xl.mt-6` | 2.82:1 on #fafbfc | 6.88:1 on #fafbfc | 18px |
| `/locations` | `.body-lg.max-w-xl.mt-5` | 2.82:1 on #fafbfc | 6.88:1 on #fafbfc | 18px |
| `/locations` | `.border-b` | 3.05:1 on #fafbfc | 6.88:1 on #fafbfc | 12px |
| `/locations` | `.grid-cols-\[6\.5rem_minmax\(0\,1fr\)\].gap-4.grid:nth-` | 3.44:1 on #fafbfc | 8.10:1 on #fafbfc | 14px |
| `/locations` | `.grid-cols-\[6\.5rem_minmax\(0\,1fr\)\].gap-4.grid:nth-` | 3.44:1 on #fafbfc | 8.10:1 on #fafbfc | 14px |
| `/locations` | `.gap-2.inline-flex.items-center:nth-child(3) > .decorat` | 4.39:1 on #fafbfc | 8.10:1 on #fafbfc | 14px |
| `/locations` | `.grid-cols-\[6\.5rem_minmax\(0\,1fr\)\].gap-4.border-in` | 4.39:1 on #fafbfc | 8.10:1 on #fafbfc | 14px |
| `/patients` | `.bg-sage-mist > .flex-col.flex-1.min-w-0 > div:nth-chil` | 2.09:1 on #f2f4f3 | 6.60:1 on #e2e7e4 | 17px |
| `/patients` | `.bg-sage-mist > .flex-col.flex-1.min-w-0 > .mt-12.md\:m` | 2.09:1 on #f2f4f3 | 6.60:1 on #e2e7e4 | 15px |
| `/patients` | `.bg-sage-mist > .flex-col.flex-1.min-w-0 > .mt-12.md\:m` | 2.09:1 on #f2f4f3 | 6.60:1 on #e2e7e4 | 15px |
| `/patients` | `.bg-sage-mist > .flex-col.flex-1.min-w-0 > .mt-12.md\:m` | 2.09:1 on #f2f4f3 | 6.60:1 on #e2e7e4 | 15px |
| `/patients` | `.hover\:bg-white\/30.focus-visible\:border-ink\/40[href` | 2.81:1 on #f2f4f3 | 13.30:1 on #e2e7e4 | 14px |
| `/patients` | `article[aria-labelledby="second-opinion-title"] > .flex` | 2.10:1 on #f3f6f9 | 6.70:1 on #e4eaf2 | 17px |
| `/patients` | `article[aria-labelledby="second-opinion-title"] > .flex` | 2.10:1 on #f3f6f9 | 6.70:1 on #e4eaf2 | 15px |
| `/patients` | `article[aria-labelledby="second-opinion-title"] > .flex` | 2.10:1 on #f3f6f9 | 6.70:1 on #e4eaf2 | 15px |
| `/patients` | `article[aria-labelledby="second-opinion-title"] > .flex` | 2.10:1 on #f3f6f9 | 6.70:1 on #e4eaf2 | 15px |
| `/patients` | `.hover\:bg-white\/30.focus-visible\:border-ink\/40[href` | 2.82:1 on #f3f6f9 | 13.74:1 on #e4eaf2 | 14px |
| `/patients` | `article[aria-labelledby="private-treatment-title"] > .f` | 2.11:1 on #f8f6f2 | 6.87:1 on #f0ece2 | 17px |
| `/patients` | `article[aria-labelledby="private-treatment-title"] > .f` | 2.11:1 on #f8f6f2 | 6.87:1 on #f0ece2 | 15px |
| `/patients` | `article[aria-labelledby="private-treatment-title"] > .f` | 2.11:1 on #f8f6f2 | 6.87:1 on #f0ece2 | 15px |
| `/patients` | `article[aria-labelledby="private-treatment-title"] > .f` | 2.11:1 on #f8f6f2 | 6.87:1 on #f0ece2 | 15px |
| `/patients` | `.hover\:bg-white\/30.focus-visible\:border-ink\/40[href` | 2.82:1 on #f8f6f2 | 14.10:1 on #f0ece2 | 14px |
| `/patients` | `article[aria-labelledby="receiving-treatment-title"] > ` | 2.10:1 on #f3f6f9 | 6.70:1 on #e4eaf2 | 17px |
| `/patients` | `article[aria-labelledby="receiving-treatment-title"] > ` | 2.10:1 on #f3f6f9 | 6.70:1 on #e4eaf2 | 15px |
| `/patients` | `article[aria-labelledby="receiving-treatment-title"] > ` | 2.10:1 on #f3f6f9 | 6.70:1 on #e4eaf2 | 15px |
| `/patients` | `article[aria-labelledby="receiving-treatment-title"] > ` | 2.10:1 on #f3f6f9 | 6.70:1 on #e4eaf2 | 15px |
| `/patients` | `article[aria-labelledby="receiving-treatment-title"] > ` | 2.82:1 on #f3f6f9 | 13.74:1 on #e4eaf2 | 14px |
| `/patients` | `article[aria-labelledby="supporting-someone-title"] > .` | 2.07:1 on #e8ebe9 | 5.87:1 on #cbd3ce | 17px |
| `/patients` | `article[aria-labelledby="supporting-someone-title"] > .` | 2.07:1 on #e8ebe9 | 5.87:1 on #cbd3ce | 15px |
| `/patients` | `article[aria-labelledby="supporting-someone-title"] > .` | 2.07:1 on #e8ebe9 | 5.87:1 on #cbd3ce | 15px |
| `/patients` | `article[aria-labelledby="supporting-someone-title"] > .` | 2.07:1 on #e8ebe9 | 5.87:1 on #cbd3ce | 15px |
| `/patients` | `article[aria-labelledby="supporting-someone-title"] > .` | 2.76:1 on #e8ebe9 | 10.89:1 on #cbd3ce | 14px |
| `/patients` | `.gap-4.px-3[href$="resources"] > .flex-1.min-w-0` | 2.93:1 on #f0f3f3 | 15.92:1 on #fbfaf5 | 15px |
| `/patients` | `a[href$="#first-appointment"] > .flex-1.min-w-0` | 2.93:1 on #f0f3f3 | 15.92:1 on #fbfaf5 | 15px |
| `/patients` | `#newly-diagnosed-title` | 2.81:1 on #f2f4f3 | 13.30:1 on #e2e7e4 | 48px |
| `/patients` | `#second-opinion-title` | 2.82:1 on #f3f6f9 | 13.74:1 on #e4eaf2 | 48px |
| `/patients` | `#private-treatment-title` | 2.82:1 on #f8f6f2 | 14.10:1 on #f0ece2 | 48px |
| `/patients` | `#receiving-treatment-title` | 2.82:1 on #f3f6f9 | 13.74:1 on #e4eaf2 | 48px |
| `/patients` | `#supporting-someone-title` | 2.76:1 on #e8ebe9 | 10.89:1 on #cbd3ce | 48px |
| `/patients` | `a[href$="#faqs"] > .flex-1.min-w-0` | 2.93:1 on #f0f3f3 | 15.92:1 on #fbfaf5 | 16px |
| `/patients` | `.pb-4 > .font-display.text-xl` | 2.93:1 on #f0f3f3 | 15.92:1 on #fbfaf5 | 20px |
| `/tariffs` | `#self-funding > .type-label.text-ink\/70` | 1.84:1 on #eef0ed | 5.67:1 on #e2e7e4 | 12px |
| `/tariffs` | `#self-funding > .tracking-tight.text-2xl.leading-tight` | 2.63:1 on #eef0ed | 13.30:1 on #e2e7e4 | 24px |
| `/tariffs` | `#self-funding > .max-w-md.type-body.mt-3` | 1.95:1 on #eef0ed | 6.60:1 on #e2e7e4 | 15px |
| `/tariffs` | `a[href$="#request"]` | 2.63:1 on #eef0ed | 13.30:1 on #e2e7e4 | 14px |
| `/tariffs` | `#insurance > .type-label.text-ink\/70` | 1.87:1 on #eff2f3 | 5.73:1 on #e4eaf2 | 12px |
| `/tariffs` | `#insurance > .tracking-tight.text-2xl.leading-tight` | 2.68:1 on #eff2f3 | 13.74:1 on #e4eaf2 | 24px |
| `/tariffs` | `#insurance > .max-w-md.type-body.mt-3` | 1.99:1 on #eff2f3 | 6.70:1 on #e4eaf2 | 15px |
| `/tariffs` | `a[href$="#shortfalls"]` | 2.68:1 on #eff2f3 | 13.74:1 on #e4eaf2 | 14px |
| `/tariffs` | `button[aria-controls="fees-faq-0"]` | 2.91:1 on #fbfbf9 | 16.64:1 on #ffffff | 18px |
| `/tariffs` | `button[aria-controls="fees-faq-1"]` | 2.91:1 on #fbfbf9 | 16.64:1 on #ffffff | 18px |
| `/tariffs` | `button[aria-controls="fees-faq-2"]` | 2.91:1 on #fbfbf9 | 16.64:1 on #ffffff | 18px |
| `/tariffs` | `button[aria-controls="fees-faq-3"]` | 2.91:1 on #fbfbf9 | 16.64:1 on #ffffff | 18px |
| `/tariffs` | `button[aria-controls="fees-faq-4"]` | 2.91:1 on #fbfbf9 | 16.64:1 on #ffffff | 18px |
| `/tariffs` | `.pb-12.md\:pt-32.lg\:grid-cols-\[minmax\(0\,0\.85fr\)_m` | 2.91:1 on #fbfbf9 | 16.64:1 on #ffffff | 18px |
| `/tariffs` | `.lg\:order-1 > .min-h-\[480px\].lg\:min-h-\[560px\].py-` | 2.91:1 on #fbfbf9 | 16.64:1 on #ffffff | 18px |
| `/tariffs` | `.pb-12.md\:pt-32.lg\:grid-cols-\[minmax\(0\,0\.85fr\)_m` | 2.91:1 on #fbfbf9 | 16.64:1 on #ffffff | 20px |
| `/tariffs` | `.pb-12.md\:pt-32.lg\:grid-cols-\[minmax\(0\,0\.85fr\)_m` | 2.91:1 on #fbfbf9 | 16.64:1 on #ffffff | 20px |
| `/tariffs` | `.lg\:order-1 > .min-h-\[480px\].lg\:min-h-\[560px\].py-` | 2.14:1 on #f0f3f8 | 7.13:1 on #ffffff | 12px |
| `/tariffs` | `.lg\:order-1 > .min-h-\[480px\].lg\:min-h-\[560px\].py-` | 3.01:1 on #f0f3f8 | 16.64:1 on #ffffff | 20px |
| `/tariffs` | `.lg\:order-1 > .min-h-\[480px\].lg\:min-h-\[560px\].py-` | 3.01:1 on #f0f3f8 | 16.64:1 on #ffffff | 20px |
| `/tariffs` | `.pb-12.md\:pt-32.lg\:grid-cols-\[minmax\(0\,0\.85fr\)_m` | 2.10:1 on #fbfbf9 | 7.13:1 on #ffffff | 12px |

## Unverified

Could not be captured; treated as outstanding, not as passing.

- `/locations` `.gap-2\.5` — element never reached full opacity (settled at 0.63)
- `/locations` `.grid-cols-\[6\.5rem_minmax\(0\,1fr\)\].gap-4.border-ink\/\[0\.07\]:nt` — element never reached full opacity (settled at 0.97)
- `/locations` `.grid-cols-\[6\.5rem_minmax\(0\,1fr\)\].gap-4.border-ink\/\[0\.07\]:nt` — element never reached full opacity (settled at 0.84)
