import type { NavItem } from "./types";

// Site-wide identity, contact (NAP) and top-level navigation.
// The production domain drives canonical URLs, the sitemap and OG tags.
export const site = {
  name: "Berkshire Oncology Partnership",
  shortName: "Berkshire Oncology",
  strapline: "Private oncology care in Berkshire and the surrounding area",
  url: "https://www.berkshire-oncology.org.uk",
  contact: {
    addressLines: ["13 Bath Rd", "Reading", "Berkshire", "RG1 6HH"],
    postalAddress: {
      streetAddress: "13 Bath Rd",
      addressLocality: "Reading",
      addressRegion: "Berkshire",
      postalCode: "RG1 6HH",
      addressCountry: "GB",
    },
    phone: "0118 959 8866",
    phoneMobile: "07928 888662",
    email: "practicemanager@berkshire-oncology.org.uk",
    practiceManager: "Trish Evans",
    // Dunedin House, 13 Bath Road — Nominatim's building-level match, sitting
    // 2.6 m from the ONS centroid of the postcode OSM records for No. 13 and
    // 91 m across the road from the Spire Dunedin pin, as an odd/even pair
    // should. Replaces an earlier coordinate ~175 m west along Bath Road that
    // matched no building.
    geo: { lat: 51.449959, lng: -0.985037 },
  },
} as const;

// Top-level navigation. The Specialities dropdown is populated at render time
// from the specialities data (see Navbar), so it stays in sync automatically.
export const nav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Consultants", href: "/consultants" },
  { label: "Specialities", href: "/specialities" },
  { label: "Tariffs", href: "/tariffs" },
  { label: "Contact", href: "/contact" },
  { label: "Links", href: "/links" },
];

// Registered/legal footer links (the old site's "Policies" group).
export const policyLinks = [
  { label: "Privacy Notice", href: "/privacy" },
  { label: "Website Privacy Policy", href: "/website-privacy" },
  { label: "Cookies", href: "/cookies" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Accessibility", href: "/accessibility" },
];
