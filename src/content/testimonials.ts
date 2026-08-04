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
  /** File in public/testimonials/. */
  image: string;
  /** Pexels photographer and photo id, for the record. */
  credit: string;
}

/* The photographs are Pexels — free for commercial use, no attribution
   required, though the credit is recorded below anyway. They are warm and
   vibrant on purpose, and the card scrim is neutral black rather than the
   site's navy so it fades them without tinting them blue.

   These are stock, and they are not the people quoted. That is a second reason
   the placeholder notice matters: a photograph beside a testimonial reads as a
   photograph of whoever said it. If real quotations arrive without consented
   photographs of the patients, this section should keep the images generic and
   say so, or drop them. */

export const testimonials: Testimonial[] = [
  {
    quote:
      "I saw the same consultant every time. He explained what the options were and what each one would ask of me, and then we decided together.",
    attribution: "Patient A, Reading",
    image: "/testimonials/couple-park.jpg",
    credit: "Caleb Oquendo / Pexels 7807597",
  },
  {
    quote:
      "I was seen within a few days of my GP referral, and someone rang me afterwards to check I had understood what had been said.",
    attribution: "Patient B, Windsor",
    image: "/testimonials/family.jpg",
    credit: "Rebeca Medeiros / Pexels 15795032",
  },
  {
    quote:
      "Nobody rushed me. I asked the same question three times in one appointment and got a straight answer three times.",
    attribution: "Patient C, Newbury",
    image: "/testimonials/woman-garden.jpg",
    credit: "Marcus Aurelius / Pexels 6787552",
  },
  {
    quote:
      "It mattered to know exactly who was in charge of my treatment, and to be able to reach them when I needed to.",
    attribution: "Patient D, Reading",
    image: "/testimonials/couple-gardening.jpg",
    credit: "Greta Hoffman / Pexels 7729131",
  },
];
