import type { Slug } from "./types";

// Treatment modalities per consultant, exactly as listed on the old speciality
// pages (the wording is consistent per consultant across every condition page
// they appear on). Dr Ruth Davis's pages show only a specialities line and no
// "Treatments" line, so she is intentionally omitted here.
export const modalitiesByConsultant: Record<Slug, string[]> = {
  "joss-adams": ["Chemotherapy", "Radiotherapy", "Immunotherapy", "Hormone treatment"],
  "madhumita-bhattacharyya": [
    "Chemotherapy",
    "Radiotherapy",
    "Biological and immunotherapy",
    "Hormone treatment",
  ],
  "nicola-dallas": [
    "Chemotherapy",
    "Radiotherapy",
    "Biological and immunotherapy",
    "Hormone treatment",
    "Therapeutic radioisotopes",
  ],
  "gelareh-eslamian": [
    "Chemotherapy",
    "Immunotherapy",
    "Targeted and endocrine treatments",
  ],
  "alice-freebairn": [
    "Chemotherapy",
    "Radiotherapy",
    "Biological and immunotherapy",
    "Hormone treatment",
  ],
  "esme-hill": [
    "Chemotherapy",
    "Radiotherapy",
    "Systemic therapy",
    "Biological and immunotherapy",
    "Hormone treatment",
  ],
  "ayman-madi": ["Chemotherapy", "Biological and immunotherapy", "Hormone treatment"],
  "helen-odonnell": [
    "Chemotherapy",
    "Radiotherapy",
    "Brachytherapy",
    "Biological and immunotherapy",
    "Hormone treatment",
  ],
  "paul-rogers": [
    "Prostate brachytherapy",
    "Radiotherapy",
    "Radio-isotope therapy",
    "Chemotherapy",
    "Biological and immunotherapy",
    "Hormone therapy",
  ],
};
