import Image from "next/image";
import Button from "@/components/ui/Button";

/**
 * One visible pair at each breakpoint. Phones place the actions with the intro,
 * before the photo; the existing tablet layout keeps them below the photo;
 * desktop places them beside it. The hidden copy is also excluded from the
 * accessibility tree and keyboard order.
 *
 * Callers supply the display utilities; this sets no display of its own.
 */
function HeroLinks({ className = "" }: { className?: string }) {
  return (
    <div
      className={`type-button flex-col items-start gap-4 max-md:w-fit max-md:max-w-full max-md:items-stretch xl:gap-5 ${className}`}
    >
      <Button href="#treatment-index" className="hero-cta-primary">
        Browse treatments
      </Button>
      <Button href="#what-we-do-not-provide" variant="ghost" className="hero-cta-secondary">
        How care is provided
      </Button>
    </div>
  );
}

export default function TreatmentHero() {
  return (
    <section className="relative overflow-x-clip bg-canvas pb-[6.5rem] pt-24 sm:pt-28 md:pb-28 md:pt-28 xl:pb-0 xl:pt-36">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[70%] xl:block">
        <Image
          src="/home/hero.jpg"
          alt="A consultant speaking with a patient during an appointment"
          fill
          fetchPriority="high"
          sizes="70vw"
          className="object-cover object-[60%_50%]"
        />
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[52%] bg-gradient-to-r from-canvas from-0% via-canvas via-[55%] to-transparent"
        />
      </div>

      <div className="container-wide relative z-10">
        <div className="grid items-center gap-8 xl:min-h-[clamp(580px,70svh,720px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:gap-12">
          <div className="relative z-10 xl:flex xl:min-h-[clamp(580px,70svh,720px)] xl:-translate-y-16 xl:flex-col xl:justify-center">
            <h1 className="type-page-hero max-w-[43rem] text-ink">
              Cancer treatments.
            </h1>
            <p className="type-hero-lede mt-6 max-w-[34rem] text-ink-muted xl:mt-7">
              Read about cancer treatments and find consultants by cancer type.
            </p>
            <HeroLinks className="mt-7 flex sm:mt-8 md:hidden xl:mt-11 xl:flex" />
          </div>

          <div className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-auto md:h-[360px] lg:h-[400px] xl:h-auto xl:min-h-[clamp(580px,70svh,720px)]">
            <div className="absolute inset-y-0 left-0 right-0 overflow-hidden rounded-panel md:-left-10 md:right-[calc(50%-50vw)] md:rounded-l-panel md:rounded-r-none xl:hidden">
              <Image
                src="/home/hero.jpg"
                alt="A consultant speaking with a patient during an appointment"
                fill
                fetchPriority="high"
                sizes="(max-width: 1279px) 100vw, 70vw"
                className="object-cover object-[61%_45%]"
              />
            </div>
          </div>

          <HeroLinks className="hidden md:flex xl:hidden" />
        </div>

      </div>
    </section>
  );
}
