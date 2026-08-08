import type { Slug } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Which hospitals each consultant practises at — the one fact the focus strip
// shows that the rest of the repo deliberately avoided, included at the
// practice's request on the condition that it is verified, not assumed.
//
// Every entry below was checked against live public sources in August 2026,
// and carries the page it is checkable against:
//   • Spire profile URLs embed the GMC number (dr-<name>-c<GMC>), so all ten
//     Spire confirmations are GMC-matched against consultants.ts — they
//     cannot be same-name confusions.
//   • The GenesisCare entries were cross-checked against the complete
//     44-name roster on the operator's Windsor centre page; exactly our
//     seven appear on it. Oxford lists only Adams, Dallas and Rogers.
//   • Princess Margaret: Circle's full consultant sitemap (4,881 names) was
//     enumerated — Dr Ruth Davis is the only partner listed, her page
//     confirming GMC 4529136 and "Partner in Berkshire Oncology Partnership".
//   • Royal Berkshire publishes no consultant directory; RBH rests on the
//     operators' "current NHS posts" fields and bios, plus the practice's
//     own homepage: "All members of the Partnership hold Consultant posts in
//     the NHS at the Royal Berkshire Hospital."
//
// A site a consultant could not be verified at is simply absent — silence
// over guesswork, as with `services` on the location pages. Do not add a row
// here without a source.
// ─────────────────────────────────────────────────────────────────────────────

export type ConsultantSiteId =
  | "spire-dunedin"
  | "princess-margaret"
  | "genesiscare-windsor"
  | "genesiscare-oxford"
  | "royal-berkshire";

export const SITE_LABELS: Record<ConsultantSiteId, string> = {
  "spire-dunedin": "Spire Dunedin, Reading",
  "princess-margaret": "Princess Margaret, Windsor",
  "genesiscare-windsor": "GenesisCare Windsor",
  "genesiscare-oxford": "GenesisCare Oxford",
  "royal-berkshire": "Royal Berkshire (NHS)",
};

export interface ConsultantSite {
  site: ConsultantSiteId;
  /** Live public page the claim is checkable against. */
  source: string;
}

const SPIRE = "https://www.spirehealthcare.com/consultant-profiles/";
const GC = "https://www.genesiscare.com/uk/our-doctors/";
const PRACTICE = "https://berkshire-oncology.org.uk/index.htm";

export const consultantSites: Partial<Record<Slug, ConsultantSite[]>> = {
  "joss-adams": [
    { site: "spire-dunedin", source: `${SPIRE}dr-joss-adams-c4259509/` },
    { site: "genesiscare-windsor", source: `${GC}dr-joss-adams` },
    { site: "genesiscare-oxford", source: `${GC}dr-joss-adams` },
    { site: "royal-berkshire", source: `${GC}dr-joss-adams` },
  ],
  "madhumita-bhattacharyya": [
    {
      site: "spire-dunedin",
      source: `${SPIRE}dr-madhumita-bhattacharyya-c4521657/`,
    },
    { site: "royal-berkshire", source: PRACTICE },
  ],
  "nicola-dallas": [
    { site: "spire-dunedin", source: `${SPIRE}dr-nicola-dallas-c4502331/` },
    { site: "genesiscare-windsor", source: `${GC}dr-nicola-dallas` },
    { site: "genesiscare-oxford", source: `${GC}dr-nicola-dallas` },
    { site: "royal-berkshire", source: `${SPIRE}dr-nicola-dallas-c4502331/` },
  ],
  "ruth-davis": [
    { site: "spire-dunedin", source: `${SPIRE}dr-ruth-davis-c4529136/` },
    {
      site: "princess-margaret",
      source: "https://www.circlehealthgroup.co.uk/consultants/ruth-davis",
    },
    { site: "genesiscare-windsor", source: `${GC}dr-ruth-davis` },
    {
      site: "royal-berkshire",
      source: "https://www.circlehealthgroup.co.uk/consultants/ruth-davis",
    },
  ],
  "gelareh-eslamian": [
    {
      site: "spire-dunedin",
      source: `${SPIRE}dr-gelareh-eslamian-c6043320/`,
    },
    { site: "royal-berkshire", source: PRACTICE },
  ],
  "alice-freebairn": [
    { site: "spire-dunedin", source: `${SPIRE}dr-alice-freebairn-c3684771/` },
    { site: "genesiscare-windsor", source: `${GC}dr-alice-freebairn` },
    {
      site: "royal-berkshire",
      source: `${SPIRE}dr-alice-freebairn-c3684771/`,
    },
  ],
  "esme-hill": [
    { site: "spire-dunedin", source: `${SPIRE}dr-esme-hill-c6025316/` },
    { site: "genesiscare-windsor", source: `${GC}dr-esme-hill` },
    { site: "royal-berkshire", source: `${GC}dr-esme-hill` },
  ],
  "ayman-madi": [
    { site: "spire-dunedin", source: `${SPIRE}dr-ayman-madi-c6034857/` },
    { site: "royal-berkshire", source: PRACTICE },
  ],
  "helen-odonnell": [
    { site: "spire-dunedin", source: `${SPIRE}dr-helen-odonnell-c4542566/` },
    { site: "genesiscare-windsor", source: `${GC}dr-helen-odonnell` },
    { site: "royal-berkshire", source: `${GC}dr-helen-odonnell` },
  ],
  "paul-rogers": [
    { site: "spire-dunedin", source: `${SPIRE}dr-paul-rogers-c3310731/` },
    { site: "genesiscare-windsor", source: `${GC}dr-paul-rogers` },
    { site: "genesiscare-oxford", source: `${GC}dr-paul-rogers` },
    { site: "royal-berkshire", source: `${SPIRE}dr-paul-rogers-c3310731/` },
  ],
};

/** Display labels for a consultant's verified sites, in declaration order. */
export function sitesForConsultant(slug: Slug): string[] {
  return (consultantSites[slug] ?? []).map((s) => SITE_LABELS[s.site]);
}
