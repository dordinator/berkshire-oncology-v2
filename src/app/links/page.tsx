import type { Metadata } from "next";
import Link from "next/link";
import { librarySheets } from "@/content/resourceLibrary";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import { site } from "@/content/site";
import JsonLd from "@/components/site/JsonLd";
import Reveal from "@/components/ui/Reveal";
import ResourceLibrary from "@/components/sections/resources/ResourceLibrary";

// ─────────────────────────────────────────────────────────────────────────────
// Resources and support — the library.
//
// Rebuilt (Aug 2026) around Dan's reference comp: a scroll-stepped library
// where the index stays put on the left, one topic sheet at a time holds the
// middle, and a counter card on the right always says what is next. The
// previous page's seven-section motion tour (wave hero, logo band, pathways,
// search, photograph, organisation panels, navy close) is replaced by the
// instrument — its content lives on in the sheets, which are driven by
// src/content/resourceLibrary.ts and cannot drift from the IA.
//
// This file is also /resources: src/app/resources/page.tsx re-exports it.
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = pageMeta({
  title: "Resources and support",
  description:
    "Clear information, practical guidance and trusted organisations for patients, families and carers affected by cancer.",
  path: "/resources",
});

export default function ResourcesPage() {
  const tel = site.contact.phone.replace(/\s+/g, "");

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Resources", path: "/resources" },
        ])}
      />
      {/* The library runs its own mandatory snap, guarded to its stage —
          the site-wide proximity snap must not fight it. data-no-snap rides
          on the sections themselves: the global selector reads
          main > section, and would never see it on a wrapper div. */}
      <div className="overflow-x-clip bg-canvas pt-24 lg:pt-0">
        <ResourceLibrary sheets={librarySheets} />

        {/* ── Close — the practice, for whatever the library didn't answer. */}
        <section
          data-no-snap
          className="relative mt-16 overflow-hidden rounded-t-[2.5rem] bg-ink py-24 text-white md:rounded-t-[3.5rem] md:py-32 lg:mt-0"
        >
          <div className="container-wide">
            <Reveal>
              <h2 className="display-section max-w-3xl text-white">
                You don&rsquo;t have to face this alone.
              </h2>
            </Reveal>
            <Reveal>
              <p className="mt-8 max-w-xl text-[17px] leading-relaxed text-white/70">
                If you are not sure where to start,{" "}
                {site.contact.practiceManager} and the practice team can point
                you to the right information, or to the right person, for your
                circumstances.
              </p>
            </Reveal>
            <Reveal>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5 focus-visible:-translate-y-0.5 focus-visible:shadow-[0_0_0_2px_#c8992f]"
                >
                  Contact the practice{" "}
                  <span aria-hidden className="text-lg leading-none">
                    →
                  </span>
                </Link>
                <a
                  href={`tel:${tel}`}
                  className="rounded-full border border-white/25 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:border-white/60 hover:bg-white/[0.06] focus-visible:border-white/60 focus-visible:bg-white/[0.06] focus-visible:shadow-[0_0_0_2px_#c8992f]"
                >
                  {site.contact.phone}
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    </>
  );
}
