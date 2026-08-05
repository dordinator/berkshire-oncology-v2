import type { Hospital } from "./types";

// Where the partnership's consultants provide private oncology services
// (from the homepage: "We provide Oncology Services at ...").
//
// ── On `geo` ─────────────────────────────────────────────────────────────────
// Coordinates are geocoded from each site's own postal address via OpenStreetMap
// Nominatim, and checked to land on the named building in the named town. They
// are never typed from memory: a pin in the wrong place is a factual error on a
// medical site, and an absent pin is not.
//
// The two GenesisCare sites took more work. Their addresses were first
// recovered from archived pages via the Wayback Machine (2016–17) and geocoded
// from their postcodes; in August 2026 both centres were re-verified against
// the operator's LIVE pages — GenesisCare UK moved its web presence from
// genesiscare.co.uk onto genesiscare.com/uk (the group split into separately
// governed UK/Australia/Spain businesses on emerging from Chapter 11 in
// February 2024; the UK company neither closed nor renamed), and the old
// domain's redirect drops the /uk/our-centres/ path, which is why the old
// links died with a cert error then a 404. Windsor is confirmed still at
// 69 Alma Road; Oxford still at Peters Way, OX4 6LB — so the archived-era
// coordinates stand, now corroborated by a live source.
// ─────────────────────────────────────────────────────────────────────────────
export const hospitals: Hospital[] = [
  {
    name: "Spire Dunedin Hospital",
    location: "Reading",
    url: "https://www.spirehealthcare.com/spire-dunedin-hospital",
    // 16 Bath Road, Reading RG1 6HW
    geo: { lat: 51.450499, lng: -0.986018 },
  },
  {
    name: "Princess Margaret Hospital",
    location: "Windsor",
    url: "https://www.circlehealthgroup.co.uk/hospitals/the-princess-margaret-hospital",
    // 38–42 Osborne Road, Windsor SL4 3SJ
    geo: { lat: 51.47484, lng: -0.609968 },
  },
  {
    name: "GenesisCare",
    location: "Oxford",
    url: "https://www.genesiscare.com/uk/our-centres/oxford",
    // Peters Way, Sandy Lane West, Oxford OX4 6LB — the operator's own current
    // wording; the old "Sandford Medical Centre, Littlemore" rendering was a
    // third-party artefact. Same postcode throughout. ONS postcode centroid;
    // Nominatim's street match agrees to ~75 m.
    geo: { lat: 51.723559, lng: -1.215733 },
  },
  {
    name: "GenesisCare",
    location: "Windsor",
    url: "https://www.genesiscare.com/uk/our-centres/windsor",
    // 69 Alma Road, Windsor. Geocoded from SL4 3ES (CQC's postcode for the
    // centre; the operator now publishes SL4 3HD — same building, adjacent
    // units, one for the practice to confirm). ONS postcode centroid;
    // Nominatim's match for Alma Road agrees to ~125 m.
    geo: { lat: 51.47786, lng: -0.616878 },
  },
  {
    name: "Royal Berkshire Hospital",
    location: "Reading (NHS)",
    url: "https://www.royalberkshire.nhs.uk",
    // London Road, Reading RG1 5AN
    geo: { lat: 51.449176, lng: -0.958114 },
  },
];
