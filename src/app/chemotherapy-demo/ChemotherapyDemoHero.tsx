import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { site } from "@/content/site";

const heroRoutes = [
  {
    label: "Understanding chemotherapy",
    description: "A clear introduction to how treatment works.",
    href: "#understanding",
  },
  {
    label: "When it may be considered",
    description: "Why your consultant might recommend it.",
    href: "#when-considered",
  },
  {
    label: "What to expect",
    description: "Before treatment, treatment day and between cycles.",
    href: "#what-to-expect",
  },
];

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

function GuidePanel({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <nav
      aria-label="On this page"
      style={style}
      className={`flex flex-col rounded-[2rem] border border-ink/[0.09] bg-[#fbfaf7]/[0.985] px-8 py-5 shadow-[0_24px_60px_-34px_rgba(6,28,70,0.38)] ${className}`}
    >
      <h2 className="font-display text-[clamp(1.6rem,2vw,2rem)] font-semibold leading-tight tracking-[-0.035em] text-ink">
        Your guide to chemotherapy
      </h2>

      <ul className="mt-4 flex flex-1 flex-col divide-y divide-ink/10">
        {heroRoutes.map((route) => (
          <li key={route.href} className="flex-1">
            <Link
              href={route.href}
              className="group grid h-full min-h-[50px] grid-cols-[1fr_auto] items-center gap-4 py-1.5"
            >
              <span>
                <span className="block font-display text-base font-semibold leading-tight text-ink xl:text-[1.05rem]">
                  {route.label}
                </span>
                <span className="mt-1 block text-[12px] leading-relaxed text-ink-muted xl:text-[13px]">
                  {route.description}
                </span>
              </span>
              <span className="text-ink-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent">
                <Arrow />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="#care-team"
        className="group mt-1 flex items-center justify-center gap-3 border-t border-ink/10 pt-4 text-sm font-medium text-[#617f70]"
      >
        Consultants and treatment locations
        <span className="transition-transform duration-300 group-hover:translate-x-1">
          <Arrow />
        </span>
      </Link>
    </nav>
  );
}

export default function ChemotherapyDemoHero() {
  return (
    <header className="mesh-bg noise relative flex flex-col pt-28 lg:h-[100svh] lg:min-h-[700px] lg:pt-24">
      <div className="relative z-10 flex min-h-0 flex-1 items-center px-6 py-8 sm:px-8 lg:px-[6vw] lg:py-4">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(360px,0.84fr)_minmax(600px,1.16fr)] lg:gap-5 xl:gap-8">
          <div className="relative z-30 text-left lg:-translate-y-3 lg:pb-7">
            <h1 className="heading-lg">
              Chemotherapy
            </h1>
            <p className="body-lg mt-6 max-w-[31rem]">
              Anti-cancer medicines given in cycles, with rest periods in between.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-start gap-5">
              <Button href="/contact#guidance" variant="sage">
                Talk to the practice
              </Button>
              <span aria-hidden className="hidden h-10 w-px bg-ink/15 sm:block" />
              <a
                href={`tel:${site.contact.phone.replace(/\s+/g, "")}`}
                className="inline-flex min-h-11 items-center text-base font-medium text-[#617f70]"
              >
                {site.contact.phone}
              </a>
            </div>
          </div>

          <div className="hidden translate-x-[2.65vw] -translate-y-1 justify-end lg:flex">
            <div className="relative h-[min(704px,calc(100svh-190px))] max-h-[704px] aspect-[800/704]">
              <div
                aria-hidden
                className="absolute left-[1.2%] top-[4%] z-0 h-[79.5%] w-[39%] rounded-[2.75rem] bg-[#cfddd7]"
              />

              <div className="absolute left-[17.5%] top-[8.8%] z-10 h-[66.2%] w-[82.5%] overflow-hidden rounded-[2.5rem] border border-white/70 bg-canvas-soft">
                <Image
                  src="/treatments/chemotherapy-consultation.png"
                  alt="A consultant speaking with a patient."
                  fill
                  priority
                  sizes="(max-width: 1280px) 54vw, 660px"
                  className="object-cover object-[20%_center]"
                />
              </div>

              <GuidePanel
                className="absolute left-[7.5%] top-[38%] z-20 h-[56%] w-[71.25%]"
                style={{
                  transform: "scale(1.1)",
                  transformOrigin: "center center",
                }}
              />
            </div>
          </div>

          <div className="relative mx-auto mt-2 w-full max-w-xl pb-6 lg:hidden">
            <div aria-hidden className="absolute -left-3 -top-4 h-52 w-44 rounded-[2rem] bg-[#cfddd7]" />
            <div className="relative aspect-[3/2] overflow-hidden rounded-[2rem]">
              <Image
                src="/treatments/chemotherapy-consultation.png"
                alt="A consultant speaking with a patient."
                fill
                priority
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>
            <GuidePanel className="relative z-10 -mt-14 min-h-[455px] px-6 py-5" />
          </div>
        </div>
      </div>

    </header>
  );
}
