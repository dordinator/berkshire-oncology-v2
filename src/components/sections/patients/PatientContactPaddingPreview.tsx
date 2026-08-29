"use client";

import { type ReactNode, useEffect, useState } from "react";

const levels = [8, 16, 24, 32, 40, 48, 56, 64, 72, 80] as const;
const storageKey = "berkshire-oncology:patients-contact-padding";
const defaultLevel = 7;

export default function PatientContactPaddingPreview({
  children,
}: {
  children: ReactNode;
}) {
  const [selected, setSelected] = useState(defaultLevel);
  const padding = levels[selected];

  useEffect(() => {
    const saved = Number(window.localStorage.getItem(storageKey));
    if (Number.isInteger(saved) && saved >= 0 && saved < levels.length) {
      setSelected(saved);
    }
  }, []);

  const choose = (index: number) => {
    setSelected(index);
    window.localStorage.setItem(storageKey, String(index));
  };

  return (
    <>
      <section
        id="contact-next-step"
        className="flex scroll-mt-24 items-center bg-ink text-white"
        style={{ paddingBlock: `${padding}px` }}
      >
        {children}
      </section>

      {process.env.NODE_ENV === "development" && (
        <aside
          aria-label="Contact section padding preview"
          className="fixed bottom-5 right-4 z-[120] w-[min(21rem,calc(100vw-2rem))] rounded-2xl border border-ink/10 bg-white/95 p-3 text-ink shadow-[0_18px_55px_-18px_rgba(6,28,70,0.45)] backdrop-blur-md sm:right-5"
        >
          <div className="flex items-baseline justify-between gap-3 px-1">
            <p className="text-xs font-semibold">Contact padding</p>
            <output className="text-[11px] text-ink-muted">
              Level {selected + 1} · {padding}px
            </output>
          </div>
          <div className="mt-2 grid grid-cols-10 gap-1">
            {levels.map((value, index) => (
              <button
                key={value}
                type="button"
                aria-label={`Set contact section padding to level ${index + 1}, ${value} pixels`}
                aria-pressed={selected === index}
                onClick={() => choose(index)}
                className={`flex h-7 items-center justify-center rounded-lg text-[11px] font-semibold transition-colors ${
                  selected === index
                    ? "bg-ink text-white"
                    : "bg-ink/[0.05] text-ink-muted hover:bg-ink/10 hover:text-ink"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </aside>
      )}
    </>
  );
}
