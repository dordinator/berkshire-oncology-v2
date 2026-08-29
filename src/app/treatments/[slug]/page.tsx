import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TreatmentDetailPage from "@/components/treatments/TreatmentDetailPage";
import JsonLd from "@/components/site/JsonLd";
import { breadcrumbLd, pageMeta } from "@/content/seo";
import { getTherapy, therapies } from "@/content/therapies";

export const dynamicParams = false;

export function generateStaticParams() {
  return therapies.map((therapy) => ({ slug: therapy.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const therapy = getTherapy(params.slug);
  if (!therapy) return {};

  return pageMeta({
    title: therapy.title,
    description: therapy.summary,
    path: `/treatments/${therapy.slug}`,
  });
}

export default function TreatmentPage({
  params,
}: {
  params: { slug: string };
}) {
  const therapy = getTherapy(params.slug);
  if (!therapy) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Treatments", path: "/treatments" },
          { name: therapy.title, path: `/treatments/${therapy.slug}` },
        ])}
      />
      <TreatmentDetailPage therapy={therapy} />
    </>
  );
}
