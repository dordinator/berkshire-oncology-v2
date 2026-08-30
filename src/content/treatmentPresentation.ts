export interface TreatmentPresentation {
  hero: {
    src: string;
    alt: string;
    objectPosition?: string;
  };
  understandingHeadings: readonly [string, string, string];
}

const treatmentPresentation: Record<string, TreatmentPresentation> = {
  chemotherapy: {
    hero: {
      src: "/treatments/chemotherapy-consultation.webp",
      alt: "A consultant and patient speaking in a consultation room.",
      objectPosition: "20% center",
    },
    understandingHeadings: [
      "How chemotherapy works",
      "How chemotherapy is given",
      "How chemotherapy fits into treatment",
    ],
  },
  immunotherapy: {
    hero: {
      src: "/treatments/heroes/immunotherapy.jpg",
      alt: "A consultant speaking with a patient in a treatment lounge.",
    },
    understandingHeadings: [
      "How checkpoint inhibitors work",
      "How treatment is given",
      "Side effects to be aware of",
    ],
  },
  "targeted-therapies": {
    hero: {
      src: "/treatments/heroes/targeted-therapies.jpg",
      alt: "A consultant and patient looking at information together.",
    },
    understandingHeadings: [
      "How targeted therapies work",
      "Tests that guide treatment",
      "How treatment is given",
    ],
  },
  "hormone-therapy": {
    hero: {
      src: "/treatments/heroes/hormone-therapy.jpg",
      alt: "A consultant speaking with a patient in a consultation room.",
    },
    understandingHeadings: [
      "How hormone therapy works",
      "When hormone therapy is used",
      "Side effects and monitoring",
    ],
  },
  radiotherapy: {
    hero: {
      src: "/treatments/radiotherapy-conversation.jpg",
      alt: "A radiotherapy professional speaking with a patient in a treatment room.",
    },
    understandingHeadings: [
      "How external radiotherapy works",
      "How treatment is planned",
      "How the schedule is set",
    ],
  },
  brachytherapy: {
    hero: {
      src: "/treatments/heroes/brachytherapy.jpg",
      alt: "A radiotherapy specialist speaking with a patient in a treatment room.",
    },
    understandingHeadings: [
      "How brachytherapy works",
      "Temporary and permanent treatment",
      "When brachytherapy is used",
    ],
  },
  "radioisotope-therapy": {
    hero: {
      src: "/treatments/heroes/radioisotope-therapy.jpg",
      alt: "A nuclear medicine professional speaking with a patient.",
    },
    understandingHeadings: [
      "How radioisotope therapy works",
      "Different medicines target different cells",
      "Preparation and safety",
    ],
  },
};

export function getTreatmentPresentation(slug: string): TreatmentPresentation {
  const presentation = treatmentPresentation[slug];
  if (!presentation) {
    throw new Error(`Missing treatment presentation for ${slug}.`);
  }
  return presentation;
}
