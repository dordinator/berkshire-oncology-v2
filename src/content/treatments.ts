import type { Treatment } from "./types";

// The many-to-many consultant↔condition mapping — the single source of truth,
// queried in both directions (see queries.ts) so consultant and condition pages
// never drift. `modality` holds the treatment wording shown on each old
// speciality page (enriched from the live pages).
export const treatments: Treatment[] = [
  // Bladder
  { consultant: "nicola-dallas", speciality: "bladder" },
  { consultant: "helen-odonnell", speciality: "bladder" },
  { consultant: "paul-rogers", speciality: "bladder" },
  // Brain
  { consultant: "ruth-davis", speciality: "brain" },
  // Breast
  { consultant: "joss-adams", speciality: "breast" },
  { consultant: "madhumita-bhattacharyya", speciality: "breast" },
  { consultant: "ruth-davis", speciality: "breast" },
  { consultant: "gelareh-eslamian", speciality: "breast" },
  { consultant: "ayman-madi", speciality: "breast" },
  // Cancer of Unknown Primary
  { consultant: "esme-hill", speciality: "cancer-unknown-primary" },
  // Colorectal
  { consultant: "alice-freebairn", speciality: "colorectal" },
  { consultant: "ayman-madi", speciality: "colorectal" },
  // Gynaecological
  { consultant: "madhumita-bhattacharyya", speciality: "gynaecology" },
  { consultant: "helen-odonnell", speciality: "gynaecology" },
  // Head & Neck
  { consultant: "nicola-dallas", speciality: "head-and-neck" },
  { consultant: "alice-freebairn", speciality: "head-and-neck" },
  // Kidney
  { consultant: "nicola-dallas", speciality: "kidney" },
  { consultant: "helen-odonnell", speciality: "kidney" },
  { consultant: "paul-rogers", speciality: "kidney" },
  // Liver
  { consultant: "gelareh-eslamian", speciality: "liver" },
  { consultant: "esme-hill", speciality: "liver" },
  // Lung
  { consultant: "joss-adams", speciality: "lung" },
  // Lymphoma
  { consultant: "joss-adams", speciality: "lymphoma" },
  // Oesophageal
  { consultant: "gelareh-eslamian", speciality: "oesophagus" },
  { consultant: "esme-hill", speciality: "oesophagus" },
  // Pancreatic
  { consultant: "gelareh-eslamian", speciality: "pancreas" },
  { consultant: "esme-hill", speciality: "pancreas" },
  // Prostate
  { consultant: "nicola-dallas", speciality: "prostate" },
  { consultant: "helen-odonnell", speciality: "prostate" },
  { consultant: "paul-rogers", speciality: "prostate" },
  // Skin
  { consultant: "alice-freebairn", speciality: "skin" },
  { consultant: "madhumita-bhattacharyya", speciality: "skin" },
  // Stomach
  { consultant: "esme-hill", speciality: "stomach" },
  // Testicular
  { consultant: "nicola-dallas", speciality: "testicular" },
  { consultant: "paul-rogers", speciality: "testicular" },
];
