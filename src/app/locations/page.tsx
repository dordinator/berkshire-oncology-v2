import type { Metadata } from "next";
import JsonLd from "@/components/site/JsonLd";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import LocationsJourney from "@/components/sections/locations/LocationsJourney";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import { journeyStops } from "@/content/journey";
import { mapAttribution } from "@/content/mapAttribution";

// ─────────────────────────────────────────────────────────────────────────────
// /locations — a scroll journey in the manner of HCA's "Our locations".
//
// A hero beside a faint vector map of the whole UK, whose pins cluster in the
// Thames Valley; scrolling flies the map to the practice's own rooms first and
// then to each hospital in turn, each stop's panel saying what the building is
// in its operator's own terms. The choreography lives in LocationsJourney; the
// stops, their order and their framing in content/journey.ts.
//
// What used to be here — a card grid and a set of generic detail scaffolds — is
// replaced by the journey itself. Each site panel links to the hospital's own
// verified page; practice-specific questions go to the contact journey.
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = pageMeta({
  title: "Locations",
  description:
    "Find Berkshire Oncology locations in Reading, Windsor and Oxford, and understand how to confirm where your appointment or treatment will take place.",
  path: "/locations",
});

export default function LocationsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Locations", path: "/locations" },
        ])}
      />

      <LocationsJourney
        stops={journeyStops}
        attribution={mapAttribution}
        hero={
          <>
            <Reveal>
              <h1 className="type-page-hero">Where you may be seen</h1>
            </Reveal>
            <Reveal delay={1}>
              <p className="body-lg mt-6 max-w-xl">
                Your location depends on your consultant and the care planned
                for you. Berkshire Oncology Partnership is a group of
                independent consultant oncologists based in Reading. They also
                practise at hospitals and cancer centres in Reading, Windsor
                and Oxford.
              </p>
            </Reveal>
            <Reveal delay={2}>
              <p className="body-lg mt-5 max-w-xl">
                These descriptions explain what each site provides generally,
                not which Berkshire Oncology services take place there. Your
                consultant or the practice team will confirm where you need to
                go before you travel.
              </p>
            </Reveal>
          </>
        }
        outro={
          // The journey's last lock: the camera has pulled back out to the
          // UK-wide shot it opened on, with a direct hand-off to the practice.
          <>
            <h2 className="font-display text-2xl leading-tight text-ink md:text-3xl">
              Not sure which site you need?
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted">
              Contact the practice team if you are unsure where to go. They can
              check where your consultant sees patients and where your treatment
              is planned before you travel.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 lg:mt-8">
              <Button href="/contact#guidance" variant="primary">
                Contact the practice
              </Button>
              <Button href="/consultants" variant="ghost">
                Find a consultant
              </Button>
            </div>
          </>
        }
      />

    </>
  );
}
