import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import ChemotherapyDemoHero from "./ChemotherapyDemoHero";
import { site } from "@/content/site";
import {
  getConsultantsForTherapy,
  getTherapy,
} from "@/content/therapies";
import { getLocationsForTherapy } from "@/content/treatmentLocations";

export const metadata: Metadata = {
  title: "Chemotherapy page concept",
  description: "A design concept for the Berkshire Oncology chemotherapy page.",
  robots: { index: false, follow: false },
};

function requireChemotherapy() {
  const entry = getTherapy("chemotherapy");
  if (!entry) throw new Error("The chemotherapy content entry is missing.");
  return entry;
}

const therapy = requireChemotherapy();

const consultants = getConsultantsForTherapy("chemotherapy");
const locations = getLocationsForTherapy("chemotherapy");

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

function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-accent"
    >
      {children}
      <span className="transition-transform duration-300 group-hover:translate-x-1">
        <Arrow />
      </span>
    </Link>
  );
}

function tel(value: string) {
  return `tel:${value.replace(/\s+/g, "")}`;
}

export default function ChemotherapyDemoPage() {
  const featuredConsultants = consultants.slice(0, 3);
  const featuredLocations = locations.slice(0, 3);

  return (
    <article className="overflow-hidden bg-[#fbfaf7]">
      <ChemotherapyDemoHero />

      <section
        id="understanding"
        className="flex scroll-mt-28 items-center border-t border-ink/[0.06] bg-[#fbfaf7] py-24 md:py-28 lg:min-h-[100svh] lg:py-32"
      >
        <div className="container-wide grid items-stretch gap-12 lg:grid-cols-[0.76fr_1.24fr] lg:gap-0">
          <Reveal className="lg:pr-16 xl:pr-20">
            <h2 className="max-w-[10ch] font-display text-[clamp(2.7rem,3.8vw,4.3rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-ink">
              Understanding chemotherapy
            </h2>
            <span aria-hidden className="mt-8 block h-0.5 w-14 bg-[#718b7d]" />
            <p className="mt-9 max-w-[24rem] text-lg leading-[1.7] text-ink-muted">
              What chemotherapy is, how it is given, and where it can fit within a wider treatment plan.
            </p>
            <a
              href={therapy.sources[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex min-h-12 items-center gap-2 rounded-full border border-ink/15 px-6 text-sm font-medium text-ink transition-colors hover:border-[#718b7d]/70 hover:text-[#617f70]"
            >
              Read more about chemotherapy
              <span aria-hidden>↗</span>
            </a>
          </Reveal>

          <Reveal delay={1} className="lg:border-l lg:border-ink/10 lg:pl-16 xl:pl-20">
            <div className="max-w-[50rem] text-[17px] leading-[1.72] text-ink/85 md:text-lg md:leading-[1.78]">
              <p>{therapy.what[0]}</p>

              <aside className="mt-9 grid items-center gap-5 bg-[#eef3f0] px-5 py-5 sm:grid-cols-[3.5rem_1px_1fr] sm:px-7">
                <span
                  aria-hidden
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-[#718b7d] font-display text-xl font-semibold text-[#617f70]"
                >
                  i
                </span>
                <span aria-hidden className="hidden h-full min-h-14 w-px bg-[#718b7d]/65 sm:block" />
                <p className="font-semibold leading-[1.55] text-ink">
                  Chemotherapy targets fast-growing cells, which is why it can affect some healthy tissues that renew quickly.
                </p>
              </aside>

              <p className="mt-9 border-t border-ink/10 pt-8">{therapy.what[1]}</p>
              <p className="mt-9 border-t border-ink/10 pt-8">{therapy.what[2]}</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section
        id="when-considered"
        className="flex scroll-mt-28 items-center border-t border-ink/[0.06] bg-[#edf2ef] py-24 md:py-28 lg:min-h-[100svh] lg:py-32"
      >
        <div className="container-wide grid items-center gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:gap-24">
          <Reveal>
            <h2 className="max-w-[10ch] font-display text-[clamp(2.8rem,4.2vw,4.8rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-ink">
              When it may be considered
            </h2>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-ink-muted">
              Your consultant will consider the cancer, the aim of treatment and how chemotherapy fits with other care.
            </p>
          </Reveal>

          <Reveal delay={1}>
            <ol className="divide-y divide-ink/10 rounded-[1.25rem] border border-ink/[0.08] bg-canvas px-6 py-2 md:px-8 lg:px-9">
              {therapy.whenConsidered.map((item, index) => (
                <li key={item} className="grid grid-cols-[2.5rem_1fr] gap-5 py-5 md:py-6">
                  <span className="pt-0.5 text-sm font-semibold text-ink/70">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-base leading-relaxed text-ink/80 md:text-lg">{item}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section
        id="what-to-expect"
        className="flex scroll-mt-28 items-center border-t border-ink/[0.06] bg-[#f1f4f3] py-24 md:py-28 lg:min-h-[100svh] lg:py-32"
      >
        <div className="container-wide">
          <Reveal>
            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <h2 className="font-display text-[clamp(2.8rem,4.2vw,4.8rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-ink">
                  What to expect
                </h2>
              </div>
              <p className="max-w-xl text-lg leading-relaxed text-ink-muted lg:justify-self-end">
                A general picture of how treatment tends to run. Your own plan may differ, and your team will explain it before you begin.
              </p>
            </div>
          </Reveal>

          <ol className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:mt-16 lg:gap-x-20 lg:gap-y-12">
            {therapy.expect.map((stage, index) => (
              <Reveal key={stage.title} delay={index} as="li" className="border-t border-[#718b7d]/40 pt-6">
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

      <section
        id="care-team"
        className="flex scroll-mt-28 items-center border-t border-ink/[0.06] bg-[#fbfaf7] py-24 md:py-28 lg:min-h-[100svh] lg:py-32"
      >
        <div className="container-wide w-full">
          <Reveal>
            <h2 className="max-w-4xl font-display text-[clamp(2.8rem,4.2vw,4.8rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-ink">
              Consultants and treatment locations
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h3 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
                    Our consultants
                  </h3>
                  <p className="mt-2 text-sm text-ink-muted">
                    {consultants.length} consultants provide chemotherapy care.
                  </p>
                </div>
                <TextLink href="/consultants/by-treatment">See all consultants</TextLink>
              </div>

              <ul className="mt-7 grid gap-4 sm:grid-cols-3">
                {featuredConsultants.map((consultant) => (
                  <li key={consultant.slug}>
                    <Link
                      href={`/consultants/${consultant.slug}`}
                      className="group block rounded-[1.5rem] border border-black/[0.06] bg-white p-3 shadow-[0_12px_40px_-22px_rgba(6,28,70,0.28)] transition-transform duration-300 hover:-translate-y-1"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.1rem] bg-canvas-soft">
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
                      <div className="px-1 pb-1">
                        <h3 className="mt-4 font-display text-lg font-semibold leading-tight text-ink">
                          {consultant.name}
                        </h3>
                        <p className="mt-1 text-xs text-ink-muted">{consultant.shortRole}</p>
                        <span className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-accent">
                          View profile <Arrow />
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={1}>
              <div className="lg:border-l lg:border-[#718b7d]/35 lg:pl-16">
                <h3 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
                  Where treatment happens
                </h3>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-muted">
                  The right location depends on your consultant and treatment plan.
                </p>
                <ul className="mt-7 divide-y divide-ink/10 border-y border-ink/10">
                  {featuredLocations.map(({ location, note }) => (
                    <li key={location.slug}>
                      <Link
                        href={`/locations/${location.slug}`}
                        className="group flex items-center justify-between gap-5 py-5"
                      >
                        <span>
                          <span className="block font-medium text-ink">{location.name}</span>
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
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="close-merged bg-ink text-white">
        <div className="container-wide grid min-h-[62svh] items-center gap-14 py-20 md:py-24 lg:grid-cols-[1.08fr_0.92fr] lg:gap-24">
          <Reveal>
            <h2 className="max-w-[12ch] font-display text-[clamp(3.5rem,6.2vw,7rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-white">
              You do not need to choose a treatment before you contact us.
            </h2>
          </Reveal>

          <Reveal delay={1}>
            <div className="max-w-xl">
              <p className="text-lg leading-relaxed text-white/65 md:text-xl">
                Start with the diagnosis, letter or information you already have. The practice team can help you find the appropriate consultant.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-6">
                <Button href="/contact" variant="light">
                  Contact the practice
                </Button>
                <a
                  href={tel(site.contact.phone)}
                  className="text-base font-medium text-white underline decoration-white/35 underline-offset-8 transition-colors hover:decoration-white"
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
