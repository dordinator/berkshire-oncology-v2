import type { Metadata } from "next";
import JsonLd from "@/components/site/JsonLd";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import { therapies } from "@/content/therapies";
import TreatmentHero from "./TreatmentHero";
import TreatmentSections, {
  type TreatmentGroupData,
} from "./TreatmentSections";

export const metadata: Metadata = pageMeta({
  title: "Treatments",
  description:
    "Clear information about cancer treatments, how treatment decisions are made and which parts of care may be provided by other teams or specialist centres.",
  path: "/treatments",
});

const treatmentOrder = [
  "chemotherapy",
  "immunotherapy",
  "targeted-therapies",
  "hormone-therapy",
  "radiotherapy",
  "brachytherapy",
  "radioisotope-therapy",
];

const treatmentLinks = treatmentOrder.flatMap((slug) => {
  const treatment = therapies.find((item) => item.slug === slug);
  return treatment ? [treatment] : [];
});

const treatmentGroups: TreatmentGroupData[] = [
  {
    id: "medicine",
    number: "01",
    title: "Treatments using medicines",
    description:
      "Medicines can act on cancer cells, hormones or the immune system in different ways.",
    treatments: treatmentLinks.filter((treatment) => treatment.group === "drug"),
  },
  {
    id: "radiotherapy",
    number: "02",
    title: "Radiotherapy treatments",
    description:
      "Radiation can be delivered from outside the body or from a source placed inside it.",
    treatments: treatmentLinks.filter(
      (treatment) => treatment.group === "radiotherapy",
    ),
  },
];

export default function TreatmentsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Treatments", path: "/treatments" },
        ])}
      />

      <TreatmentHero />
      <TreatmentSections groups={treatmentGroups} />
    </>
  );
}
