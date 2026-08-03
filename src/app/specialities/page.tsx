import type { Metadata } from "next";
import {
  getAllSpecialities,
  getConsultantsForSpeciality,
  getSpecialityBySlug,
} from "@/content/queries";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import JsonLd from "@/components/site/JsonLd";
import PageHeader from "@/components/site/PageHeader";
import CancerHub, {
  type HubGroup,
} from "@/components/sections/cancer/CancerHub";
import { GraphicModeProvider } from "@/components/graphic/GraphicMode";
import { cancerGroups, unlistedGroup, type CancerGroup } from "@/content/cancerGroups";
import { privateCareSites } from "@/content/careDelivery";
import type { CareMapData } from "@/components/graphic/CareMap";

export const metadata: Metadata = pageMeta({
  title: "Cancer Types",
  description:
    "The cancers treated by Berkshire Oncology Partnership in Reading, Berkshire — who treats each one, which treatments they provide, and where care is delivered.",
  path: "/specialities",
});

function toHubGroup(group: CancerGroup, unlisted = false): HubGroup {
  // Bladder and Kidney are treated by the same three consultants, and both
  // Upper GI pages share Dr Hill. Summing the per-page counts would advertise
  // more people than exist, so the group count is over distinct consultants.
  const seen = new Map<string, { name: string; slug: string }>();
  for (const slug of group.slugs) {
    for (const c of getConsultantsForSpeciality(slug)) {
      if (!seen.has(c.slug)) seen.set(c.slug, { name: c.name, slug: c.slug });
    }
  }

  return {
    id: group.id,
    label: group.label,
    blurb: group.blurb,
    icon: group.icon,
    unlisted,
    consultants: Array.from(seen.values()),
    entries: group.slugs.map((slug) => ({
      slug,
      title: getSpecialityBySlug(slug)?.title ?? slug,
      count: getConsultantsForSpeciality(slug).length,
    })),
  };
}

export default function SpecialitiesPage() {
  const indexItems = getAllSpecialities()
    .map((s) => ({
      slug: s.slug,
      title: s.title,
      count: getConsultantsForSpeciality(s.slug).length,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

  const groups = cancerGroups.map((g) => toHubGroup(g));
  const unlisted = toHubGroup(unlistedGroup, true);

  // The hub's map explains the system rather than one cancer: the shape of the
  // partnership, and the fact that radiotherapy narrows to two sites.
  const mapData: CareMapData = {
    cancer: `${cancerGroups.length} cancer types`,
    consultants: [
      { id: "clin", label: "Clinical oncologists", meta: "Radiotherapy and drug treatment" },
      { id: "med", label: "Medical oncologists", meta: "Drug treatment" },
    ],
    treatments: [
      { id: "drug", label: "Drug treatment", from: ["clin", "med"] },
      { id: "rt", label: "Radiotherapy", from: ["clin"], accent: true },
    ],
    locations: privateCareSites.map((s) => ({
      id: s.slug,
      label: s.name,
      meta: s.area,
      accent: s.capabilities.includes("radiotherapy"),
      from: s.capabilities.includes("radiotherapy") ? ["drug", "rt"] : ["drug"],
    })),
  };

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Cancer Types", path: "/specialities" },
        ])}
      />

      <PageHeader
        eyebrow="Cancer Types"
        title="The cancers we treat"
        intro="Start with your cancer type. Each page sets out what the partnership treats, which consultants specialise in it, how it is usually diagnosed and staged, the treatments that may be involved, and where that care takes place."
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Cancer Types" }]}
      />

      <GraphicModeProvider>
        <CancerHub
          groups={groups}
          unlisted={unlisted}
          indexItems={indexItems}
          mapData={mapData}
        />
      </GraphicModeProvider>
    </>
  );
}
