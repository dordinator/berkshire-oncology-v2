/** @type {import('next').NextConfig} */

// Slugs kept in sync with src/content. Used to 301-redirect every old .htm URL
// to its new route so existing search rankings and inbound links are preserved.
const specialities = [
  "bladder",
  "brain",
  "breast",
  "cancer-unknown-primary",
  "colorectal",
  "gynaecology",
  "head-and-neck",
  "kidney",
  "liver",
  "lung",
  "lymphoma",
  "oesophagus",
  "pancreas",
  "prostate",
  "skin",
  "stomach",
  "testicular",
  "sarcoma",
];

const consultants = [
  "joss-adams",
  "madhumita-bhattacharyya",
  "nicola-dallas",
  "ruth-davis",
  "gelareh-eslamian",
  "alice-freebairn",
  "esme-hill",
  "ayman-madi",
  "helen-odonnell",
  "paul-rogers",
];

const nextConfig = {
  reactStrictMode: true,
  // Two dev servers in the same checkout will otherwise both compile into .next
  // and tear each other's chunks out from underneath ("Cannot find module
  // ./vendor-chunks/..."). Setting NEXT_DIST_DIR gives a second server its own
  // build directory. Unset in normal use, so .next stays the default.
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  async redirects() {
    return [
      { source: "/index.htm", destination: "/", permanent: true },
      // Home and About are one page. On a practice this size they were always
      // going to say the same thing twice, so the root *is* the About page and
      // /about redirects into it. This matches `source` exactly — the children
      // (/about/the-partnership and the rest) are untouched and still resolve.
      { source: "/about", destination: "/", permanent: true },
      {
        source: "/about/nhs-and-private-practice",
        destination: "/patients#private-treatment",
        permanent: true,
      },
      {
        source: "/about/referring-professionals",
        destination: "/contact?intent=referral#next-step",
        permanent: true,
      },
      {
        source: "/about/careers",
        destination: "/contact?intent=professional#next-step",
        permanent: true,
      },
      {
        source: "/consultants/by-cancer-type",
        destination: "/specialities",
        permanent: true,
      },
      { source: "/our-consultants.htm", destination: "/consultants", permanent: true },
      { source: "/contact.htm", destination: "/contact", permanent: true },
      { source: "/contacts", destination: "/contact", permanent: true },
      { source: "/tariffs.htm", destination: "/tariffs", permanent: true },
      { source: "/useful-links.htm", destination: "/links", permanent: true },
      { source: "/privacy-notice.htm", destination: "/privacy", permanent: true },
      { source: "/privacy.htm", destination: "/website-privacy", permanent: true },
      { source: "/cookies.htm", destination: "/cookies", permanent: true },
      {
        source: "/terms-and-conditions.htm",
        destination: "/terms",
        permanent: true,
      },
      { source: "/accessibility.htm", destination: "/accessibility", permanent: true },
      // Speciality pages
      ...specialities.map((s) => ({
        source: `/specialities/${s}.htm`,
        destination: `/specialities/${s}`,
        permanent: true,
      })),
      // Consultant profile pages
      ...consultants.map((s) => ({
        source: `/consultant-dr-${s}.htm`,
        destination: `/consultants/${s}`,
        permanent: true,
      })),
      // Treatment pages that were folded into others during the treatment-hub
      // rebuild. SACT is an umbrella term (explained on the hub), palliative
      // radiotherapy is a section within radiotherapy, and clinical trials is
      // unpublished — see src/content/therapies.ts for the reasoning.
      {
        source: "/treatments/systemic-anti-cancer-treatment",
        destination: "/treatments",
        permanent: true,
      },
      {
        source: "/treatments/palliative-radiotherapy",
        destination: "/treatments/radiotherapy#palliative-radiotherapy",
        permanent: true,
      },
      {
        source: "/treatments/clinical-trials",
        destination: "/treatments",
        permanent: true,
      },
      // Former consultants no longer on the site
      {
        source: "/consultant-dr-james-gildersleve.htm",
        destination: "/consultants",
        permanent: true,
      },
      {
        source: "/consultant-dr-richard-brown.htm",
        destination: "/consultants",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
