/**
 * JavaScript/canvas mirror of the public CSS palette.
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

const ink = "#061c46";
const accent = "#1a4d8f";
const sage = "#5c7767";

export const palette = Object.freeze({
  ink,
  inkMuted: "#5a6884",
  accent,
  accentSoft: "#3f6fb0",
  accentGlow: "#9fb9dc",
  accentMist: mixHex(accent, "#ffffff", 0.12),
  sage,
  sageDeep: mixHex(sage, ink, 0.82),
  sageMid: mixHex(sage, "#ffffff", 0.82),
  sageSoft: mixHex(sage, "#ffffff", 0.68),
  sagePanel: mixHex(sage, "#ffffff", 0.32),
  sageMist: mixHex(sage, "#ffffff", 0.18),
  sageWash: mixHex(sage, "#ffffff", 0.1),
  gold: "#c8992f",
  goldInk: "#8a6516",
  goldSoft: "#e3bd6a",
  // Approved homepage/Patients panel: deliberately yellower than an opacity
  // tint of the accent gold, so it remains the one named family exception.
  goldPanel: "#f3dca2",
  canvas: "#fafbfc",
  paper: "#fbfaf5",
  paperSoft: "#f8f8f4",
  sectionWarm: "#f0ece2",
  sectionCool: "#e7edf1",
  white: "#ffffff",
});
