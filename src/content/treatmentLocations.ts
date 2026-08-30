import { locations, type Location } from "@/content/locations";

// ─────────────────────────────────────────────────────────────────────────────
// Where each treatment is delivered — researched 2026-08, official sources
// only. DRAFT: the whole map needs the practice's sign-off before launch.
//
// The bar for a claim here is the operator's or the practice's OWN published
// page saying so. Where no official page states a location for a treatment,
// this file says nothing and the UI falls back to honest generic wording —
// it never guesses.
//
// Sources consulted:
//   • berkshire-oncology.org.uk (the practice's own site) — the partnership
//     treats with "chemotherapy, radiotherapy, biological and immunotherapy,
//     hormone treatment, therapeutic radioisotopes", plus brachytherapy;
//     lists the same five practising locations as this site; brachytherapy is
//     carried by Dr Helen O'Donnell and Dr Paul Rogers ("Prostate
//     Brachytherapy"), therapeutic radioisotopes by Dr Nicola Dallas and
//     Dr Paul Rogers. All members hold NHS posts at the Royal Berkshire.
//   • genesiscare.com/uk/our-centres/windsor — "Radiotherapy" (VMAT, SGRT,
//     DIBH, prostate spacers), "Chemotherapy & Systemic Anti-cancer
//     Therapy", "Theranostics".
//   • genesiscare.com/uk/our-centres/oxford — advanced radiotherapy
//     including the MR Linac, IGRT, SABR, VMAT, DIBH; "Chemotherapy &
//     Systemic Anti-cancer Therapy" — the centre's own wording covers
//     "chemotherapy, hormone therapy, immunotherapy and targeted therapy".
//   • spirehealthcare.com/spire-dunedin-hospital — cancer investigations and
//     treatments; chemotherapy in the hospital's A-Z. No radiotherapy.
//   • circlehealthgroup.co.uk — The Princess Margaret Hospital's oncology
//     suite "delivering a wide range of chemotherapy treatments and regimes"
//     under consultant oncologists. Day-care unit. No radiotherapy.
//   • royalberkshire.nhs.uk — the trust "supplies chemotherapy, radiotherapy,
//     and palliative care services" (the consultants' NHS base).
//
// Deliberately NOT claimed, because no official page states it:
//   • A location for brachytherapy — the practice names the treatment and
//     its consultants, but no operator page says where it happens.
//   • Radioisotope therapy at GenesisCare Oxford (only Windsor lists
//     Theranostics).
//   • Radiotherapy at Spire Dunedin or the Princess Margaret.
// ─────────────────────────────────────────────────────────────────────────────

/** Which location slugs deliver each therapy, with the operator's own label
 *  for what happens there. Keyed by therapy slug. */
export const therapyLocationMap: Record<
  string,
  { slug: string; note: string }[]
> = {
  chemotherapy: [
    { slug: "spire-dunedin-reading", note: "Chemotherapy day treatment" },
    { slug: "princess-margaret-windsor", note: "Consultant-led oncology suite" },
    { slug: "genesiscare-windsor", note: "Chemotherapy and systemic therapy" },
    { slug: "genesiscare-oxford", note: "Chemotherapy and systemic therapy" },
    { slug: "royal-berkshire-hospital", note: "NHS chemotherapy services" },
  ],
  // The three other drug treatments are delivered as systemic anti-cancer
  // therapy. GenesisCare's own wording covers all four by name; the Spire
  // and Circle pages say "chemotherapy", so those two are not claimed here.
  immunotherapy: [
    { slug: "genesiscare-windsor", note: "Systemic anti-cancer therapy" },
    { slug: "genesiscare-oxford", note: "Immunotherapy" },
  ],
  "targeted-therapies": [
    { slug: "genesiscare-windsor", note: "Systemic anti-cancer therapy" },
    { slug: "genesiscare-oxford", note: "Targeted therapy" },
  ],
  "hormone-therapy": [
    { slug: "genesiscare-windsor", note: "Systemic anti-cancer therapy" },
    { slug: "genesiscare-oxford", note: "Hormone therapy" },
  ],
  radiotherapy: [
    { slug: "genesiscare-windsor", note: "External beam radiotherapy services" },
    { slug: "genesiscare-oxford", note: "External beam radiotherapy services" },
    { slug: "royal-berkshire-hospital", note: "NHS radiotherapy services" },
  ],
  // Brachytherapy: treatment and consultants confirmed by the practice's own
  // site; no operator page states a delivery location, so none is listed and
  // the UI shows the generic fallback.
  brachytherapy: [],
  "radioisotope-therapy": [
    { slug: "genesiscare-windsor", note: "Radioisotope treatment" },
  ],
};

/** Shown when a therapy has no officially-stated locations. */
export const locationFallback =
  "The treatment location depends on what is planned for you. Your consultant will confirm where treatment will take place.";

export function getLocationsForTherapy(
  slug: string
): { location: Location; note: string }[] {
  const rows = therapyLocationMap[slug] ?? [];
  return rows.flatMap((row) => {
    const location = locations.find((l) => l.slug === row.slug);
    return location ? [{ location, note: row.note }] : [];
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Proton beam therapy & national referrals — DRAFT COPY for practice
// sign-off. NHS proton beam therapy is a national service delivered at
// University College London Hospitals and The Christie in Manchester, with
// referral through national panels — not something any partnership location
// provides. The wording below makes no promise beyond "ask your consultant".
// ─────────────────────────────────────────────────────────────────────────────

export const protonReferral = {
  id: "proton-referrals",
  label: "Proton beam therapy and national referrals",
  title: "Specialist treatments elsewhere",
  summary:
    "Some treatments are provided through national specialist centres.",
  body: [
    "Proton beam therapy and certain other treatments are provided through national NHS specialist centres. National clinical panels assess referrals.",
    "Your consultant will explain what a specialist treatment involves and how referral works when it applies to your diagnosis.",
  ],
  note: "Berkshire Oncology does not provide proton beam therapy at the hospitals listed on this site.",
};
