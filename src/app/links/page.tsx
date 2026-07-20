import type { Metadata } from "next";
import { usefulLinks } from "@/content/usefulLinks";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import JsonLd from "@/components/site/JsonLd";
import Reveal from "@/components/ui/Reveal";
import LinkLogo from "@/components/sections/links/LinkLogo";
import GenerativeTree from "@/components/sections/links/GenerativeTree";

export const metadata: Metadata = pageMeta({
  title: "Useful Links",
  description:
    "Helpful resources and support for patients, relatives and friends — from Macmillan and Cancer Research UK to the hospitals where Berkshire Oncology Partnership practises.",
  path: "/links",
});

export default function LinksPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Links", path: "/links" },
        ])}
      />
      <section className="relative overflow-x-clip bg-gradient-to-b from-canvas-soft/60 via-canvas to-canvas pb-16 pt-32 md:pb-24 md:pt-40">
        {/* generative tree — ambient full-page background behind all content */}
        <GenerativeTree className="pointer-events-none absolute inset-0 z-0 opacity-[0.72]" />

        {/* soft page-coloured scrim behind the header — the tree dissolves
            where the title/intro sit so they stay readable, while the tree
            still shows around and below (option 1a) */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-6 z-[1] h-[460px] w-[min(120%,1060px)] -translate-x-1/2"
          style={{
            background:
              "radial-gradient(58% 58% at 50% 44%, rgba(250,251,252,0.95) 0%, rgba(250,251,252,0.86) 40%, rgba(250,251,252,0) 75%)",
          }}
        />

        <div className="container-wide relative z-10">
          {/* header — centred, matching the tariffs & consultants pages */}
          <div className="mx-auto max-w-2xl text-center">
            <div className="flex items-center justify-center gap-4">
              <span className="h-px w-14 bg-gradient-to-r from-transparent via-accent/40 to-[#c8992f] sm:w-20" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink">
                Support
              </span>
              <span className="h-px w-14 bg-gradient-to-l from-transparent via-accent/40 to-[#c8992f] sm:w-20" />
            </div>

            <h1 className="mx-auto mt-6 font-display text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl md:text-6xl">
              Useful <span className="text-gradient">links.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-ink-muted">
              Resources and support for patients, relatives and friends —
              whether you are undergoing treatment or supporting someone who is.
            </p>
          </div>

          {/* links grid, below */}
          <div className="mx-auto mt-14 grid max-w-5xl auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:mt-20">
            {usefulLinks.map((l, i) => (
              <Reveal key={l.url} delay={i % 3}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full items-center gap-4 card-soft p-5 transition-transform duration-300 hover:-translate-y-1"
                >
                  <LinkLogo name={l.name} logo={l.logo} i={i} />
                  <span className="flex-1 text-[15px] font-medium leading-snug text-ink">
                    {l.name}
                  </span>
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 self-start text-ink-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M5 11L11 5M11 5H6M11 5V10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
