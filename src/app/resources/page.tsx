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
// Resources — information and support, for patients and for the people looking
// after them. Two groups: reading about treatment, and finding help with the
// rest of life. Both come from src/content/navigation.ts.
// ─────────────────────────────────────────────────────────────────────────────

const section = getSection("resources")!;

export const metadata: Metadata = pageMeta({
  title: "Resources and support",
  description:
    "Information, practical guidance and support for patients and families during cancer treatment — from Berkshire Oncology Partnership in Reading, Berkshire.",
  path: "/resources",
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

export default function ResourcesPage() {
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
        title="Resources and support"
        intro={section.summary}
        breadcrumbs={[{ name: "Home", href: "/" }, { name: section.label }]}
      />

      <section className="container-wide pb-24 pt-14 md:pb-32 md:pt-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="max-w-2xl text-[15px] leading-relaxed text-ink-muted">
              We are writing these pages with the consultants. In the meantime,
              the organisations we most often point patients and families
              towards are already listed on our{" "}
              <Link
                href="/links"
                className="text-accent underline-offset-2 hover:underline"
              >
                external organisations
              </Link>{" "}
              page.
            </p>
          </Reveal>

          {section.groups.map((group, gi) => (
            <div key={group.title ?? gi} className="mt-14 md:mt-20">
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

          {/* ── Ask us instead ── */}
          <Reveal>
            <div className="card-soft mt-16 p-6 md:mt-24 md:p-8">
              <h2 className="font-display text-xl text-ink md:text-2xl">
                Cannot find what you need?
              </h2>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-muted">
                If you are looking for something that is not here, our practice
                manager, {site.contact.practiceManager}, can help or pass your
                question to your consultant.
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
