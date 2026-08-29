import type { Approach } from "./cancerInfo";
import type { Slug } from "./types";

export interface CancerTreatmentGuide {
  slug: Slug;
  intro: string;
  approaches: Approach[];
  sources: { label: string; url: string }[];
  reviewedBy?: string;
  reviewedOn?: string;
}

/**
 * Treatment-only drafts for cancer groupings whose full clinical guide has not
 * yet been written in cancerInfo.ts. These are kept separate so adding a safe
 * treatment overview cannot make an unfinished detail page appear complete.
 */
export const cancerTreatmentGuides: Record<string, CancerTreatmentGuide> = {
  colorectal: {
    slug: "colorectal",
    intro: "Treatment for bowel cancer depends on whether it started in the colon or rectum, its stage, whether it has spread, relevant molecular test results, treatment you have already had, your general health and what matters to you. The approaches below may be discussed, but this page cannot show which — if any — are suitable for you.",
    approaches: [
      {
        title: "Surgery",
        byOthers: true,
        body: "Surgery is the main treatment for many bowel cancers that have not spread. It may involve removing the affected part of the colon or rectum and nearby lymph nodes. Surgery is carried out by a colorectal surgeon, and some operations involve a temporary or permanent stoma.",
      },
      {
        therapy: "chemotherapy",
        title: "Chemotherapy",
        body: "Chemotherapy may be given after surgery for some bowel cancers. It may also be used before surgery in particular situations, or when the cancer has spread. The decision depends on the stage and characteristics of the cancer, previous treatment and your general health.",
      },
      {
        therapy: "radiotherapy",
        title: "Radiotherapy and chemoradiotherapy",
        body: "Radiotherapy is used mainly for rectal cancer rather than colon cancer. It may be given before surgery, sometimes together with chemotherapy, or used to help control symptoms when cancer has spread.",
      },
      {
        therapy: "targeted-therapies",
        title: "Targeted therapy",
        body: "For some advanced or metastatic bowel cancers, molecular tests may identify features that make a targeted medicine an option. Whether it is relevant depends on the test results, previous treatment and the wider treatment plan.",
      },
      {
        therapy: "immunotherapy",
        title: "Immunotherapy",
        body: "Some advanced or metastatic bowel cancers have changes in the way their cells repair DNA. Tests may describe this as mismatch repair deficient (dMMR) or microsatellite instability high (MSI-H). In those specific circumstances, immunotherapy may be an option.",
      },
    ],
    sources: [
      {
        label: "NICE NG151 — Colorectal cancer",
        url: "https://www.nice.org.uk/guidance/ng151",
      },
      {
        label: "NHS — Treatment for bowel cancer",
        url: "https://www.nhs.uk/conditions/bowel-cancer/treatment/",
      },
      {
        label: "Cancer Research UK — Treatment for bowel cancer",
        url: "https://www.cancerresearchuk.org/about-cancer/bowel-cancer/treatment",
      },
    ],
  },
};
