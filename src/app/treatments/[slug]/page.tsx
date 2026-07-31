import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import SectionPage, { sectionPageMeta } from "@/components/site/SectionPage";
import Reveal from "@/components/ui/Reveal";
import {
  therapies,
  getTherapy,
  getConsultantsForTherapy,
  type TherapyConsultant,
} from "@/content/therapies";

// ─────────────────────────────────────────────────────────────────────────────
// /treatments/[slug] — one page per treatment modality.
//
// The consultant list is generated from each consultant's own listed wording
// (see therapies.ts). We show that wording verbatim rather than paraphrasing
// it, and where no honest mapping exists the page says so instead of guessing.
// The clinical description of each treatment is still to be written with the
// consultants; SectionPage renders that outline below.
// ─────────────────────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return therapies.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  if (!getTherapy(params.slug)) return {};
  return sectionPageMeta(`/treatments/${params.slug}`);
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

function Note({ children }: { children: ReactNode }) {
  return (
    <div className="mt-10 rounded-3xl rounded-l-lg border border-black/[0.06] border-l-2 border-l-accent/40 bg-accent/[0.04] px-5 py-5 md:px-7 md:py-6">
      <span className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
        Please note
      </span>
      <p className="mt-3 text-[15px] leading-relaxed text-ink/80">{children}</p>
    </div>
  );
}

export default function TreatmentPage({
  params,
}: {
  params: { slug: string };
}) {
  const therapy = getTherapy(params.slug);
  if (!therapy) notFound();

  const consultants = getConsultantsForTherapy(therapy.slug);
  const related = (therapy.related ?? [])
    .map((slug) => getTherapy(slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <SectionPage
      href={`/treatments/${therapy.slug}`}
      title={therapy.title}
      // The summary below carries the introduction, so the header doesn't
      // repeat a shorter version of the same sentence.
      intro=""
      // Where the consultant list is already on the page, don't also promise it
      // as something still to be written.
      omitCovers={
        consultants.length > 0 ? ["Which of our consultants provide it"] : undefined
      }
    >
      <Reveal>
        <p className="max-w-2xl text-lg leading-relaxed text-ink md:text-xl">
          {therapy.summary}
        </p>
      </Reveal>

      {consultants.length > 0 ? (
        <>
          <Reveal>
            <div className="mt-12">
              <h2 className="font-display text-2xl text-ink md:text-3xl">
                Consultants who list this treatment
              </h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
                This list reflects the treatments each consultant states on their
                own profile, in their own wording.
              </p>
            </div>
          </Reveal>

          <ul className="mt-7 grid gap-4 sm:grid-cols-2">
            {consultants.map((consultant, i) => (
              <Reveal key={consultant.slug} delay={i} className="h-full" as="li">
                <ConsultantRow consultant={consultant} />
              </Reveal>
            ))}
          </ul>

          {therapy.note && (
            <Reveal>
              <Note>{therapy.note}</Note>
            </Reveal>
          )}
        </>
      ) : (
        therapy.note && (
          <Reveal>
            <Note>{therapy.note}</Note>
          </Reveal>
        )
      )}

      {related.length > 0 && (
        <Reveal>
          <div className="mt-12">
            <h2 className="font-display text-2xl text-ink md:text-3xl">
              Related treatments
            </h2>
            <ul className="mt-6 flex flex-wrap gap-2.5">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/treatments/${r.slug}`}
                    className="inline-flex min-h-[44px] items-center rounded-full border border-ink/15 px-5 text-sm text-ink transition-colors hover:border-accent/40 hover:bg-accent/[0.05] hover:text-accent"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      )}
    </SectionPage>
  );
}
