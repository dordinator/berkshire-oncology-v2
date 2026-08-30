import Image from "next/image";
import Link from "next/link";

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 18 18"
      fill="none"
      className={`h-4 w-4 ${className}`}
      aria-hidden
    >
      <path
        d="M3.5 9h11M10.5 5l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.4"
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
      className="group inline-flex items-center gap-4 font-medium text-ink underline decoration-ink/25 underline-offset-[7px] transition-colors hover:decoration-ink"
    >
      <span>{children}</span>
      <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}

export default function TreatmentHero() {
  return (
    <section className="relative overflow-x-clip bg-[#fbfcfd] pt-24 sm:pt-28 md:pt-28 xl:pt-36">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[70%] xl:block">
        <Image
          src="/home/hero.jpg"
          alt="A consultant speaking with a patient during an appointment"
          fill
          priority
          sizes="70vw"
          className="object-cover object-[60%_50%]"
        />
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[52%]"
          style={{
            background:
              "linear-gradient(90deg, #fbfcfd 0%, #fbfcfd 55%, rgba(251, 252, 253, 0) 100%)",
          }}
        />
      </div>

      <div className="container-wide relative z-10">
        <div className="grid items-center gap-8 xl:min-h-[clamp(580px,70svh,720px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:gap-12">
          <div className="relative z-10 xl:flex xl:min-h-[clamp(580px,70svh,720px)] xl:-translate-y-16 xl:flex-col xl:justify-center">
            <h1 className="max-w-[43rem] font-display text-[clamp(2.8rem,13vw,3.25rem)] font-semibold leading-[0.94] tracking-[-0.06em] text-ink xl:text-[clamp(4rem,5vw,4.75rem)]">
              Cancer treatments.
            </h1>
            <p className="mt-6 max-w-[34rem] text-[16px] leading-[1.65] text-ink-muted sm:text-[17px] md:text-[18px] xl:mt-7 xl:text-[19px]">
              Read about cancer treatments and find consultants by cancer type.
            </p>
            <div className="mt-7 flex flex-col items-start gap-4 text-[15px] sm:mt-8 md:text-[16px] xl:mt-11 xl:gap-5">
              <TextLink href="#treatment-index">
                Browse treatments
              </TextLink>
              <TextLink href="#what-we-do-not-provide">
                How care is provided
              </TextLink>
            </div>
          </div>

          <div className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-auto md:h-[360px] lg:h-[400px] xl:h-auto xl:min-h-[clamp(580px,70svh,720px)]">
            <div className="absolute inset-y-0 -left-6 right-[calc(50%-50vw)] overflow-hidden rounded-l-[1.5rem] sm:rounded-l-[2.25rem] md:-left-10 xl:hidden">
              <Image
                src="/home/hero.jpg"
                alt="A consultant speaking with a patient during an appointment"
                fill
                priority
                sizes="(max-width: 1279px) 100vw, 70vw"
                className="object-cover object-[61%_45%]"
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
