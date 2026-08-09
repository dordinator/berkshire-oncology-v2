import type { Metadata } from "next";
import JsonLd from "@/components/site/JsonLd";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import {
  therapies,
  getConsultantsForTherapy,
  treatmentDisclaimer,
  trialsNote,
  sactNote,
  type Therapy,
} from "@/content/therapies";
import { getLocationsForTherapy } from "@/content/treatmentLocations";
import TreatmentsExplorer, {
  type TreatmentItemData,
} from "@/components/sections/treatments/TreatmentsExplorer";

// ─────────────────────────────────────────────────────────────────────────────
// /treatments — the hub, rebuilt as the click-to-swap explorer.
//
// This file owns the CONTENT: it maps each therapy plus the consultant edge
// list and the researched treatment→location map (treatmentLocations.ts,
// DRAFT until the practice signs it off) into explorer props, server-side.
// TreatmentsExplorer owns the choreography. The seven leaf pages under
// /treatments/[slug] carry the long-form copy this hub summarises.
//
// The closing band and the three standing notes (SACT, trials, disclaimer)
// live here as server-rendered HTML — the notes as native <details>, so
// they work before hydration. #clinical-trials keeps its anchor: the search
// index points at it.
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = pageMeta({
  title: "Treatments",
  description:
    "The cancer treatments provided by the consultants of Berkshire Oncology Partnership — chemotherapy, immunotherapy, targeted and hormone therapies, radiotherapy, brachytherapy and radioisotope therapy, across Reading, Windsor and Oxford.",
  path: "/treatments",
});

function toItem(therapy: Therapy): TreatmentItemData {
  return {
    slug: therapy.slug,
    title: therapy.title,
    summary: therapy.summary,
    group: therapy.group,
    href: `/treatments/${therapy.slug}`,
    what: therapy.what,
    whenConsidered: therapy.whenConsidered,
    expect: therapy.expect,
    consultants: getConsultantsForTherapy(therapy.slug).map((c) => ({
      slug: c.slug,
      name: c.name,
      shortRole: c.shortRole,
      photo: c.photo,
    })),
    locations: getLocationsForTherapy(therapy.slug).map(({ location, note }) => ({
      slug: location.slug,
      name: location.name,
      area: location.area,
      note,
    })),
    // CRUK / NHS / Macmillan — every "read more" on the sheet points here.
    sources: therapy.sources,
  };
}

const bandSteps = [
  {
    title: "The cancer",
    body: "Your diagnosis and the cancer type.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 5.5V3M12 21v-2.5M18.5 12H21M3 12h2.5M16.6 7.4l1.8-1.8M5.6 18.4l1.8-1.8M16.6 16.6l1.8 1.8M5.6 5.6l1.8 1.8" />
      </svg>
    ),
  },
  {
    title: "Your results",
    body: "Tests and scans that help us understand more.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
        <rect x="5" y="3.5" width="14" height="17" rx="2" />
        <path d="M9 3.5h6v3H9zM9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Your priorities",
    body: "Your values, goals and what matters most to you.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
      </svg>
    ),
  },
  {
    title: "Your consultation",
    body: "A conversation with your consultant about what's right for you.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
        <path d="M20 11.5a7.5 7.5 0 0 1-11 6.6L4 19.5l1.4-4.4A7.5 7.5 0 1 1 20 11.5Z" />
      </svg>
    ),
  },
];

const notes = [
  { id: "sact", title: "You may see “SACT” on letters", body: sactNote },
  { id: "clinical-trials", title: "Asking about clinical trials", body: trialsNote },
  { id: "disclaimer", title: "About this information", body: treatmentDisclaimer },
];

export default function TreatmentsPage() {
  const items = therapies.map(toItem);

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Treatments", path: "/treatments" },
        ])}
      />

      {/* ── The explorer — the title lives inside its left column, so the
             sheet can hang from the same top line and own the right-hand
             side of the frame from the first pixel. ── */}
      <section className="bg-[#f7f5f1]">
        <div className="container-wide pb-16 pt-28 md:pb-24">
          <TreatmentsExplorer items={items} />
        </div>
      </section>

      {/* ── The closing band — how a treatment decision is actually made ── */}
      <section className="border-t border-ink/10 bg-[#f3efe6]">
        <div className="container-wide grid gap-10 py-16 md:py-20 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2.6fr)] lg:gap-16">
          <div>
            <h2 className="max-w-[12ch] font-display text-[1.65rem] font-semibold leading-snug tracking-tight text-ink md:text-[1.9rem]">
              The name of a treatment is only the beginning.
            </h2>
            <div aria-hidden className="mt-4 h-[3px] w-10 rounded-full bg-[#e3bd6a]" />
          </div>
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {bandSteps.map((step, i) => (
              <li key={step.title} className="relative flex flex-col items-start lg:items-center lg:text-center">
                {/* hairline joining the steps, desktop only */}
                {i < bandSteps.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute left-[calc(50%+2.5rem)] top-7 hidden h-px w-[calc(100%-5rem)] bg-[#d9c9a3] lg:block"
                  />
                )}
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-ink/15 bg-white/70 text-ink">
                  {step.icon}
                </span>
                <p className="mt-4 font-display text-[1.05rem] font-semibold text-ink">
                  {step.title}
                </p>
                <p className="mt-1.5 max-w-[24ch] text-[13px] leading-relaxed text-ink-muted">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── The standing notes, quiet but present ── */}
      <section className="border-t border-ink/10 bg-[#f7f5f1]">
        <div className="container-wide py-10 md:py-12">
          <div className="grid gap-x-10 gap-y-2 lg:grid-cols-3">
            {notes.map((note) => (
              <details
                key={note.id}
                id={note.id}
                className="group scroll-mt-28 rounded-xl open:bg-white/60"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-3 py-3 text-[13.5px] font-medium text-ink/80 transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
                  {note.title}
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5 flex-none text-ink-muted transition-transform duration-300 group-open:-rotate-180 motion-reduce:transition-none"
                    aria-hidden
                  >
                    <path d="M3 5.5l5 5 5-5" />
                  </svg>
                </summary>
                <p className="px-3 pb-4 text-[13px] leading-relaxed text-ink-muted">
                  {note.body}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
