"use client";

/*
  Visual-density mode for the treatment section (/treatments/*) only.

  Three registers, in increasing order of how much visual explanation sits
  alongside the clinical copy:

    quiet       hairline waves and small directional markers. Nothing moves
                that doesn't have to. The reading experience.
    integrated  adds the pathway diagram — treatment → consultant → location →
                support — so the routing structure of the page is visible.
    expressive  adds the flowing particle field already used on /tariffs, for a
                sense of precision and movement.

  Constraints that apply to all three: medically neutral, never illustrative of
  disease, never competing with the text, and never load-bearing — every mode
  shows exactly the same content and the same links. The visuals explain the
  *structure* of care, not the biology of cancer.

  Persisted per-visitor in localStorage. `prefers-reduced-motion` is honoured
  inside each visual rather than by forcing a mode, so a visitor who wants the
  expressive register still gets it, just without animation.
*/

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const TREATMENT_MODES = ["quiet", "integrated", "expressive"] as const;
export type TreatmentMode = (typeof TREATMENT_MODES)[number];

export const DEFAULT_MODE: TreatmentMode = "integrated";

const STORAGE_KEY = "bop:treatment-mode";

function isMode(value: unknown): value is TreatmentMode {
  return (
    typeof value === "string" &&
    (TREATMENT_MODES as readonly string[]).includes(value)
  );
}

interface Ctx {
  mode: TreatmentMode;
  setMode: (mode: TreatmentMode) => void;
  /** False during SSR and the first client render. Ambient visuals wait for it
   *  so they never cause a hydration mismatch. */
  ready: boolean;
}

const TreatmentModeContext = createContext<Ctx>({
  mode: DEFAULT_MODE,
  setMode: () => {},
  ready: false,
});

export function TreatmentModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<TreatmentMode>(DEFAULT_MODE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isMode(stored)) setModeState(stored);
    } catch {
      // Private browsing or blocked storage — the default is fine.
    }
    setReady(true);
  }, []);

  const setMode = useCallback((next: TreatmentMode) => {
    setModeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Non-fatal: the choice just won't survive a reload.
    }
  }, []);

  const value = useMemo(() => ({ mode, setMode, ready }), [mode, setMode, ready]);

  return (
    <TreatmentModeContext.Provider value={value}>
      {children}
    </TreatmentModeContext.Provider>
  );
}

export function useTreatmentMode() {
  return useContext(TreatmentModeContext);
}

/** True once hydrated AND the mode is at or above the given register. */
export function useModeAtLeast(min: TreatmentMode) {
  const { mode, ready } = useTreatmentMode();
  if (!ready) return false;
  return TREATMENT_MODES.indexOf(mode) >= TREATMENT_MODES.indexOf(min);
}
