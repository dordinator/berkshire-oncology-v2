"use client";

// Lets a specific look be shared as a link: /patients?graphics=expressive.
//
// The shared toggle in @/components/graphic/GraphicMode persists to
// localStorage but has no URL handling, and it is used by other pages that are
// being built in parallel. Rather than reach into it, this reads the
// parameter once on mount and pushes the value through the normal setMode path.
// Delete this alongside the toggle when the partnership has settled on a mode.
//
// Reads window.location directly rather than useSearchParams(), which would
// force this route into dynamic rendering for the sake of a review affordance.

import { useEffect } from "react";
import {
  GRAPHIC_MODES,
  useGraphicMode,
  type GraphicMode,
} from "@/components/graphic/GraphicMode";

export default function GraphicModeFromUrl() {
  const { setMode } = useGraphicMode();

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("graphics");
    if (value && (GRAPHIC_MODES as readonly string[]).includes(value)) {
      setMode(value as GraphicMode);
    }
  }, [setMode]);

  return null;
}
