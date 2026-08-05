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
    <section className="relative overflow-hidden bg-[#f8f8f4] pt-32 text-ink md:pt-36">
      <div className="container-wide grid min-h-[calc(100svh-8rem)] items-center gap-12 pb-24 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:pb-36">
        <div className="relative z-10 py-8 lg:py-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-medium text-ink-muted shadow-[0_8px_30px_-20px_rgba(6,28,70,0.25)]">
            <span aria-hidden className="h-2 w-2 rounded-full bg-[#8ca49a]" />
            Patients & families
          </span>

          <h1 className="mt-7 max-w-3xl font-display text-[clamp(3.4rem,5.55vw,6.4rem)] font-semibold leading-[0.93] tracking-[-0.06em]">
            Wherever you are in this, there is a place to start.
          </h1>

          <p className="mt-7 max-w-lg text-lg leading-relaxed text-ink-muted md:text-xl">
            Clear guidance for a new diagnosis, a second opinion, private
            treatment, ongoing care or supporting someone close to you.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button href="#start-here" variant="primary">
              Find your next step
            </Button>
            <Button href="/contact" variant="ghost" arrow={false}>
              Talk to our team
            </Button>
          </div>
        </div>

        <div className="relative min-h-[570px] py-6 lg:min-h-[690px]">
          <div
            aria-hidden
            className="absolute bottom-[8%] left-[4%] top-[2%] w-[47%] rounded-[2.5rem] bg-[#c8d6cf]"
          />

          <div className="absolute right-0 top-[7%] h-[69%] w-[64%] overflow-hidden rounded-[2.5rem] border border-ink/10 bg-white shadow-[0_35px_90px_-40px_rgba(6,28,70,0.35)]">
            <Image
              src="/home/partnership.jpg"
              alt="A consultant talking with a patient"
              fill
              priority
              sizes="(max-width: 1024px) 68vw, 38vw"
              className="object-cover object-[62%_center]"
            />
          </div>

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
