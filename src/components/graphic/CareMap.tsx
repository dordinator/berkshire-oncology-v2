"use client";

import { palette } from "@/lib/designTokens";

// ─────────────────────────────────────────────────────────────────────────────
// Integrated mode: a branching map that carries real information —
//   this cancer type → the consultants who treat it → the treatments they list
//   → the places those treatments actually happen.
//
// The point of the diagram is the last hop. It is the fastest way to show that
// drug treatment happens close to home while radiotherapy only happens at two
// centres, which is the single thing patients most often discover too late.
//
// Accessibility: the SVG is presentational (the same information is in the page
// as linked text below it), so it carries a label and a description rather than
// pretending to be an interactive diagram. Below md the map becomes a vertical
// spine, because a four-column diagram at 375px is a picture of nothing.
// ─────────────────────────────────────────────────────────────────────────────

export interface MapNode {
  id: string;
  label: string;
  /** Sub-label, e.g. a consultant's role or a location's town. */
  meta?: string;
  /** ids in the previous column this node connects to. */
  from?: string[];
  /** Draw this node with emphasis — used for radiotherapy sites. */
  accent?: boolean;
}

export interface CareMapData {
  cancer: string;
  consultants: MapNode[];
  treatments: MapNode[];
  locations: MapNode[];
}

// x is where a column's dots sit; w is how much room its labels get before the
// connectors to the next column start. Keep the gaps (next x − (x + w)) at 80px
// or more or the curves have no room to read as connections.
const COLS = [
  { x: 34, w: 205, title: "Cancer type" },
  { x: 330, w: 225, title: "Your consultant" },
  { x: 640, w: 175, title: "Treatment" },
  { x: 900, w: 266, title: "Where it happens" },
];

const ROW = 46;
const TOP = 74;
const DOT = 4.5;

function layout(count: number, height: number) {
  // Centre a column's rows in the available height so short columns don't all
  // pile up at the top and leave the diagram bottom-heavy.
  const span = (count - 1) * ROW;
  const start = TOP + Math.max(0, (height - TOP - 30 - span) / 2);
  return Array.from({ length: count }, (_, i) => start + i * ROW);
}

function curve(x1: number, y1: number, x2: number, y2: number) {
  const dx = (x2 - x1) * 0.5;
  return `M${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

export default function CareMap({
  data,
  className = "",
}: {
  data: CareMapData;
  className?: string;
}) {
  const { cancer, consultants, treatments, locations } = data;

  const rows = Math.max(
    consultants.length,
    treatments.length,
    locations.length,
    1,
  );
  const height = Math.max(260, TOP + rows * ROW + 24);

  const colNodes: MapNode[][] = [
    [{ id: "cancer", label: cancer }],
    consultants,
    treatments,
    locations,
  ];
  const colY = colNodes.map((nodes) => layout(nodes.length, height));

  // Every node keeps its y so the next column can draw back to it.
  const yById = new Map<string, { y: number; col: number }>();
  colNodes.forEach((nodes, col) =>
    nodes.forEach((n, i) => yById.set(n.id, { y: colY[col][i], col })),
  );

  const links: { d: string; accent?: boolean }[] = [];
  colNodes.forEach((nodes, col) => {
    if (col === 0) return;
    nodes.forEach((node, i) => {
      const y2 = colY[col][i];
      const x2 = COLS[col].x;
      // An explicit empty `from` means "connects to nothing" and must draw
      // nothing. Only an absent `from` means "connects to the whole previous
      // column" — otherwise a treatment nobody listed would silently fan out to
      // every consultant on the page.
      const sources = node.from ?? colNodes[col - 1].map((n) => n.id);
      sources.forEach((sourceId) => {
        const source = yById.get(sourceId);
        if (!source || source.col !== col - 1) return;
        const x1 = COLS[col - 1].x + COLS[col - 1].w;
        links.push({
          d: curve(x1, source.y, x2, y2),
          accent: node.accent,
        });
      });
    });
  });

  const description = `${cancer}: treated by ${consultants
    .map((c) => c.label)
    .join(", ")}. Treatments include ${treatments
    .map((t) => t.label)
    .join(", ")}. Delivered at ${locations.map((l) => l.label).join(", ")}.`;

  return (
    <div className={className}>
      {/* ── md and up: the branching map ── */}
      <svg
        viewBox={`0 0 1200 ${height}`}
        className="hidden h-auto w-full md:block"
        role="img"
        aria-label={`How care is joined up for ${cancer}`}
        fill="none"
      >
        <desc>{description}</desc>

        <defs>
          <linearGradient id="cm-link" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={palette.accent} stopOpacity="0.1" />
            <stop offset="50%" stopColor={palette.accent} stopOpacity="0.42" />
            <stop offset="100%" stopColor={palette.accent} stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="cm-link-accent" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={palette.gold} stopOpacity="0.1" />
            <stop offset="55%" stopColor={palette.gold} stopOpacity="0.55" />
            <stop offset="100%" stopColor={palette.gold} stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* column headings */}
        {COLS.map((c) => (
          <text
            key={c.title}
            x={c.x}
            y={34}
            className="fill-ink-muted"
            fontSize="11"
            letterSpacing="1.6"
            style={{ textTransform: "uppercase" }}
          >
            {c.title.toUpperCase()}
          </text>
        ))}
        <path
          d={`M34 48 H1166`}
          stroke={palette.ink}
          strokeOpacity="0.07"
          strokeWidth="1"
        />

        {/* connectors, drawn under the nodes */}
        <g fill="none" strokeWidth="1.1">
          {links.map((l, i) => (
            <path
              key={i}
              d={l.d}
              stroke={l.accent ? "url(#cm-link-accent)" : "url(#cm-link)"}
            />
          ))}
        </g>

        {/* nodes */}
        {colNodes.map((nodes, col) =>
          nodes.map((node, i) => {
            const y = colY[col][i];
            const x = COLS[col].x;
            const isRoot = col === 0;
            return (
              <g key={node.id}>
                <circle
                  cx={x}
                  cy={y}
                  r={isRoot ? DOT + 1.5 : DOT}
                  className={
                    node.accent
                      ? "fill-gold"
                      : isRoot
                        ? "fill-ink"
                        : "fill-accent"
                  }
                  fillOpacity={isRoot ? 1 : 0.85}
                />
                <text
                  x={x + 14}
                  y={y + (node.meta ? -1 : 4)}
                  className={isRoot ? "fill-ink" : "fill-ink"}
                  fontSize={isRoot ? "16" : "14"}
                  fontWeight={isRoot ? 600 : 500}
                >
                  {node.label}
                </text>
                {node.meta && (
                  <text
                    x={x + 14}
                    y={y + 14}
                    className="fill-ink-muted"
                    fontSize="11.5"
                  >
                    {node.meta}
                  </text>
                )}
              </g>
            );
          }),
        )}
      </svg>

      {/* ── below md: a vertical spine ── */}
      <div className="md:hidden">
        <ol className="relative space-y-6 pl-7">
          <span
            aria-hidden
            className="absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-ink/25 via-accent/25 to-gold/40"
          />
          {[
            { title: "Cancer type", items: [{ id: "c", label: cancer }] },
            { title: "Your consultant", items: consultants },
            { title: "Treatment", items: treatments },
            { title: "Where it happens", items: locations },
          ].map((stage) => (
            <li key={stage.title} className="relative">
              <span
                aria-hidden
                className="absolute -left-[27px] top-[7px] h-[9px] w-[9px] rounded-full border-2 border-white bg-accent"
              />
              <span className="type-label text-ink-muted">
                {stage.title}
              </span>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {stage.items.map((item) => (
                  <li
                    key={item.id}
                    className={`type-supporting rounded-full border px-3 py-1.5 ${
                      item.accent
                        ? "border-gold/45 bg-gold/[0.08] text-ink"
                        : "border-black/[0.07] bg-white text-ink/85"
                    }`}
                  >
                    {item.label}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
