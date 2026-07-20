// Typed content model for the Berkshire Oncology Partnership site.
// Plain TS data modules (no CMS) — the single source of truth for every page.

export type Slug = string;

export interface MedicalSchool {
  name: string;
  year?: number;
}

export interface Consultant {
  slug: Slug;
  name: string; // "Dr Paul Rogers"
  role: string; // "Consultant Clinical Oncologist"
  shortRole?: string; // "Clinical Oncologist"
  photo?: string; // "/consultants/paul-rogers.jpg" — undefined ⇒ initials placeholder
  gmc?: string;
  qualifications?: string; // "MBBS, MRCP, FRCP, FRCR"
  consultantInReadingSince?: number;
  medicalSchool?: MedicalSchool;
  /** Long-form biography sections — each string is a paragraph. Render only what exists. */
  clinicalInvolvement?: string[];
  research?: string[];
  achievements?: string[];
  disclosures?: string[];
  /** Optional SEO overrides; sensible defaults are derived when absent. */
  seoTitle?: string;
  seoDescription?: string;
}

export interface Speciality {
  slug: Slug; // "prostate"
  name: string; // "Prostate" (short, for pills/nav)
  title: string; // "Prostate Cancer" (display heading)
  blurb?: string; // short verbatim intro from the old page
  seoTitle?: string;
  seoDescription?: string;
}

/** One edge of the many-to-many consultant↔condition relationship. */
export interface Treatment {
  consultant: Slug;
  speciality: Slug;
  modality?: string[]; // treatment modalities as listed on the old speciality page
}

export interface Hospital {
  name: string;
  location: string;
  url?: string;
}

export interface UsefulLink {
  name: string;
  url: string;
  note?: string;
  /** optional path to a logo in public/links/ (e.g. "/links/macmillan.svg");
   *  falls back to a monogram tile when absent */
  logo?: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterGroup {
  title: string;
  links: FooterLink[];
}

export interface LegalDoc {
  slug: string;
  title: string;
  updated?: string; // e.g. "18 May 2018"
  description: string; // meta description
  html: string; // verbatim body, rendered inside .legal-prose
}
