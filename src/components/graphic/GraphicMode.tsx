"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// ─────────────────────────────────────────────────────────────────────────────
// The shared graphic toggle, scoped to the cancer-type hub and the cancer pages.
//
//   quiet       — line motifs and a single gentle wave. Nothing moves much.
//   integrated  — a branching map that actually carries information: this cancer
//                 type → the consultants who treat it → the treatments they use
//                 → where those happen.
//   expressive  — a larger abstract network, visibly drawn and flowing.
//
// One rule governs all three, and any future addition: the graphics may never
// depict disease. No cell clusters, no spreading, no anatomy, no anything that
// could be read as a prognosis. Strands in the expressive mode deliberately run
// *inward* — care converging on one person — because an outward-branching
// animation on a cancer page reads as spread, whatever the intention was.
// ─────────────────────────────────────────────────────────────────────────────

export const GRAPHIC_MODES = ["quiet", "integrated", "expressive"] as const;
export type GraphicMode = (typeof GRAPHIC_MODES)[number];

export const DEFAULT_MODE: GraphicMode = "integrated";

const STORAGE_KEY = "bop:graphic-mode";

interface Ctx {
  mode: GraphicMode;
  setMode: (mode: GraphicMode) => void;
  /** False during the first client render, before the stored choice is read.
   *  Components use it to avoid animating in on a mode the user didn't pick. */
  ready: boolean;
}

const GraphicModeContext = createContext<Ctx | null>(null);

export function GraphicModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<GraphicMode>(DEFAULT_MODE);
  const [ready, setReady] = useState(false);

  // Server renders the default; the stored preference is applied after mount so
  // the markup matches on hydration.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && (GRAPHIC_MODES as readonly string[]).includes(stored)) {
        setModeState(stored as GraphicMode);
      }
    } catch {
      // Private browsing, or storage disabled. The default is fine.
    }
    setReady(true);
  }, []);

  const setMode = useCallback((next: GraphicMode) => {
    setModeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Preference simply won't persist. Not worth telling the user about.
    }
  }, []);

  return (
    <GraphicModeContext.Provider value={{ mode, setMode, ready }}>
      {children}
    </GraphicModeContext.Provider>
  );
}

export function useGraphicMode(): Ctx {
  const ctx = useContext(GraphicModeContext);
  if (!ctx) {
    // Used outside the provider — render the default rather than crashing a
    // patient-facing page over a decorative graphic.
    return { mode: DEFAULT_MODE, setMode: () => {}, ready: false };
  }
  return ctx;
}

const LABELS: Record<GraphicMode, { label: string; hint: string }> = {
  quiet: { label: "Quiet", hint: "Minimal line work" },
  integrated: { label: "Integrated", hint: "Show how care connects" },
  expressive: { label: "Expressive", hint: "Fuller illustration" },
};

export function GraphicModeToggle({ className = "" }: { className?: string }) {
  const { mode, setMode } = useGraphicMode();

  return (
    <div className={className}>
      <div
        role="radiogroup"
        aria-label="Illustration style"
        className="inline-flex items-center gap-0.5 rounded-full border border-black/[0.07] bg-white/80 p-1 backdrop-blur"
      >
        {GRAPHIC_MODES.map((m) => {
          const active = mode === m;
          return (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={active}
              title={LABELS[m].hint}
              onClick={() => setMode(m)}
              className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors sm:text-[13px] ${
                active
                  ? "bg-ink text-white"
                  : "text-ink-muted hover:bg-black/[0.04] hover:text-ink"
              }`}
            >
              {LABELS[m].label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
