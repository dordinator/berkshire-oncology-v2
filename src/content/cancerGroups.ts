import type { Slug } from "./types";
import { specialities } from "./specialities";

// ─────────────────────────────────────────────────────────────────────────────
// The cancer-type hub's information architecture.
//
// The practice asked for fourteen groupings. The underlying pages keep their
// existing slugs — they map 1:1 onto the old site's /specialities/*.htm files
// and the 301s depend on them — so a group is a *presentation* layer over one
// or more existing speciality pages, never a replacement for them.
//
// Order is the order the practice gave, which is roughly by how often the
// partnership sees each cancer, not alphabetical. The A–Z view on the hub is
// there for anyone who wants alphabetical.
// ─────────────────────────────────────────────────────────────────────────────

export interface CancerGroup {
  id: string;
  /** Group label as the practice worded it. */
  label: string;
  /** Speciality slugs this group covers, in display order. */
  slugs: Slug[];
  /** One line of plain-English orientation. Shown on the hub card. */
  blurb: string;
  /** Slug whose icon represents the group on the hub. */
  icon: Slug;
}

export const cancerGroups: CancerGroup[] = [
  {
    id: "breast",
    label: "Breast",
    slugs: ["breast"],
    blurb:
      "Cancer that starts in the breast, in women and in men — including cancer found through screening.",
    icon: "breast",
  },
  {
    id: "prostate",
    label: "Prostate",
    slugs: ["prostate"],
    blurb:
      "Cancer that starts in the prostate gland, from early disease found on a PSA test to advanced disease.",
    icon: "prostate",
  },
  {
    id: "bladder-and-kidney",
    label: "Bladder and Kidney",
    slugs: ["bladder", "kidney"],
    blurb:
      "Cancers of the urinary tract — the bladder and the kidneys. Often seen by the same consultants.",
    icon: "kidney",
  },
  {
    id: "colorectal",
    label: "Colorectal",
    slugs: ["colorectal"],
    blurb:
      "Bowel cancer — cancer of the colon or the rectum, including cancer found through bowel screening.",
    icon: "colorectal",
  },
  {
    id: "lung",
    label: "Lung",
    slugs: ["lung"],
    blurb:
      "Cancer that starts in the lung or the airways, including non-small cell and small cell lung cancer.",
    icon: "lung",
  },
  {
    id: "head-and-neck",
    label: "Head and Neck",
    slugs: ["head-and-neck"],
    blurb:
      "Cancers of the mouth, throat, voice box, salivary glands, nose and sinuses.",
    icon: "head-and-neck",
  },
  {
    id: "gynaecological",
    label: "Gynaecological",
    slugs: ["gynaecology"],
    blurb:
      "Cancers of the ovary, womb, cervix, vulva and vagina.",
    icon: "gynaecology",
  },
  {
    id: "brain-and-spinal",
    label: "Brain and Spinal",
    slugs: ["brain"],
    blurb:
      "Tumours that start in the brain, and cancer that has spread to the brain from elsewhere.",
    icon: "brain",
  },
  {
    id: "upper-gi",
    label: "Upper GI",
    slugs: ["oesophagus", "stomach"],
    blurb:
      "Cancers of the upper digestive tract — the oesophagus (gullet) and the stomach.",
    icon: "oesophagus",
  },
  {
    id: "liver-and-pancreatic",
    label: "Liver and Pancreatic",
    slugs: ["liver", "pancreas"],
    blurb:
      "Cancers of the liver, the pancreas and the bile ducts.",
    icon: "pancreas",
  },
  {
    id: "skin-and-melanoma",
    label: "Skin and Melanoma",
    slugs: ["skin"],
    blurb:
      "Melanoma and non-melanoma skin cancers, including basal cell and squamous cell carcinoma.",
    icon: "skin",
  },
  {
    id: "testicular",
    label: "Testicular",
    slugs: ["testicular"],
    blurb:
      "Cancer that starts in the testicle — most often in younger men, and usually very treatable.",
    icon: "testicular",
  },
  {
    id: "lymphoma",
    label: "Lymphoma",
    slugs: ["lymphoma"],
    blurb:
      "Cancer of the lymphatic system, including Hodgkin and non-Hodgkin lymphoma.",
    icon: "lymphoma",
  },
  {
    id: "cancer-of-unknown-primary",
    label: "Cancer of Unknown Primary",
    slugs: ["cancer-unknown-primary"],
    blurb:
      "Cancer that has been found in the body without a clear starting point, while tests continue.",
    icon: "cancer-unknown-primary",
  },
];

// Sarcoma is in the data and has a live URL, but no current partner lists it.
// It is shown separately on the hub rather than dropped, so that anyone who
// arrives looking for it is told plainly and given a route, instead of a 404
// or a page implying cover we do not have.
export const unlistedGroup: CancerGroup = {
  id: "sarcoma",
  label: "Sarcoma",
  slugs: ["sarcoma"],
  blurb:
    "Cancers of bone and soft tissue. No partner currently lists sarcoma — please contact the practice.",
  icon: "sarcoma",
};

/** Every slug that appears in a group, for completeness checks. */
export const groupedSlugs = new Set(
  [...cancerGroups, unlistedGroup].flatMap((g) => g.slugs),
);

/** The group a speciality slug belongs to, if any. */
export function getGroupForSlug(slug: Slug): CancerGroup | undefined {
  return [...cancerGroups, unlistedGroup].find((g) => g.slugs.includes(slug));
}

/** Sibling slugs inside the same group — e.g. bladder ↔ kidney. */
export function getGroupSiblings(slug: Slug): Slug[] {
  return getGroupForSlug(slug)?.slugs.filter((s) => s !== slug) ?? [];
}

// Fails loudly in development if a speciality is added without a home on the
// hub — a cancer type that exists but is unreachable is worse than a missing
// page, because nothing surfaces it.
if (process.env.NODE_ENV === "development") {
  const orphans = specialities.filter((s) => !groupedSlugs.has(s.slug));
  if (orphans.length) {
    console.warn(
      `[cancerGroups] not on the hub: ${orphans.map((s) => s.slug).join(", ")}`,
    );
  }
}
