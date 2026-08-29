export interface TreatmentPresentation {
  hero: {
    src: string;
    alt: string;
    objectPosition?: string;
  };
  keyPoint: string;
}

const treatmentPresentation: Record<string, TreatmentPresentation> = {
  chemotherapy: {
    hero: {
      src: "/treatments/chemotherapy-consultation.png",
      alt: "Illustrative image of a consultant speaking with a patient in a consultation room.",
      objectPosition: "20% center",
    },
    keyPoint:
      "Chemotherapy acts on cells while they are dividing, so some healthy tissues that renew quickly can also be affected.",
  },
  immunotherapy: {
    hero: {
      src: "/treatments/heroes/immunotherapy.jpg",
      alt: "Illustrative image of a consultant discussing immunotherapy with a patient in a treatment lounge.",
    },
    keyPoint:
      "Checkpoint inhibitors can cause immune-related effects during treatment or afterwards, so new or worsening symptoms should be reported straight away.",
  },
  "targeted-therapies": {
    hero: {
      src: "/treatments/heroes/targeted-therapies.jpg",
      alt: "Illustrative image of a consultant and patient reviewing treatment information together.",
    },
    keyPoint:
      "Some targeted therapies depend on a particular feature in the cancer, so testing may form part of deciding whether a treatment is an option.",
  },
  "hormone-therapy": {
    hero: {
      src: "/treatments/heroes/hormone-therapy.jpg",
      alt: "Illustrative image of a consultant and patient discussing a long-term treatment plan.",
    },
    keyPoint:
      "Hormone therapy lowers hormone levels or blocks their effects; the type and length of treatment depend on the cancer and treatment aim.",
  },
  radiotherapy: {
    hero: {
      src: "/treatments/radiotherapy-conversation.jpg",
      alt: "Illustrative image of a radiotherapy professional speaking with a patient in a treatment room.",
    },
    keyPoint:
      "This page focuses on external beam radiotherapy. The treatment area, dose and schedule are planned for your individual situation.",
  },
  brachytherapy: {
    hero: {
      src: "/treatments/heroes/brachytherapy.jpg",
      alt: "Illustrative image of a radiotherapy specialist preparing a patient for a treatment-planning conversation.",
    },
    keyPoint:
      "Brachytherapy may use a temporary source that is removed, or permanent seeds whose radiation gradually fades. The pathway depends on the cancer and technique.",
  },
  "radioisotope-therapy": {
    hero: {
      src: "/treatments/heroes/radioisotope-therapy.jpg",
      alt: "Illustrative image of a nuclear medicine professional speaking with a patient before treatment.",
    },
    keyPoint:
      "Radioisotope therapy includes several different medicines, so preparation, delivery, follow-up and radiation-safety advice depend on the treatment prescribed.",
  },
};

export function getTreatmentPresentation(slug: string): TreatmentPresentation {
  const presentation = treatmentPresentation[slug];
  if (!presentation) {
    throw new Error(`Missing treatment presentation for ${slug}.`);
  }
  return presentation;
}
