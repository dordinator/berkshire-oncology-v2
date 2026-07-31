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
  /** Confirmed by the practice — empty until then. */
  services: LocationService[];
  /** Whether this is an NHS site rather than a private one. */
  nhs?: boolean;
}

export const locations: Location[] = [
  {
    slug: "spire-dunedin-reading",
    name: "Spire Dunedin Hospital",
    area: "Reading",
    provider: "Spire Healthcare",
    url: "https://www.spirehealthcare.com/spire-dunedin-hospital",
    services: [],
  },
  {
    slug: "princess-margaret-windsor",
    name: "Princess Margaret Hospital",
    area: "Windsor",
    provider: "Circle Health Group",
    url: "https://www.circlehealthgroup.co.uk/hospitals/the-princess-margaret-hospital",
    services: [],
  },
  {
    slug: "genesiscare-windsor",
    name: "GenesisCare Windsor",
    area: "Windsor",
    provider: "GenesisCare",
    url: "https://www.genesiscare.co.uk/windsor",
    services: [],
  },
  {
    slug: "genesiscare-oxford",
    name: "GenesisCare Oxford",
    area: "Sandford, Oxford",
    provider: "GenesisCare",
    url: "https://www.genesiscare.co.uk/cancer-centre/oxford",
    services: [],
  },
  {
    slug: "royal-berkshire-hospital",
    name: "Royal Berkshire Hospital",
    area: "Reading",
    provider: "Royal Berkshire NHS Foundation Trust",
    url: "https://www.royalberkshire.nhs.uk",
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
