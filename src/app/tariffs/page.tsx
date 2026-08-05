import type { Metadata } from "next";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import JsonLd from "@/components/site/JsonLd";
import FeesHero from "@/components/sections/tariffs/FeesHero";
import FeesBody from "@/components/sections/tariffs/FeesBody";

export const metadata: Metadata = pageMeta({
  title: "Tariffs & Fees",
  description:
    "Guidance on the cost of private oncology treatment with Berkshire Oncology Partnership in Reading, Berkshire, for self-funding and insured patients.",
  path: "/tariffs",
});

export default function TariffsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Tariffs", path: "/tariffs" },
        ])}
      />
      {/* overflow-x-CLIP, never hidden: hidden would make this section the
          sticky containment for the in-page fees nav and it would never pin;
          clip only trims the strip/band/sheet full-bleed surface layers. */}
      <section className="relative overflow-x-clip bg-gradient-to-b from-canvas-soft/70 via-canvas to-canvas">
        <FeesHero />

        <FeesBody />
      </section>
    </>
  );
}
