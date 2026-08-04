/*
  LinkLogo — the logo tile for a useful-links card.
  Renders a supplied `logo` file (public/links/…) when present, otherwise a
  clean brand-tinted monogram. Server component (deterministic, no hydration
  risk). Drop real logo files into public/links/ and set `logo` on each entry
  to show the exact logos.
*/

import Image from "next/image";

const STOP = new Set(["the", "at", "and", "of", "for", "&", "a"]);
function initials(name: string) {
  const words = name
    .replace(/[(),]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w.toLowerCase()));
  return words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

const TINTS = [
  { bg: "rgba(26,77,143,0.09)", fg: "#1a4d8f" },
  { bg: "rgba(201,154,62,0.14)", fg: "#a9791a" },
  { bg: "rgba(63,111,176,0.11)", fg: "#3f6fb0" },
  { bg: "rgba(90,104,132,0.10)", fg: "#5a6884" },
];

export default function LinkLogo({
  name,
  logo,
  i,
  compact = false,
  large = false,
}: {
  name: string;
  logo?: string;
  i: number;
  compact?: boolean;
  large?: boolean;
}) {
  if (logo) {
    // the GenesisCare wordmark is wide and reads small at the default size
    const big = !compact && /genesiscare/i.test(logo);
    return (
      <span
        className={`flex shrink-0 items-center justify-center ${
          compact ? "h-12 w-24" : large ? "h-28 w-52" : big ? "h-[92px] w-[112px]" : "h-14 w-[86px]"
        }`}
      >
        <Image
          src={logo}
          alt={`${name} logo`}
          width={220}
          height={140}
          className={`h-auto w-auto max-w-full object-contain ${
            compact ? "max-h-10" : large ? "max-h-24" : big ? "max-h-[92px]" : "max-h-12"
          }`}
        />
      </span>
    );
  }

  const t = TINTS[i % TINTS.length];
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${compact ? "h-10 w-10" : large ? "h-16 w-16" : "h-12 w-12"}`}
      style={{ backgroundColor: t.bg, color: t.fg }}
    >
      {initials(name)}
    </span>
  );
}
