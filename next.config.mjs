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
  async redirects() {
    return [
      { source: "/index.htm", destination: "/", permanent: true },
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
