import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import SectionPage, { sectionPageMeta } from "@/components/site/SectionPage";
import Reveal from "@/components/ui/Reveal";
import ModeToggle from "@/components/treatments/ModeToggle";
import {
  AmbientBand,
  PathwaySection,
} from "@/components/treatments/TreatmentVisuals";
import type { PathwayStop } from "@/components/treatments/PathwayDiagram";
import { locations } from "@/content/locations";
import {
  therapies,
  getTherapy,
  getConsultantsForTherapy,
  getCancerTypesForTherapy,
  treatmentDisclaimer,
  type Therapy,
  type TherapyConsultant,
} from "@/content/therapies";

// ─────────────────────────────────────────────────────────────────────────────
// /treatments/[slug] — one page per treatment.
//
// These are routing-and-orientation pages, not service pages: the partnership
// is a group of consultants, and the equipment belongs to the partner
// hospitals. Each page answers the six questions in the same order —
//
//   what it is · when it may be considered · who provides it · where it happens
//   · what to expect · where to get further support
//
// — then connects onward to cancer types, consultants, locations, fees and
// patient support. The clinical copy is drafted from UK public patient
// information and kept deliberately general; see the provenance notes at the
// top of content/therapies.ts.
// ─────────────────────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return therapies.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const therapy = getTherapy(params.slug);
  if (!therapy) return {};
  return sectionPageMeta(`/treatments/${params.slug}`, {
    description: therapy.summary,
  });
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

function SectionHeading({
  id,
  children,
  sub,
}: {
  id?: string;
  children: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <>
      <h2
        id={id}
        className="scroll-mt-28 font-display text-2xl text-ink md:text-3xl"
      >
        {children}
      </h2>
      {sub && (
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
          {sub}
        </p>
      )}
    </>
  );
}

function Note({ children, label = "Please note" }: { children: ReactNode; label?: string }) {
  return (
    <div className="mt-8 rounded-3xl rounded-l-lg border border-black/[0.06] border-l-2 border-l-accent/40 bg-accent/[0.04] px-5 py-5 md:px-7 md:py-6">
      <span className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
        {label}
      </span>
      <p className="mt-3 text-[15px] leading-relaxed text-ink/80">{children}</p>
    </div>
  );
}

function ConsultantRow({ consultant }: { consultant: TherapyConsultant }) {
  return (
    <Link
      href={`/consultants/${consultant.slug}`}
      className="group card-soft flex h-full items-start gap-4 p-5 transition-transform duration-300 hover:-translate-y-1 md:p-6"
    >
      <div className="relative h-14 w-14 flex-none overflow-hidden rounded-full bg-gradient-to-br from-accent/10 to-lilac/20">
        {consultant.photo ? (
          <Image
            src={consultant.photo}
            alt=""
            fill
            sizes="56px"
            className="object-cover object-top"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-display text-base text-accent/60">
            {initials(consultant.name)}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <span className="block font-display text-lg text-ink">
          {consultant.name}
        </span>
        <span className="mt-0.5 block text-sm text-ink-muted">
          {consultant.shortRole ?? consultant.role}
        </span>
        <span className="mt-3 flex flex-wrap gap-1.5">
          <span className="sr-only">Listed on their own profile as:</span>
          {consultant.listedAs.map((wording) => (
            <span
              key={wording}
              className="rounded-full border border-black/[0.06] bg-canvas-soft px-2.5 py-1 text-xs text-ink-muted"
            >
              {wording}
            </span>
          ))}
        </span>
      </div>

      <svg
        aria-hidden
        className="mt-1 h-4 w-4 flex-none text-ink-muted/50 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent"
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
    </Link>
  );
}

function Chip({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-[44px] items-center rounded-full border border-ink/15 px-5 text-sm text-ink transition-colors hover:border-accent/40 hover:bg-accent/[0.05] hover:text-accent"
    >
      {children}
    </Link>
  );
}

/** The five stops are the same everywhere — the route through care doesn't
 *  change by modality — but the wording at "Treatment" does. */
function pathwayFor(therapy: Therapy, hasConsultants: boolean): PathwayStop[] {
  return [
    {
      stage: "Referral",
      body: "From your GP, another consultant, or by contacting the practice directly.",
      link: { label: "Arranging private treatment", href: "/patients/private-treatment" },
    },
    {
      stage: "Consultation",
      body: "A consultant reviews your diagnosis and discusses whether this treatment is right for you.",
      link: hasConsultants
        ? { label: "Who provides this", href: "#consultants" }
        : { label: "Find a consultant", href: "/consultants" },
    },
    {
      stage: "Planning",
      body: "Tests, scans and — where needed — a detailed plan prepared before anything begins.",
      link: { label: "Preparing for treatment", href: "/resources/treatment-preparation" },
    },
    {
      stage: "Treatment",
      body: `${therapy.title} is delivered at one of the partner hospitals our consultants work from.`,
      link: { label: "Where we practise", href: "/locations" },
    },
    {
      stage: "Follow-up",
      body: "Reviews and scans to check how the cancer has responded, with support alongside.",
      link: { label: "Support and resources", href: "/resources" },
    },
  ];
}

export default function TreatmentPage({
  params,
}: {
  params: { slug: string };
}) {
  const therapy = getTherapy(params.slug);
  if (!therapy) notFound();

  const consultants = getConsultantsForTherapy(therapy.slug);
  const cancerTypes = getCancerTypesForTherapy(therapy.slug);
  const related = (therapy.related ?? [])
    .map((slug) => getTherapy(slug))
    .filter((t): t is Therapy => Boolean(t));

  return (
    <SectionPage
      href={`/treatments/${therapy.slug}`}
      title={therapy.title}
      intro={therapy.summary}
      showOutline={false}
      headerAside={<ModeToggle />}
    >
      {/* ── What it is ─────────────────────────────────────────────────── */}
      <Reveal>
        <div className="relative">
          <AmbientBand className="absolute -top-10 left-1/2 h-[150px] w-screen -translate-x-1/2 md:h-[180px]" />
          <div className="relative">
            <SectionHeading>What {therapy.title.toLowerCase()} is</SectionHeading>
            <div className="mt-5 max-w-2xl space-y-4 text-[17px] leading-relaxed text-ink/85">
              {therapy.what.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {therapy.image && (
        <Reveal>
          <figure className="mt-10">
            <div className="relative aspect-[3/2] overflow-hidden rounded-3xl border border-black/[0.06] bg-canvas-soft">
              <Image
                src={therapy.image.src}
                alt={therapy.image.alt}
                fill
                sizes="(min-width: 1024px) 720px, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3 text-[13.5px] leading-relaxed text-ink-muted">
              {therapy.image.caption}{" "}
              <span className="text-ink-muted/70">{therapy.image.credit}</span>
            </figcaption>
          </figure>
        </Reveal>
      )}

      {/* ── When it may be considered ──────────────────────────────────── */}
      <Reveal>
        <div className="mt-14">
          <SectionHeading sub="These are general situations in which this treatment is used. Whether any of them applies to you is a matter for your consultant, not for this page.">
            When it may be considered
          </SectionHeading>
          <ul className="mt-7 space-y-3">
            {therapy.whenConsidered.map((c) => (
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

      {/* ── Who provides it ────────────────────────────────────────────── */}
      <Reveal>
        <div className="mt-14">
          <SectionHeading
            id="consultants"
            sub="This list reflects the treatments each consultant states on their own profile, in their own wording."
          >
            Which of our consultants provide it
          </SectionHeading>
        </div>
      </Reveal>

      {consultants.length > 0 ? (
        <ul className="mt-7 grid gap-4 sm:grid-cols-2">
          {consultants.map((consultant, i) => (
            <Reveal key={consultant.slug} delay={i} className="h-full" as="li">
              <ConsultantRow consultant={consultant} />
            </Reveal>
          ))}
        </ul>
      ) : null}

      {therapy.note && (
        <Reveal>
          <Note>{therapy.note}</Note>
        </Reveal>
      )}

      {/* ── Where it takes place ───────────────────────────────────────── */}
      <Reveal>
        <div className="mt-14">
          <SectionHeading sub="Our consultants are independent practitioners who treat at partner hospitals rather than at a centre of our own. Which site is right for your treatment depends on your consultant, and is confirmed when your care is arranged.">
            Where it takes place
          </SectionHeading>
          <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
            {locations.map((l) => (
              <li key={l.slug}>
                <Link
                  href={`/locations/${l.slug}`}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-black/[0.06] bg-white/70 px-4 py-3.5 transition-colors hover:border-accent/30 hover:bg-accent/[0.04]"
                >
                  <span className="min-w-0">
                    <span className="block text-[15px] text-ink">{l.name}</span>
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

      {/* ── What to expect ─────────────────────────────────────────────── */}
      <Reveal>
        <div className="mt-14">
          <SectionHeading sub="A general picture of how treatment tends to run. Your own plan may differ.">
            What you may expect
          </SectionHeading>
          <ol className="mt-8 space-y-7">
            {therapy.expect.map((stage, i) => (
              <li key={stage.title} className="relative pl-11">
                <span
                  aria-hidden
                  className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full border border-accent/25 bg-accent/[0.06] font-display text-[13px] text-accent"
                >
                  {i + 1}
                </span>
                <h3 className="font-display text-lg text-ink">{stage.title}</h3>
                <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink/80">
                  {stage.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>

      {/* ── The pathway diagram (integrated / expressive) ──────────────── */}
      <Reveal>
        <PathwaySection
          stops={pathwayFor(therapy, consultants.length > 0)}
          intro="From first referral to follow-up, and where each part of this site fits."
        />
      </Reveal>

      {/* ── Folded-in sections (e.g. palliative radiotherapy) ──────────── */}
      {therapy.sections?.map((s) => (
        <Reveal key={s.id}>
          <div className="mt-14">
            <SectionHeading id={s.id}>{s.title}</SectionHeading>
            <div className="mt-5 max-w-2xl space-y-4 text-[17px] leading-relaxed text-ink/85">
              {s.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {s.note && <Note>{s.note}</Note>}
          </div>
        </Reveal>
      ))}

      {/* ── Cancer types ───────────────────────────────────────────────── */}
      {cancerTypes.length > 0 && (
        <Reveal>
          <div className="mt-14">
            <SectionHeading sub="The cancers looked after by the consultants above. This is a route to the right page — not a statement that this treatment is used for every cancer listed. Whether it applies in your case is for your consultant to say.">
              Cancer types treated by these consultants
            </SectionHeading>
            <ul className="mt-7 flex flex-wrap gap-2.5">
              {cancerTypes.map((c) => (
                <li key={c.slug}>
                  <Chip href={`/specialities/${c.slug}`}>{c.name}</Chip>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      )}

      {/* ── Cost ───────────────────────────────────────────────────────── */}
      <Reveal>
        <div className="card-soft mt-14 p-6 md:p-8">
          <h2 className="font-display text-xl text-ink md:text-2xl">
            What it costs
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-muted">
            We do not publish a price for {therapy.title.toLowerCase()}, because
            the cost depends on{" "}
            {therapy.group === "drug"
              ? "the drugs used and the number of cycles"
              : "the technique used and the number of sessions"}{" "}
            planned for you. Ask for a written estimate before treatment starts,
            and if you are insured, check the cost is covered in full first.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Chip href="/tariffs/treatment-estimate">Getting an estimate</Chip>
            <Chip href="/tariffs/private-medical-insurance">Insurance</Chip>
            <Chip href="/tariffs">Tariffs and fees</Chip>
          </div>
        </div>
      </Reveal>

      {/* ── Further support ────────────────────────────────────────────── */}
      <Reveal>
        <div className="mt-14">
          <SectionHeading sub="This page is a starting point. For depth — side effects in detail, practical and financial help, and talking to someone who has had the same treatment — these are the places we point patients to.">
            Where to find further support
          </SectionHeading>

          <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
            {[
              { label: "Managing side effects", href: "/resources/managing-side-effects" },
              { label: "Emotional and practical support", href: "/resources/emotional-and-practical-support" },
              { label: "Support for carers and families", href: "/resources/carers-and-families" },
              { label: "If you are already receiving treatment", href: "/patients/receiving-treatment" },
            ].map((r) => (
              <li key={r.href}>
                <Link
                  href={r.href}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-black/[0.06] bg-white/70 px-4 py-3.5 text-[15px] text-ink transition-colors hover:border-accent/30 hover:bg-accent/[0.04]"
                >
                  {r.label}
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

          <p className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
            Read more about this treatment
          </p>
          <ul className="mt-4 flex flex-wrap gap-2.5">
            {therapy.sources.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-ink/15 px-5 text-sm text-ink transition-colors hover:border-accent/40 hover:bg-accent/[0.05] hover:text-accent"
                >
                  {s.label}
                  <span aria-hidden className="text-ink-muted/60">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      {/* ── Related treatments ─────────────────────────────────────────── */}
      {related.length > 0 && (
        <Reveal>
          <div className="mt-14">
            <SectionHeading>Related treatments</SectionHeading>
            <ul className="mt-6 flex flex-wrap gap-2.5">
              {related.map((r) => (
                <li key={r.slug}>
                  <Chip href={`/treatments/${r.slug}`}>{r.title}</Chip>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      )}

      {/* ── Standing disclaimer ────────────────────────────────────────── */}
      <Reveal>
        <div className="mt-14 rounded-3xl border border-black/[0.06] bg-canvas-soft/60 px-5 py-5 md:px-7 md:py-6">
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
            About this information
          </h2>
          <p className="mt-3 text-[14.5px] leading-relaxed text-ink/75">
            {treatmentDisclaimer}
          </p>
        </div>
      </Reveal>
    </SectionPage>
  );
}
