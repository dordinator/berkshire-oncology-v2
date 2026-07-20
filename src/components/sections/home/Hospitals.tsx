import type { SVGProps } from "react";
import Reveal from "@/components/ui/Reveal";
import MapEmbed from "@/components/site/MapEmbed";
import { hospitals } from "@/content/hospitals";
import { site } from "@/content/site";

const iconBase = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

const IconBuilding = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...p}>
    <path d="M3 21h18" />
    <path d="M5 21V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v16" />
    <path d="M14 21V9h4a1 1 0 0 1 1 1v11" />
    <path d="M8 8h2M8 12h2M8 16h2" />
  </svg>
);
const IconCrown = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...p}>
    <path d="M5 19h14" />
    <path d="M4 8l3.5 3L12 5l4.5 6L20 8l-1.5 8h-13L4 8Z" />
  </svg>
);
const IconHeart = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...p}>
    <path d="M12 20C7 16.5 4 13.5 4 10a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 3.5-3 6.5-8 10Z" />
  </svg>
);
const IconShield = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...p}>
    <path d="M12 3l7 3v5.5c0 4-3 7.5-7 8.5-4-1-7-4.5-7-8.5V6l7-3Z" />
    <path d="M12 9v5M9.5 11.5h5" />
  </svg>
);
const IconPin = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...p}>
    <path d="M12 21c4-4.5 7-7.8 7-11a7 7 0 1 0-14 0c0 3.2 3 6.5 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

// Icons matched to each hospital (same order as src/content/hospitals.ts).
const icons = [IconBuilding, IconCrown, IconHeart, IconBuilding, IconShield];

export default function Hospitals() {
  const geo = site.contact.geo;

  return (
    <section className="bg-canvas-soft py-24 md:py-32">
      <div className="container-wide">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* left — copy + stat */}
          <div className="max-w-xl">
            <Reveal>
              <span className="eyebrow text-accent">
                <span className="h-px w-8 bg-accent/50" /> Where we practise
              </span>
            </Reveal>
            <Reveal delay={1}>
              <h2 className="heading-lg mt-5">
                Private care across{" "}
                <span className="text-gradient">Berkshire &amp; Oxford.</span>
              </h2>
            </Reveal>
            <Reveal delay={2}>
              <p className="body-lg mt-6">
                Our consultants provide oncology services at leading private
                hospitals and cancer centres across the region.
              </p>
            </Reveal>
            <Reveal delay={3}>
              <div className="mt-8 inline-flex items-center gap-4 rounded-2xl border border-black/[0.06] bg-white p-4 pr-7">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <IconPin className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-display text-lg text-ink">
                    {hospitals.length} locations
                  </p>
                  <p className="text-sm text-ink-muted">across Berkshire &amp; Oxford</p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* right — live map */}
          <Reveal delay={2}>
            <div className="h-[320px] overflow-hidden rounded-3xl border border-black/[0.06] shadow-[0_12px_40px_-16px_rgba(6,28,70,0.18)] md:h-[440px]">
              <MapEmbed
                lat={geo.lat}
                lng={geo.lng}
                zoom={9}
                label="Berkshire Oncology Partnership — hospitals across Berkshire and Oxford"
              />
            </div>
          </Reveal>
        </div>

        {/* hospital strip */}
        <Reveal delay={1}>
          <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-black/[0.06] bg-black/[0.06] md:grid-cols-5">
            {hospitals.map((h, i) => {
              const Icon = icons[i] ?? IconBuilding;
              return (
                <a
                  key={`${h.name}-${h.location}`}
                  href={h.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center bg-white px-5 py-8 text-center transition-colors hover:bg-canvas-soft"
                >
                  <span className="text-accent">
                    <Icon className="h-8 w-8" />
                  </span>
                  <h3 className="mt-4 font-display text-base leading-snug text-ink">
                    {h.name}
                  </h3>
                  <p className="mt-1 text-sm text-ink-muted">{h.location}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                    Visit website
                    <svg
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M3 8h10M9 4l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </a>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
