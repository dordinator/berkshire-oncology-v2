import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/site/JsonLd";
import PageHeader from "@/components/site/PageHeader";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import { site } from "@/content/site";
import { getSection, type NavLink } from "@/content/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// Patients & Families — the front door for anyone arriving frightened.
//
// The first group ("Start here") leads: five large, quiet cards, one line each,
// so someone can find the sentence that sounds like them without reading a
// page of prose. Everything practical sits below it, deliberately smaller.
// The groups and their order come from src/content/navigation.ts.
// ─────────────────────────────────────────────────────────────────────────────

const section = getSection("patients")!;

export const metadata: Metadata = pageMeta({
  title: "Patients and families",
  description:
    "Where to start with Berkshire Oncology Partnership — a new diagnosis, a second opinion, private treatment, care already under way, or supporting someone through cancer.",
  path: "/patients",
});

function Arrow() {
  return (
    <span
      aria-hidden
      className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink-muted transition-colors duration-300 group-hover:border-accent/30 group-hover:bg-accent/[0.06] group-hover:text-accent"
    >
      <svg
        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
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
  );
}

// `wide` cards span both columns (the odd one out at the end of a group) and
// lay out horizontally from md up, so the extra width reads as deliberate.
function LeadCard({ link, wide = false }: { link: NavLink; wide?: boolean }) {
  return (
    <Link
      href={link.href}
      className={`card-soft group flex h-full flex-col p-7 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_28px_64px_-24px_rgba(6,28,70,0.22)] md:p-9${
        wide ? " md:flex-row md:items-center md:gap-10" : ""
      }`}
    >
      <div className={wide ? "md:flex-1" : ""}>
        <h3 className="font-display text-2xl leading-snug tracking-tight text-ink md:text-[1.7rem]">
          {link.label}
        </h3>
        {link.description && (
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted md:text-base">
            {link.description}
          </p>
        )}
      </div>
      <div className={`mt-auto pt-8${wide ? " md:mt-0 md:pt-0" : ""}`}>
        <Arrow />
      </div>
    </Link>
  );
}

function QuietCard({ link }: { link: NavLink }) {
  return (
    <Link
      href={link.href}
      className="card-soft group flex h-full flex-col p-6 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_54px_-24px_rgba(6,28,70,0.2)] md:p-7"
    >
      <h3 className="font-display text-xl leading-snug text-ink">
        {link.label}
      </h3>
      {link.description && (
        <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
          {link.description}
        </p>
      )}
      <div className="mt-auto pt-6">
        <Arrow />
      </div>
    </Link>
  );
}

function GroupHeading({ title }: { title: string }) {
  return (
    <Reveal>
      <h2 className="eyebrow">
        <span aria-hidden className="h-px w-8 bg-ink-muted" />
        {title}
      </h2>
    </Reveal>
  );
}

export default function PatientsPage() {
  const [startHere, practical] = section.groups;

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: section.label, path: section.href },
        ])}
      />

      <PageHeader
        eyebrow={section.label}
        title="Patients and families"
        intro={section.summary}
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: section.label },
        ]}
      />

      <section className="container-wide pb-24 pt-14 md:pb-32 md:pt-20">
        <div className="mx-auto max-w-6xl">
          {/* ── Start here: the five ways in, given room to breathe ── */}
          {startHere && (
            <div>
              {startHere.title && <GroupHeading title={startHere.title} />}
              <div className="mt-7 grid gap-4 sm:gap-5 md:mt-9 md:auto-rows-fr md:grid-cols-2">
                {startHere.links.map((link, i) => {
                  const isOddLast =
                    i === startHere.links.length - 1 &&
                    startHere.links.length % 2 === 1;
                  return (
                    <Reveal
                      key={link.href}
                      delay={i % 2}
                      className={`h-full${isOddLast ? " md:col-span-2" : ""}`}
                    >
                      <LeadCard link={link} wide={isOddLast} />
                    </Reveal>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Practical information: deliberately quieter ── */}
          {practical && (
            <div className="mt-16 md:mt-24">
              {practical.title && <GroupHeading title={practical.title} />}
              <div className="mt-7 grid gap-4 md:mt-9 md:auto-rows-fr md:grid-cols-3">
                {practical.links.map((link, i) => (
                  <Reveal key={link.href} delay={i % 3} className="h-full">
                    <QuietCard link={link} />
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {/* ── Somebody to talk to ── */}
          <Reveal>
            <div className="card-soft mt-16 p-6 md:mt-24 md:p-8">
              <h2 className="font-display text-xl text-ink md:text-2xl">
                Not sure where to start?
              </h2>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-muted">
                You do not need to know the right question. Our practice
                manager, {site.contact.practiceManager}, can talk things through
                and arrange an appointment with the right consultant.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button href="/contact" variant="primary">
                  Contact the practice
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
      </section>
    </>
  );
}
