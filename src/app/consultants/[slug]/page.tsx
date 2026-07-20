import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  getConsultantBySlug,
  getProfiledConsultantSlugs,
  getSpecialitiesForConsultant,
} from "@/content/queries";
import { pageMeta, physicianLd, breadcrumbLd } from "@/content/seo";
import JsonLd from "@/components/site/JsonLd";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import ConsultantHeroBackground, {
  CONSULTANT_HERO_VARIANTS,
} from "@/components/sections/consultants/ConsultantHeroBackground";

export function generateStaticParams() {
  return getProfiledConsultantSlugs().map((slug) => ({ slug }));
}

function initials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const c = getConsultantBySlug(params.slug);
  if (!c) return {};
  const specs = getSpecialitiesForConsultant(c.slug).map((s) => s.speciality.name);
  const title = c.seoTitle ?? `${c.name} — ${c.role}, Reading`;
  const description =
    c.seoDescription ??
    `${c.name} is a ${c.role.toLowerCase()} at Berkshire Oncology Partnership in Reading${
      specs.length ? `, treating ${specs.slice(0, 4).join(", ").toLowerCase()} cancers` : ""
    }.`;
  return pageMeta({ title, description, path: `/consultants/${c.slug}` });
}

export default function ConsultantProfile({
  params,
}: {
  params: { slug: string };
}) {
  const c = getConsultantBySlug(params.slug);
  if (!c) notFound();
  const treats = getSpecialitiesForConsultant(c.slug);

  // cycle the 4 watercolour colourways down the consultant list
  const heroVariant =
    Math.max(0, getProfiledConsultantSlugs().indexOf(c.slug)) %
    CONSULTANT_HERO_VARIANTS;

  const facts: { label: string; value: string }[] = [];
  if (c.gmc) facts.push({ label: "GMC number", value: c.gmc });
  if (c.consultantInReadingSince)
    facts.push({
      label: "Consultant in Reading since",
      value: String(c.consultantInReadingSince),
    });
  if (c.qualifications) facts.push({ label: "Qualifications", value: c.qualifications });
  if (c.medicalSchool)
    facts.push({
      label: "Qualified",
      value: `${c.medicalSchool.name}${c.medicalSchool.year ? `, ${c.medicalSchool.year}` : ""}`,
    });

  return (
    <article>
      <JsonLd
        data={[
          physicianLd(
            c,
            treats.map((t) => t.speciality),
          ),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Consultants", path: "/consultants" },
            { name: c.name, path: `/consultants/${c.slug}` },
          ]),
        ]}
      />

      <header className="relative overflow-hidden noise pt-32 md:pt-40">
        <ConsultantHeroBackground variant={heroVariant} />
        <div className="container-wide relative z-10 pb-12 md:pb-16">
          <div className="mb-6">
            <Breadcrumbs
              items={[
                { name: "Home", href: "/" },
                { name: "Consultants", href: "/consultants" },
                { name: c.name },
              ]}
            />
          </div>
          <Reveal>
            <span className="eyebrow">
              <span className="h-px w-8 bg-ink-muted" /> {c.role}
            </span>
          </Reveal>
          <Reveal delay={1}>
            <h1 className="heading-lg mt-4">{c.name}</h1>
          </Reveal>
        </div>
      </header>

      <div className="container-wide grid gap-10 py-14 md:py-20 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="card-soft overflow-hidden">
            <div className="relative aspect-[4/5] w-full bg-gradient-to-br from-accent/10 to-lilac/20">
              {c.photo ? (
                <Image
                  src={c.photo}
                  alt={`${c.name}, ${c.shortRole ?? c.role}, Berkshire Oncology Partnership, Reading`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover object-top"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="font-display text-6xl text-accent/60">
                    {initials(c.name)}
                  </span>
                </div>
              )}
            </div>
            {facts.length > 0 && (
              <dl className="divide-y divide-black/[0.06] px-6 py-2 text-sm">
                {facts.map((f) => (
                  <div key={f.label} className="py-3">
                    <dt className="text-xs uppercase tracking-[0.14em] text-ink-muted">
                      {f.label}
                    </dt>
                    <dd className="mt-1 text-ink">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="p-6 pt-4">
              <Button href="/contact" variant="primary" className="w-full justify-center">
                Contact the practice
              </Button>
            </div>
          </div>
        </aside>

        <div className="max-w-2xl">
          {c.clinicalInvolvement && c.clinicalInvolvement.length > 0 && (
            <Section title="About">
              {c.clinicalInvolvement.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </Section>
          )}

          {treats.length > 0 && (
            <div className="mb-12">
              <SectionHeading>Conditions treated</SectionHeading>
              <div className="flex flex-wrap gap-2">
                {treats.map((t) => (
                  <Link
                    key={t.speciality.slug}
                    href={`/specialities/${t.speciality.slug}`}
                    className="rounded-full border border-black/[0.08] bg-white px-3.5 py-1.5 text-sm text-ink-muted transition-colors hover:border-accent/40 hover:text-ink"
                  >
                    {t.speciality.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {c.research && c.research.length > 0 && (
            <Section title="Research & publications">
              {c.research.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </Section>
          )}

          {c.achievements && c.achievements.length > 0 && (
            <Section title="Achievements">
              {c.achievements.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </Section>
          )}

          {c.disclosures && c.disclosures.length > 0 && (
            <Section title="Disclosures">
              {c.disclosures.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </Section>
          )}
        </div>
      </div>
    </article>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="eyebrow mb-4">
      <span className="h-px w-8 bg-ink-muted" /> {children}
    </h2>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal className="mb-12">
      <SectionHeading>{title}</SectionHeading>
      <div className="space-y-4 text-[15px] leading-relaxed text-ink/75">
        {children}
      </div>
    </Reveal>
  );
}
