import type { Metadata } from "next";
import TreatmentDetailPage from "@/components/treatments/TreatmentDetailPage";
import { getTherapy } from "@/content/therapies";

export const metadata: Metadata = {
  title: "Chemotherapy page concept",
  description: "A design concept for the Berkshire Oncology chemotherapy page.",
  robots: { index: false, follow: false },
};

export default function ChemotherapyDemoPage() {
  const therapy = getTherapy("chemotherapy");
  if (!therapy) {
    throw new Error("The chemotherapy content entry is missing.");
  }

  return <TreatmentDetailPage therapy={therapy} />;
}
