import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { site } from "@/content/site";
import type { Therapy } from "@/content/therapies";
import type { TreatmentPresentation } from "@/content/treatmentPresentation";

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
  therapy,
  className = "",
  style,
}: {
  therapy: Therapy;
  className?: string;
  style?: CSSProperties;
}) {
  const routes = [
    {
      label: `Understanding ${therapy.title.toLowerCase()}`,
      description: "What the treatment is, how it works and how it is given.",
      href: "#understanding",
    },
    {
      label: "When it is used",
      description: "Common reasons for using this treatment.",
      href: "#when-considered",
    },
    {
      label: "What to expect",
      description: "How appointments, checks and follow-up are planned.",
      href: "#what-to-expect",
    },
  ];

  return (
    <nav
      aria-label="On this page"
      style={style}
      className={`flex flex-col rounded-[2rem] border border-ink/[0.09] bg-[#fbfaf7]/[0.985] px-6 py-5 shadow-[0_24px_60px_-34px_rgba(6,28,70,0.38)] lg:px-5 lg:py-4 xl:px-8 xl:py-5 ${className}`}
    >
      <h2 className="font-display text-[1.45rem] font-semibold leading-tight tracking-[-0.035em] text-ink lg:text-xl xl:text-[1.75rem] 2xl:text-[2rem]">
        On this page
      </h2>

      <ul className="mt-4 flex flex-1 flex-col divide-y divide-ink/10 lg:mt-2 xl:mt-4">
        {routes.map((route) => (
          <li key={route.href} className="flex-1">
            <Link
              href={route.href}
              className="group grid h-full min-h-[46px] grid-cols-[1fr_auto] items-center gap-4 py-1 lg:min-h-[42px] xl:min-h-[50px] xl:py-1.5"
            >
              <span>
                <span className="block font-display text-base font-semibold leading-tight text-ink xl:text-[1.05rem]">
                  {route.label}
                </span>
                <span className="mt-1 block text-[12px] leading-relaxed text-ink-muted lg:hidden xl:block xl:text-[13px]">
                  {route.description}
                </span>
              </span>
              <span className="text-ink-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#617f70]">
                <Arrow />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="#care-team"
        className="group mt-1 flex items-center justify-center gap-3 border-t border-ink/10 pt-4 text-center text-sm font-medium text-[#617f70] lg:pt-2 lg:text-xs xl:pt-4 xl:text-sm"
      >
        Consultants and treatment locations
        <span className="transition-transform duration-300 group-hover:translate-x-1">
          <Arrow />
        </span>
      </Link>
    </nav>
  );
}

function HeroImage({
  presentation,
  mobile = false,
}: {
  presentation: TreatmentPresentation;
  mobile?: boolean;
}) {
  return (
    <>
      <Image
        src={presentation.hero.src}
        alt={presentation.hero.alt}
        fill
        priority
        sizes={
          mobile
            ? "100vw"
            : "(min-width: 1536px) 660px, (min-width: 1024px) 58vw, 100vw"
        }
        style={{ objectPosition: presentation.hero.objectPosition ?? "center" }}
        className="object-cover"
      />
      <span className="absolute bottom-3 right-3 rounded-full bg-[#fbfaf7]/90 px-3 py-1 text-[11px] font-medium text-ink-muted backdrop-blur-sm">
        Illustrative image
      </span>
    </>
  );
}

export default function TreatmentDetailHero({
  therapy,
  presentation,
}: {
  therapy: Therapy;
  presentation: TreatmentPresentation;
}) {
  return (
    <header className="mesh-bg noise relative flex flex-col pt-28 lg:h-[100svh] lg:min-h-[700px] lg:pt-24">
      <div className="relative z-10 flex min-h-0 flex-1 items-center px-6 py-8 sm:px-8 lg:px-[4vw] lg:py-4 xl:px-[6vw]">
        <div className="grid w-full min-w-0 items-center gap-10 lg:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)] lg:gap-3 xl:grid-cols-[minmax(21rem,0.84fr)_minmax(0,1.16fr)] xl:gap-5 2xl:gap-8">
          <div className="relative z-30 text-left lg:-translate-y-3 lg:pb-7">
            <h1 className="heading-lg max-w-[13ch]">{therapy.title}</h1>
            <p className="body-lg mt-6 max-w-[32rem]">{therapy.summary}</p>
            <div className="mt-8 flex flex-wrap items-center justify-start gap-5">
              <Button href="/contact#guidance" variant="sage">
                Contact the practice
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

          <div className="hidden min-w-0 translate-x-[1.5vw] -translate-y-1 justify-end lg:flex xl:translate-x-[2.65vw]">
            <div className="relative aspect-[800/704] w-full min-w-0 max-w-[800px]">
              <div
                aria-hidden
                className="absolute left-[1.2%] top-[4%] z-0 h-[79.5%] w-[39%] rounded-[2.75rem] bg-[#cfddd7]"
              />

              <div className="absolute left-[17.5%] top-[8.8%] z-10 h-[66.2%] w-[82.5%] overflow-hidden rounded-[2.5rem] border border-white/70 bg-canvas-soft">
                <HeroImage presentation={presentation} />
              </div>

              <GuidePanel
                therapy={therapy}
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
              <HeroImage presentation={presentation} mobile />
            </div>
            <GuidePanel
              therapy={therapy}
              className="relative z-10 -mt-14 min-h-[455px] px-6 py-5"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
