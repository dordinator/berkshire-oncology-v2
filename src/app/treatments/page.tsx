import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/site/JsonLd";
import PageHeader from "@/components/site/PageHeader";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import ModeToggle from "@/components/treatments/ModeToggle";
import { AmbientBand } from "@/components/treatments/TreatmentVisuals";
import { locations } from "@/content/locations";
import {
  therapyGroups,
  getTherapiesInGroup,
  getConsultantsForTherapy,
  treatmentDisclaimer,
  trialsNote,
  sactNote,
  type Therapy,
} from "@/content/therapies";

// ─────────────────────────────────────────────────────────────────────────────
// /treatments — the hub.
//
// Framed around what this partnership actually is: consultants who treat at
// partner hospitals, not a centre with its own equipment. So the hub leads with
// that fact rather than burying it, groups the seven treatments the way the
// navigation does, and carries the two explanations that are not pages of their
// own — SACT (an umbrella term) and clinical trials (which the practice's own
// material does not evidence).
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = pageMeta({
  title: "Treatments",
  description:
    "The cancer treatments provided by the consultants of Berkshire Oncology Partnership — chemotherapy, immunotherapy, targeted and hormone therapies, radiotherapy, brachytherapy and radioisotope therapy, across Reading, Windsor and Oxford.",
  path: "/treatments",
});

function consultantCount(therapy: Therapy) {
  // A count is only honest where the mapping from each consultant's own wording
  // is complete. Where a therapy carries a `note` the mapping is knowingly
  // partial, so the card shows no number rather than one that understates the
  // partnership. The note itself is on the detail page.
  if (therapy.note) return null;
  const n = getConsultantsForTherapy(therapy.slug).length;
  if (n === 0) return null;
  return n === 1
    ? "1 consultant lists this treatment"
    : `${n} consultants list this treatment`;
}

function TherapyCard({ therapy }: { therapy: Therapy }) {
  const count = consultantCount(therapy);

  return (
    <Link
      href={`/treatments/${therapy.slug}`}
      className="group card-soft flex h-full flex-col p-6 transition-transform duration-300 hover:-translate-y-1 md:p-7"
    >
      <h3 className="font-display text-xl text-ink">{therapy.title}</h3>
      <p className="mt-3 flex-1 text-[15px] leading-relaxed text-ink-muted">
        {therapy.summary}
      </p>
      {count && <p className="mt-5 text-sm text-ink/70">{count}</p>}
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
        Read more
        <svg
          aria-hidden
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M3 8h10M9 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
  );
}

export default function TreatmentsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Treatments", path: "/treatments" },
        ])}
      />

      <PageHeader
        eyebrow="Treatments"
        title="Treatments our consultants provide"
        intro="Our consultants diagnose, plan and oversee cancer treatment, and deliver it at the partner hospitals they practise from across Reading, Windsor and Oxford. These pages explain what each treatment is, who provides it, and what happens next."
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Treatments" }]}
      >
        <ModeToggle />
      </PageHeader>

      <section className="relative overflow-hidden">
        <AmbientBand className="absolute inset-x-0 top-0 h-[190px] w-full md:h-[230px]" />

        <div className="container-wide relative pb-24 pt-16 md:pb-32 md:pt-24">
          <div className="space-y-14 md:space-y-20">
            {therapyGroups.map((group) => (
              <div key={group.id}>
                <Reveal>
                  <h2 className="font-display text-2xl text-ink md:text-3xl">
                    {group.title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
                    {group.blurb}
                  </p>
                </Reveal>
                <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {getTherapiesInGroup(group.id).map((therapy, i) => (
                    <Reveal key={therapy.slug} delay={i} className="h-full">
                      <TherapyCard therapy={therapy} />
                    </Reveal>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── Where treatment happens ─────────────────────────────────── */}
          <Reveal>
            <div className="mt-16 md:mt-20">
              <h2 className="font-display text-2xl text-ink md:text-3xl">
                Where treatment happens
              </h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
                We are a partnership of independent consultants rather than a
                hospital, so treatment is delivered at the sites our consultants
                practise from. Which one is right for you depends on your
                consultant and your treatment, and is confirmed when your care is
                arranged.
              </p>
              <ul className="mt-7 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                {locations.map((l) => (
                  <li key={l.slug}>
                    <Link
                      href={`/locations/${l.slug}`}
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-black/[0.06] bg-white/70 px-4 py-3.5 transition-colors hover:border-accent/30 hover:bg-accent/[0.04]"
                    >
                      <span className="min-w-0">
                        <span className="block text-[15px] text-ink">
                          {l.name}
                        </span>
                        <span className="mt-0.5 block text-[13px] text-ink-muted">
                          {l.area}
                          {l.nhs ? " · NHS" : ""}
                        </span>
                      </span>
                      <span
                        aria-hidden
                        className="flex-none text-ink-muted/50 transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                      >
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* ── Two things that aren't pages ───────────────────────────── */}
          <div className="mt-16 grid gap-5 md:mt-20 lg:grid-cols-2">
            <Reveal className="h-full">
              <div className="card-soft h-full p-6 md:p-7">
                <h2 className="font-display text-xl text-ink md:text-2xl">
                  If you have seen the term &lsquo;SACT&rsquo;
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
                  {sactNote}
                </p>
              </div>
            </Reveal>

            <Reveal className="h-full">
              <div id="clinical-trials" className="card-soft h-full scroll-mt-28 p-6 md:p-7">
                <h2 className="font-display text-xl text-ink md:text-2xl">
                  Clinical trials
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
                  {trialsNote}
                </p>
              </div>
            </Reveal>
          </div>

          {/* ── Onward ─────────────────────────────────────────────────── */}
          <Reveal>
            <div className="card-soft mt-16 p-6 md:p-8">
              <h2 className="font-display text-xl text-ink md:text-2xl">
                Not sure which treatment applies to you?
              </h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
                Which treatment is right depends on the type of cancer, its stage
                and your own circumstances. Your consultant will talk this
                through with you. If you would like to ask before booking, the
                practice manager can help.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button href="/contact" variant="primary">
                  Contact the practice
                </Button>
                <Button href="/consultants" variant="ghost">
                  Find a consultant
                </Button>
              </div>
            </div>
          </Reveal>

          {/* ── Standing disclaimer ────────────────────────────────────── */}
          <Reveal>
            <div className="mt-12 rounded-3xl border border-black/[0.06] bg-canvas-soft/60 px-5 py-5 md:px-7 md:py-6">
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
                About this information
              </h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink/75">
                {treatmentDisclaimer}
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
