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
      className={`flex flex-col rounded-panel border border-ink/[0.09] bg-paper/[0.985] px-6 py-5 shadow-[0_24px_60px_-34px_rgba(6,28,70,0.38)] lg:px-5 lg:py-4 xl:px-8 xl:py-5 ${className}`}
    >
      <h2 className="type-card-title text-ink lg:text-xl xl:text-[1.75rem] 2xl:text-[2rem]">
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
                <span className="type-compact-title block text-ink">
                  {route.label}
                </span>
                <span className="type-supporting mt-1 block text-ink-muted lg:hidden xl:block">
                  {route.description}
                </span>
              </span>
              <span className="text-ink-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-sage-ink">
                <Arrow />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="#care-team"
        className="type-button group mt-1 flex items-center justify-center gap-3 border-t border-ink/10 pt-4 text-center text-sage-ink lg:pt-2 lg:text-xs xl:pt-4 xl:text-sm"
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
        fetchPriority="high"
        sizes={
          mobile
            ? "100vw"
            : "(min-width: 1536px) 660px, (min-width: 1024px) 58vw, 100vw"
        }
        style={{ objectPosition: presentation.hero.objectPosition ?? "center" }}
        className="object-cover"
      />
      {/* Top-right on a phone, bottom-right everywhere else. The mobile
          composition pulls the "On this page" card up over the image with
          `-mt-14`, and that 56px strip is exactly where `bottom-3` puts this
          badge — so it sat under a translucent, blurred panel and read as a
          ghosted smear of text on all seven treatment pages. The label is a
          disclosure that the photograph is not of a real patient, so it has to
          stay legible rather than be hidden on small screens. */}
      <span
        className={`absolute right-3 rounded-full bg-paper/90 px-3 py-1 text-xs font-medium text-ink-muted backdrop-blur-sm ${
          mobile ? "top-3" : "bottom-3"
        }`}
      >
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
      <div className="site-gutter relative z-10 flex min-h-0 flex-1 items-center py-8 lg:py-4">
        <div className="grid w-full min-w-0 items-center gap-10 lg:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)] lg:gap-3 xl:grid-cols-[minmax(21rem,0.84fr)_minmax(0,1.16fr)] xl:gap-5 2xl:gap-8">
          <div className="relative z-30 text-left lg:-translate-y-3 lg:pb-7">
            <h1 className="type-page-hero max-w-[13ch] text-ink">
              {therapy.title}
            </h1>
            <p className="type-hero-lede mt-6 max-w-[32rem] text-ink-muted">
              {therapy.summary}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-start gap-5">
              <Button href="/contact#guidance" variant="sage">
                Contact the practice
              </Button>
              <span aria-hidden className="hidden h-10 w-px bg-ink/15 sm:block" />
              <a
                href={`tel:${site.contact.phone.replace(/\s+/g, "")}`}
                className="type-body inline-flex min-h-11 items-center font-medium text-sage-ink"
              >
                {site.contact.phone}
              </a>
            </div>
          </div>

          <div className="hidden min-w-0 translate-x-[1.5vw] -translate-y-1 justify-end lg:flex xl:translate-x-[2.65vw]">
            <div className="relative aspect-[800/704] w-full min-w-0 max-w-[800px]">
              <div
                aria-hidden
                className="absolute left-[1.2%] top-[4%] z-0 h-[79.5%] w-[39%] rounded-panel bg-sage-panel"
              />

              <div className="absolute left-[17.5%] top-[8.8%] z-10 h-[66.2%] w-[82.5%] overflow-hidden rounded-panel border border-white/70 bg-canvas-soft">
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
            <div aria-hidden className="absolute -left-3 -top-4 h-52 w-44 rounded-panel bg-sage-panel" />
            <div className="relative aspect-[3/2] overflow-hidden rounded-panel">
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
