import type { Metadata } from "next";
import {
  getAllSpecialities,
  getConsultantsForSpeciality,
} from "@/content/queries";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import JsonLd from "@/components/site/JsonLd";
import SpecialityIndex from "@/components/sections/specialities/SpecialityIndex";
import SilkRibbon from "@/components/sections/specialities/SilkRibbon";

export const metadata: Metadata = pageMeta({
  title: "Specialities",
  description:
    "The cancer types treated by Berkshire Oncology Partnership in Reading, Berkshire — from breast, prostate and lung to bowel, gynaecological and more.",
  path: "/specialities",
});

export default function SpecialitiesPage() {
  const items = getAllSpecialities()
    .map((s) => ({
      slug: s.slug,
      title: s.title,
      count: getConsultantsForSpeciality(s.slug).length,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Specialities", path: "/specialities" },
        ])}
      />

      <section className="relative overflow-x-clip bg-white">
        {/* champagne-silk drifting in the background, behind the page content */}
        {/* vertically aligned just above the "Brain Cancer" row of the index */}
        <SilkRibbon className="pointer-events-none absolute top-[404px] z-0 md:top-[369px]" />

        <div className="container-wide relative z-10 pb-24 pt-32 md:pt-36 xl:pt-40">
          <div className="grid gap-10 xl:grid-cols-[240px_1fr] xl:gap-16">
            {/* left — title */}
            <div>
              <h1 className="font-display text-4xl leading-tight tracking-tight text-ink sm:text-5xl">
                Cancer types
              </h1>
              <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-ink-muted">
                Find your cancer type quickly and easily.
              </p>
            </div>

            {/* right — alphabet filter + grouped index */}
            <SpecialityIndex items={items} />
          </div>
        </div>
      </section>
    </>
  );
}
