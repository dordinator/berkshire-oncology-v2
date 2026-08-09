import { getSection } from "./navigation";
import { organisationGroups } from "./organisations";

// ─────────────────────────────────────────────────────────────────────────────
// The resource library: nine sheets, one per area of the resources IA, for
// the scroll-stepped library on /resources.
//
// Labels, descriptions and destinations come from navigation.ts so the
// library cannot drift from the IA. The ROWS are hand-written here — like
// pathways.ts, the grouping of each area into two or three lettered entries
// with destinations is editorial judgement no other module encodes.
//
// WHAT A ROW IS ALLOWED TO LINK TO. This is a medical practice, not a medical
// resource (Dan's ruling on /treatments): rows point at practice business
// (consultants, locations, fees, contact, the patients pages) and at the
// independent organisations already recorded and verified in usefulLinks.ts /
// organisations.ts. Internal anchors below were all previously checked
// against a running server (see pathways.ts); the External organisations
// sheet is generated from organisationGroups so the two can never disagree.
// ─────────────────────────────────────────────────────────────────────────────

export type LibraryLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type LibraryRow = {
  /** The lettered badge: A, B, C. */
  key: string;
  title: string;
  blurb: string;
  links: LibraryLink[];
};

export type LibrarySheet = {
  num: string;
  id: string;
  group: "Information and guidance" | "Support";
  /** Short form for the index rail. */
  railLabel: string;
  title: string;
  intro: string;
  rows: LibraryRow[];
  /** The quiet boxed line under the rows, where one is warranted. */
  note?: string;
  cta?: { label: string; href: string };
};

const MACMILLAN = {
  label: "Macmillan Cancer Support",
  href: "https://www.macmillan.org.uk",
  external: true,
};
const CRUK = {
  label: "Cancer Research UK",
  href: "https://www.cancerresearchuk.org/about-cancer",
  external: true,
};

/** navigation.ts description for an area — the sheet intros reuse the IA's
 *  own words rather than restating them. */
function intro(href: string): string {
  const link = (getSection("resources")?.groups ?? [])
    .flatMap((g) => g.links)
    .find((l) => l.href === href);
  return link?.description ?? "";
}

export const librarySheets: LibrarySheet[] = [
  {
    num: "01",
    id: "cancer-information",
    group: "Information and guidance",
    railLabel: "Cancer information",
    title: "Cancer information",
    intro:
      "Clear information to help you understand the language, questions and possibilities around a diagnosis.",
    rows: [
      {
        key: "A",
        title: "Understanding your diagnosis",
        blurb:
          "Plain-English starting points for cancer types, staging and what they mean.",
        links: [
          { label: "Cancer types we treat", href: "/specialities" },
          { label: "Questions people ask first", href: "/patients#faqs" },
        ],
      },
      {
        key: "B",
        title: "Trusted information",
        blurb:
          "Two independent charities whose information pages we point patients to most often.",
        links: [CRUK, MACMILLAN],
      },
      {
        key: "C",
        title: "Talking it through",
        blurb:
          "Reading only goes so far — a consultant can put information in the context of your case.",
        links: [
          {
            label: "Find a consultant by cancer type",
            href: "/consultants/by-cancer-type",
          },
          { label: "Contact the practice", href: "/contact" },
        ],
      },
    ],
    note: "Information can help you prepare, but it cannot predict an individual pathway — your consultant can.",
    cta: {
      label: "Explore cancer information",
      href: "/resources/cancer-information",
    },
  },
  {
    num: "02",
    id: "treatment-preparation",
    group: "Information and guidance",
    railLabel: "Treatment preparation",
    title: "Treatment preparation",
    intro: intro("/resources/treatment-preparation"),
    rows: [
      {
        key: "A",
        title: "Before you start",
        blurb:
          "What the first appointment involves, and the treatments the partnership provides.",
        links: [
          { label: "Your first appointment", href: "/patients#first-appointment" },
          { label: "Treatments we provide", href: "/treatments" },
        ],
      },
      {
        key: "B",
        title: "On the day",
        blurb: "Where you'll be seen, and how private care works around you.",
        links: [
          { label: "Where you'll be seen", href: "/locations" },
          { label: "How private care works", href: "/patients#start-here" },
        ],
      },
      {
        key: "C",
        title: "Daily life during treatment",
        blurb:
          "Work, driving and the practical rhythm of life between appointments.",
        links: [
          { label: "Support during treatment", href: "/patients#support" },
          MACMILLAN,
        ],
      },
    ],
    note: "Your team will give you instructions specific to your treatment plan — if anything here seems to differ, follow theirs.",
    cta: {
      label: "Explore treatment preparation",
      href: "/resources/treatment-preparation",
    },
  },
  {
    num: "03",
    id: "managing-side-effects",
    group: "Information and guidance",
    railLabel: "Managing side effects",
    title: "Managing side effects",
    intro:
      "Practical guidance on what you may notice, what may help, and when to contact your treatment team.",
    rows: [
      {
        key: "A",
        title: "Common side effects",
        blurb:
          "What you may notice, what tends to help, and what to keep an eye on.",
        links: [
          {
            label: "If you’re already receiving treatment",
            href: "/patients/receiving-treatment",
          },
          CRUK,
        ],
      },
      {
        key: "B",
        title: "When to contact your team",
        blurb:
          "Know which symptoms to report, and how to get in touch with the practice.",
        links: [{ label: "Contact the practice", href: "/contact" }],
      },
      {
        key: "C",
        title: "Longer-term effects",
        blurb:
          "Some effects arrive later or linger — follow-up exists for exactly this.",
        links: [
          { label: "Support during treatment", href: "/patients#support" },
          MACMILLAN,
        ],
      },
    ],
    note: "If you feel suddenly or seriously unwell, use the contact details given to you by your treatment team.",
    cta: {
      label: "Explore side-effect guidance",
      href: "/resources/managing-side-effects",
    },
  },
  {
    num: "04",
    id: "patient-guides",
    group: "Information and guidance",
    railLabel: "Patient guides",
    title: "Patient guides",
    intro: intro("/resources/patient-guides"),
    rows: [
      {
        key: "A",
        title: "Appointment checklists",
        blurb: "Arrive with the questions you actually want answered.",
        links: [
          { label: "Your first appointment", href: "/patients#first-appointment" },
          { label: "Questions people ask first", href: "/patients#faqs" },
        ],
      },
      {
        key: "B",
        title: "Guides by treatment type",
        blurb:
          "Each treatment explained, with trusted further reading chosen by the partnership.",
        links: [{ label: "Treatments we provide", href: "/treatments" }],
      },
    ],
    note: "The downloadable guides are being prepared with the consultants — the pages linked here cover the same ground in the meantime.",
    cta: { label: "Explore patient guides", href: "/resources/patient-guides" },
  },
  {
    num: "05",
    id: "emotional-and-practical-support",
    group: "Support",
    railLabel: "Emotional & practical",
    title: "Emotional and practical support",
    intro:
      "Counselling, groups and practical help for the parts of life that treatment can affect.",
    rows: [
      {
        key: "A",
        title: "Someone to talk to",
        blurb:
          "Counselling, listening services and support lines — free to contact.",
        links: [
          MACMILLAN,
          { label: "Support during treatment", href: "/patients#support" },
        ],
      },
      {
        key: "B",
        title: "Practical help at home",
        blurb:
          "Some care and medicines can come to you rather than the other way round.",
        links: [
          {
            label: "Healthcare at Home (Sciensus)",
            href: "https://www.sciensus.com",
            external: true,
          },
        ],
      },
      {
        key: "C",
        title: "Appearance, fatigue and sleep",
        blurb:
          "The side of treatment that shows up in the mirror and the small hours.",
        links: [CRUK],
      },
    ],
    note: "Using support is not taking something away from the person who is ill.",
    cta: {
      label: "Explore emotional and practical support",
      href: "/resources/emotional-and-practical-support",
    },
  },
  {
    num: "06",
    id: "carers-and-families",
    group: "Support",
    railLabel: "Carers & families",
    title: "Carers and families",
    intro: intro("/resources/carers-and-families"),
    rows: [
      {
        key: "A",
        title: "Support available to carers",
        blurb:
          "Help for the people supporting someone through treatment — including you.",
        links: [
          {
            label: "I’m supporting someone with cancer",
            href: "/patients/supporting-someone",
          },
          MACMILLAN,
        ],
      },
      {
        key: "B",
        title: "Coming to an appointment",
        blurb:
          "Two sets of ears are better than one — what to expect if you come along.",
        links: [
          {
            label: "Coming with someone to an appointment",
            href: "/patients#first-appointment",
          },
        ],
      },
      {
        key: "C",
        title: "Looking after your own health",
        blurb: "Carrying someone else's illness is work. Support exists for it.",
        links: [
          {
            label: "Emotional and practical support",
            href: "/resources/emotional-and-practical-support",
          },
        ],
      },
    ],
    note: "Support is available for partners, relatives and friends too.",
    cta: {
      label: "Explore support for carers",
      href: "/resources/carers-and-families",
    },
  },
  {
    num: "07",
    id: "financial-and-benefits-advice",
    group: "Support",
    railLabel: "Financial & benefits",
    title: "Financial and benefits advice",
    intro: intro("/resources/financial-and-benefits-advice"),
    rows: [
      {
        key: "A",
        title: "Benefits and entitlements",
        // Only the remit organisations.ts records: practical and financial
        // support, help with benefits, free to contact. Nothing wider.
        blurb:
          "Practical and financial support, including help with benefits — free to contact.",
        links: [MACMILLAN],
      },
      {
        key: "B",
        title: "Fees, insurance and paying for care",
        blurb: "How private fees, insurance and self-funding work here.",
        links: [
          { label: "How fees and insurance work", href: "/tariffs#funding" },
          { label: "Fees and payment", href: "/tariffs" },
        ],
      },
      {
        key: "C",
        title: "Travel and getting there",
        blurb:
          "Where the partnership sees patients, and how to reach each site.",
        links: [{ label: "Where you’ll be seen", href: "/locations" }],
      },
    ],
    cta: {
      label: "Explore financial and benefits advice",
      href: "/resources/financial-and-benefits-advice",
    },
  },
  {
    num: "08",
    id: "external-organisations",
    group: "Support",
    railLabel: "External organisations",
    title: "External organisations",
    intro:
      "The organisations we most often point patients and families towards.",
    // Generated from organisations.ts so the sheet and the source of truth
    // can never disagree; the group note rides as the row blurb.
    rows: organisationGroups.map((g, i) => ({
      key: String.fromCharCode(65 + i),
      title: g.title,
      blurb: g.note,
      links: g.entries.map((e) => ({
        label: e.link.name,
        href: e.link.url,
        external: true,
      })),
    })),
    note: "All independent of Berkshire Oncology Partnership. Every link opens in a new tab.",
  },
  {
    num: "09",
    id: "news-and-updates",
    group: "Support",
    railLabel: "News & updates",
    title: "News and updates",
    intro: intro("/resources/news"),
    rows: [
      {
        key: "A",
        title: "From the practice",
        blurb:
          "Announcements, new services and consultant appointments will be published here.",
        links: [{ label: "Contact the practice", href: "/contact" }],
      },
    ],
    cta: { label: "Explore news and updates", href: "/resources/news" },
  },
];
