import type { Metadata } from "next";
import { site } from "./site";
import type { Consultant, Speciality } from "./types";

// ── Page metadata helper ──────────────────────────────────────────────────
// Produces a per-page Metadata object with a canonical URL and matching OG/Twitter.
export function pageMeta({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = `${site.url}${path}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      url,
      siteName: site.name,
      type: "website",
      locale: "en_GB",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${site.name}`,
      description,
    },
  };
}

// ── JSON-LD structured data builders ──────────────────────────────────────
const schema = "https://schema.org";

/** Sitewide MedicalClinic / MedicalOrganization (rendered in the root layout). */
export function organizationLd() {
  const c = site.contact;
  return {
    "@context": schema,
    "@type": "MedicalClinic",
    "@id": `${site.url}/#organization`,
    name: site.name,
    url: site.url,
    description: site.strapline,
    telephone: c.phone,
    email: c.email,
    medicalSpecialty: "Oncologic",
    address: {
      "@type": "PostalAddress",
      streetAddress: c.postalAddress.streetAddress,
      addressLocality: c.postalAddress.addressLocality,
      addressRegion: c.postalAddress.addressRegion,
      postalCode: c.postalAddress.postalCode,
      addressCountry: c.postalAddress.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: c.geo.lat,
      longitude: c.geo.lng,
    },
    areaServed: ["Reading", "Berkshire", "Thames Valley"],
  };
}

/** Physician schema for a consultant profile page. */
export function physicianLd(consultant: Consultant, treats: Speciality[]) {
  return {
    "@context": schema,
    "@type": "Physician",
    name: consultant.name,
    url: `${site.url}/consultants/${consultant.slug}`,
    ...(consultant.photo ? { image: `${site.url}${consultant.photo}` } : {}),
    jobTitle: consultant.role,
    medicalSpecialty: "Oncologic",
    ...(consultant.gmc
      ? {
          identifier: {
            "@type": "PropertyValue",
            propertyID: "GMC",
            value: consultant.gmc,
          },
        }
      : {}),
    ...(consultant.medicalSchool
      ? {
          alumniOf: {
            "@type": "EducationalOrganization",
            name: consultant.medicalSchool.name,
          },
        }
      : {}),
    memberOf: { "@type": "MedicalOrganization", name: site.name },
    worksFor: { "@type": "MedicalOrganization", name: site.name },
    knowsAbout: treats.map((s) => s.title),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Reading",
      addressRegion: "Berkshire",
      addressCountry: "GB",
    },
  };
}

/** MedicalWebPage + MedicalCondition for a speciality page. */
export function conditionLd(speciality: Speciality) {
  return {
    "@context": schema,
    "@type": "MedicalWebPage",
    name: `${speciality.title} — ${site.name}`,
    url: `${site.url}/specialities/${speciality.slug}`,
    about: { "@type": "MedicalCondition", name: speciality.title },
    audience: { "@type": "MedicalAudience", audienceType: "Patient" },
  };
}

/** BreadcrumbList for nested pages. */
export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": schema,
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${site.url}${it.path}`,
    })),
  };
}
