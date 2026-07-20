/*
  ConsultantHeroBackground — a soft watercolour / alcohol-ink style wash behind
  the header of a consultant profile page. Four colourways (blue, peach, lilac,
  sage) built purely from layered CSS radial-gradients (no image assets). A
  consultant is assigned one by index (cycled) on their page. A light veil on
  the left keeps the dark heading/role text readable. Purely decorative.
*/

// each entry is a full CSS `background` value: a white veil (top-left, for text
// legibility) over soft colour blooms over a light base gradient.
const VARIANTS: string[] = [
  // 0 — blue / steel
  `radial-gradient(72% 125% at 1% 46%, rgba(255,255,255,0.62), transparent 56%),
   radial-gradient(46% 130% at 86% 26%, rgba(95,128,168,0.50), transparent 60%),
   radial-gradient(40% 120% at 70% 98%, rgba(74,104,146,0.42), transparent 62%),
   radial-gradient(34% 95% at 54% 6%, rgba(120,150,185,0.30), transparent 60%),
   radial-gradient(64% 150% at 103% 62%, rgba(58,88,130,0.36), transparent 55%),
   linear-gradient(135deg, #eef3f8, #d8e4ef)`,
  // 1 — peach / sand
  `radial-gradient(72% 125% at 1% 46%, rgba(255,255,255,0.62), transparent 56%),
   radial-gradient(46% 130% at 86% 26%, rgba(214,169,120,0.48), transparent 60%),
   radial-gradient(40% 120% at 70% 98%, rgba(198,150,108,0.42), transparent 62%),
   radial-gradient(34% 95% at 54% 6%, rgba(226,196,158,0.32), transparent 60%),
   radial-gradient(64% 150% at 103% 62%, rgba(186,138,92,0.34), transparent 55%),
   linear-gradient(135deg, #f8f1e7, #efe0cc)`,
  // 2 — lilac / purple
  `radial-gradient(72% 125% at 1% 46%, rgba(255,255,255,0.62), transparent 56%),
   radial-gradient(46% 130% at 86% 26%, rgba(179,140,196,0.48), transparent 60%),
   radial-gradient(40% 120% at 70% 98%, rgba(150,110,175,0.40), transparent 62%),
   radial-gradient(34% 95% at 54% 6%, rgba(205,178,216,0.32), transparent 60%),
   radial-gradient(64% 150% at 103% 62%, rgba(138,98,165,0.34), transparent 55%),
   linear-gradient(135deg, #f4eef7, #e6d7ee)`,
  // 3 — sage / green
  `radial-gradient(72% 125% at 1% 46%, rgba(255,255,255,0.62), transparent 56%),
   radial-gradient(46% 130% at 86% 26%, rgba(140,170,145,0.48), transparent 60%),
   radial-gradient(40% 120% at 70% 98%, rgba(116,150,124,0.42), transparent 62%),
   radial-gradient(34% 95% at 54% 6%, rgba(178,200,180,0.32), transparent 60%),
   radial-gradient(64% 150% at 103% 62%, rgba(100,134,110,0.34), transparent 55%),
   linear-gradient(135deg, #eef3ee, #dbe6da)`,
];

export const CONSULTANT_HERO_VARIANTS = VARIANTS.length;

export default function ConsultantHeroBackground({
  variant,
}: {
  variant: number;
}) {
  const i = ((variant % VARIANTS.length) + VARIANTS.length) % VARIANTS.length;
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{ background: VARIANTS[i] }}
    />
  );
}
