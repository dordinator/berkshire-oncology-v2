"use client";

/*
  SpecialityIndex — an A–Z "visual index" of cancer types on /specialities.
  An alphabet filter bar ("All" + A–Z) filters a multi-column list of cancer
  types grouped by their first letter; each entry shows the consultant count and
  links to that speciality. Letters with no cancer type are disabled/greyed.
*/

import { useMemo, useState } from "react";
import Link from "next/link";

export type IndexItem = {
  slug: string;
  title: string;
  count: number;
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function SpecialityIndex({ items }: { items: IndexItem[] }) {
  const [active, setActive] = useState<string>("all");

  const present = useMemo(
    () => new Set(items.map((i) => i.title[0].toUpperCase())),
    [items],
  );

  const groups = useMemo(() => {
    const map = new Map<string, IndexItem[]>();
    for (const it of items) {
      const letter = it.title[0].toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(it);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([letter, list]) => ({
        letter,
        list: list
          .slice()
          .sort((x, y) => x.title.localeCompare(y.title)),
      }));
  }, [items]);

  const shown = active === "all" ? groups : groups.filter((g) => g.letter === active);

  return (
    <div>
      {/* alphabet filter bar */}
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => setActive("all")}
          className={`mr-1 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
            active === "all"
              ? "bg-ink text-white"
              : "text-ink-muted hover:bg-black/5 hover:text-ink"
          }`}
        >
          All
        </button>
        {ALPHABET.map((L) => {
          const has = present.has(L);
          const isActive = active === L;
          return (
            <button
              key={L}
              type="button"
              disabled={!has}
              onClick={() => has && setActive(L)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition ${
                isActive
                  ? "bg-ink text-white"
                  : has
                    ? "text-ink-muted hover:bg-black/5 hover:text-ink"
                    : "cursor-default text-black/20"
              }`}
            >
              {L}
            </button>
          );
        })}
      </div>

      {/* grouped columns */}
      <div className="mt-10 gap-x-10 sm:columns-2 lg:columns-3 xl:columns-4">
        {shown.map((g) => (
          <div key={g.letter} className="mb-9 break-inside-avoid">
            <h2 className="text-sm font-bold text-ink">{g.letter}</h2>
            <ul className="mt-3 space-y-5">
              {g.list.map((it) => (
                <li key={it.slug}>
                  <Link href={`/specialities/${it.slug}`} className="group block">
                    <span className="block font-medium leading-snug text-ink transition-colors group-hover:text-accent">
                      {it.title}
                    </span>
                    <span className="mt-0.5 block text-sm text-ink-muted">
                      {it.count} consultant{it.count === 1 ? "" : "s"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
