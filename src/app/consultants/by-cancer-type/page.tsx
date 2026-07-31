import type { Metadata } from "next";
import Link from "next/link";
import {
  getAllSpecialities,
  getConsultantsForSpeciality,
} from "@/content/queries";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import JsonLd from "@/components/site/JsonLd";
import PageHeader from "@/components/site/PageHeader";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";

// ─────────────────────────────────────────────────────────────────────────────
// Every cancer type, with the consultants who treat it — the condition → doctor
// direction of the same edge list that drives the speciality pages.
//
// The jump index is md+ only: on a phone a plain scrolling list of eighteen
// short sections is easier to use than a cramped rail of tiny anchors.
// ─────────────────────────────────────────────────────────────────────────────

const PATH = "/consultants/by-cancer-type";

export const metadata: Metadata = pageMeta({
  title: "Consultants by Cancer Type",
  description:
    "Find a consultant by cancer type — every cancer type treated by Berkshire Oncology Partnership in Reading, with the consultants who treat it.",
  path: PATH,
});

export default function ByCancerTypePage() {
  const groups = getAllSpecialities()
    .slice()
    .sort((a, b) => a.title.localeCompare(b.title, "en-GB"))
    .map((speciality) => ({
      speciality,
      doctors: getConsultantsForSpeciality(speciality.slug),
    }));

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Consultants", path: "/consultants" },
          { name: "Browse by cancer type", path: PATH },
        ])}
      />

      <PageHeader
        eyebrow="Consultants"
        title="Consultants by cancer type"
        intro="Every cancer type the partnership treats, and the consultants who treat it. Choose a name to read the full profile, or open the cancer type page for more detail."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Consultants", href: "/consultants" },
          { name: "Browse by cancer type" },
        ]}
      />

      <section className="container-wide pb-24 pt-14 md:pb-32 md:pt-20">
        {/* jump index — desktop and tablet only */}
        <Reveal className="hidden md:block">
          <nav aria-label="Jump to a cancer type">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
              Jump to
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {groups.map(({ speciality }) => (
                <li key={speciality.slug}>
                  <a
                    href={`#${speciality.slug}`}
                    className="inline-flex min-h-[40px] items-center rounded-full border border-black/[0.06] bg-white px-4 py-2 text-sm text-ink-muted transition-colors hover:border-accent/30 hover:text-ink"
                  >
                    {speciality.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Reveal>

        <div className="space-y-12 md:mt-14 md:space-y-14">
          {groups.map(({ speciality, doctors }) => (
            <Reveal key={speciality.slug}>
              <div
                id={speciality.slug}
                className="scroll-mt-28 border-t border-black/[0.06] pt-8"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                  <h2 className="font-display text-2xl text-ink md:text-3xl">
                    {speciality.title}
                  </h2>
                  <Link
                    href={`/specialities/${speciality.slug}`}
                    className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-ink"
                  >
                    About {speciality.title}
                    <span aria-hidden>&rarr;</span>
                  </Link>
                </div>

                {doctors.length > 0 ? (
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {doctors.map((d) => (
                      <li key={d.slug}>
                        {d.hasProfile ? (
                          <Link
                            href={`/consultants/${d.slug}`}
                            className="group flex min-h-[64px] items-center justify-between gap-3 rounded-2xl border border-black/[0.06] bg-white px-4 py-3 transition-colors hover:border-accent/30 hover:bg-canvas-warm"
                          >
                            <span className="min-w-0">
                              <span className="block text-[15px] font-medium text-ink">
                                {d.name}
                              </span>
                              {d.shortRole && (
                                <span className="mt-0.5 block text-[13px] text-ink-muted">
                                  {d.shortRole}
                                </span>
                              )}
                            </span>
                            <span
                              aria-hidden
                              className="flex-none text-ink-muted/50 transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                            >
                              &rarr;
                            </span>
                          </Link>
                        ) : (
                          <div className="flex min-h-[64px] items-center rounded-2xl border border-black/[0.06] bg-canvas-warm px-4 py-3">
                            <span className="text-[15px] font-medium text-ink">
                              {d.name}
                            </span>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-5 max-w-2xl rounded-2xl border border-black/[0.06] bg-canvas-warm px-5 py-4 text-[15px] leading-relaxed text-ink-muted">
                    Please contact the practice to discuss diagnosis and
                    treatment options for this condition.
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="card-soft mt-14 p-6 md:p-8">
            <h2 className="font-display text-xl text-ink md:text-2xl">
              Not sure where to start?
            </h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-muted">
              Our practice manager can point you to the right consultant and
              arrange an appointment. You can also browse by treatment instead.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button href="/contact" variant="primary">
                Contact the practice
              </Button>
              <Button href="/consultants/by-treatment" variant="ghost">
                Browse by treatment
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
