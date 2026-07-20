import { consultants } from "./consultants";
import { specialities } from "./specialities";
import { treatments } from "./treatments";
import { modalitiesByConsultant } from "./modalities";
import type { Consultant, Slug, Speciality } from "./types";

const consultantBySlug = new Map(consultants.map((c) => [c.slug, c]));
const specialityBySlug = new Map(specialities.map((s) => [s.slug, s]));

export function getAllConsultants(): Consultant[] {
  return consultants;
}

export function getConsultantBySlug(slug: Slug): Consultant | undefined {
  return consultantBySlug.get(slug);
}

export function getProfiledConsultantSlugs(): Slug[] {
  return consultants.map((c) => c.slug);
}

export function getAllSpecialities(): Speciality[] {
  return specialities;
}

export function getSpecialityBySlug(slug: Slug): Speciality | undefined {
  return specialityBySlug.get(slug);
}

export interface SpecialityConsultant {
  name: string;
  slug: Slug;
  role?: string;
  shortRole?: string;
  photo?: string;
  hasProfile: boolean;
  modality?: string[];
}

/** Direction 1: condition → the consultants who treat it (in listing order). */
export function getConsultantsForSpeciality(slug: Slug): SpecialityConsultant[] {
  return treatments
    .filter((t) => t.speciality === slug)
    .map((t) => {
      const c = consultantBySlug.get(t.consultant);
      return {
        name: c?.name ?? t.consultant,
        slug: t.consultant,
        role: c?.role,
        shortRole: c?.shortRole,
        photo: c?.photo,
        hasProfile: Boolean(c),
        modality: t.modality ?? modalitiesByConsultant[t.consultant],
      };
    });
}

export interface ConsultantSpeciality {
  speciality: Speciality;
  modality?: string[];
}

/** Direction 2: consultant → the conditions they treat. */
export function getSpecialitiesForConsultant(slug: Slug): ConsultantSpeciality[] {
  const out: ConsultantSpeciality[] = [];
  for (const t of treatments) {
    if (t.consultant !== slug) continue;
    const speciality = specialityBySlug.get(t.speciality);
    if (speciality) {
      out.push({ speciality, modality: t.modality ?? modalitiesByConsultant[slug] });
    }
  }
  return out;
}
