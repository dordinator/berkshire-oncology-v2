"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Motion intensity for /resources, with the review switcher that drives it.
//
// Three levels, because "how much should a cancer-care page move" is a taste
// decision the design can't make alone:
//   1 Calm     — the layouts and colour bands, near-static. Reveal fades only.
//   2 Flowing  — everything scrubbed: waves draw, panels drift and settle,
//                the photograph parallaxes. Nothing hijacks the scroll.
//   3 Full-on  — adds the scroll-hijacking moves: the statement pins while the
//                next sheet slides over it, and the five pathways become a
//                pinned shelf that scrolls sideways.
//
// The level lives in ?motion= so a choice survives reload and can be sent as a
// link. Read in an effect rather than useSearchParams — that hook would opt the
// whole route out of static prerendering for the sake of a review tool.
//
// Once a level is chosen, delete the panel below and hard-code the level in
// links/page.tsx. Everything else stays.
// ─────────────────────────────────────────────────────────────────────────────

export type MotionLevel = 1 | 2 | 3;

const LEVELS: { id: MotionLevel; name: string; note: string }[] = [
  { id: 1, name: "Calm", note: "layouts only, near-static" },
  { id: 2, name: "Flowing", note: "waves draw, panels drift — no hijacking" },
  { id: 3, name: "Full-on", note: "adds the pinned shelf + curtain" },
];

const DEFAULT: MotionLevel = 2;

const Ctx = createContext<MotionLevel>(DEFAULT);

/** The current motion level. Components below IntensityStage re-render when
 *  the reviewer switches, so markup variants (shelf vs rows) follow along. */
export function useMotionLevel(): MotionLevel {
  return useContext(Ctx);
}

export default function IntensityStage({ children }: { children: ReactNode }) {
  const [level, setLevel] = useState<MotionLevel>(DEFAULT);

  useEffect(() => {
    const raw = Number(new URLSearchParams(window.location.search).get("motion"));
    if (raw === 1 || raw === 2 || raw === 3) setLevel(raw);
  }, []);

  function choose(next: MotionLevel) {
    setLevel(next);
    const url = new URL(window.location.href);
    url.searchParams.set("motion", String(next));
    window.history.replaceState(null, "", url);
  }

  const current = LEVELS.find((l) => l.id === level);

  return (
    <Ctx.Provider value={level}>
      {children}

      <div className="fixed bottom-4 left-4 z-[200] rounded-2xl border border-ink/10 bg-white/85 p-2.5 shadow-[0_8px_30px_-8px_rgba(6,28,70,0.25)] backdrop-blur-md md:bottom-5 md:left-5 md:p-3">
        <div className="mb-2 px-1 text-[10px] font-medium uppercase tracking-[0.16em] text-ink-muted">
          Motion
        </div>
        <div className="flex gap-1.5">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => choose(l.id)}
              title={`${l.name} — ${l.note}`}
              aria-label={`Motion level ${l.id}: ${l.name}, ${l.note}`}
              aria-pressed={l.id === level}
              className={`h-9 min-w-9 rounded-lg px-2 text-[13px] font-medium transition-colors md:h-8 ${
                l.id === level
                  ? "bg-ink text-white"
                  : "bg-ink/[0.06] text-ink hover:bg-ink/[0.12]"
              }`}
            >
              {l.id}
            </button>
          ))}
        </div>
        <div className="mt-2 max-w-[200px] px-1 text-[11px] leading-snug text-ink-muted">
          <span className="font-medium text-ink">{current?.name}</span>
          <span className="hidden md:inline"> — {current?.note}</span>
        </div>
      </div>
    </Ctx.Provider>
  );
}
