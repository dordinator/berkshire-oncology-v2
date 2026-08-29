import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";

const routes = [
  { label: "I’m newly diagnosed", href: "#newly-diagnosed" },
  { label: "I’m looking for a second opinion", href: "#second-opinion" },
  { label: "I’m looking for private treatment", href: "#private-treatment" },
  { label: "I’m already receiving treatment", href: "#receiving-treatment" },
  { label: "I’m supporting someone with cancer", href: "#supporting-someone" },
];

export default function PatientsHero() {
  return (
    // data-drift-band scopes the sage panel's scrubbed travel; the fx hooks
    // here are read by PageMotion, mounted by the page.
    <section
      data-drift-band
      className="relative overflow-clip bg-[#f8f8f4] pt-32 text-ink md:pt-36"
    >
      <div className="container-wide grid min-h-[calc(100svh-8rem)] items-center gap-12 pb-24 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:pb-36">
        <div className="relative z-10 py-8 lg:py-14">
          <h1 className="max-w-3xl font-display text-[clamp(1.8rem,10.5vw,3.4rem)] font-semibold leading-[0.93] tracking-[-0.06em] sm:text-[clamp(3.4rem,5.55vw,6.4rem)] lg:text-[clamp(3.4rem,4.1vw,5.2rem)]">
            <span className="block whitespace-nowrap">A clear place</span>
            <span className="block whitespace-nowrap">to start with</span>
            <span className="block whitespace-nowrap">
              private cancer care.
            </span>
          </h1>

          <p className="mt-7 max-w-lg text-lg leading-relaxed text-ink-muted md:text-xl">
            Find practical information if you have a new diagnosis, are
            considering a second opinion or private treatment, are already
            receiving treatment, or are supporting someone close to you.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button
              href="#start-here"
              variant="primary"
              className="border-2 border-transparent hover:border-white focus-visible:border-white"
            >
              Find your next step
            </Button>
            <Button href="/contact#guidance" variant="ghost" arrow={false}>
              Talk to our team
            </Button>
          </div>
        </div>

        <div className="relative min-h-[570px] py-6 lg:min-h-[690px]">
          <div
            aria-hidden
            data-fx="drift"
            data-drift="0.5"
            className="absolute bottom-[8%] left-[4%] top-[2%] w-[47%] rounded-[2.5rem] bg-[#c8d6cf]"
          />

          <div
            data-parallax-frame
            className="absolute right-0 top-[7%] h-[69%] w-[64%] overflow-hidden rounded-[2.5rem] border border-ink/10 bg-white shadow-[0_35px_90px_-40px_rgba(6,28,70,0.35)]"
          >
            {/* Taller than its frame so the parallax never shows an edge. */}
            <div
              data-fx="parallax"
              className="absolute inset-x-0 -top-[16%] h-[132%]"
            >
              <Image
                src="/home/partnership.jpg"
                alt="A consultant talking with a patient"
                fill
                priority
                sizes="(max-width: 1024px) 68vw, 38vw"
                className="object-cover object-[62%_center]"
              />
            </div>
          </div>

          {/* No data-fx="rise" here, deliberately: this card is above the fold,
              and a scrubbed entrance catches mid-flight on first paint —
              half-transparent and adrift over the photograph. Entrances belong
              to elements the reader scrolls TO. */}
          <div className="absolute bottom-3 left-0 w-[82%] rounded-[2rem] border border-ink/10 bg-[#fbfaf5] p-3 shadow-[0_30px_80px_-35px_rgba(6,28,70,0.35)] sm:p-4 lg:w-[76%]">
            <div className="flex items-center justify-between border-b border-ink/10 px-2 pb-3">
              <p className="font-display text-lg">Where are you starting from?</p>
              <span className="hidden text-[10px] uppercase tracking-[0.18em] text-ink-muted sm:block">
                Choose one
              </span>
            </div>

            <div className="divide-y divide-ink/10">
              {routes.map((route, index) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className="group flex items-center gap-3 px-2 py-3 text-sm text-ink transition-colors hover:text-accent"
                >
                  <span
                    aria-hidden
                    className={`h-2.5 w-2.5 flex-none rounded-full ${
                      index === 0 ? "bg-[#8ca49a]" : "border border-ink/20"
                    }`}
                  />
                  <span className="min-w-0 flex-1">{route.label}</span>
                  <span
                    aria-hidden
                    className="transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
