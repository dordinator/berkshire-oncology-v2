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
// The two GenesisCare sites took more work, and carry a caveat. Their URLs
// below no longer resolve — the host presents a TLS certificate that does not
// cover genesiscare.co.uk, and following it insecurely lands on a 404 at
// genesiscare.com — and neither centre is in OpenStreetMap under that name. The
// addresses were recovered from the operator's own archived pages via the
// Wayback Machine (2016 for Oxford, 2017 for Windsor), then geocoded from their
// postcodes.
//
// So those two coordinates are as good as a 2016–17 source can make them, and
// they still need confirming: a centre can move or close in that time, and this
// operator's UK web presence plainly has changed. The links need replacing
// regardless.
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
    location: "Sandford, Oxford",
    // TODO(practice): dead link — see the note above.
    url: "https://www.genesiscare.co.uk/cancer-centre/oxford",
    // Sandford Medical Centre, Sandy Lane West, Peters Way, Littlemore,
    // Oxford OX4 6LB. "Sandford" is the centre's name, not the village of
    // Sandford-on-Thames three miles away — which is where a guess would have
    // put it. ONS postcode centroid; Nominatim's street match agrees to ~75 m.
    geo: { lat: 51.723559, lng: -1.215733 },
  },
  {
    name: "GenesisCare",
    location: "Windsor",
    // TODO(practice): dead link — see the note above.
    url: "https://www.genesiscare.co.uk/windsor",
    // 69 Alma Road, Windsor SL4 3ES. ONS postcode centroid; Nominatim's match
    // for Alma Road agrees to ~125 m.
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
