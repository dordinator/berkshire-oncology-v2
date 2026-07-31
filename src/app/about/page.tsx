import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/site/JsonLd";
import PageHeader from "@/components/site/PageHeader";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import { site } from "@/content/site";
import { getAllConsultants } from "@/content/queries";
import { getSection, type NavLink } from "@/content/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// About Us — the front door for anyone working out who we are: patients
// checking us over, GPs deciding where to refer, colleagues enquiring.
//
// The figures below are counted from the consultant data rather than written
// by hand, so they cannot drift out of date. Everything else comes from the
// information architecture in src/content/navigation.ts.
// ─────────────────────────────────────────────────────────────────────────────

const section = getSection("about")!;

const consultants = getAllConsultants();
const facts = [
  {
    value: String(consultants.length),
    label: "consultant oncologists in the partnership",
  },
  {
    value: String(
      consultants.filter((c) => c.role === "Consultant Clinical Oncologist")
        .length,
    ),
    label: "consultant clinical oncologists",
  },
  {
    value: String(
      consultants.filter((c) => c.role === "Consultant Medical Oncologist")
        .length,
    ),
    label: "consultant medical oncologists",
  },
];

export const metadata: Metadata = pageMeta({
  title: "About us",
  description:
    "Berkshire Oncology Partnership is a partnership of independent consultant oncologists working together across Berkshire and the surrounding area.",
  path: "/about",
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
function LinkCard({ link, wide = false }: { link: NavLink; wide?: boolean }) {
  return (
    <Link
      href={link.href}
      className={`card-soft group flex h-full flex-col p-6 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_26px_58px_-24px_rgba(6,28,70,0.2)] md:p-8${
        wide ? " md:flex-row md:items-center md:gap-10" : ""
      }`}
    >
      <div className={wide ? "md:flex-1" : ""}>
        <h3 className="font-display text-xl leading-snug text-ink md:text-2xl">
          {link.label}
        </h3>
        {link.description && (
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-muted">
            {link.description}
          </p>
        )}
      </div>
      <div className={`mt-auto pt-7${wide ? " md:mt-0 md:pt-0" : ""}`}>
        <Arrow />
      </div>
    </Link>
  );
}

export default function AboutPage() {
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
        title="About the partnership"
        intro={section.summary}
        breadcrumbs={[{ name: "Home", href: "/" }, { name: section.label }]}
      />

      <section className="container-wide pb-24 pt-14 md:pb-32 md:pt-20">
        <div className="mx-auto max-w-6xl">
          {/* ── The partnership in figures, counted from the consultant data ── */}
          <Reveal>
            <div className="card-soft grid gap-7 p-6 sm:grid-cols-3 sm:gap-6 md:p-8">
              {facts.map((f) => (
                <div key={f.label}>
                  <div className="font-display text-4xl leading-none tracking-tight text-ink md:text-5xl">
                    {f.value}
                  </div>
                  <div className="mt-3 max-w-[15rem] text-[13px] leading-relaxed text-ink-muted">
                    {f.label}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {section.groups.map((group, gi) => (
            <div key={group.title ?? gi} className="mt-16 md:mt-24">
              {group.title && (
                <Reveal>
                  <h2 className="eyebrow">
                    <span aria-hidden className="h-px w-8 bg-ink-muted" />
                    {group.title}
                  </h2>
                </Reveal>
              )}
              <div className="mt-7 grid gap-4 sm:gap-5 md:mt-9 md:auto-rows-fr md:grid-cols-2">
                {group.links.map((link, i) => {
                  const isOddLast =
                    i === group.links.length - 1 && group.links.length % 2 === 1;
                  return (
                    <Reveal
                      key={link.href}
                      delay={i % 2}
                      className={`h-full${isOddLast ? " md:col-span-2" : ""}`}
                    >
                      <LinkCard link={link} wide={isOddLast} />
                    </Reveal>
                  );
                })}
              </div>
            </div>
          ))}

          {/* ── Enquiries ── */}
          <Reveal>
            <div className="card-soft mt-16 p-6 md:mt-24 md:p-8">
              <h2 className="font-display text-xl text-ink md:text-2xl">
                Speak to the practice
              </h2>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-muted">
                Enquiries about the partnership, referrals and appointments all
                come through our practice manager,{" "}
                {site.contact.practiceManager}, who can point you to the right
                consultant.
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
