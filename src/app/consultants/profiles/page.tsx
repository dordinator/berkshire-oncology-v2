import type { Metadata } from "next";
import Link from "next/link";
import { getAllConsultants } from "@/content/queries";
import type { Consultant } from "@/content/types";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import JsonLd from "@/components/site/JsonLd";
import PageHeader from "@/components/site/PageHeader";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";

// ─────────────────────────────────────────────────────────────────────────────
// A plain A–Z index of every profile, sorted by surname. Names are stored as
// "Dr Firstname Surname", so the surname is the last word.
// ─────────────────────────────────────────────────────────────────────────────

const PATH = "/consultants/profiles";

export const metadata: Metadata = pageMeta({
  title: "Consultant Profiles A–Z",
  description:
    "An A–Z index of the consultant oncologists of Berkshire Oncology Partnership, with role and GMC number, linking to each full profile.",
  path: PATH,
});

function surname(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] ?? name;
}

export default function ConsultantProfilesPage() {
  const sorted = getAllConsultants()
    .slice()
    .sort((a, b) => surname(a.name).localeCompare(surname(b.name), "en-GB"));

  const groups: { letter: string; people: Consultant[] }[] = [];
  for (const c of sorted) {
    const letter = surname(c.name).charAt(0).toUpperCase();
    const last = groups[groups.length - 1];
    if (last && last.letter === letter) last.people.push(c);
    else groups.push({ letter, people: [c] });
  }

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Consultants", path: "/consultants" },
          { name: "Consultant profiles", path: PATH },
        ])}
      />

      <PageHeader
        eyebrow="Consultants"
        title="Consultant profiles"
        intro="Every consultant in the partnership, listed A to Z by surname. Each profile sets out their training, the cancers they treat and their research."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Consultants", href: "/consultants" },
          { name: "Consultant profiles" },
        ]}
      />

      <section className="container-wide pb-24 pt-14 md:pb-32 md:pt-20">
        <div className="max-w-4xl space-y-10">
          {groups.map((group) => (
            <Reveal key={group.letter}>
              <div className="grid gap-4 md:grid-cols-[64px_minmax(0,1fr)] md:gap-6">
                <h2
                  aria-label={`Surnames beginning with ${group.letter}`}
                  className="font-display text-2xl text-ink-muted md:pt-3 md:text-3xl"
                >
                  {group.letter}
                </h2>
                <ul className="space-y-3">
                  {group.people.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/consultants/${c.slug}`}
                        className="group flex min-h-[72px] items-center justify-between gap-4 rounded-2xl border border-black/[0.06] bg-white px-5 py-4 transition-colors hover:border-accent/30 hover:bg-canvas-warm"
                      >
                        <span className="min-w-0">
                          <span className="block font-display text-lg text-ink md:text-xl">
                            {c.name}
                          </span>
                          <span className="type-supporting mt-1 block text-ink-muted">
                            {c.role}
                            {c.gmc && (
                              <>
                                <span aria-hidden className="px-2 text-ink-muted/50">
                                  &middot;
                                </span>
                                GMC {c.gmc}
                              </>
                            )}
                          </span>
                        </span>
                        <span
                          aria-hidden
                          className="flex-none text-ink-muted/50 transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                        >
                          &rarr;
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="card-soft mt-14 max-w-4xl p-6 md:p-8">
            <h2 className="font-display text-xl text-ink md:text-2xl">
              Another way to look
            </h2>
            <p className="type-body mt-3 max-w-xl text-ink-muted">
              If you already know the diagnosis or the treatment involved, those
              routes will usually get you to the right consultant faster.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button href="/specialities" variant="primary">
                Browse by cancer type
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
