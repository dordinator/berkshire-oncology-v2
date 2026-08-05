// ─────────────────────────────────────────────────────────────────────────────
// Hand-placed labels for the /locations journey map.
//
// Placed by hand rather than derived, because at six stops the whole gazetteer
// is a dozen names and the judgement is entirely visual: a label must sit
// where the camera's frames leave quiet space, not where an algorithm puts a
// centroid. Coordinates come from the same verified geography as the pins;
// angles follow the feature (rivers run with their flow, streets with their
// bearing) and were tuned against the rendered frames.
//
// `kind` drives when a label exists at all — JourneyMap fades each class in
// and out on the camera's log-zoom, so towns belong to the regional shots,
// river names arrive as the water does, and street names only at the deepest
// frames. Nothing here renders at the UK-wide hero.
// ─────────────────────────────────────────────────────────────────────────────

export type MapLabelKind = "town" | "river" | "street";

export interface MapLabel {
  text: string;
  lat: number;
  lng: number;
  /** Degrees clockwise from horizontal, applied after the counter-scale. */
  angle: number;
  kind: MapLabelKind;
}

export const mapLabels: MapLabel[] = [
  // Towns — regional orientation while the camera is between stops.
  { text: "Reading", lat: 51.4585, lng: -0.966, angle: 0, kind: "town" },
  { text: "Windsor", lat: 51.4825, lng: -0.605, angle: 0, kind: "town" },
  { text: "Oxford", lat: 51.753, lng: -1.258, angle: 0, kind: "town" },
  { text: "Maidenhead", lat: 51.5225, lng: -0.725, angle: 0, kind: "town" },

  // Rivers — italic, set along the flow, in the cartographic manner.
  { text: "River Kennet", lat: 51.452, lng: -0.976, angle: -20, kind: "river" },
  { text: "River Thames", lat: 51.4645, lng: -0.972, angle: -8, kind: "river" },
  { text: "River Thames", lat: 51.488, lng: -0.625, angle: -15, kind: "river" },
  { text: "River Thames", lat: 51.737, lng: -1.247, angle: 80, kind: "river" },

  // Streets — only the sites' own roads, one per stop's frame.
  { text: "Bath Road", lat: 51.4508, lng: -0.9895, angle: -12, kind: "street" },
  { text: "Craven Road", lat: 51.4487, lng: -0.9575, angle: 20, kind: "street" },
  { text: "Osborne Road", lat: 51.4738, lng: -0.608, angle: 35, kind: "street" },
  { text: "Alma Road", lat: 51.4795, lng: -0.6172, angle: 80, kind: "street" },
  { text: "Peters Way", lat: 51.7228, lng: -1.2185, angle: -10, kind: "street" },
];
