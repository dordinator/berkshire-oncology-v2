import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/site/JsonLd";
import PageHeader from "@/components/site/PageHeader";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import { getSection } from "@/content/navigation";
import {
  therapies,
  getTherapy,
  getConsultantsForTherapy,
  type Therapy,
} from "@/content/therapies";

// ─────────────────────────────────────────────────────────────────────────────
// /treatments — the index of treatment pages.
//
// Grouping follows the navigation ("Drug treatments", "Radiotherapy",
// "Research") so the menu and the page can never drift apart. Anything in
// therapies.ts that the navigation doesn't yet list still appears, at the end,
// rather than being silently dropped.
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = pageMeta({
  title: "Treatments",
  description:
    "The cancer treatments provided by the consultants of Berkshire Oncology Partnership — chemotherapy, immunotherapy, targeted and hormone therapies, radiotherapy, brachytherapy and radioisotope therapy.",
  path: "/treatments",
});

interface TherapyGroup {
  title: string;
  items: Therapy[];
}

function buildGroups(): TherapyGroup[] {
  const section = getSection("treatments");
  const used = new Set<string>();
  const groups: TherapyGroup[] = [];

  for (const group of section?.groups ?? []) {
    const items: Therapy[] = [];
    for (const link of group.links) {
      if (!link.href.startsWith("/treatments/")) continue;
      const therapy = getTherapy(link.href.slice("/treatments/".length));
      if (!therapy || used.has(therapy.slug)) continue;
      used.add(therapy.slug);
      items.push(therapy);
    }
    if (items.length > 0) groups.push({ title: group.title ?? "Treatments", items });
  }

  const remaining = therapies.filter((t) => !used.has(t.slug));
  if (remaining.length > 0) {
    groups.push({ title: "Other treatments", items: remaining });
  }

  return groups;
}

// A count is only honest where the mapping from each consultant's own wording is
// complete. Where a therapy carries a `note` the mapping is knowingly partial —
// SACT, for instance, matches one literal string while nine consultants provide
// drug treatments under other names — so the card shows no number at all rather
// than one that understates the partnership. The note itself is on the detail
// page.
function consultantCount(therapy: Therapy) {
  if (therapy.note) return null;
  const n = getConsultantsForTherapy(therapy.slug).length;
  if (n === 0) return null;
  return n === 1 ? "1 consultant lists this treatment" : `${n} consultants list this treatment`;
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
  const section = getSection("treatments");
  const groups = buildGroups();

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
        title="Treatments we provide"
        intro={section?.summary}
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Treatments" }]}
      />

      <section className="container-wide pb-24 pt-14 md:pb-32 md:pt-20">
        <div className="space-y-14 md:space-y-20">
          {groups.map((group) => (
            <div key={group.title}>
              <Reveal>
                <h2 className="font-display text-2xl text-ink md:text-3xl">
                  {group.title}
                </h2>
              </Reveal>
              <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {group.items.map((therapy, i) => (
                  <Reveal key={therapy.slug} delay={i} className="h-full">
                    <TherapyCard therapy={therapy} />
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Reveal>
          <div className="card-soft mt-16 p-6 md:p-8">
            <h2 className="font-display text-xl text-ink md:text-2xl">
              Not sure which treatment applies to you?
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
              Which treatment is right depends on the type of cancer, its stage
              and your own circumstances. Your consultant will talk this through
              with you. If you would like to ask before booking, the practice
              manager can help.
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
      </section>
    </>
  );
}
