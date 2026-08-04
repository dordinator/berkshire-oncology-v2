import { getAllConsultants } from "./queries";
import { site } from "./site";

// ─────────────────────────────────────────────────────────────────────────────
// The checkable facts behind "Quality and governance".
//
// Lifted out of the home page, which is where these were written and where they
// were the only copy on the site. They live here rather than in the page so the
// counts stay derived from the consultant data — an eleventh consultant, or one
// who has not published disclosures, changes these sentences automatically.
//
// The distinction the copy is careful about: items 2, 3 and 5 are true of every
// licensed consultant and every registered independent hospital in the country.
// They are stated as general facts about UK practice, never dressed up as
// something this partnership does especially.
// ─────────────────────────────────────────────────────────────────────────────

const consultants = getAllConsultants();

const withGmc = consultants.filter((c) => c.gmc).length;
const withDisclosures = consultants.filter(
  (c) => c.disclosures && c.disclosures.length > 0,
).length;

const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
  "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
];

/** Small counts read better spelled out in running prose. */
function words(n: number) {
  return NUMBER_WORDS[n] ?? String(n);
}

const sentenceCase = (s: string) => s.replace(/^./, (c) => c.toUpperCase());

export interface GovernanceItem {
  t: string;
  d: string;
}

export const governance: GovernanceItem[] = [
  {
    t: "GMC registration",
    d: `All ${words(withGmc)} of our consultants hold full registration with a licence to practise and are on the GMC's Specialist Register. Every GMC number is published on the consultant's own profile, so the register can be searched independently.`,
  },
  {
    t: "Appraisal and revalidation",
    d: "Every licensed doctor in the UK is appraised annually against the GMC's Good Medical Practice and revalidates every five years on the recommendation of a Responsible Officer. Revalidation covers the whole of a doctor's practice, NHS and private alike.",
  },
  {
    t: "Multidisciplinary review",
    d: "Cancer treatment decisions are made in multidisciplinary team meetings, where surgeons, oncologists, radiologists, pathologists and specialist nurses review a case together. Our consultants take part in these MDTs through their NHS posts.",
  },
  {
    t: "Declarations of interest",
    d: `${sentenceCase(words(withDisclosures))} of our ${words(consultants.length)} consultants publish their professional and financial interests in full on their own profile — including industry relationships and investments. We would rather you read them than wonder about them.`,
  },
  {
    t: "Regulated premises",
    d: "Treatment is given at independent hospitals and cancer centres registered with and inspected by the Care Quality Commission, and at the Royal Berkshire Hospital. Every site's inspection reports are published by the CQC.",
  },
  {
    t: "Concerns and complaints",
    d: `A concern about your care should reach us directly and quickly. Our practice manager, ${site.contact.practiceManager}, is the first point of contact and will tell you how a complaint will be handled and by whom.`,
  },
];
