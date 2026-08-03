// ─────────────────────────────────────────────────────────────────────────────
// Where care is actually delivered.
//
// The partnership is ten independent consultants, not a hospital. Patients are
// seen and treated at host sites, and which site depends on what the treatment
// is — radiotherapy in particular only happens at two of them. Sending someone
// to the wrong building is the most damaging mistake this section can make, so
// every line below is taken from the host site's own published service list and
// carries its source. Nothing here is inferred.
//
// `locations.ts` still holds the practice-confirmed record and deliberately
// keeps `services` empty. This file is the researched, sourced view used to
// explain to a patient what usually happens where — the two are kept separate
// on purpose so the practice's own confirmation can overwrite it later.
// ─────────────────────────────────────────────────────────────────────────────

export type CareCapability =
  | "consultations"
  | "chemotherapy"
  | "radiotherapy"
  | "imaging"
  | "biopsy"
  | "wellbeing";

export interface CareSite {
  /** Matches a slug in locations.ts. */
  slug: string;
  name: string;
  area: string;
  capabilities: CareCapability[];
  /** Plain-English line about what this site is for. */
  summary: string;
  /** Notable specifics worth telling a patient before they travel. */
  detail: string[];
  nhs?: boolean;
  source: { label: string; url: string };
}

export const careSites: CareSite[] = [
  {
    slug: "spire-dunedin-reading",
    name: "Spire Dunedin Hospital",
    area: "Reading",
    capabilities: ["consultations", "chemotherapy", "imaging", "biopsy"],
    summary:
      "The partnership's main Reading base for outpatient appointments and drug treatment.",
    detail: [
      "A dedicated oncology unit where chemotherapy is given in individual treatment rooms.",
      "Cancer tests and scans, and a one-stop breast clinic.",
      "Holds the Macmillan Quality Environment Mark.",
      "No radiotherapy on this site.",
    ],
    source: {
      label: "Spire Dunedin Hospital — cancer investigations and treatments",
      url: "https://www.spirehealthcare.com/spire-dunedin-hospital/treatments/cancer-investigations-and-treatments/",
    },
  },
  {
    slug: "princess-margaret-windsor",
    name: "The Princess Margaret Hospital",
    area: "Windsor",
    capabilities: ["consultations", "chemotherapy", "imaging"],
    summary:
      "Outpatient appointments and day-unit chemotherapy for patients closer to Windsor, Maidenhead and Ascot.",
    detail: [
      "An oncology suite staffed by specialist nurses, run as a day unit.",
      "Scalp cooling is available during chemotherapy.",
      "On-site pharmacy working alongside the oncology team, and a rapid breast clinic.",
      "No radiotherapy on this site.",
    ],
    source: {
      label: "The Princess Margaret Hospital — private cancer care centre",
      url: "https://www.circlehealthgroup.co.uk/hospitals/the-princess-margaret-hospital/private-cancer-care-centre-windsor",
    },
  },
  {
    slug: "genesiscare-windsor",
    name: "GenesisCare Windsor",
    area: "Windsor",
    capabilities: [
      "consultations",
      "chemotherapy",
      "radiotherapy",
      "imaging",
      "biopsy",
      "wellbeing",
    ],
    summary:
      "The nearer of the two centres where private radiotherapy is delivered, alongside drug treatment and imaging.",
    detail: [
      "Radiotherapy including VMAT, surface-guided radiotherapy and deep inspiration breath hold.",
      "Chemotherapy, immunotherapy, hormone and targeted therapy.",
      "CT, MRI and PET-CT scanning, mammography and biopsy under ultrasound.",
      "Exercise medicine and Penny Brohn UK wellbeing support.",
    ],
    source: {
      label: "GenesisCare Windsor — centre services",
      url: "https://www.genesiscare.com/uk/our-centres/windsor",
    },
  },
  {
    slug: "genesiscare-oxford",
    name: "GenesisCare Oxford",
    area: "Oxford",
    capabilities: [
      "consultations",
      "chemotherapy",
      "radiotherapy",
      "imaging",
      "biopsy",
      "wellbeing",
    ],
    summary:
      "A further radiotherapy centre, used when its equipment suits the treatment plan better.",
    detail: [
      "Radiotherapy including MR Linac, stereotactic ablative radiotherapy (SABR), image-guided and surface-guided radiotherapy.",
      "Chemotherapy, hormone, immunotherapy and targeted therapy in private treatment suites.",
      "CT, MRI and PET-CT scanning, ultrasound and biopsy.",
    ],
    source: {
      label: "GenesisCare Oxford — centre services",
      url: "https://www.genesiscare.com/uk/our-centres/oxford",
    },
  },
  {
    slug: "royal-berkshire-hospital",
    name: "Royal Berkshire Hospital",
    area: "Reading",
    nhs: true,
    capabilities: ["chemotherapy", "radiotherapy", "imaging"],
    summary:
      "The NHS cancer centre where our consultants also hold posts. NHS care, not private treatment.",
    detail: [
      "The Berkshire Cancer Centre provides NHS radiotherapy, chemotherapy and palliative care.",
      "Four linear accelerators, brachytherapy and a Macmillan information centre.",
      "Relevant because most of our consultants work here too, so private and NHS care can be kept joined up.",
    ],
    source: {
      label: "Royal Berkshire NHS Foundation Trust — cancer services",
      url: "https://www.royalberkshire.nhs.uk/services-and-departments/cancer",
    },
  },
];

export const capabilityLabels: Record<CareCapability, string> = {
  consultations: "Consultations",
  chemotherapy: "Chemotherapy and drug treatment",
  radiotherapy: "Radiotherapy",
  imaging: "Scans and imaging",
  biopsy: "Biopsy",
  wellbeing: "Wellbeing and exercise support",
};

export function sitesWith(capability: CareCapability): CareSite[] {
  return careSites.filter((s) => !s.nhs && s.capabilities.includes(capability));
}

/** Private sites only — the NHS trust is listed separately and never offered
 *  as somewhere a patient can choose to have private treatment. */
export const privateCareSites = careSites.filter((s) => !s.nhs);
