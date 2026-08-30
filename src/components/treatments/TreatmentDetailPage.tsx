import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import TreatmentDetailHero from "@/components/treatments/TreatmentDetailHero";
import {
  getCancerTypesForTherapy,
  getConsultantsForTherapy,
  getTherapy,
  treatmentDisclaimer,
  type Therapy,
} from "@/content/therapies";
import {
  getLocationsForTherapy,
  locationFallback,
} from "@/content/treatmentLocations";
import { getTreatmentPresentation } from "@/content/treatmentPresentation";

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden>
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TextLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  const classes =
    "type-button group inline-flex min-h-11 items-center gap-2 text-ink transition-colors hover:text-sage";
  const content = (
    <>
      {children}
      <span className="transition-transform duration-300 group-hover:translate-x-1">
        {external ? <span aria-hidden>↗</span> : <Arrow />}
      </span>
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}

function Chip({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="type-button inline-flex min-h-11 items-center rounded-full border border-sage/35 px-5 text-ink transition-colors hover:border-sage/70 hover:bg-paper/70 hover:text-sage"
    >
      {children}
    </Link>
  );
}

function Caveat({
  children,
  label = "Please note",
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <aside className="mt-8 rounded-[1.5rem] border border-ink/[0.08] bg-sage-wash px-5 py-5 md:px-7 md:py-6">
      <p className="type-label font-semibold text-sage">
        {label}
      </p>
      <div className="type-body mt-3 text-ink/80">{children}</div>
    </aside>
  );
}

function SupportingFigure({ therapy }: { therapy: Therapy }) {
  if (!therapy.image) return null;

  return (
    <section className="border-t border-ink/[0.06] bg-paper py-20 md:py-24">
      <div className="container-wide">
        <Reveal>
          <figure className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
            <div className="relative aspect-[3/2] overflow-hidden rounded-[2rem] border border-ink/[0.08] bg-canvas-soft">
              <Image
                src={therapy.image.src}
                alt={therapy.image.alt}
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="max-w-lg">
              <p className="type-card-title text-ink">
                About this image
              </p>
              <p className="type-body mt-4 text-ink-muted">
                {therapy.image.caption}
              </p>
              <p className="type-supporting mt-4 text-ink-muted/75">
                {therapy.image.credit}
              </p>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

export default function TreatmentDetailPage({ therapy }: { therapy: Therapy }) {
  const presentation = getTreatmentPresentation(therapy.slug);
  const consultants = getConsultantsForTherapy(therapy.slug);
  const locations = getLocationsForTherapy(therapy.slug);
  const cancerTypes = getCancerTypesForTherapy(therapy.slug);
  const related = (therapy.related ?? [])
    .map((slug) => getTherapy(slug))
    .filter((entry): entry is Therapy => Boolean(entry));
  const featuredConsultants = consultants.slice(0, 3);
  const featuredLocations = locations.slice(0, 3);
  const hasSingleFeaturedConsultant = featuredConsultants.length === 1;
  const lowerTitle = therapy.title.toLowerCase();
  const consultantCount =
    consultants.length > featuredConsultants.length
      ? "Showing " +
        featuredConsultants.length +
        " of " +
        consultants.length +
        " consultants who provide care for this treatment."
      : consultants.length === 1
        ? "1 consultant provides care for this treatment."
        : consultants.length + " consultants provide care for this treatment.";
  const consultantGrid =
    hasSingleFeaturedConsultant
      ? "mt-6 grid max-w-[39rem] gap-4"
      : featuredConsultants.length === 2
        ? "mt-6 grid max-w-[39rem] gap-4 sm:grid-cols-2"
        : "mt-6 grid gap-4 sm:grid-cols-3";

  return (
    <article className="overflow-hidden bg-paper">
      <TreatmentDetailHero therapy={therapy} presentation={presentation} />

      <section
        id="understanding"
        data-anchor-align="viewport"
        className="flex scroll-mt-28 items-center border-t border-ink/[0.06] bg-paper pb-24 pt-28 md:py-28 lg:min-h-[100svh] lg:py-32"
      >
        <div className="container-wide grid items-center gap-16 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20 xl:gap-28">
          <Reveal className="lg:flex lg:flex-col lg:justify-center">
            <h2 className="type-feature-title max-w-[11ch] text-ink">
              Understanding {lowerTitle}
            </h2>
            <p className="type-hero-lede mt-9 max-w-[25rem] text-ink-muted">
              What the treatment is, how it works and how it is given.
            </p>
            <a
              href={therapy.sources[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className="type-button mt-10 inline-flex min-h-12 w-fit items-center gap-2 rounded-full border border-ink/15 px-6 text-ink transition-colors hover:border-sage/70 hover:text-sage"
            >
              Read more about {lowerTitle}
              <span aria-hidden>↗</span>
            </a>
          </Reveal>

          <Reveal delay={1}>
            <div className="relative max-w-[50rem]">
              <span
                aria-hidden
                className="absolute z-0 block w-px bg-sage/45"
                style={{
                  bottom: "1.25rem",
                  left: "0.875rem",
                  top: "1.25rem",
                }}
              />
              <ol className="relative z-10">
                {therapy.what.map((paragraph, index) => (
                  <li
                    key={paragraph}
                    className="relative grid py-8 first:pt-0 last:pb-0"
                    style={{
                      columnGap: "1.75rem",
                      gridTemplateColumns: "1.75rem minmax(0, 1fr)",
                    }}
                  >
                    <span
                      aria-hidden
                      className="relative z-10 mt-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-sage/45 bg-paper"
                    >
                      <span className="h-2.5 w-2.5 rounded-full bg-sage" />
                    </span>
                    <div>
                      <h3 className="type-card-title max-w-[31rem] text-ink">
                        {presentation.understandingHeadings[index]}
                      </h3>
                      <p className="type-section-lede mt-4 max-w-[38rem] text-ink-muted">
                        {paragraph}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>
      </section>

      <SupportingFigure therapy={therapy} />

      <section
        id="when-considered"
        data-anchor-align="viewport"
        className="scroll-mt-28 border-t border-ink/[0.06] bg-sage-mist pb-20 pt-28 md:py-24 lg:py-28"
      >
        <div className="container-wide grid items-center gap-14 lg:grid-cols-[1.18fr_0.82fr] lg:gap-16 xl:gap-20">
          <Reveal className="lg:order-2">
            <h2 className="type-feature-title max-w-[10ch] text-ink">
              When it is used
            </h2>
            <p className="type-hero-lede mt-7 max-w-md text-ink-muted">
              These are common reasons for using this treatment. Your consultant
              will explain whether it is an option for you.
            </p>
          </Reveal>

          <Reveal delay={1} className="lg:order-1">
            <ol className="divide-y divide-ink/10 rounded-[1.75rem] border border-ink/[0.08] bg-paper px-6 py-2 shadow-[0_24px_60px_-50px_rgba(6,28,70,0.42)] md:px-9 lg:px-10">
              {therapy.whenConsidered.map((item, index) => (
                <li key={item} className="grid grid-cols-[2.5rem_1fr] gap-5 py-5 md:py-6">
                  <span className="type-label pt-0.5 font-semibold text-ink/70">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="type-section-lede text-ink/80">
                    {item}
                  </p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section
        id="what-to-expect"
        data-anchor-align="viewport"
        className="scroll-mt-28 border-t border-ink/[0.06] bg-sage-wash pb-24 pt-28 md:py-28 lg:py-32"
      >
        <div className="container-wide">
          <Reveal>
            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <h2 className="type-feature-title text-ink">
                What to expect
              </h2>
              <p className="type-hero-lede max-w-xl text-ink-muted lg:justify-self-end">
                Your appointments and checks depend on the treatment plan. The
                team caring for you will explain what happens and when.
              </p>
            </div>
          </Reveal>

          <ol className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:mt-16 lg:gap-x-20 lg:gap-y-12">
            {therapy.expect.map((stage, index) => (
              <Reveal
                key={stage.title}
                delay={index}
                as="li"
                className="border-t border-sage/40 pt-6"
              >
                <div className="flex items-baseline gap-5">
                  <span className="type-button text-sage">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="type-card-title text-ink">
                    {stage.title}
                  </h3>
                </div>
                <p className="type-body mt-4 max-w-[39rem] pl-[3.15rem] text-ink-muted">
                  {stage.body}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {therapy.sections?.map((section) => (
        <section
          key={section.id}
          id={section.id}
          data-anchor-align="viewport"
          className="scroll-mt-28 border-t border-ink/[0.06] bg-paper pb-20 pt-28 md:py-24"
        >
          <div className="container-wide grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <Reveal>
              <h2 className="type-section-title max-w-[12ch] text-ink">
                {section.title}
              </h2>
            </Reveal>
            <Reveal delay={1}>
              <div className="type-section-lede max-w-[49rem] space-y-5 text-ink/85">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.note && <Caveat>{section.note}</Caveat>}
            </Reveal>
          </div>
        </section>
      ))}

      <section
        id="care-team"
        data-anchor-align="viewport"
        className="scroll-mt-28 border-t border-ink/[0.06] bg-sage-mist pb-20 pt-28 md:py-24 lg:py-28"
      >
        <div className="container-wide">
          <div className="grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16 xl:gap-20">
            <div>
              <Reveal>
                <h2 className="type-feature-title max-w-5xl text-ink">
                  Consultants and
                  <br className="hidden sm:block" /> treatment locations
                </h2>
              </Reveal>

              <Reveal>
                <div className="mt-12">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h3 className="type-card-title text-ink">
                    Our consultants
                  </h3>
                  <p className="type-supporting mt-2 text-ink-muted">{consultantCount}</p>
                </div>
                <TextLink href="/consultants/by-treatment">
                  See all consultants
                </TextLink>
              </div>

              {featuredConsultants.length > 0 ? (
                <ul className={consultantGrid}>
                  {featuredConsultants.map((consultant) => (
                    <li key={consultant.slug}>
                      <Link
                        href={"/consultants/" + consultant.slug}
                        className={
                          "group block h-full rounded-[1.5rem] border border-black/[0.06] bg-paper p-3 shadow-[0_12px_40px_-25px_rgba(6,28,70,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_-25px_rgba(6,28,70,0.4)] " +
                          (hasSingleFeaturedConsultant
                            ? "sm:grid sm:grid-cols-[12rem_1fr] sm:items-stretch"
                            : "")
                        }
                      >
                        <div
                          className={
                            "relative overflow-hidden rounded-[1.1rem] bg-canvas-soft " +
                            (hasSingleFeaturedConsultant
                              ? "aspect-[4/4.4] sm:aspect-auto sm:min-h-[15rem]"
                              : "aspect-[4/4.4]")
                          }
                        >
                          {consultant.photo && (
                            <Image
                              src={consultant.photo}
                              alt=""
                              fill
                              sizes="(max-width: 640px) 100vw, 220px"
                              className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                            />
                          )}
                        </div>
                        <div
                          className={
                            "px-1 pb-1 " +
                            (hasSingleFeaturedConsultant
                              ? "sm:flex sm:flex-col sm:justify-center sm:px-6"
                              : "")
                          }
                        >
                          <h4 className="type-compact-title mt-4 text-ink">
                            {consultant.name}
                          </h4>
                          <p className="type-supporting mt-1 text-ink-muted">
                            {consultant.shortRole ?? consultant.role}
                          </p>
                          <span className="type-button mt-3 inline-flex items-center gap-2 text-accent">
                            View profile <Arrow />
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <Caveat label="Consultant details">
                  Contact the practice for help arranging a consultation about
                  this treatment.
                </Caveat>
              )}
                </div>
              </Reveal>
            </div>

            <Reveal delay={1}>
              <div className="h-full lg:pt-1">
                <h3 className="type-card-title text-ink">
                  Possible treatment locations
                </h3>
                <p className="type-supporting mt-3 max-w-lg text-ink-muted">
                  Our consultants are independent practitioners who treat at
                  partner hospitals. The partnership does not operate its own
                  treatment centre. Your consultant will confirm where your
                  treatment will take place.
                </p>

                {featuredLocations.length > 0 ? (
                  <>
                    <ul className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
                      {featuredLocations.map(({ location, note }) => (
                        <li key={location.slug}>
                          <Link
                            href="/locations"
                            className="group -mx-3 flex items-center justify-between gap-5 rounded-xl px-3 py-5 transition-colors hover:bg-paper/70"
                          >
                            <span>
                              <span className="block font-medium text-ink">
                                {location.name}
                              </span>
                              <span className="type-supporting mt-1 block text-ink-muted">
                                {location.area} · {note}
                              </span>
                            </span>
                            <span className="text-ink-muted transition-transform group-hover:translate-x-1 group-hover:text-accent">
                              <Arrow />
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6">
                      <TextLink href="/locations">See all locations</TextLink>
                    </div>
                  </>
                ) : (
                  <Caveat label="Location arrangements">
                    {locationFallback}
                  </Caveat>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section
        id="about-information"
        data-anchor-align="viewport"
        className="scroll-mt-28 border-t border-ink/[0.06] bg-sage-wash pb-24 pt-28 md:py-28 lg:py-32"
      >
        <div className="container-wide grid items-start gap-14 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16 xl:gap-24">
          <Reveal className="lg:pr-4">
            <h2 className="type-feature-title max-w-[9ch] text-ink">
              About this information
            </h2>
            <p className="type-section-lede mt-8 max-w-[31rem] text-ink/78">
              {treatmentDisclaimer}
            </p>
            <div className="mt-8 max-w-[31rem] border-t border-sage/35 pt-7">
              <h3 className="type-compact-title text-ink">
                Information review
              </h3>
              <p className="type-supporting mt-4 text-ink-muted">
                Clinical information on this page was checked against the UK
                sources linked below.
              </p>
              <p className="type-supporting mt-3 text-ink-muted/75">
                Sources checked: 29 August 2026.
              </p>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div className="grid gap-10 sm:grid-cols-2 lg:gap-12 xl:gap-16">
              <div>
                <h3 className="type-card-title text-ink">
                  Sources and further information
                </h3>
                <ul className="mt-5 space-y-3">
                  {therapy.sources.map((source) => (
                    <li key={source.url}>
                      <TextLink href={source.url} external>
                        {source.label}
                      </TextLink>
                    </li>
                  ))}
                </ul>
              </div>

              {related.length > 0 && (
                <div>
                  <h3 className="type-card-title text-ink">
                    Related treatments
                  </h3>
                  <ul className="mt-5 flex flex-wrap gap-2.5">
                    {related.map((entry) => (
                      <li key={entry.slug}>
                        <Chip href={"/treatments/" + entry.slug}>
                          {entry.title}
                        </Chip>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {cancerTypes.length > 0 && (
              <div className="mt-12 border-t border-sage/35 pt-10">
                <h3 className="type-card-title text-ink">
                  Find consultants by cancer type
                </h3>
                <p className="type-supporting mt-4 max-w-3xl text-ink-muted">
                  These links take you to consultants who treat each cancer type.
                  Your consultant will explain which treatments are relevant to
                  you.
                </p>
                <ul className="mt-6 flex flex-wrap gap-2.5">
                  {cancerTypes.map((cancerType) => (
                    <li key={cancerType.slug}>
                      <Chip href={"/specialities/" + cancerType.slug}>
                        {cancerType.name}
                      </Chip>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Reveal>
        </div>
      </section>

    </article>
  );
}
