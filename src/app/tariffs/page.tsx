import type { Metadata } from "next";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import JsonLd from "@/components/site/JsonLd";
import ParticleField from "@/components/sections/tariffs/ParticleField";

export const metadata: Metadata = pageMeta({
  title: "Tariffs & Fees",
  description:
    "Guidance on the cost of private oncology treatment with Berkshire Oncology Partnership in Reading, Berkshire, for self-funding and insured patients.",
  path: "/tariffs",
});

const paragraphs = [
  "Berkshire Oncology Partnership is a group of professional independent practitioners who reserve the right to set our own tariff which we feel is both fair and reasonable for the service provided.",
  "Each self funding package is tailored to the individual needs of our patients and anyone requiring treatment for which they are self funding will be provided with a comprehensive tariff prior to starting their treatment.",
  "For insured patients, there are a number of Insurance Providers who not only have their own fee schedule but the benefits associated with the policies they offer can vary from one individual to another.",
  "We therefore strongly advise that you obtain a quote prior to any treatment to clarify whether the cost of your treatment will be covered in full.",
  "If your insurer does not settle your account in full, the liability for the shortfall lies with the patient.",
  "Please note that all quotes provided are estimates and may be subject to change dependent on the treatment given.",
];

export default function TariffsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Tariffs", path: "/tariffs" },
        ])}
      />
      <section className="relative overflow-hidden bg-gradient-to-b from-canvas-soft/70 via-canvas to-canvas">
        {/* interactive particle wave */}
        <ParticleField className="pointer-events-none absolute inset-x-0 top-0 h-[560px] w-full md:h-[640px]" />

        {/* hero */}
        <div className="container-wide relative z-10 pt-32 text-center md:pt-40">
          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-14 bg-gradient-to-r from-transparent via-accent/40 to-[#c8992f] sm:w-20" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink">
              About our tariffs
            </span>
            <span className="h-px w-14 bg-gradient-to-l from-transparent via-accent/40 to-[#c8992f] sm:w-20" />
          </div>

          <h1 className="mx-auto mt-7 max-w-4xl font-display text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl md:text-6xl">
            Clear, fair and transparent.
            <br />
            <span className="text-gradient">That&rsquo;s our promise.</span>
          </h1>
        </div>

        {/* body copy, below the wave */}
        <div className="container-narrow relative z-10 pt-40 md:pt-56">
          <div className="mx-auto max-w-3xl space-y-6 text-[17px] leading-relaxed text-ink/85">
            <p className="text-[19px] font-medium leading-relaxed text-ink">
              Please note that tariffs are meant to be used as a guide only.
            </p>
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>

        {/* closing wave, flush with the footer */}
        <div className="relative mt-16">
          <ParticleField
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[300px] w-full md:h-[380px]"
            midYFrac={0.87}
            edgeFade="footer"
          />
          <div className="relative z-10 pb-44 md:pb-56" />
        </div>
      </section>
    </>
  );
}
