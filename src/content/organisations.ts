import { usefulLinks } from "./usefulLinks";
import type { UsefulLink } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// The recommended organisations, grouped, with a line saying why each might
// help. The Resources page uses the same data for its search results and its
// scrolling directory, so the two cannot drift apart.
//
// WHAT A "reason" IS ALLOWED TO BE.
// This is a medical site and these are other people's organisations, so nothing
// below is invented. Each line is one of three things:
//   1. The published remit of a national charity, which is a matter of public
//      record (Macmillan, Cancer Research UK).
//   2. Derived from the organisation's own name as it already appears in
//      usefulLinks.ts — "Healthcare at Home", "Reading Urology Partnership".
//   3. Carried by the group heading rather than the row, which is how the five
//      treatment sites are handled: hospitals.ts records that these are where
//      the partnership's consultants provide services, and nothing further is
//      claimed about any individual site.
//
// What is deliberately NOT here: which site does chemotherapy, which does
// radiotherapy, opening hours, waiting times, or any judgement between them.
// locations.ts already refuses to state per-site services for the same reason —
// "getting it wrong would send a patient to the wrong building".
// ─────────────────────────────────────────────────────────────────────────────

export type OrganisationGroup = {
  id: string;
  title: string;
  /** Why every organisation in this group might help, when the row shouldn't
   *  claim something specific on its own behalf. */
  note: string;
  entries: { link: UsefulLink; reason?: string }[];
};

/** Looks a link up by the name already recorded in usefulLinks.ts, so this file
 *  cannot drift from the source of truth or silently drop an organisation. */
function byName(name: string): UsefulLink {
  const found = usefulLinks.find((l) => l.name === name);
  if (!found) throw new Error(`organisations.ts: no useful link named "${name}"`);
  return found;
}

export const organisationGroups: OrganisationGroup[] = [
  {
    id: "information-and-support",
    title: "Information and support",
    note: "National organisations offering cancer information and practical support, plus services that may be arranged as part of your care.",
    entries: [
      {
        link: byName("Macmillan Cancer Support"),
        reason:
          "Practical, financial and emotional support, including a free support line and help with benefits.",
      },
      {
        link: byName("Cancer Research UK"),
        reason:
          "Information about cancer types, tests, treatments and clinical trials.",
      },
      {
        link: byName("NHS cancer information"),
        reason:
          "Official NHS information about symptoms, cancer types and common treatments.",
      },
      {
        link: byName("Maggie’s"),
        reason:
          "Free practical, emotional and social support for people with cancer, their family and friends.",
      },
      {
        link: byName("Cancer Care Map"),
        reason:
          "A searchable UK directory of cancer support services near you.",
      },
      {
        link: byName("Healthcare at Home (Sciensus)"),
        reason:
          "Medicines and cancer care at home when arranged by your care team.",
      },
    ],
  },
  {
    id: "where-you-may-be-treated",
    title: "Where you may be treated",
    note: "The hospitals and centres our consultants provide private oncology services from, plus the NHS trust most of them also hold posts at. Which site you are seen at depends on your consultant and your treatment — the practice will tell you.",
    entries: [
      { link: byName("Spire Dunedin Hospital, Reading") },
      { link: byName("Princess Margaret Hospital, Windsor") },
      { link: byName("GenesisCare, Oxford") },
      { link: byName("GenesisCare, Windsor") },
      { link: byName("Royal Berkshire Hospital, Reading") },
    ],
  },
  {
    id: "other-services",
    title: "Specialist services",
    note: "A specialist external service patients may ask us about.",
    entries: [
      {
        link: byName("The Forbury Clinic (Reading Urology Partnership)"),
        reason: "The Reading Urology Partnership's own clinic.",
      },
    ],
  },
];

/** "https://www.macmillan.org.uk" → "macmillan.org.uk" */
export function domain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
