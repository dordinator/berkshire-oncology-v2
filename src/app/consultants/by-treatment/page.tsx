import type { Metadata } from "next";
import Link from "next/link";
import { therapies, getConsultantsForTherapy } from "@/content/therapies";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import JsonLd from "@/components/site/JsonLd";
import PageHeader from "@/components/site/PageHeader";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";

// ─────────────────────────────────────────────────────────────────────────────
// Every treatment, with the consultants who list it.
//
// A consultant only appears under a treatment when their own listed wording
// says so, and that wording is shown verbatim beside their name rather than
// paraphrased. Where no honest mapping exists the therapy's own note is shown
// instead of an empty list — see src/content/therapies.ts.
// ─────────────────────────────────────────────────────────────────────────────

const PATH = "/consultants/by-treatment";

export const metadata: Metadata = pageMeta({
  title: "Consultants by Treatment",
  description:
    "Find a consultant by treatment — chemotherapy, radiotherapy, immunotherapy, brachytherapy and more, with the Berkshire Oncology Partnership consultants who provide each.",
  path: PATH,
});

export default function ByTreatmentPage() {
  const groups = therapies.map((therapy) => ({
    therapy,
    doctors: getConsultantsForTherapy(therapy.slug),
  }));

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Consultants", path: "/consultants" },
          { name: "Browse by treatment", path: PATH },
        ])}
      />

      <PageHeader
        eyebrow="Consultants"
        title="Consultants by treatment"
        intro="The treatments our consultants provide, and who provides them. Where a consultant describes a treatment in their own wording, it is shown beside their name exactly as they give it."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Consultants", href: "/consultants" },
          { name: "Browse by treatment" },
        ]}
      />

      <section className="container-wide pb-24 pt-14 md:pb-32 md:pt-20">
        {/* jump index — desktop and tablet only */}
        <Reveal className="hidden md:block">
          <nav aria-label="Jump to a treatment">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
              Jump to
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {groups.map(({ therapy }) => (
                <li key={therapy.slug}>
                  <a
                    href={`#${therapy.slug}`}
                    className="inline-flex min-h-[40px] items-center rounded-full border border-black/[0.06] bg-white px-4 py-2 text-sm text-ink-muted transition-colors hover:border-accent/30 hover:text-ink"
                  >
                    {therapy.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Reveal>

        <div className="space-y-12 md:mt-14 md:space-y-14">
          {groups.map(({ therapy, doctors }) => (
            <Reveal key={therapy.slug}>
              <div
                id={therapy.slug}
                className="scroll-mt-28 border-t border-black/[0.06] pt-8"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                  <h2 className="font-display text-2xl text-ink md:text-3xl">
                    {therapy.title}
                  </h2>
                  <Link
                    href={`/treatments/${therapy.slug}`}
                    className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-ink"
                  >
                    About {therapy.title.toLowerCase()}
                    <span aria-hidden>&rarr;</span>
                  </Link>
                </div>

                <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-ink-muted">
                  {therapy.summary}
                </p>

                {therapy.note && (
                  <p className="mt-5 max-w-3xl rounded-2xl border border-black/[0.06] bg-canvas-warm px-5 py-4 text-[15px] leading-relaxed text-ink/80">
                    {therapy.note}
                  </p>
                )}

                {doctors.length > 0 && (
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {doctors.map((d) => {
                      // Only surface the consultant's own wording where it
                      // differs from the heading — repeating "Chemotherapy"
                      // under Chemotherapy tells the reader nothing.
                      const wording = d.listedAs.filter(
                        (m) => m.toLowerCase() !== therapy.title.toLowerCase(),
                      );
                      return (
                      <li key={d.slug}>
                        <Link
                          href={`/consultants/${d.slug}`}
                          className="group flex h-full min-h-[64px] flex-col justify-center rounded-2xl border border-black/[0.06] bg-white px-4 py-3 transition-colors hover:border-accent/30 hover:bg-canvas-warm"
                        >
                          <span className="flex items-center justify-between gap-3">
                            <span className="text-[15px] font-medium text-ink">
                              {d.name}
                            </span>
                            <span
                              aria-hidden
                              className="flex-none text-ink-muted/50 transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                            >
                              &rarr;
                            </span>
                          </span>
                          {d.shortRole && (
                            <span className="mt-0.5 block text-[13px] text-ink-muted">
                              {d.shortRole}
                            </span>
                          )}
                          {wording.length > 0 && (
                            <span className="mt-3 flex flex-wrap gap-1.5">
                              {wording.map((m) => (
                                <span
                                  key={m}
                                  className="rounded-full border border-black/[0.06] bg-canvas-soft px-2.5 py-1 text-xs text-ink-muted"
                                >
                                  {m}
                                </span>
                              ))}
                            </span>
                          )}
                        </Link>
                      </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="card-soft mt-14 p-6 md:p-8">
            <h2 className="font-display text-xl text-ink md:text-2xl">
              Not sure which treatment applies?
            </h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-muted">
              Treatment is decided with you once your diagnosis is clear. If you
              would rather start from the diagnosis, browse by cancer type, or
              ask our practice manager.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button href="/specialities" variant="primary">
                Browse by cancer type
              </Button>
              <Button href="/contact#guidance" variant="ghost">
                Contact the practice
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
