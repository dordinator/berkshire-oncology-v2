"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
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
  const groupRef = useRef<HTMLDivElement>(null);

  // A radio group is one tab stop, not three: Tab reaches the checked option and
  // the arrow keys move between them. The role was already here promising that
  // behaviour; this is the behaviour. Selection follows focus, which is the
  // default for a radio group and is right here because switching style is
  // instant and reversible.
  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const KEYS = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
    if (!KEYS.includes(event.key)) return;
    event.preventDefault();

    const count = GRAPHIC_MODES.length;
    const current = Math.max(0, GRAPHIC_MODES.indexOf(mode));
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? count - 1
          : event.key === "ArrowRight" || event.key === "ArrowDown"
            ? (current + 1) % count
            : (current - 1 + count) % count;

    setMode(GRAPHIC_MODES[next]);
    groupRef.current
      ?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
      [next]?.focus();
  }

  return (
    <div className={className}>
      {/* The APG radiogroup pattern puts the tab stop on the checked radio via
          roving tabindex, not on the group. The lint rule does not model that. */}
      {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus */}
      <div
        ref={groupRef}
        role="radiogroup"
        aria-label="Illustration style"
        onKeyDown={onKeyDown}
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
              tabIndex={active ? 0 : -1}
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
