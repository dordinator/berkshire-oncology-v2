import type { Metadata } from "next";
import {
  getAllConsultants,
  getSpecialitiesForConsultant,
} from "@/content/queries";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import JsonLd from "@/components/site/JsonLd";
import ConsultantFocusStrip, {
  type FocusConsultant,
} from "@/components/sections/consultants/ConsultantFocusStrip";
import ConsultantsHeadline from "@/components/sections/consultants/ConsultantsHeadline";
import { modalitiesByConsultant } from "@/content/modalities";
import { sitesForConsultant } from "@/content/consultantSites";

export const metadata: Metadata = pageMeta({
  title: "Our Consultants",
  description:
    "Meet the ten consultant oncologists of Berkshire Oncology Partnership, providing private cancer care in Reading, Berkshire and the surrounding area.",
  path: "/consultants",
});

export default function ConsultantsPage() {
  const focusConsultants: FocusConsultant[] = getAllConsultants().map((c) => ({
    slug: c.slug,
    name: c.name,
    shortRole: c.shortRole ?? c.role,
    photo: c.photo ?? "",
    photoTall: `/consultants/tall/${c.slug}.jpg`,
    cancerTypes: getSpecialitiesForConsultant(c.slug).map(
      (x) => x.speciality.name,
    ),
    treatments: modalitiesByConsultant[c.slug] ?? [],
    sites: sitesForConsultant(c.slug),
  }));

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Consultants", path: "/consultants" },
        ])}
      />

      {/* The page IS the strip: headline band, then the partnership as one
          wall of portraits, the hovered consultant coming into focus. All
          further wayfinding lives in the band's tabs. */}
      <section className="bg-paper-soft pb-10 pt-28 md:pt-32 lg:pb-12">
        <div className="container-wide">
          <ConsultantsHeadline />
        </div>
        {/* Full width of the screen — end to end, no container: at any inset
            the band reads as a card, and the point is a wall of the whole
            partnership. */}
        <div className="mt-8 lg:mt-10">
          {/* The strip's consultant names are h3s, so without this the page ran
              h1 straight to h3. The heading is not shown because the headline
              band above already says what this is; it exists for anyone
              navigating the page by its outline. */}
          <h2 className="sr-only">The consultants</h2>
          <ConsultantFocusStrip consultants={focusConsultants} />
        </div>
      </section>
    </>
  );
}
