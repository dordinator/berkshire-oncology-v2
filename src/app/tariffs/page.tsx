import type { Metadata } from "next";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import JsonLd from "@/components/site/JsonLd";
import FeesHero from "@/components/sections/tariffs/FeesHero";
import FeesBody from "@/components/sections/tariffs/FeesBody";
// The site's scroll choreography engine: finds the data-fx hooks FeesBody
// declares (drift / rise / draw) and scrubs them against the scroll.
// Mounted without IntensityStage, so it runs at the default "Flowing"
// level — same as /patients.
import PageMotion from "@/components/sections/resources/PageMotion";

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
      {/* overflow-x-CLIP, never hidden: clip trims the strip/band/sheet
          full-bleed w-screen surface layers without creating a scroll
          container (hidden would break position:sticky for any future
          sticky child and force the other axis to auto). */}
      <PageMotion />
      <section className="relative overflow-x-clip bg-gradient-to-b from-canvas-soft/70 via-canvas to-canvas">
        <FeesHero />

        <FeesBody />
      </section>
    </>
  );
}
