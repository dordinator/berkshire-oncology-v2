import type { Metadata } from "next";
import {
  getAllConsultants,
  getSpecialitiesForConsultant,
} from "@/content/queries";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import JsonLd from "@/components/site/JsonLd";
import ConsultantThread, {
  type ThreadConsultant,
} from "@/components/sections/consultants/ConsultantThread";
import HeadingSwoosh from "@/components/sections/consultants/HeadingSwoosh";
import MarbleBackground from "@/components/sections/consultants/MarbleBackground";

export const metadata: Metadata = pageMeta({
  title: "Our Consultants",
  description:
    "Meet the ten consultant oncologists of Berkshire Oncology Partnership, providing private cancer care in Reading, Berkshire and the surrounding area.",
  path: "/consultants",
});

export default function ConsultantsPage() {
  const consultants: ThreadConsultant[] = getAllConsultants().map((c) => ({
    slug: c.slug,
    name: c.name,
    shortRole: c.shortRole ?? c.role,
    photo: c.photo ?? "",
    specialities: getSpecialitiesForConsultant(c.slug).map((x) => ({
      slug: x.speciality.slug,
      name: x.speciality.name,
    })),
  }));

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Consultants", path: "/consultants" },
        ])}
      />
      <section className="relative min-h-screen overflow-hidden bg-white pb-24">
        {/* gold marble strands behind the thread — masked out of the top so
            they never touch the swoosh/title feature */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 480px, #000 720px)",
            maskImage:
              "linear-gradient(to bottom, transparent 480px, #000 720px)",
          }}
        >
          <MarbleBackground />
        </div>

        {/* the swoosh feature, spanning full width behind the hero */}
        <HeadingSwoosh className="pointer-events-none absolute inset-x-0 top-0 h-[440px] w-full md:h-[520px]" />

        {/* hero — centred, matching the tariffs page */}
        <div className="container-wide relative z-10 pt-32 text-center md:pt-40">
          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-14 bg-gradient-to-r from-transparent via-accent/40 to-[#c8992f] sm:w-20" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink">
              Our consultants
            </span>
            <span className="h-px w-14 bg-gradient-to-l from-transparent via-accent/40 to-[#c8992f] sm:w-20" />
          </div>

          <h1 className="mx-auto mt-7 max-w-4xl font-display text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl md:text-6xl">
            Find the right expert
            <br />
            <span className="text-gradient">for you.</span>
          </h1>
        </div>

        <div className="container-wide relative z-10 mt-20 lg:mt-28">
          <ConsultantThread consultants={consultants} />
        </div>
      </section>
    </>
  );
}
