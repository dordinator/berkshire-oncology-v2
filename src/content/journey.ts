import { site } from "./site";
import { hospitals } from "./hospitals";
import { getLocation } from "./locations";
import type { JourneyStop } from "@/components/sections/locations/LocationsJourney";

// ─────────────────────────────────────────────────────────────────────────────
// The /locations scroll journey: which stops, in which order, framed how.
//
// The order is geographic, not alphabetical or by importance: the practice's
// own rooms first, then Spire Dunedin directly across the road, then the Royal
// Berkshire two kilometres east — the Reading cluster — before the map flies
// to the Windsor pair and finishes at Oxford. Each move is the shortest the
// camera can make, so the journey reads as one sweep rather than criss-cross.
//
// `spanM` is the MINIMUM framed diameter on the ground at each stop — tight
// enough that the active pin separates from its neighbours (the two Windsor
// centres are 690 m apart, the practice 91 m from Spire Dunedin, so town-wide
// frames would stack their pins). The camera itself may open wider than this:
// JourneyMap biases each frame towards the nearest river and zooms out just
// enough to bring it into shot, because without the Kennet or the Thames a
// close-up here is a pin in a white void — the county lines live kilometres
// away, and the sites sit 700 m – 1.6 km from their water.
//
// Coordinates come from hospitals.ts and site.ts, which carry their own
// provenance; descriptions and addresses from locations.ts, checkable against
// each operator's live page. Nothing here is asserted for the first time.
// ─────────────────────────────────────────────────────────────────────────────

function geoOf(hospitalName: string, location?: string) {
  const h = hospitals.find(
    (x) =>
      x.name === hospitalName && (!location || x.location.includes(location)),
  );
  if (!h?.geo) throw new Error(`No geo for ${hospitalName} in hospitals.ts`);
  return h.geo;
}

function hospitalStop(
  slug: string,
  opts: {
    index: string;
    eyebrow: string;
    hospitalName: string;
    hospitalLocation?: string;
    spanM: number;
  },
): JourneyStop {
  const loc = getLocation(slug);
  if (!loc?.description) {
    throw new Error(`locations.ts is missing ${slug} or its description`);
  }
  return {
    index: opts.index,
    eyebrow: opts.eyebrow,
    slug: loc.slug,
    name: loc.name,
    area: loc.area,
    provider: loc.provider,
    nhs: loc.nhs,
    description: loc.description,
    address: loc.address,
    href: `/locations/${loc.slug}`,
    linkLabel: "About this site",
    spanM: opts.spanM,
    ...geoOf(opts.hospitalName, opts.hospitalLocation),
  };
}

export const journeyStops: JourneyStop[] = [
  {
    index: "01",
    eyebrow: "The practice",
    // Matches the practice's grounds polygon in mapPaths.generated sitePolys.
    slug: "practice",
    name: "Berkshire Oncology Partnership",
    area: "Reading",
    description:
      "The practice's own rooms at 13 Bath Road, directly opposite Spire Dunedin Hospital. This is where the partnership is based, where our practice manager is reached, and where correspondence is handled — every journey with us starts here.",
    address: site.contact.addressLines.join(", "),
    href: "/contact",
    linkLabel: "Contact the practice",
    spanM: 1000,
    ...site.contact.geo,
  },
  hospitalStop("spire-dunedin-reading", {
    index: "02",
    eyebrow: "Private hospital",
    hospitalName: "Spire Dunedin Hospital",
    spanM: 1000,
  }),
  hospitalStop("royal-berkshire-hospital", {
    index: "03",
    eyebrow: "NHS hospital",
    hospitalName: "Royal Berkshire Hospital",
    spanM: 1200,
  }),
  hospitalStop("princess-margaret-windsor", {
    index: "04",
    eyebrow: "Private hospital",
    hospitalName: "Princess Margaret Hospital",
    spanM: 1400,
  }),
  hospitalStop("genesiscare-windsor", {
    index: "05",
    eyebrow: "Cancer centre",
    hospitalName: "GenesisCare",
    hospitalLocation: "Windsor",
    spanM: 1400,
  }),
  hospitalStop("genesiscare-oxford", {
    index: "06",
    eyebrow: "Cancer centre",
    hospitalName: "GenesisCare",
    hospitalLocation: "Oxford",
    spanM: 1600,
  }),
];
