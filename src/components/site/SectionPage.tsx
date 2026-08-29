import type { ReactNode } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import PageHeader from "./PageHeader";
import JsonLd from "./JsonLd";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import { site } from "@/content/site";
import { getNavLink, getSiblings } from "@/content/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// Shared layout for the pages the new navigation introduces.
//
// Most are scaffolds: the structure, breadcrumb, heading and outline are real,
// the prose is not written yet. Rather than fake it, the page says plainly what
// it will cover and offers the contact route in the meantime — a patient who
// lands here from search still gets somewhere useful to go.
//
// Pages that do have real content pass it as `children`; the outline is then
// only shown for whatever remains unwritten.
// ─────────────────────────────────────────────────────────────────────────────

export function sectionPageMeta(href: string, overrides?: Partial<Metadata>): Metadata {
  const link = getNavLink(href);
  const title = link?.label ?? "Berkshire Oncology Partnership";
  const description =
    link?.description ??
    `${title} — Berkshire Oncology Partnership, private oncology care in Reading, Berkshire.`;
  return { ...pageMeta({ title, description, path: href }), ...overrides };
}

/**
 * Standing safety route for the pages that promise "who to call urgently" and
 * have not been written yet. Nothing here is practice-specific — the helpline
 * number belongs to whichever unit is giving the treatment and is printed on the
 * patient's own alert card, and 111/999 are national. Without this a page that
 * advertises "warning signs that need urgent attention" offers an office
 * landline and nothing else.
 */
function UrgentHelp() {
  return (
    <Reveal>
      <div className="mb-12 rounded-3xl rounded-l-lg border border-accent/25 border-l-[3px] border-l-accent bg-accent/[0.05] px-5 py-5 md:px-7 md:py-6">
        <h2 className="font-display text-xl text-ink md:text-2xl">
          If you are unwell now
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink/80">
          Do not wait for this page, and do not wait for office hours. If you are
          having cancer treatment you will have been given a 24-hour acute
          oncology or chemotherapy helpline number — it is on your treatment
          record or your alert card. Use it.
        </p>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink/80">
          If you do not have that number to hand, call NHS 111. If someone is
          seriously unwell, call 999.
        </p>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
          A high temperature, shivering, breathlessness, bleeding or sudden
          confusion during treatment always needs to be checked the same day.
        </p>
      </div>
    </Reveal>
  );
}

export default function SectionPage({
  href,
  title,
  intro,
  children,
  headerAside,
  showOutline = true,
  omitCovers,
  urgent = false,
}: {
  href: string;
  title?: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  /** Rendered inside the page header, under the intro. Used by the treatment
   *  pages for the visual-density control. */
  headerAside?: ReactNode;
  showOutline?: boolean;
  /** Outline bullets this page already answers in `children` — listing them
   *  under "what this page will cover" reads as if nobody checked the page. */
  omitCovers?: string[];
  /** Show the standing urgent-symptom route. For pages that promise it. */
  urgent?: boolean;
}) {
  const link = getNavLink(href);
  const section = link?.section;
  const siblings = getSiblings(href).slice(0, 8);
  const covers = (link?.covers ?? []).filter((c) => !omitCovers?.includes(c));
  const heading = title ?? link?.label ?? "";
  const isReferrerPage = href === "/about/referring-professionals";

  const breadcrumbs = [
    { name: "Home", href: "/" },
    ...(section ? [{ name: section.label, href: section.href }] : []),
    { name: link?.label ?? String(heading) },
  ];

  return (
    <>
      <JsonLd
        data={breadcrumbLd(
          breadcrumbs.map((b) => ({ name: b.name, path: b.href ?? href })),
        )}
      />

      <PageHeader
        eyebrow={section?.label}
        title={heading}
        intro={intro ?? link?.description}
        breadcrumbs={breadcrumbs}
      >
        {headerAside}
      </PageHeader>

      <section className="container-wide pb-24 pt-14 md:pb-32 md:pt-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
          <div className="min-w-0">
            {urgent && <UrgentHelp />}

            {children}

            {showOutline && covers.length > 0 && (
              <Reveal>
                <div className={children ? "mt-14" : ""}>
                  <h2 className="font-display text-2xl text-ink md:text-3xl">
                    What this page will cover
                  </h2>
                  <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
                    We&rsquo;re writing this section with the consultants. It will
                    include:
                  </p>
                  <ul className="mt-7 space-y-3">
                    {covers.map((c) => (
                      <li
                        key={c}
                        className="flex gap-3.5 text-[15px] leading-relaxed text-ink/80 md:text-base"
                      >
                        <span
                          aria-hidden
                          className="mt-[0.6em] h-1.5 w-1.5 flex-none rounded-full bg-accent/50"
                        />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}

            <Reveal>
              <div className="card-soft mt-12 p-6 md:p-8">
                <h2 className="font-display text-xl text-ink md:text-2xl">
                  Need an answer now?
                </h2>
                <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-muted">
                  Our practice manager can answer most questions directly, and can
                  arrange an appointment with the right consultant.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button
                    href={isReferrerPage ? "/contact#referral" : "/contact#guidance"}
                    variant="primary"
                  >
                    {isReferrerPage ? "Open the referral route" : "Contact the practice"}
                  </Button>
                  <a
                    href={`tel:${site.contact.phone.replace(/\s+/g, "")}`}
                    className="rounded-full border border-ink/15 px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:border-ink/40 hover:bg-ink/[0.03]"
                  >
                    {site.contact.phone}
                  </a>
                </div>
              </div>
            </Reveal>
          </div>

          {siblings.length > 0 && section && (
            <aside className="lg:pt-1">
              <Reveal>
                <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
                  More in {section.label}
                </h2>
                <ul className="mt-5 space-y-1">
                  {siblings.map((s) => (
                    <li key={s.href}>
                      <Link
                        href={s.href}
                        className="group flex items-start gap-2 rounded-2xl px-3 py-2.5 -mx-3 text-[15px] text-ink/75 transition-colors hover:bg-ink/[0.035] hover:text-ink"
                      >
                        <span className="min-w-0 flex-1">{s.label}</span>
                        <span
                          aria-hidden
                          className="mt-0.5 flex-none text-ink-muted/50 transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                        >
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </aside>
          )}
        </div>
      </section>
    </>
  );
}
