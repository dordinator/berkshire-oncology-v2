import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import TreatmentDetailHero from "@/components/treatments/TreatmentDetailHero";
import { site } from "@/content/site";
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
    "group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-[#617f70]";
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
      className="inline-flex min-h-11 items-center rounded-full border border-[#718b7d]/35 px-5 text-sm text-ink transition-colors hover:border-[#718b7d]/70 hover:bg-[#fbfaf7]/70 hover:text-[#617f70]"
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
    <aside className="mt-8 rounded-[1.5rem] border border-ink/[0.08] bg-[#eef3f0] px-5 py-5 md:px-7 md:py-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#617f70]">
        {label}
      </p>
      <div className="mt-3 text-[15px] leading-relaxed text-ink/80">{children}</div>
    </aside>
  );
}

function SupportingFigure({ therapy }: { therapy: Therapy }) {
  if (!therapy.image) return null;

  return (
    <section className="border-t border-ink/[0.06] bg-[#fbfaf7] py-20 md:py-24">
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
              <p className="font-display text-2xl font-semibold tracking-tight text-ink">
                About this image
              </p>
              <p className="mt-4 text-base leading-relaxed text-ink-muted">
                {therapy.image.caption}
              </p>
              <p className="mt-4 text-xs leading-relaxed text-ink-muted/75">
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
    <article className="overflow-hidden bg-[#fbfaf7]">
      <TreatmentDetailHero therapy={therapy} presentation={presentation} />

      <section
        id="understanding"
        className="flex scroll-mt-28 items-center border-t border-ink/[0.06] bg-[#fbfaf7] py-24 md:py-28 lg:min-h-[100svh] lg:py-32"
      >
        <div className="container-wide grid items-center gap-16 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20 xl:gap-28">
          <Reveal className="lg:flex lg:flex-col lg:justify-center">
            <h2 className="max-w-[11ch] font-display text-[clamp(2.7rem,3.8vw,4.3rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-ink">
              Understanding {lowerTitle}
            </h2>
            <p className="mt-9 max-w-[25rem] text-lg leading-[1.7] text-ink-muted">
              What the treatment is, how it works and how it is given.
            </p>
            <a
              href={therapy.sources[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex min-h-12 w-fit items-center gap-2 rounded-full border border-ink/15 px-6 text-sm font-medium text-ink transition-colors hover:border-[#718b7d]/70 hover:text-[#617f70]"
            >
              Read more about {lowerTitle}
              <span aria-hidden>↗</span>
            </a>
          </Reveal>

          <Reveal delay={1}>
            <div className="relative max-w-[50rem]">
              <span
                aria-hidden
                className="absolute z-0 block w-px"
                style={{
                  backgroundColor: "#aebdb5",
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
                      className="relative z-10 mt-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-[#718b7d]/45 bg-[#fbfaf7]"
                    >
                      <span className="h-2.5 w-2.5 rounded-full bg-[#718b7d]" />
                    </span>
                    <div>
                      <h3 className="max-w-[31rem] font-display text-[clamp(1.45rem,2vw,2rem)] font-semibold leading-[1.12] tracking-[-0.025em] text-ink">
                        {presentation.understandingHeadings[index]}
                      </h3>
                      <p className="mt-4 max-w-[38rem] text-[16px] leading-[1.7] text-ink-muted md:text-[17px]">
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
        className="scroll-mt-28 border-t border-ink/[0.06] bg-[#edf2ef] py-20 md:py-24 lg:py-28"
      >
        <div className="container-wide grid items-center gap-14 lg:grid-cols-[1.18fr_0.82fr] lg:gap-16 xl:gap-20">
          <Reveal className="lg:order-2">
            <h2 className="max-w-[10ch] font-display text-[clamp(2.8rem,4.2vw,4.8rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-ink">
              When it is used
            </h2>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-ink-muted">
              These are common reasons for using this treatment. Your consultant
              will explain whether it is an option for you.
            </p>
          </Reveal>

          <Reveal delay={1} className="lg:order-1">
            <ol className="divide-y divide-ink/10 rounded-[1.75rem] border border-ink/[0.08] bg-[#fbfaf7] px-6 py-2 shadow-[0_24px_60px_-50px_rgba(6,28,70,0.42)] md:px-9 lg:px-10">
              {therapy.whenConsidered.map((item, index) => (
                <li key={item} className="grid grid-cols-[2.5rem_1fr] gap-5 py-5 md:py-6">
                  <span className="pt-0.5 text-sm font-semibold text-ink/70">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-base leading-relaxed text-ink/80 md:text-lg">
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
        className="scroll-mt-28 border-t border-ink/[0.06] bg-[#f1f4f3] py-24 md:py-28 lg:py-32"
      >
        <div className="container-wide">
          <Reveal>
            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <h2 className="font-display text-[clamp(2.8rem,4.2vw,4.8rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-ink">
                What to expect
              </h2>
              <p className="max-w-xl text-lg leading-relaxed text-ink-muted lg:justify-self-end">
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
                className="border-t border-[#718b7d]/40 pt-6"
              >
                <div className="flex items-baseline gap-5">
                  <span className="text-sm font-medium text-[#617f70]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-2xl font-semibold tracking-tight text-ink">
                    {stage.title}
                  </h3>
                </div>
                <p className="mt-4 max-w-[39rem] pl-[3.15rem] text-[15px] leading-[1.75] text-ink-muted md:text-base">
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
          className="scroll-mt-28 border-t border-ink/[0.06] bg-[#fbfaf7] py-20 md:py-24"
        >
          <div className="container-wide grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <Reveal>
              <h2 className="max-w-[12ch] font-display text-[clamp(2.4rem,3.6vw,4rem)] font-semibold leading-[1] tracking-[-0.05em] text-ink">
                {section.title}
              </h2>
            </Reveal>
            <Reveal delay={1}>
              <div className="max-w-[49rem] space-y-5 text-[17px] leading-[1.75] text-ink/85">
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
        className="scroll-mt-28 border-t border-ink/[0.06] bg-[#edf2ef] py-20 md:py-24 lg:py-28"
      >
        <div className="container-wide">
          <div className="grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16 xl:gap-20">
            <div>
              <Reveal>
                <h2 className="max-w-5xl font-display text-[clamp(2.8rem,4.2vw,4.8rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-ink">
                  Consultants and
                  <br className="hidden sm:block" /> treatment locations
                </h2>
              </Reveal>

              <Reveal>
                <div className="mt-12">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h3 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
                    Our consultants
                  </h3>
                  <p className="mt-2 text-sm text-ink-muted">{consultantCount}</p>
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
                          "group block h-full rounded-[1.5rem] border border-black/[0.06] bg-[#fbfaf7] p-3 shadow-[0_12px_40px_-25px_rgba(6,28,70,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_-25px_rgba(6,28,70,0.4)] " +
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
                          <h4 className="mt-4 font-display text-lg font-semibold leading-tight text-ink">
                            {consultant.name}
                          </h4>
                          <p className="mt-1 text-xs text-ink-muted">
                            {consultant.shortRole ?? consultant.role}
                          </p>
                          <span className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-accent">
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
                <h3 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
                  Possible treatment locations
                </h3>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-muted">
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
                            href={"/locations/" + location.slug}
                            className="group -mx-3 flex items-center justify-between gap-5 rounded-xl px-3 py-5 transition-colors hover:bg-[#fbfaf7]/70"
                          >
                            <span>
                              <span className="block font-medium text-ink">
                                {location.name}
                              </span>
                              <span className="mt-1 block text-xs leading-relaxed text-ink-muted">
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
        className="scroll-mt-28 border-t border-ink/[0.06] bg-[#f1f4f3] py-24 md:py-28 lg:py-32"
      >
        <div className="container-wide grid items-start gap-14 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16 xl:gap-24">
          <Reveal className="lg:pr-4">
            <h2 className="max-w-[9ch] font-display text-[clamp(3rem,4.2vw,4.8rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-ink">
              About this information
            </h2>
            <p className="mt-8 max-w-[31rem] text-[16px] leading-[1.78] text-ink/78 md:text-[17px]">
              {treatmentDisclaimer}
            </p>
            <div className="mt-8 max-w-[31rem] border-t border-[#718b7d]/35 pt-7">
              <h3 className="font-display text-xl font-semibold tracking-tight text-ink">
                Information review
              </h3>
              <p className="mt-4 text-sm leading-[1.7] text-ink-muted">
                Clinical information on this page was checked against the UK
                sources linked below.
              </p>
              <p className="mt-3 text-xs leading-relaxed text-ink-muted/75">
                Sources checked: 29 August 2026.
              </p>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div className="grid gap-10 sm:grid-cols-2 lg:gap-12 xl:gap-16">
              <div>
                <h3 className="font-display text-2xl font-semibold tracking-tight text-ink">
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
                  <h3 className="font-display text-2xl font-semibold tracking-tight text-ink">
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
              <div className="mt-12 border-t border-[#718b7d]/35 pt-10">
                <h3 className="font-display text-2xl font-semibold tracking-tight text-ink">
                  Find consultants by cancer type
                </h3>
                <p className="mt-4 max-w-3xl text-sm leading-[1.7] text-ink-muted">
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

      <section
        id="contact"
        className="close-merged scroll-mt-24 rounded-t-[3rem] bg-ink py-20 text-white md:rounded-t-[4.5rem] md:py-28 lg:flex lg:min-h-[82svh] lg:items-center lg:py-32"
      >
        <div className="container-wide grid gap-12 lg:grid-cols-[0.54fr_0.46fr] lg:items-center lg:gap-20 xl:gap-28">
          <Reveal>
            <h2 className="max-w-3xl font-display text-[48px] font-semibold leading-[0.98] tracking-[-0.055em] text-white md:text-6xl lg:text-7xl">
              Contact the practice
            </h2>
            <p className="mt-7 max-w-xl text-[17px] leading-[1.72] text-white/72">
              You do not need to decide whether this treatment is right for you
              before getting in touch. The practice team can take your details
              and help arrange a consultation.
            </p>
            <p className="mt-5 max-w-xl text-[15px] leading-[1.7] text-white/55">
              If a referral letter or recent results are needed, the practice
              will explain how to send them securely.
            </p>
          </Reveal>

          <Reveal delay={1}>
            <div className="rounded-[2.5rem] border border-white/10 bg-[#f8f5ef] p-7 text-ink shadow-[0_35px_90px_-50px_rgba(0,0,0,0.65)] sm:p-9 md:p-11">
              <p className="text-sm text-ink-muted">Contact options</p>
              <Link
                href="/contact?intent=consultation#next-step"
                className="group mt-5 grid min-h-[108px] grid-cols-[1fr_auto] items-center gap-5 border-y border-ink/[0.12] py-6"
              >
                <span>
                  <span className="block font-display text-2xl font-medium leading-tight">
                    Contact us about a consultation
                  </span>
                  <span className="mt-2 block text-sm leading-relaxed text-ink-muted">
                    Leave your contact details and a brief outline of your
                    enquiry.
                  </span>
                </span>
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#718b7d]/45 text-[#617f70] transition-transform duration-300 group-hover:translate-x-1">
                  <Arrow />
                </span>
              </Link>
              <Link
                href="/contact?intent=guidance#next-step"
                className="group grid min-h-[108px] grid-cols-[1fr_auto] items-center gap-5 border-b border-ink/[0.12] py-6"
              >
                <span>
                  <span className="block font-display text-2xl font-medium leading-tight">
                    I&rsquo;m not sure what happens next
                  </span>
                  <span className="mt-2 block text-sm leading-relaxed text-ink-muted">
                    The practice team can explain how to arrange a consultation.
                  </span>
                </span>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white transition-transform duration-300 group-hover:translate-x-1">
                  <Arrow />
                </span>
              </Link>
              <div className="mt-7 flex flex-col gap-2 border-t border-ink/[0.08] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-ink-muted">
                  Call the practice
                </span>
                <a
                  href={"tel:" + site.contact.phone.replace(/\s+/g, "")}
                  className="font-display text-xl font-semibold text-ink underline decoration-ink/20 underline-offset-4 transition-colors hover:text-[#617f70]"
                >
                  {site.contact.phone}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </article>
  );
}
