import type { Metadata } from "next";
import JsonLd from "@/components/site/JsonLd";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import { cancerGroups, unlistedGroup } from "@/content/cancerGroups";
import { getSpecialityBySlug, getConsultantsForSpeciality } from "@/content/queries";
import { cancerInfo, type CancerInfo } from "@/content/cancerInfo";
import {
  cancerTreatmentGuides,
  type CancerTreatmentGuide,
} from "@/content/cancerTreatmentGuides";
import { therapies } from "@/content/therapies";
import CancerTypesPrototype, {
  type CancerTypePrototypeItem,
} from "@/components/sections/specialities/CancerTypesPrototype";

/*
  Cancer-types prototype: a forgiving, search-first entrance followed by a
  joined-up care picture. This server page owns the relationships; the client
  component owns only finder state and transitions. The original site remains
  unchanged in its own worktree while this direction is reviewed on port 3001.
*/

export const metadata: Metadata = pageMeta({
  title: "Cancer Types",
  description:
    "Explore the cancers treated by Berkshire Oncology Partnership, the consultants who treat them, available treatments and where care is delivered.",
  path: "/specialities",
});

/** One joined-up snapshot for the finder, with every relationship derived from
 * the same content modules as the existing detail pages. */
function toItem(
  group: (typeof cancerGroups)[number] | typeof unlistedGroup,
  treated = true,
): CancerTypePrototypeItem {
  const consultants = new Map<string, { name: string; slug: string; photo?: string; role?: string }>();
  const treatments = new Map<string, { slug?: string; href?: string; title: string; summary: string; byOthers?: boolean }>();
  // A facility offering a therapy does not establish that it provides that
  // therapy for this cancer. Keep cancer-specific locations empty until the
  // practice supplies a verified cancer × treatment × site mapping.
  const locations: CancerTypePrototypeItem["locations"] = [];
  const listedModalities = new Set<string>();
  let hasCancerSpecificApproaches = false;
  let treatmentIntro: string | undefined;
  let clinicalReview: CancerTypePrototypeItem["clinicalReview"];
  const groupTreatmentGuide = cancerTreatmentGuides[group.id];

  function addTreatmentGuide(
    treatmentGuide: CancerInfo | CancerTreatmentGuide,
    fallbackSlug: string,
    reviewHref?: string,
  ) {
    const approaches = treatmentGuide.approaches;
    if (approaches.length > 0) hasCancerSpecificApproaches = true;
    if ("intro" in treatmentGuide) treatmentIntro = treatmentGuide.intro;
    if (!clinicalReview) {
      clinicalReview = {
        status: treatmentGuide.reviewedBy && treatmentGuide.reviewedOn ? "reviewed" : "draft",
        reviewedBy: treatmentGuide.reviewedBy,
        reviewerCredentials: treatmentGuide.reviewerCredentials,
        reviewedOn: treatmentGuide.reviewedOn,
        nextReviewOn: treatmentGuide.nextReviewOn,
        sources: treatmentGuide.sources,
        href: reviewHref,
      };
    }

    for (const approach of approaches) {
      const treatmentKey = approach.therapy ?? `${fallbackSlug}-${approach.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      if (!treatments.has(treatmentKey)) {
        treatments.set(treatmentKey, {
          slug: approach.therapy,
          href: !treated
            ? undefined
            : approach.therapy
              ? `/treatments/${approach.therapy}`
              : approach.href ?? ("overview" in treatmentGuide ? `/specialities/${fallbackSlug}` : undefined),
          title: approach.title,
          summary: approach.body,
          byOthers: approach.byOthers,
        });
      }
    }
  }

  for (const slug of group.slugs) {
    for (const c of getConsultantsForSpeciality(slug)) {
      if (!consultants.has(c.slug)) consultants.set(c.slug, { name: c.name, slug: c.slug, photo: c.photo, role: c.shortRole ?? c.role });
      c.modality?.forEach((modality) => listedModalities.add(modality));
    }
    const info = cancerInfo[slug];
    if (!groupTreatmentGuide && info) {
      addTreatmentGuide(info, slug, `/specialities/${slug}#clinical-review`);
    }
  }

  if (groupTreatmentGuide) {
    addTreatmentGuide(groupTreatmentGuide, group.slugs[0]);
  }

  // Most cancer types currently have only the treatment wording reproduced on
  // their legacy consultant listings, rather than signed-off cancer-specific
  // approach copy. In those cases expose the matching treatment information
  // pages as routing links, while the UI labels the relationship plainly as
  // consultant-linked rather than claiming that each therapy treats the cancer.
  if (!hasCancerSpecificApproaches) {
    for (const therapy of therapies) {
      if (!therapy.matches.some((match) => listedModalities.has(match))) continue;
      treatments.set(therapy.slug, {
        slug: therapy.slug,
        href: `/treatments/${therapy.slug}`,
        title: therapy.title,
        summary: therapy.summary,
      });
    }
  }

  const entries = group.slugs.map((slug) => ({
    slug,
    title: getSpecialityBySlug(slug)?.title ?? slug,
  }));

  return {
    id: group.id,
    label: group.label,
    title: group.slugs.length === 1 ? getSpecialityBySlug(group.slugs[0])?.title ?? group.label : `${group.label} cancers`,
    blurb: group.blurb,
    treated,
    entries,
    consultants: Array.from(consultants.values()),
    treatments: Array.from(treatments.values()),
    locations,
    treatmentBasis: hasCancerSpecificApproaches
      ? "cancer-specific"
      : treatments.size > 0
        ? "consultant-linked"
        : "unconfirmed",
    treatmentIntro,
    clinicalReview: hasCancerSpecificApproaches ? clinicalReview : undefined,
  };
}

export default function SpecialitiesPage() {
  const items = [...cancerGroups.map((group) => toItem(group)), toItem(unlistedGroup, false)];
  const missingTreatmentGuides = items.filter(
    (item) => item.treatmentBasis !== "cancer-specific",
  );

  if (missingTreatmentGuides.length > 0) {
    throw new Error(
      `Cancer groups without a cancer-specific treatment guide: ${missingTreatmentGuides.map((item) => item.id).join(", ")}`,
    );
  }

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Cancer Types", path: "/specialities" },
        ])}
      />

      <CancerTypesPrototype items={items} />
    </>
  );
}
