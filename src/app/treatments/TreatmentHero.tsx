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
    <section className="relative overflow-x-clip bg-[#fbfcfd] pt-28 md:pt-32 lg:pt-36">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[70%] lg:block">
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
        <div className="grid items-center gap-10 lg:min-h-[580px] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12 2xl:min-h-[760px]">
          <div className="relative z-10 pb-2 lg:flex lg:min-h-[580px] lg:-translate-y-16 lg:flex-col lg:justify-center lg:pb-0 2xl:min-h-[760px]">
            <h1 className="max-w-[43rem] font-display text-[clamp(3.75rem,5.2vw,6.25rem)] font-semibold leading-[0.94] tracking-[-0.06em] text-ink">
              Clear information about treatment.
            </h1>
            <p className="mt-7 max-w-[34rem] text-[17px] leading-[1.65] text-ink-muted md:text-[19px]">
              Read about treatments our consultants work with, or begin with
              the cancer type you have.
            </p>
            <div className="mt-9 flex flex-col items-start gap-5 text-[15px] md:mt-11 md:text-[16px]">
              <TextLink href="/specialities#browse-all">
                Start with your cancer type
              </TextLink>
              <TextLink href="#what-we-do-not-provide">
                What we do not provide directly
              </TextLink>
            </div>
          </div>

          <div className="relative min-h-[340px] sm:min-h-[430px] lg:min-h-[580px] 2xl:min-h-[760px]">
            <div className="absolute inset-y-0 left-[-3rem] right-[calc(50%-50vw)] overflow-hidden rounded-l-[2.25rem] lg:hidden">
              <Image
                src="/home/hero.jpg"
                alt="A consultant speaking with a patient during an appointment"
                fill
                priority
                sizes="(max-width: 640px) 96vw, (max-width: 1024px) 92vw, 70vw"
                className="object-cover object-[61%_45%]"
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
