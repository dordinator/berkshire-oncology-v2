"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { specialityIcon } from "@/components/site/SpecialityIcons";

/* ═══════════════════════════════════════════════════════════════════════════
   TEMPORARY — IMAGERY AND COUNT COMPARISON. DELETE WHEN BOTH ARE CHOSEN.
   ───────────────────────────────────────────────────────────────────────────
   Two switchers sit above this grid: which visual treatment the cards use, and
   whether five or six show. Also readable from the URL as ?img=<style>&n=<5|6>.

   Retiring it: keep the chosen STYLE's rendering branch, hardcode CARD_COUNT,
   delete the two control rows, the Style type and this block. The card markup
   and the data below it stay exactly as they are.
   ═══════════════════════════════════════════════════════════════════════════ */

type Style = "people" | "environment" | "abstract" | "diagnostic" | "icons";

const STYLES: { id: Style; name: string }[] = [
  { id: "people", name: "People" },
  { id: "environment", name: "Environments" },
  { id: "abstract", name: "Abstract" },
  { id: "diagnostic", name: "Diagnostics" },
  { id: "icons", name: "Icons" },
];

const DEFAULT_STYLE: Style = "people";
const DEFAULT_COUNT = 6;

/**
 * Ordered by how common the cancer is in the UK, not by how many of our
 * consultants list it. Ranking by internal coverage put bladder and kidney
 * above bowel and lung, which is not what someone newly diagnosed is looking
 * for — they arrive knowing the name of their own diagnosis.
 */
export interface CancerCard {
  slug: string;
  label: string;
}

export default function CancerCards({ cards }: { cards: CancerCard[] }) {
  const [style, setStyle] = useState<Style>(DEFAULT_STYLE);
  const [count, setCount] = useState<number>(DEFAULT_COUNT);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const s = q.get("img");
    if (s && STYLES.some((x) => x.id === s)) setStyle(s as Style);
    const n = Number(q.get("n"));
    if (n === 5 || n === 6) setCount(n);
  }, []);

  const shown = cards.slice(0, count);

  return (
    <div>
      {/* TEMPORARY controls — see the block at the top of this file. */}
      <div className="mt-9 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5 rounded-full border border-ink/10 bg-canvas-soft/60 p-1.5">
          {STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStyle(s.id)}
              aria-pressed={style === s.id}
              className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                style === s.id
                  ? "bg-ink text-white"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 rounded-full border border-ink/10 bg-canvas-soft/60 p-1.5">
          {[5, 6].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCount(n)}
              aria-pressed={count === n}
              className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                count === n ? "bg-ink text-white" : "text-ink-muted hover:text-ink"
              }`}
            >
              {n} cards
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((c) => {
          const Icon = specialityIcon[c.slug];
          return (
            <li key={c.slug}>
              <Link
                href={`/specialities/${c.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink/[0.07] bg-white transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-accent/25 hover:shadow-[0_20px_50px_-24px_rgba(6,28,70,0.35)] motion-reduce:transition-none"
              >
                {style === "icons" ? (
                  // The icon treatment needs no photography and cannot be
                  // tasteless, which is worth something on a cancer page.
                  <span className="flex aspect-[16/10] w-full items-center justify-center bg-canvas-soft">
                    {Icon && (
                      <Icon className="h-12 w-12 text-accent/70 transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" />
                    )}
                  </span>
                ) : (
                  <span className="relative block aspect-[16/10] w-full overflow-hidden bg-canvas-soft">
                    <Image
                      src={`/cancers/${style}-${c.slug}.jpg`}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                    />
                  </span>
                )}

                <span className="flex flex-1 items-center justify-between gap-4 px-5 py-5">
                  <span className="font-display text-lg leading-snug text-ink transition-colors group-hover:text-accent">
                    {c.label}
                  </span>
                  <span
                    aria-hidden
                    className="shrink-0 text-ink-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent motion-reduce:transition-none"
                  >
                    →
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
