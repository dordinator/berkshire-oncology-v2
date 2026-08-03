import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getAllSpecialities,
  getSpecialityBySlug,
  getConsultantsForSpeciality,
  type SpecialityConsultant,
} from "@/content/queries";
import { pageMeta, conditionLd, breadcrumbLd } from "@/content/seo";
import { getCancerInfo, type Approach } from "@/content/cancerInfo";
import { getGroupForSlug, getGroupSiblings } from "@/content/cancerGroups";
import { careSites, privateCareSites, type CareSite } from "@/content/careDelivery";
import { getTherapy } from "@/content/therapies";
import { site } from "@/content/site";
import JsonLd from "@/components/site/JsonLd";
import PageHeader from "@/components/site/PageHeader";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import CancerPathway from "@/components/sections/cancer/CancerPathway";
import type { CareMapData } from "@/components/graphic/CareMap";

// ─────────────────────────────────────────────────────────────────────────────
// /specialities/[slug] — one page per cancer type, all to the same shape:
//
//   1. What the partnership treats
//   2. Which consultants specialise in it
//   3. How care is joined up (the graphic)
//   4. Typical diagnostic and staging context
//   5. Possible treatment approaches
//   6. Where care may be delivered
//   7. What to do next, and where to get support
//
// Sections 1, 4 and 5 need written clinical content (src/content/cancerInfo.ts).
// Where that isn't written yet the page still works — it runs on the real
// consultant, treatment and location data and says plainly that the clinical
// detail is being written, rather than showing an empty heading.
// ─────────────────────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return getAllSpecialities().map((s) => ({ slug: s.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const s = getSpecialityBySlug(params.slug);
  if (!s) return {};
  const info = getCancerInfo(s.slug);
  const names = getConsultantsForSpeciality(s.slug).map((c) => c.name);
  const title = s.seoTitle ?? `${s.title} — Private Treatment in Reading`;
  const description =
    s.seoDescription ??
    (info
      ? `${s.title}: what Berkshire Oncology Partnership treats, the consultants who specialise in it, how it is diagnosed and staged, treatment approaches and where care is delivered.`
      : `Consultant oncologists at Berkshire Oncology Partnership treating ${s.title.toLowerCase()} privately in Reading, Berkshire${
          names.length ? `: ${names.join(", ")}.` : "."
        }`);
  return pageMeta({ title, description, path: `/specialities/${s.slug}` });
}

// ── small shared pieces ──────────────────────────────────────────────────────

function Section({
  id,
  eyebrow,
  title,
  lead,
  children,
  tint = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  lead?: ReactNode;
  children: ReactNode;
  tint?: boolean;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 py-14 md:py-20 ${tint ? "bg-canvas-soft/45" : ""}`}
    >
      <div className="container-wide">
        <Reveal>
          <span className="eyebrow">
            <span className="h-px w-8 bg-ink-muted" /> {eyebrow}
          </span>
          <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight text-ink md:text-4xl">
            {title}
          </h2>
          {lead && (
            <p className="mt-5 max-w-3xl text-[16px] leading-relaxed text-ink/80 md:text-[17px]">
              {lead}
            </p>
          )}
        </Reveal>
        {children}
      </div>
    </section>
  );
}

const ROUTES = [
  {
    href: "#consultants",
    label: "Meet the consultants",
    hint: "Who treats this, and what they specialise in",
  },
  {
    href: "#treatments",
    label: "Treatment approaches",
    hint: "What may be involved, and what each one means",
  },
  {
    href: "#where",
    label: "Where care happens",
    hint: "Which site, and why it depends on the treatment",
  },
  {
    href: "/tariffs",
    label: "Fees and insurance",
    hint: "Self-pay and insured routes, before you commit",
  },
];

function RouteBoxes({ hasCover }: { hasCover: boolean }) {
  // A page for a cancer no partner treats has no treatments or locations
  // section to jump to, so it only offers the routes that exist.
  const routes = hasCover
    ? ROUTES
    : [
        {
          href: "/consultants",
          label: "All ten consultants",
          hint: "What the partnership does cover",
        },
        ROUTES[3],
      ];

  return (
    <ul className={`grid gap-3 sm:grid-cols-2 ${hasCover ? "lg:grid-cols-4" : ""}`}>
      {routes.map((r, i) => (
        <Reveal key={r.href} as="li" delay={i} className="h-full">
          <Link
            href={r.href}
            className="card-soft group flex h-full flex-col justify-between gap-4 p-5 transition-transform duration-300 hover:-translate-y-1"
          >
            <span className="font-display text-[17px] leading-snug text-ink">
              {r.label}
            </span>
            <span className="flex items-end justify-between gap-3">
              <span className="text-[13px] leading-relaxed text-ink-muted">
                {r.hint}
              </span>
              <span
                aria-hidden
                className="flex-none text-ink-muted/45 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent"
              >
                →
              </span>
            </span>
          </Link>
        </Reveal>
      ))}
    </ul>
  );
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

function ConsultantRow({ c }: { c: SpecialityConsultant }) {
  const body = (
    <>
      <div className="relative h-16 w-16 flex-none overflow-hidden rounded-2xl bg-gradient-to-br from-accent/10 to-lilac/20">
        {c.photo ? (
          <Image
            src={c.photo}
            alt={`${c.name}, ${c.shortRole ?? c.role ?? "Consultant Oncologist"}`}
            fill
            sizes="64px"
            className="object-cover object-top"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-display text-lg text-accent/60">
            {initials(c.name)}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <span className="block font-display text-lg text-ink">{c.name}</span>
        <span className="mt-0.5 block text-sm text-ink-muted">
          {c.role ?? c.shortRole}
        </span>
        {c.modality && c.modality.length > 0 && (
          <span className="mt-3 flex flex-wrap gap-1.5">
            <span className="sr-only">Treatments listed on their profile:</span>
            {c.modality.map((m) => (
              <span
                key={m}
                className="rounded-full border border-black/[0.06] bg-canvas-soft px-2.5 py-1 text-xs text-ink-muted"
              >
                {m}
              </span>
            ))}
          </span>
        )}
      </div>

      {c.hasProfile && (
        <span
          aria-hidden
          className="mt-1 flex-none text-ink-muted/45 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent"
        >
          →
        </span>
      )}
    </>
  );

  if (!c.hasProfile) {
    return <div className="card-soft flex h-full items-start gap-4 p-5 md:p-6">{body}</div>;
  }

  return (
    <Link
      href={`/consultants/${c.slug}`}
      className="card-soft group flex h-full items-start gap-4 p-5 transition-transform duration-300 hover:-translate-y-1 md:p-6"
    >
      {body}
    </Link>
  );
}

function ApproachCard({ approach }: { approach: Approach }) {
  const therapy = approach.therapy ? getTherapy(approach.therapy) : undefined;
  const href = approach.href ?? (therapy ? `/treatments/${therapy.slug}` : undefined);

  const inner = (
    <>
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-display text-xl text-ink">{approach.title}</h3>
        {href && (
          <span
            aria-hidden
            className="mt-1 flex-none text-ink-muted/45 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent"
          >
            →
          </span>
        )}
      </div>
      {approach.byOthers && (
        <span className="mt-3 inline-flex items-center rounded-full border border-black/[0.07] bg-canvas-soft px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-ink-muted">
          Not carried out by our consultants
        </span>
      )}
      <p className="mt-3 text-[15px] leading-relaxed text-ink/80">{approach.body}</p>
    </>
  );

  if (!href) {
    return <div className="card-soft h-full p-6 md:p-7">{inner}</div>;
  }

  return (
    <Link
      href={href}
      className="card-soft group block h-full p-6 transition-transform duration-300 hover:-translate-y-1 md:p-7"
    >
      {inner}
    </Link>
  );
}

function SiteCard({ site: s, radiotherapy }: { site: CareSite; radiotherapy: boolean }) {
  return (
    <div
      className={`card-soft h-full p-6 md:p-7 ${
        radiotherapy ? "border-[#c9a35a]/35" : ""
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h3 className="font-display text-xl text-ink">{s.name}</h3>
        <span className="text-[13px] text-ink-muted">{s.area}</span>
        {radiotherapy && (
          <span className="rounded-full border border-[#c9a35a]/40 bg-[#c9a35a]/[0.09] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-[#8a6516]">
            Radiotherapy
          </span>
        )}
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-ink/80">{s.summary}</p>
      <ul className="mt-4 space-y-2">
        {s.detail.map((d) => (
          <li
            key={d}
            className="flex gap-3 text-[14px] leading-relaxed text-ink-muted"
          >
            <span
              aria-hidden
              className="mt-[0.55em] h-1 w-1 flex-none rounded-full bg-accent/45"
            />
            {d}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
        <Link
          href={`/locations/${s.slug}`}
          className="font-medium text-accent underline-offset-2 hover:underline"
        >
          About this location
        </Link>
        <a
          href={s.source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink-muted underline-offset-2 hover:text-ink hover:underline"
        >
          Their own service list
        </a>
      </div>
    </div>
  );
}

// ── the page ─────────────────────────────────────────────────────────────────

export default function SpecialityPage({
  params,
}: {
  params: { slug: string };
}) {
  const speciality = getSpecialityBySlug(params.slug);
  if (!speciality) notFound();

  const info = getCancerInfo(speciality.slug);
  const doctors = getConsultantsForSpeciality(speciality.slug);
  const group = getGroupForSlug(speciality.slug);
  const siblings = getGroupSiblings(speciality.slug)
    .map((s) => getSpecialityBySlug(s))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  // Which of our treatment pages are relevant here, from the written content
  // where it exists and from what the consultants themselves list where it
  // doesn't. Never invented.
  const approachTherapies = (info?.approaches ?? [])
    .map((a) => a.therapy)
    .filter((t): t is string => Boolean(t));
  const listedModalities = Array.from(
    new Set(doctors.flatMap((d) => d.modality ?? [])),
  );
  const usesRadiotherapy =
    approachTherapies.includes("radiotherapy") ||
    approachTherapies.includes("brachytherapy") ||
    listedModalities.some((m) => /radio/i.test(m));
  const usesDrugTreatment =
    approachTherapies.some((t) =>
      ["chemotherapy", "immunotherapy", "targeted-therapies", "hormone-therapy"].includes(t),
    ) || listedModalities.some((m) => !/radio/i.test(m));

  const relevantSites = privateCareSites.filter(
    (s) =>
      (usesRadiotherapy && s.capabilities.includes("radiotherapy")) ||
      (usesDrugTreatment && s.capabilities.includes("chemotherapy")) ||
      s.capabilities.includes("consultations"),
  );
  const nhsSite = careSites.find((s) => s.nhs);

  // The pathway graphic, built from this cancer's own data.
  //
  // Which consultant connects to which treatment comes from the modalities each
  // one lists on their own profile — not from their job title. Two of the
  // partnership's medical oncologists list radiotherapy, and the diagram has to
  // follow the practice's own record rather than a general assumption about
  // what medical oncologists do. Where a consultant lists nothing (Dr Davis's
  // profile carries specialities only), they connect to drug treatment and
  // never to radiotherapy: an unlisted modality is not evidence of one.
  const givesRadiotherapy = (d: SpecialityConsultant) =>
    (d.modality ?? []).some((m) => /radio/i.test(m));
  const givesDrugTreatment = (d: SpecialityConsultant) =>
    (d.modality ?? []).length === 0 ||
    (d.modality ?? []).some((m) => !/radio/i.test(m));

  const treatmentNodes: CareMapData["treatments"] = [];
  if (usesDrugTreatment) {
    treatmentNodes.push({
      id: "drug",
      label: "Drug treatment",
      from: doctors.filter(givesDrugTreatment).map((d) => d.slug),
    });
  }
  if (usesRadiotherapy) {
    treatmentNodes.push({
      id: "rt",
      label: "Radiotherapy",
      accent: true,
      from: doctors.filter(givesRadiotherapy).map((d) => d.slug),
    });
  }
  if (treatmentNodes.length === 0) {
    treatmentNodes.push({ id: "consult", label: "Consultation and review" });
  }

  const mapData: CareMapData = {
    cancer: speciality.title,
    consultants: doctors.length
      ? doctors.map((d) => ({
          id: d.slug,
          label: d.name,
          meta: d.shortRole ?? d.role,
        }))
      : [{ id: "none", label: "No partner currently lists this", meta: "Contact the practice" }],
    treatments: treatmentNodes,
    locations: relevantSites.map((s) => ({
      id: s.slug,
      label: s.name,
      meta: s.area,
      accent: s.capabilities.includes("radiotherapy"),
      from: s.capabilities.includes("radiotherapy")
        ? treatmentNodes.map((t) => t.id)
        : treatmentNodes.filter((t) => t.id !== "rt").map((t) => t.id),
    })),
  };

  return (
    <>
      <JsonLd
        data={[
          conditionLd(speciality),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Cancer Types", path: "/specialities" },
            { name: speciality.title, path: `/specialities/${speciality.slug}` },
          ]),
        ]}
      />

      <PageHeader
        eyebrow={group ? group.label : "Cancer Types"}
        title={speciality.title}
        intro={info?.overview[0] ?? group?.blurb}
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Cancer Types", href: "/specialities" },
          { name: speciality.title },
        ]}
      >
        <RouteBoxes hasCover={doctors.length > 0} />
      </PageHeader>

      {/* ── 1. what the partnership treats ── */}
      <Section
        id="what-we-treat"
        eyebrow="What we treat"
        title={`${speciality.title} at the partnership`}
      >
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
          <div className="min-w-0">
            {info ? (
              <>
                <div className="space-y-5">
                  {info.overview.slice(1).map((p) => (
                    <Reveal key={p.slice(0, 24)} as="p">
                      <span className="block max-w-2xl text-[16px] leading-relaxed text-ink/85 md:text-[17px]">
                        {p}
                      </span>
                    </Reveal>
                  ))}
                </div>

                <Reveal>
                  <ul className="mt-9 space-y-3">
                    {info.scope.map((s) => (
                      <li
                        key={s}
                        className="flex gap-3.5 text-[15px] leading-relaxed text-ink/80 md:text-base"
                      >
                        <span
                          aria-hidden
                          className="mt-[0.62em] h-1.5 w-1.5 flex-none rounded-full bg-accent/50"
                        />
                        {s}
                      </li>
                    ))}
                  </ul>
                </Reveal>

                {info.scopeNote && (
                  <Reveal>
                    <p className="mt-8 max-w-2xl rounded-3xl rounded-l-lg border border-black/[0.06] border-l-2 border-l-accent/40 bg-accent/[0.04] px-5 py-5 text-[15px] leading-relaxed text-ink/80 md:px-7">
                      {info.scopeNote}
                    </p>
                  </Reveal>
                )}
              </>
            ) : (
              <Reveal>
                <p className="max-w-2xl text-[16px] leading-relaxed text-ink/85 md:text-[17px]">
                  {doctors.length > 0 ? (
                    <>
                      The consultants listed below treat{" "}
                      {speciality.title.toLowerCase()} privately across Reading,
                      Windsor and Oxford. The plain-English guide to how this
                      cancer is diagnosed, staged and treated is being written
                      with them, and will appear here once they have reviewed
                      it. In the meantime the practice can answer any question
                      directly, and everything below — who treats it, what they
                      provide, and where — is current.
                    </>
                  ) : (
                    <>
                      No partner in the practice currently lists{" "}
                      {speciality.title.toLowerCase()} among their specialities.
                      This page is here because the condition was listed on the
                      practice&rsquo;s previous website, and someone arriving
                      from an old link deserves a straight answer rather than a
                      missing page. Please contact the practice — we will tell
                      you where this is treated locally.
                    </>
                  )}
                </p>
              </Reveal>
            )}
          </div>

          {siblings.length > 0 && (
            <aside className="lg:pt-2">
              <Reveal>
                <div className="card-soft p-6">
                  <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
                    Also in {group?.label}
                  </h3>
                  <ul className="mt-4 space-y-1">
                    {siblings.map((s) => (
                      <li key={s.slug}>
                        <Link
                          href={`/specialities/${s.slug}`}
                          className="group -mx-3 flex items-start gap-2 rounded-2xl px-3 py-2.5 text-[15px] text-ink/75 transition-colors hover:bg-ink/[0.035] hover:text-ink"
                        >
                          <span className="min-w-0 flex-1">{s.title}</span>
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
                </div>
              </Reveal>
            </aside>
          )}
        </div>
      </Section>

      {/* ── 2. consultant expertise ── */}
      <Section
        id="consultants"
        eyebrow="Consultant expertise"
        tint
        title={
          doctors.length
            ? `The ${doctors.length === 1 ? "consultant" : `${doctors.length} consultants`} who treat this`
            : "Consultant cover"
        }
        lead={
          doctors.length
            ? "Each consultant is an independent practitioner. The treatments shown under each name are the ones they list on their own profile, in their own wording."
            : undefined
        }
      >
        {doctors.length > 0 ? (
          <>
            <ul className="mt-8 grid gap-4 lg:grid-cols-2">
              {doctors.map((c, i) => (
                <Reveal key={c.slug} as="li" delay={Math.min(i, 5)} className="h-full">
                  <ConsultantRow c={c} />
                </Reveal>
              ))}
            </ul>
            <Reveal>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button href="/consultants/choosing-a-consultant" variant="ghost">
                  How to choose the right consultant
                </Button>
                <Button href="/consultants" variant="ghost">
                  All ten consultants
                </Button>
              </div>
            </Reveal>
          </>
        ) : (
          <Reveal>
            <div className="card-soft mt-8 max-w-2xl p-6 md:p-8">
              <p className="text-[16px] leading-relaxed text-ink/85">
                No partner in the practice currently lists {speciality.title.toLowerCase()}{" "}
                among their specialities. We would rather say that plainly than
                take an appointment we are not the right people for.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
                Contact the practice and we will tell you where this is treated
                locally, and can pass your details on if that helps.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href="/contact">Contact the practice</Button>
              </div>
            </div>
          </Reveal>
        )}
      </Section>

      {/* ── 3. the pathway graphic ──
          Skipped where no partner treats this cancer: a diagram of consultants,
          treatments and sites would imply cover the practice does not have. */}
      {doctors.length > 0 && (
        <section className="container-wide py-14 md:py-20">
          <CancerPathway data={mapData} note={info?.deliveryNote} />
        </section>
      )}

      {/* ── 4. diagnosis and staging ── */}
      {info && (
        <Section
          id="diagnosis"
          eyebrow="Diagnosis and staging"
          tint
          title="How this is usually diagnosed and staged"
          lead={info.diagnosis.intro}
        >
          <ol className="mt-9 grid gap-4 md:grid-cols-2">
            {info.diagnosis.steps.map((step, i) => (
              <Reveal key={step.title} as="li" delay={Math.min(i, 4)} className="h-full">
                <div className="card-soft h-full p-6 md:p-7">
                  <span className="font-display text-sm text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 font-display text-xl text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink/80">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>

          {info.diagnosis.stagingNote && (
            <Reveal>
              <div className="mt-8 max-w-3xl rounded-3xl rounded-l-lg border border-black/[0.06] border-l-2 border-l-accent/40 bg-white px-5 py-5 md:px-7 md:py-6">
                <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
                  What the words mean
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/80">
                  {info.diagnosis.stagingNote}
                </p>
              </div>
            </Reveal>
          )}
        </Section>
      )}

      {/* ── 5. treatment approaches ── */}
      {doctors.length > 0 && (
      <Section
        id="treatments"
        eyebrow="Treatment"
        title="Approaches that may be involved"
        lead={
          info
            ? "Which of these apply depends on the type, the stage and on you. Nothing here is a recommendation — it is what the conversation with your consultant is likely to cover."
            : "The treatments the consultants above provide. Which apply depends on the type, the stage and on you."
        }
      >
        {info ? (
          <ul className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {info.approaches.map((a, i) => (
              <Reveal key={a.title} as="li" delay={Math.min(i, 6)} className="h-full">
                <ApproachCard approach={a} />
              </Reveal>
            ))}
          </ul>
        ) : listedModalities.length > 0 ? (
          <Reveal>
            <ul className="mt-8 flex flex-wrap gap-2.5">
              {listedModalities.map((m) => (
                <li key={m}>
                  <span className="inline-flex min-h-[44px] items-center rounded-full border border-ink/12 px-5 text-sm text-ink">
                    {m}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
              Taken from what each consultant lists on their own profile. Full
              explanations of each treatment are on the{" "}
              <Link
                href="/treatments"
                className="font-medium text-accent underline-offset-2 hover:underline"
              >
                treatments pages
              </Link>
              .
            </p>
          </Reveal>
        ) : (
          <Reveal>
            <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
              See the{" "}
              <Link
                href="/treatments"
                className="font-medium text-accent underline-offset-2 hover:underline"
              >
                treatments pages
              </Link>{" "}
              for what each treatment involves.
            </p>
          </Reveal>
        )}
      </Section>
      )}

      {/* ── 6. where care may be delivered ── */}
      {doctors.length > 0 && (
      <Section
        id="where"
        eyebrow="Where care happens"
        tint
        title="Where this care may be delivered"
        lead="The partnership is a group of independent consultants rather than a hospital, so appointments and treatment take place at the sites below. Which one you go to depends on the treatment: drug treatment is available at all of them, radiotherapy only at the GenesisCare centres."
      >
        <ul className="mt-9 grid gap-4 lg:grid-cols-2">
          {relevantSites.map((s, i) => (
            <Reveal key={s.slug} as="li" delay={Math.min(i, 4)} className="h-full">
              <SiteCard site={s} radiotherapy={s.capabilities.includes("radiotherapy")} />
            </Reveal>
          ))}
        </ul>

        {nhsSite && (
          <Reveal>
            <p className="mt-7 max-w-3xl text-[15px] leading-relaxed text-ink-muted">
              Most of our consultants also hold NHS posts at the{" "}
              <Link
                href={`/locations/${nhsSite.slug}`}
                className="font-medium text-accent underline-offset-2 hover:underline"
              >
                {nhsSite.name}
              </Link>
              , which is where NHS treatment for this cancer is given locally. It
              is not a private treatment site, but it is the reason private and
              NHS care can be kept joined up.
            </p>
          </Reveal>
        )}

        <Reveal>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/locations" variant="ghost">
              All locations
            </Button>
            <Button href="/locations/getting-here" variant="ghost">
              Getting here and parking
            </Button>
          </div>
        </Reveal>
      </Section>
      )}

      {/* ── 7. what to do next ── */}
      <Section
        id="next"
        eyebrow="Next steps"
        title="What to do next"
        lead="You do not need to have decided anything before you get in touch. Most people start with an appointment and work it out from there."
      >
        <div className="mt-9 grid gap-4 lg:grid-cols-3">
          {[
            {
              title: "Arrange an appointment",
              body: "You can be referred by your GP or another consultant, or contact us directly. Bring any scans, reports and letters you already have.",
              href: "/contact",
              cta: "Contact the practice",
            },
            {
              title: "Ask for a second opinion",
              body: "If you already have a diagnosis or a plan and want it reviewed independently, that is a normal request and it does not affect your NHS care.",
              href: "/patients/second-opinion",
              cta: "About second opinions",
            },
            {
              title: "Check the cost first",
              body: "Self-funding and insured routes both start with a written estimate. Ask your insurer for authorisation before your first appointment.",
              href: "/tariffs",
              cta: "Fees and insurance",
            },
          ].map((c, i) => (
            <Reveal key={c.title} delay={i} className="h-full">
              <div className="card-soft flex h-full flex-col p-6 md:p-7">
                <h3 className="font-display text-xl text-ink">{c.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/80">
                  {c.body}
                </p>
                <Link
                  href={c.href}
                  className="mt-auto pt-5 text-[14px] font-medium text-accent underline-offset-2 hover:underline"
                >
                  {c.cta} →
                </Link>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="card-soft mt-6 flex flex-wrap items-center justify-between gap-5 p-6 md:p-8">
            <div>
              <h3 className="font-display text-xl text-ink md:text-2xl">
                Speak to the practice
              </h3>
              <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-muted">
                {site.contact.practiceManager} can answer most questions directly
                and arrange an appointment with the right consultant.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button href="/contact">Make an enquiry</Button>
              <a
                href={`tel:${site.contact.phone.replace(/\s+/g, "")}`}
                className="rounded-full border border-ink/15 px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:border-ink/40 hover:bg-ink/[0.03]"
              >
                {site.contact.phone}
              </a>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* ── support and information ── */}
      <Section
        id="support"
        eyebrow="Support"
        tint
        title="Information and support you can trust"
        lead="Independent organisations we point patients and families towards. None of them are run by the partnership, and all of them are free to contact."
      >
        <ul className="mt-9 grid gap-4 md:grid-cols-3">
          {(info?.support ?? [
            {
              name: "Macmillan Cancer Support",
              url: "https://www.macmillan.org.uk",
              note: "Practical, financial and emotional support, and a free support line.",
            },
            {
              name: "Cancer Research UK",
              url: "https://www.cancerresearchuk.org/about-cancer",
              note: "Clear, evidence-based explanations of tests, stages and treatments.",
            },
            {
              name: "More organisations",
              url: "/links",
              note: "The full list of organisations we recommend to patients and families.",
            },
          ]).map((l, i) => {
            const external = l.url.startsWith("http");
            return (
              <Reveal key={l.name} as="li" delay={i} className="h-full">
                <a
                  href={l.url}
                  {...(external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="card-soft group flex h-full flex-col p-6 transition-transform duration-300 hover:-translate-y-1"
                >
                  <span className="font-display text-lg text-ink">{l.name}</span>
                  <span className="mt-3 text-[14.5px] leading-relaxed text-ink/75">
                    {l.note}
                  </span>
                  <span className="mt-auto pt-5 text-[13px] font-medium text-accent">
                    {external ? "Visit their site →" : "See the list →"}
                  </span>
                </a>
              </Reveal>
            );
          })}
        </ul>

        {/* Quiet provenance line. Until a consultant signs the page off, it says
            so — in the register a clinical site uses, not a warning banner. */}
        <Reveal>
          <div className="mt-10 border-t border-black/[0.07] pt-6 text-[13px] leading-relaxed text-ink-muted">
            {info ? (
              <>
                <p>
                  {info.reviewedBy
                    ? `Clinically reviewed by ${info.reviewedBy}${
                        info.reviewedOn ? ` · ${info.reviewedOn}` : ""
                      }`
                    : "Written from published UK guidance. Awaiting clinical review by one of our consultants before publication."}
                </p>
                <p className="mt-2">
                  Sources:{" "}
                  {info.sources.map((s, i) => (
                    <span key={s.url}>
                      {i > 0 && "; "}
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline-offset-2 hover:text-ink hover:underline"
                      >
                        {s.label}
                      </a>
                    </span>
                  ))}
                  .
                </p>
                <p className="mt-2">
                  This page is general information, not advice about your own
                  care. Only your consultant can tell you what applies to you.
                </p>
              </>
            ) : (
              <p>
                Consultant, treatment and location details on this page come from
                the practice&rsquo;s own records. The clinical guide to this
                cancer type is being written with the consultants.
              </p>
            )}
          </div>
        </Reveal>
      </Section>
    </>
  );
}
