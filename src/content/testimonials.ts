// ═══════════════════════════════════════════════════════════════════════════
// PLACEHOLDER CONTENT — NOT REAL PATIENT FEEDBACK. MUST NOT SHIP.
// ───────────────────────────────────────────────────────────────────────────
// Every quotation below is invented, to hold the shape of the section while it
// is designed. Nobody said any of this.
//
// Publishing invented patient testimonials would be a false claim about care
// given to real people, and on a medical site that is not a small thing. The
// section renders a visible notice for as long as PLACEHOLDER is true — leave
// that in place until real, attributable, consented quotations replace these.
//
// To go live:
//   1. Replace every entry with a real quotation the patient has agreed to
//      publish, in the form they agreed to (initials, first name, or full name).
//   2. Set PLACEHOLDER to false, which removes the notice.
//   3. Delete this banner.
//
// The quotations are deliberately about *process* — being seen quickly, having
// options explained, knowing whose name is on the case — and never about
// outcome. That is not squeamishness: a testimonial implying a clinical result
// is an outcome claim the practice cannot substantiate, and placeholder copy
// has a way of setting the template for the real thing.
// ═══════════════════════════════════════════════════════════════════════════

export const PLACEHOLDER = true;

export interface Testimonial {
  /** The quotation, without surrounding quote marks — the component adds them. */
  quote: string;
  /** How the patient is credited. */
  attribution: string;
}

/* TEMPORARY: eight image sets, switchable from the toggle in
   TestimonialCards. Each is four photographs meant to sit together, so the
   choice is a direction rather than four separate picks. Once one is chosen,
   keep its four files, delete the rest of public/testimonials/, and replace
   this with a plain path on each testimonial.

   All generated with Higgsfield Soul 2.0. Worth knowing what that means here:
   the people do not exist. That is safer than stock photographs of real people
   in one way — nobody real is being presented as a patient of this practice —
   and worse in another, because an invented face beside a quotation is still a
   depiction of a patient who did not sit for it. It holds while the quotations
   are placeholders. It should not survive them without a decision. */
export const IMAGE_SETS = [
  { id: "garden", name: "Garden", hint: "Cottage gardens, ferns, roses \u2014 quiet and English" },
  { id: "home", name: "Home light", hint: "Windows, armchairs, tea \u2014 domestic calm" },
  { id: "outdoors", name: "Outdoors", hint: "Coast path, woodland, park \u2014 air and movement" },
  { id: "together", name: "Together", hint: "Couples, daughters, grandchildren \u2014 companionship" },
  { id: "table", name: "Kitchen table", hint: "Ordinary life resumed \u2014 the least staged" },
  { id: "golden", name: "Golden hour", hint: "Warm low sun portraits \u2014 the most flattering" },
  { id: "hands", name: "Hands", hint: "Close crops, no faces \u2014 check the rings for artefacts" },
  { id: "window", name: "Windows", hint: "Thresholds and daylight \u2014 contemplative" },
] as const;

export type ImageSetId = (typeof IMAGE_SETS)[number]["id"];

export const DEFAULT_IMAGE_SET: ImageSetId = "garden";

/** public/testimonials/<set>-<1..4>.jpg */
export function imageFor(set: ImageSetId, index: number) {
  return `/testimonials/${set}-${index + 1}.jpg`;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "I saw the same consultant every time. He explained what the options were and what each one would ask of me, and then we decided together.",
    attribution: "Patient A, Reading",
  },
  {
    quote:
      "I was seen within a few days of my GP referral, and someone rang me afterwards to check I had understood what had been said.",
    attribution: "Patient B, Windsor",
  },
  {
    quote:
      "Nobody rushed me. I asked the same question three times in one appointment and got a straight answer three times.",
    attribution: "Patient C, Newbury",
  },
  {
    quote:
      "It mattered to know exactly who was in charge of my treatment, and to be able to reach them when I needed to.",
    attribution: "Patient D, Reading",
  },
];
