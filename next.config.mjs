/** @type {import('next').NextConfig} */

// Slugs kept in sync with src/content. Used to 301-redirect every old .htm URL
// to its new route so existing search rankings and inbound links are preserved.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const cancerRoutes = JSON.parse(readFileSync(new URL("./src/content/cancerRoutes.json", import.meta.url), "utf8"));

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
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),
  // Two dev servers in the same checkout will otherwise both compile into .next
  // and tear each other's chunks out from underneath ("Cannot find module
  // ./vendor-chunks/..."). Setting NEXT_DIST_DIR gives a second server its own
  // build directory. Unset in normal use, so .next stays the default.
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  async headers() {
    return process.env.SITE_NOINDEX === "true"
      ? [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] }]
      : [];
  },
  async redirects() {
    return [
      { source: "/index.htm", destination: "/", permanent: true },
      // Home and About are one page. On a practice this size they were always
      // going to say the same thing twice, so the root *is* the About page and
      // /about redirects into it. Former scaffold children below now redirect
      // to the authored section that answers the same visitor need.
      { source: "/about", destination: "/", permanent: true },
      {
        source: "/about/the-partnership",
        destination: "/#partnership",
        permanent: true,
      },
      {
        source: "/about/our-approach",
        destination: "/patients#start-here",
        permanent: true,
      },
      {
        source: "/about/patient-feedback",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/about/quality-and-governance",
        destination: "/",
        permanent: true,
      },
      {
        source: "/patients/newly-diagnosed",
        destination: "/patients#newly-diagnosed",
        permanent: true,
      },
      {
        source: "/patients/second-opinion",
        destination: "/patients#second-opinion",
        permanent: true,
      },
      {
        source: "/patients/private-treatment",
        destination: "/patients#private-treatment",
        permanent: true,
      },
      {
        source: "/patients/receiving-treatment",
        destination: "/patients#receiving-treatment",
        permanent: true,
      },
      {
        source: "/patients/supporting-someone",
        destination: "/patients#supporting-someone",
        permanent: true,
      },
      {
        source: "/patients/first-appointment",
        destination: "/patients#first-appointment",
        permanent: true,
      },
      {
        source: "/patients/faqs",
        destination: "/patients#faqs",
        permanent: true,
      },
      {
        source: "/resources/cancer-information",
        destination: "/resources#trusted-organisations",
        permanent: true,
      },
      {
        source: "/resources/treatment-preparation",
        destination: "/patients#first-appointment",
        permanent: true,
      },
      {
        source: "/resources/managing-side-effects",
        destination: "/patients#receiving-treatment",
        permanent: true,
      },
      {
        source: "/resources/patient-guides",
        destination: "/patients#first-appointment",
        permanent: true,
      },
      {
        source: "/resources/emotional-and-practical-support",
        destination: "/resources#trusted-organisations",
        permanent: true,
      },
      {
        source: "/resources/carers-and-families",
        destination: "/patients#supporting-someone",
        permanent: true,
      },
      {
        source: "/resources/financial-and-benefits-advice",
        destination: "/resources#trusted-organisations",
        permanent: true,
      },
      {
        source: "/resources/news",
        destination: "/resources",
        permanent: true,
      },
      {
        source: "/locations/spire-dunedin-reading",
        destination: "/locations",
        permanent: true,
      },
      {
        source: "/locations/princess-margaret-windsor",
        destination: "/locations",
        permanent: true,
      },
      {
        source: "/locations/genesiscare-windsor",
        destination: "/locations",
        permanent: true,
      },
      {
        source: "/locations/genesiscare-oxford",
        destination: "/locations",
        permanent: true,
      },
      {
        source: "/locations/royal-berkshire-hospital",
        destination: "/locations",
        permanent: true,
      },
      {
        source: "/locations/other-locations",
        destination: "/locations",
        permanent: true,
      },
      {
        source: "/locations/getting-here",
        destination: "/locations",
        permanent: true,
      },
      {
        source: "/locations/parking-and-accessibility",
        destination: "/locations",
        permanent: true,
      },
      {
        source: "/consultants/choosing-a-consultant",
        destination: "/consultants",
        permanent: true,
      },
      {
        source: "/chemotherapy-demo",
        destination: "/treatments/chemotherapy",
        permanent: true,
      },
      {
        source: "/resources-demo",
        destination: "/resources",
        permanent: true,
      },
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
      { source: "/useful-links.htm", destination: "/resources", permanent: true },
      { source: "/privacy-notice.htm", destination: "/privacy", permanent: true },
      { source: "/privacy.htm", destination: "/website-privacy", permanent: true },
      { source: "/cookies.htm", destination: "/cookies", permanent: true },
      {
        source: "/terms-and-conditions.htm",
        destination: "/terms",
        permanent: true,
      },
      { source: "/accessibility.htm", destination: "/accessibility", permanent: true },
      // Retire the old templates; preserve inbound links with a direct hop.
      ...Object.entries(cancerRoutes).flatMap(([slug, group]) =>
        ["", ".htm"].map((suffix) => ({
          source: `/specialities/${slug}${suffix}`,
          destination: `/specialities?type=${group}#specialists`,
          permanent: true,
        })),
      ),
      ...Object.entries({
        "/consultants/by-treatment": "/consultants?view=treatments#consultant-list",
        "/consultants/profiles": "/consultants?sort=az#consultant-list",
        "/consultants/clinical-oncologists": "/consultants?role=clinical#consultant-list",
        "/consultants/medical-oncologists": "/consultants?role=medical#consultant-list",
        "/links": "/resources",
        "/contact-concept": "/contact",
      }).map(([source, destination]) => ({ source, destination, permanent: true })),
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
