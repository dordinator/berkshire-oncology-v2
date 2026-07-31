import { modalitiesByConsultant } from "./modalities";
import { consultants } from "./consultants";
import type { Slug } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Treatment modalities as their own pages (/treatments/*).
//
// Note the distinction from ./treatments.ts, which is the consultant↔cancer-type
// edge list. This module is about the therapies themselves.
//
// `matches` holds the exact modality wording each consultant lists on their own
// profile. We only ever claim a consultant provides a treatment when their own
// listed wording says so, and we show that wording alongside their name rather
// than paraphrasing it — an oncology site is the wrong place to infer clinical
// scope. Where a mapping cannot be made honestly, `matches` is empty and the
// page says the detail is being confirmed with the consultants.
// ─────────────────────────────────────────────────────────────────────────────

export interface Therapy {
  slug: string;
  title: string;
  /** Short plain-English description used on cards and in search. */
  summary: string;
  /** Modality strings, verbatim from modalities.ts, that count as this therapy. */
  matches: string[];
  /** Rendered when there is no honest automatic mapping. */
  note?: string;
  /** Related therapy slugs, for cross-linking. */
  related?: string[];
}

export const therapies: Therapy[] = [
  {
    slug: "chemotherapy",
    title: "Chemotherapy",
    summary:
      "Drug treatment that targets rapidly dividing cells, given in cycles over a planned course.",
    matches: ["Chemotherapy"],
    related: ["immunotherapy", "systemic-anti-cancer-treatment"],
  },
  {
    slug: "immunotherapy",
    title: "Immunotherapy",
    summary:
      "Treatment that helps the body's own immune system recognise and act against cancer cells.",
    matches: ["Immunotherapy", "Biological and immunotherapy"],
    related: ["targeted-therapies", "systemic-anti-cancer-treatment"],
  },
  {
    slug: "targeted-therapies",
    title: "Targeted therapies",
    summary:
      "Drugs designed to act on specific features of a cancer cell rather than on dividing cells generally.",
    // "Biological and immunotherapy" is deliberately NOT matched here. Seven
    // consultants list that phrase, and it already maps to Immunotherapy above;
    // reading it as targeted therapy as well would be our inference, not their
    // wording. Only "Targeted and endocrine treatments" says it outright.
    matches: ["Targeted and endocrine treatments"],
    note: "Several of our consultants describe this treatment under other wording, such as 'biological and immunotherapy'. Which of them provide targeted therapies is being confirmed with the partnership before it is listed here.",
    related: ["immunotherapy", "hormone-therapy"],
  },
  {
    slug: "hormone-therapy",
    title: "Hormone therapy",
    summary:
      "Treatment that blocks or lowers the hormones some cancers depend on to grow.",
    matches: ["Hormone treatment", "Hormone therapy", "Targeted and endocrine treatments"],
    related: ["targeted-therapies", "chemotherapy"],
  },
  {
    slug: "systemic-anti-cancer-treatment",
    title: "Systemic anti-cancer treatment",
    summary:
      "SACT is the umbrella term for drug treatments that travel through the whole body — chemotherapy, immunotherapy, targeted and hormone therapies.",
    matches: ["Systemic therapy"],
    note: "SACT is an umbrella term rather than a single treatment. For the consultants who provide each type, see the individual treatment pages.",
    related: ["chemotherapy", "immunotherapy", "targeted-therapies", "hormone-therapy"],
  },
  {
    slug: "radiotherapy",
    title: "Radiotherapy",
    summary:
      "Carefully targeted radiation delivered in planned doses, usually over a series of short daily appointments.",
    matches: ["Radiotherapy"],
    related: ["brachytherapy", "palliative-radiotherapy"],
  },
  {
    slug: "brachytherapy",
    title: "Brachytherapy",
    summary:
      "Radiotherapy delivered from a source placed inside the body, close to the tumour.",
    matches: ["Brachytherapy", "Prostate brachytherapy"],
    related: ["radiotherapy"],
  },
  {
    slug: "radioisotope-therapy",
    title: "Radioisotope therapy",
    summary:
      "A radioactive medicine, given by injection or by mouth, that treats cancer from within the body.",
    matches: ["Therapeutic radioisotopes", "Radio-isotope therapy"],
    related: ["radiotherapy"],
  },
  {
    slug: "palliative-radiotherapy",
    title: "Palliative radiotherapy",
    summary:
      "Radiotherapy given to relieve symptoms such as pain or pressure, rather than to cure.",
    matches: [],
    note: "Which consultants offer palliative radiotherapy is being confirmed with the partnership before it is published here.",
    related: ["radiotherapy"],
  },
  {
    slug: "clinical-trials",
    title: "Clinical trials and research",
    summary:
      "Research studies that test new treatments, and the research our consultants take part in.",
    matches: [],
    note: "Trial availability changes constantly. Ask your consultant whether a trial may be suitable for you.",
    related: [],
  },
];

const therapyBySlug = new Map(therapies.map((t) => [t.slug, t]));

export function getTherapy(slug: string): Therapy | undefined {
  return therapyBySlug.get(slug);
}

export interface TherapyConsultant {
  slug: Slug;
  name: string;
  role?: string;
  shortRole?: string;
  photo?: string;
  /** The consultant's own wording for this treatment, shown verbatim. */
  listedAs: string[];
}

/** Consultants whose own listed modalities include this therapy. */
export function getConsultantsForTherapy(slug: string): TherapyConsultant[] {
  const therapy = therapyBySlug.get(slug);
  if (!therapy || therapy.matches.length === 0) return [];

  const out: TherapyConsultant[] = [];
  for (const c of consultants) {
    const listed = modalitiesByConsultant[c.slug];
    if (!listed) continue;
    const listedAs = listed.filter((m) => therapy.matches.includes(m));
    if (listedAs.length === 0) continue;
    out.push({
      slug: c.slug,
      name: c.name,
      role: c.role,
      shortRole: c.shortRole,
      photo: c.photo,
      listedAs,
    });
  }
  return out;
}

/** Therapies a given consultant lists, for the reverse view. */
export function getTherapiesForConsultant(slug: Slug): Therapy[] {
  const listed = modalitiesByConsultant[slug];
  if (!listed) return [];
  return therapies.filter((t) => t.matches.some((m) => listed.includes(m)));
}
