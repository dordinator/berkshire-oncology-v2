/**
 * Canonical public palette, shared by Tailwind, CSS and canvas graphics.
 *
 * Most UI should use Tailwind's named colours. Canvas and calculated SVG
 * styles cannot resolve utility classes, so they import this shared map instead
 * of copying hex values into each component.
 */
function mixHex(foreground: string, background: string, weight: number) {
  const channel = (hex: string, offset: number) =>
    Number.parseInt(hex.slice(offset, offset + 2), 16);
  const mixChannel = (offset: number) =>
    Math.round(
      channel(foreground, offset) * weight +
        channel(background, offset) * (1 - weight),
    )
      .toString(16)
      .padStart(2, "0");

  return `#${mixChannel(1)}${mixChannel(3)}${mixChannel(5)}`;
}

const ink = "#0e2f55";
const accent = "#164c88";
const sage = "#5c7767";
const mulberry = "#843d57";
const mulberrySoft = mixHex(mulberry, "#ffffff", 0.5);
const mulberryPanel = mixHex(mulberry, "#ffffff", 0.12);

export const palette = Object.freeze({
  ink,
  inkMuted: "#4d5870",
  inkSoft: "#123056",
  accent,
  accentSoft: "#3f6fb0",
  accentGlow: "#9fb9dc",
  accentMist: mixHex(accent, "#ffffff", 0.12),
  sage,
  sageInk: "#587263",
  sageDeep: mixHex(sage, ink, 0.82),
  sageMid: mixHex(sage, "#ffffff", 0.82),
  sageSoft: mixHex(sage, "#ffffff", 0.68),
  sagePanel: mixHex(sage, "#ffffff", 0.32),
  sageMist: mixHex(sage, "#ffffff", 0.18),
  sageWash: mixHex(sage, "#ffffff", 0.1),
  mulberry,
  mulberryInk: mulberry,
  mulberrySoft,
  mulberryPanel,
  // Compatibility for older, unused compositions; public UI uses mulberry.
  gold: mulberry,
  goldInk: mulberry,
  goldSoft: mulberrySoft,
  goldPanel: mulberryPanel,
  canvas: "#fafbfc",
  canvasSoft: "#eef2f7",
  ice: "#eef5fa",
  paper: "#fbfaf5",
  paperSoft: "#f8f8f4",
  sectionWarm: "#f0ece2",
  sectionCool: "#e7edf1",
  white: "#ffffff",
});
