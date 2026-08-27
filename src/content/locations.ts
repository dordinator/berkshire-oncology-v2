import { hospitals } from "./hospitals";

// ─────────────────────────────────────────────────────────────────────────────
// The hospitals and centres the partnership practises from, as their own pages.
//
// `services` is deliberately left empty. The brief asks each location page to
// state whether the site is used for consultations, chemotherapy, radiotherapy,
// imaging or follow-up — but that is operational detail only the practice can
// confirm, and getting it wrong would send a patient to the wrong building. The
// scaffold shows the question; the practice supplies the answer.
// ─────────────────────────────────────────────────────────────────────────────

export type LocationService =
  | "Consultations"
  | "Chemotherapy"
  | "Radiotherapy"
  | "Imaging and diagnostics"
  | "Follow-up appointments";

export const allLocationServices: LocationService[] = [
  "Consultations",
  "Chemotherapy",
  "Radiotherapy",
  "Imaging and diagnostics",
  "Follow-up appointments",
];

export interface Location {
  slug: string;
  /** Full display name, e.g. "Spire Dunedin Hospital". */
  name: string;
  /** Town or area, e.g. "Reading". */
  area: string;
  /** Provider group, where it differs from the hospital name. */
  provider?: string;
  url?: string;
  /**
   * What the SITE publicly is, in the operator's own terms — a claim about
   * the building, checkable against `url`, never about which partnership
   * services run there (that is what `services` is for, and it stays empty
   * until the practice confirms it).
   */
  description?: string;
  /** The operator's own published address for the site. */
  address?: string;
  /** Confirmed by the practice — empty until then. */
  services: LocationService[];
  /** Whether this is an NHS site rather than a private one. */
  nhs?: boolean;
}

// ── On the GenesisCare URLs ──────────────────────────────────────────────────
// The two genesiscare.co.uk links that used to live here died when GenesisCare
// UK moved its web presence onto the global domain under /uk (the group split
// into separately governed UK/Australia/Spain businesses on emerging from
// Chapter 11 in February 2024 — the UK company itself neither closed nor
// renamed; both centres verified open, August 2026). The old domain's redirect
// drops the /uk/our-centres/ path segment, hence the cert error then 404.
//
// Addresses are the operators' own published wording, from the same pages as
// the descriptions. Two discrepancies to raise with the practice:
//   • GenesisCare Windsor: the operator publishes SL4 3HD, CQC's register has
//     SL4 3ES for the same centre at 69 Alma Road.
//   • Royal Berkshire: the trust's own page says Craven Road RG1 5LE; NHS.uk
//     and CQC use the older London Road RG1 5AN postal address. Same site —
//     it spans the block.
// ─────────────────────────────────────────────────────────────────────────────
export const locations: Location[] = [
  {
    slug: "spire-dunedin-reading",
    name: "Spire Dunedin Hospital",
    area: "Reading",
    provider: "Spire Healthcare",
    url: "https://www.spirehealthcare.com/spire-dunedin-hospital",
    description:
      "A private hospital on Bath Road run by Spire Healthcare. It has outpatient consulting rooms, diagnostic imaging including MRI, a one-stop breast clinic, and cancer investigation and treatment services.",
    address: "16 Bath Road, Reading RG1 6NS",
    services: [],
  },
  {
    slug: "princess-margaret-windsor",
    name: "Princess Margaret Hospital",
    area: "Windsor",
    provider: "Circle Health Group",
    url: "https://www.circlehealthgroup.co.uk/hospitals/the-princess-margaret-hospital",
    description:
      "A private hospital in central Windsor with inpatient beds, operating theatres and diagnostic imaging, including X-ray, MRI and mammography. Circle Health Group also lists an oncology centre at the hospital.",
    address: "Osborne Road, Windsor SL4 3SJ",
    services: [],
  },
  {
    slug: "genesiscare-windsor",
    name: "GenesisCare Windsor",
    area: "Windsor",
    provider: "GenesisCare",
    url: "https://www.genesiscare.com/uk/our-centres/windsor",
    description:
      "A purpose-built specialist outpatient cancer centre on Alma Road, offering advanced radiotherapy, chemotherapy and systemic anti-cancer therapy, with on-site diagnostics including PET-CT and MRI.",
    address: "69 Alma Road, Windsor SL4 3HD",
    services: [],
  },
  {
    slug: "genesiscare-oxford",
    name: "GenesisCare Oxford",
    // Formerly listed here as "Sandford, Oxford" — the operator's own page
    // uses neither "Sandford" nor "Littlemore", so nor do we.
    area: "Oxford",
    provider: "GenesisCare",
    url: "https://www.genesiscare.com/uk/our-centres/oxford",
    description:
      "A specialist outpatient cancer and radiotherapy centre south of Oxford. It offers advanced radiotherapy, including treatment using an MR Linac, as well as chemotherapy, systemic anti-cancer therapy and diagnostic services.",
    address: "Peters Way, Sandy Lane West, Oxford OX4 6LB",
    services: [],
  },
  {
    slug: "royal-berkshire-hospital",
    name: "Royal Berkshire Hospital",
    area: "Reading",
    provider: "Royal Berkshire NHS Foundation Trust",
    url: "https://www.royalberkshire.nhs.uk/our-locations/royal-berkshire-hospital",
    description:
      "The main NHS acute hospital of the Royal Berkshire NHS Foundation Trust. It is the trust's largest hospital and provides acute and specialist care for West Berkshire, including cancer services.",
    address: "Craven Road, Reading RG1 5LE",
    services: [],
    nhs: true,
  },
];

const locationBySlug = new Map(locations.map((l) => [l.slug, l]));

export function getLocation(slug: string): Location | undefined {
  return locationBySlug.get(slug);
}

/** Sanity check that every hospital in hospitals.ts has a location page. */
export function unmappedHospitals(): string[] {
  return hospitals
    .filter((h) => !locations.some((l) => l.name.startsWith(h.name)))
    .map((h) => `${h.name}, ${h.location}`);
}
