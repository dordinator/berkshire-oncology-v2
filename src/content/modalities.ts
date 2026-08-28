import type { Slug } from "./types";

// Treatment modalities per consultant. Most retain the wording used on the old
// practice speciality pages. Dr Ruth Davis's old practice pages omitted a
// treatment line, so her entry is verified against current Frimley Health NHS,
// GenesisCare and Spire profiles instead.
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
  "ruth-davis": [
    "Chemotherapy",
    "Radiotherapy",
    "Biological and immunotherapy",
    "Hormone treatment",
    "Targeted therapies",
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
