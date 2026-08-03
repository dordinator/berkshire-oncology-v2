"use client";

import { useEffect, useState } from "react";
import {
  FONT_SETS,
  DEFAULT_FONT_SET,
  FONT_SET_STORAGE_KEY,
} from "@/content/fontsets";

/* ═══════════════════════════════════════════════════════════════════════════
   TEMPORARY — TYPEFACE COMPARISON DEVICE. DELETE WHEN A PAIRING IS CHOSEN.
   See src/content/fontsets.ts for the full retirement steps.
   ═══════════════════════════════════════════════════════════════════════════ */

export default function FontToggle() {
  const [id, setId] = useState<string>(DEFAULT_FONT_SET);
  const [open, setOpen] = useState(false);

  // Read the stored choice after mount, never during render: the server has no
  // localStorage, so reading it earlier would change the first client render
  // and break hydration.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(FONT_SET_STORAGE_KEY);
      if (stored && FONT_SETS.some((f) => f.id === stored)) setId(stored);
    } catch {
      // Private browsing, or storage disabled. The default is fine.
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.fontset = id;
  }, [id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const choose = (next: string) => {
    setId(next);
    setOpen(false);
    try {
      window.localStorage.setItem(FONT_SET_STORAGE_KEY, next);
    } catch {
      // Nothing to do — the choice still applies for this page view.
    }
  };

  const current = FONT_SETS.find((f) => f.id === id) ?? FONT_SETS[0];

  return (
    <div className="fixed bottom-4 right-4 z-[200] print:hidden">
      {open && (
        <div
          role="listbox"
          aria-label="Typeface pairing"
          className="mb-2 max-h-[70svh] w-64 overflow-y-auto rounded-2xl border border-black/[0.08] bg-white/95 p-1.5 shadow-[0_24px_70px_-24px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        >
          {FONT_SETS.map((f) => {
            const active = f.id === current.id;
            return (
              <button
                key={f.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => choose(f.id)}
                className={`flex w-full flex-col items-start gap-0.5 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  active ? "bg-ink text-white" : "text-ink hover:bg-ink/[0.05]"
                }`}
              >
                {/* Each row previews its own display face, so the list is the
                    comparison rather than a description of one. */}
                <span
                  className="text-[15px] leading-tight"
                  style={{ fontFamily: `var(${f.display})` }}
                >
                  {f.name}
                </span>
                <span
                  className={`text-[11px] leading-tight ${
                    active ? "text-white/60" : "text-ink-muted"
                  }`}
                  style={{ fontFamily: `var(${f.sans})` }}
                >
                  {f.note}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-full border border-black/[0.08] bg-white/90 py-2.5 pl-4 pr-3 text-[13px] font-medium text-ink shadow-[0_10px_40px_-12px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-colors hover:bg-white"
      >
        <span aria-hidden className="text-ink-muted">
          Aa
        </span>
        <span>{current.name}</span>
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          className={`h-3.5 w-3.5 text-ink-muted transition-transform duration-300 motion-reduce:transition-none ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
        >
          <path
            d="M4 6.5 8 10.5 12 6.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
