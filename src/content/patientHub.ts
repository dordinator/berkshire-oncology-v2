// ─────────────────────────────────────────────────────────────────────────────
// Copy for the patient hub at /patients.
//
// ⚠ APPROVAL NOTE: read before this page goes live.
//
// Everything here is deliberately restricted to what the site already states or
// to plain practical process. There are no timescales, no prices, no referral
// rules and no clinical statements, because none of those are recorded anywhere
// in this repository and inventing them on a cancer practice's front door would
// be indefensible. Wherever a real answer depends on the patient's insurer,
// hospital or diagnosis, the copy routes them to the practice team instead of
// guessing.
//
// The partnership will want to replace several of those hand-offs with real
// answers. Every one of them is marked NEEDS-APPROVAL below.
//
// Verified sources for the facts used here:
//   • ten partners, all holding NHS consultant posts at the Royal Berkshire
//     Hospital, appraised annually: src/app/page.tsx (existing home copy)
//   • the five locations: src/content/locations.ts
//   • tariff wording, quoted almost verbatim: src/app/tariffs/page.tsx
//   • contact details and practice manager: src/content/site.ts
// ─────────────────────────────────────────────────────────────────────────────

export interface Pathway {
  id: string;
  /** The sentence a patient recognises as their own situation. */
  label: string;
  /** One line, shown before the card is opened. */
  summary: string;
  /** Two or three calm sentences, shown when the card opens. */
  body: string[];
  /** Concrete, checkable things, not clinical advice. */
  points?: string[];
  action: { label: string; href: string };
}

export const pathways: Pathway[] = [
  {
    id: "diagnosed",
    label: "I have been diagnosed",
    summary:
      "You have had a diagnosis confirmed and want to see a consultant oncologist privately.",
    body: [
      "You do not need to have everything in order before you get in touch. Most people call us with a diagnosis, some paperwork and very little idea of what happens next, and that is a perfectly normal place to start from.",
      "The practice team will take some details, establish which of our consultants specialises in your diagnosis, and arrange an appointment with them.",
    ],
    points: [
      "Have your diagnosis to hand, along with any scans, reports or letters you have been given",
      "Tell us the name of the team currently looking after you, if there is one",
      "If you are insured, have your policy details nearby. Your insurer may need to authorise the appointment",
    ],
    action: { label: "Find a consultant by cancer type", href: "/specialities" },
  },
  {
    id: "second-opinion",
    label: "I need a second opinion",
    summary:
      "You have a diagnosis or a proposed plan and would like it reviewed independently.",
    body: [
      "Asking for a second opinion is a routine part of cancer care, not a criticism of the team you are already under. Our consultants regularly review diagnoses and treatment plans made elsewhere.",
      "A useful second opinion depends on the consultant being able to see what your current team has seen, so the practical work is mostly about getting your records and imaging across before the appointment. The practice team will talk you through what is needed.",
    ],
    points: [
      "Bring or forward your diagnosis, imaging, pathology reports and any treatment plan you have been given",
      "Tell us which hospital and which team hold your records",
      "Say clearly what you would like reviewed: the diagnosis, the proposed treatment, or both",
    ],
    action: { label: "Contact the practice", href: "/contact" },
  },
  {
    id: "understand-treatment",
    label: "I want to understand treatment",
    summary:
      "You are not ready to book anything. You want to understand the options first.",
    body: [
      "It is reasonable to want to know what a treatment involves before you decide anything, and reading about it beforehand is not a substitute for a consultation. It just means you arrive with better questions.",
      "The treatment pages set out what each approach involves in general terms. What is right for you depends on your diagnosis, and that conversation belongs in a consultation with a consultant who has seen your records.",
    ],
    points: [
      "The treatments section covers radiotherapy, chemotherapy, immunotherapy, hormone therapy, targeted therapies and more",
      "Each cancer type page lists the consultants who specialise in it",
      "Bring your questions to the first appointment. Writing them down beforehand helps",
    ],
    action: { label: "Explore treatments", href: "/treatments" },
  },
  {
    id: "arranging-private-care",
    label: "I am arranging private care",
    summary:
      "You know you want to be seen privately and need to know how it works and what it costs.",
    body: [
      "Private care with the partnership can be arranged whether you are funding it yourself or using private medical insurance. The two routes differ mainly in the paperwork that has to happen before your first appointment.",
      "Costs are set out on the tariffs pages. Tariffs are a guide only: self-funding packages are tailored to the individual, and insurance policies vary considerably in what they cover.",
    ],
    points: [
      "If you are insured, obtain a quote and authorisation from your insurer before treatment starts",
      "If you are funding treatment yourself, you will be given a comprehensive tariff before treatment begins",
      "Where an insurer does not settle an account in full, the shortfall is the patient's responsibility",
    ],
    action: { label: "Tariffs and fees", href: "/tariffs" },
  },
  {
    id: "support",
    label: "I need support",
    summary:
      "You are in treatment, or supporting someone who is, and need practical help.",
    body: [
      "Cancer treatment is not only a series of appointments. Side effects, money, work, travel and the wellbeing of the people around you all have to be managed at the same time, often by someone who is already exhausted.",
      "The resources section brings together the practical and emotional support available, including the national organisations we work alongside. If you are unsure who to ask about something, the practice team is a reasonable first call.",
    ],
    points: [
      "Support with side effects, appearance, fatigue and sleep",
      "Emotional support and counselling, for patients and for carers",
      "Financial and benefits advice, and support for families",
    ],
    action: { label: "Patient resources and support", href: "/resources" },
  },
];

// ── The journey, enquiry through follow-up ───────────────────────────────────
// Process only. No timescales. NEEDS-APPROVAL if the partnership wants to
// state how quickly patients are typically seen at any of these steps.
export interface JourneyStep {
  n: string;
  title: string;
  body: string;
}

export const journey: JourneyStep[] = [
  {
    n: "01",
    title: "Enquiry",
    body: "You contact the practice by phone, by email or through the enquiry form. We take some details about your diagnosis and your circumstances, and identify the consultant best placed to see you.",
  },
  {
    n: "02",
    title: "Consultation",
    body: "You meet your consultant at one of our locations. They will ask about your history and symptoms, examine you where that is appropriate, and explain how they see your situation.",
  },
  {
    n: "03",
    title: "Review of your records",
    body: "Your consultant reviews the imaging, pathology and correspondence from the teams who have already been involved. Where something is missing or a further test is needed, that is arranged.",
  },
  {
    n: "04",
    title: "Treatment planning",
    body: "Your consultant sets out the options, what each involves, and their recommendation. Nothing proceeds until you have had the chance to ask questions and agree the plan.",
  },
  {
    n: "05",
    title: "Treatment",
    body: "Treatment is delivered at the hospital or cancer centre appropriate to it, under your consultant's care, with the wider clinical team supporting you throughout.",
  },
  {
    n: "06",
    title: "Follow-up",
    body: "You remain under your consultant after treatment finishes, with review appointments and a route back to the practice if something changes in between.",
  },
];

// ── Frequently asked questions ───────────────────────────────────────────────
// Each answer either restates something the site already says, or hands over to
// the practice team. Answers marked NEEDS-APPROVAL are the ones the partnership
// will most likely want to replace with something more specific.
export interface Faq {
  q: string;
  a: string;
  link?: { label: string; href: string };
}

export const faqs: Faq[] = [
  {
    // NEEDS-APPROVAL: referral requirements by insurer/hospital are not recorded
    // anywhere in this repo, so this answer routes rather than states.
    q: "Do I need a referral from my GP?",
    a: "What is required varies between insurers and between hospitals, and your consultant may need clinical information before a first appointment. Rather than guess at your situation, call the practice team. They will tell you exactly what is needed in your case.",
  },
  {
    q: "Can I see a consultant privately if I am already under NHS care?",
    a: "Every partner also holds an NHS consultant post at the Royal Berkshire Hospital, so the partnership works across both. If you are currently under an NHS team and are considering being seen privately, speak to the practice team, who can explain how that works in your circumstances.",
  },
  {
    q: "Will I see a clinical oncologist or a medical oncologist?",
    a: "The partnership includes both. Which of them you see depends on your diagnosis and the treatment being considered, and the practice team will match you to the right consultant when you make your enquiry.",
  },
  {
    q: "What will private treatment cost?",
    a: "Tariffs are intended as a guide only. Each self-funding package is tailored to the individual, and anyone funding their own treatment is given a comprehensive tariff before that treatment starts. Insured patients are strongly advised to obtain a quote beforehand to confirm the cost is covered in full. Where an insurer does not settle an account in full, the shortfall is the patient's responsibility.",
  },
  {
    q: "Where will I be seen?",
    a: "Our consultants practise at Spire Dunedin Hospital in Reading, Princess Margaret Hospital in Windsor, and GenesisCare in Windsor and in Oxford. All partners also hold NHS consultant posts at the Royal Berkshire Hospital in Reading.",
  },
  {
    // NEEDS-APPROVAL: practical rather than clinical, but still worth a check.
    q: "What should I bring to my first appointment?",
    a: "Anything you already have that describes your diagnosis: scans, reports, clinic letters and a list of the medication you currently take. If you do not have these, come anyway. Your consultant can request them. Bringing someone with you, and a written list of your questions, is often more useful than people expect.",
  },
  {
    q: "Where can I find trusted cancer information and support?",
    a: "Our resources page links to established organisations offering cancer information and practical, emotional and financial support.",
    link: { label: "View trusted resources", href: "/resources" },
  },
];
