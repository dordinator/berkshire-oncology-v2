"use client";

import { useEffect, useState } from "react";
import styles from "./CornerPreview.module.css";

const STORAGE_KEY = "berkshire-corner-preview-v1";
const DEFAULTS = { buttons: 8, panels: 28 };
type Corners = typeof DEFAULTS;

export function validRadius(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isInteger(value) && value >= 8 && value <= 28
    ? value : fallback;
}

export default function CornerPreview() {
  const [open, setOpen] = useState(true);
  const [corners, setCorners] = useState<Corners>(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      if (saved) setCorners({ buttons: validRadius(saved.buttons, 8), panels: validRadius(saved.panels, 28) });
    } catch { /* Blocked storage or stale values must not prevent previewing. */ }
    setReady(true);
    return () => {
      document.documentElement.style.removeProperty("--radius-button");
      document.documentElement.style.removeProperty("--radius-panel");
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.style.setProperty("--radius-button", `${corners.buttons}px`);
    document.documentElement.style.setProperty("--radius-panel", `${corners.panels}px`);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(corners)); } catch { /* Preview still works. */ }
  }, [corners, ready]);

  return (
    <aside className={styles.preview} aria-label="Corner preview" data-lenis-prevent>
      <button className={styles.toggle} type="button" aria-expanded={open} aria-controls="corner-preview-controls" onClick={() => setOpen(!open)}>
        <span>Corners <span className={styles.values}>{corners.buttons}px / {corners.panels}px</span></span>
        <span aria-hidden>{open ? "−" : "+"}</span>
      </button>
      <div id="corner-preview-controls" hidden={!open} className={styles.controls}>
        {(["buttons", "panels"] as const).map((key) => (
          <label key={key} className={styles.field}>
            <span>{key === "buttons" ? "Buttons" : "Boxes & images"}<output>{corners[key]}px</output></span>
            <input type="range" min="8" max="28" step="1" value={corners[key]} aria-valuetext={`${corners[key]} pixels`} onChange={(event) => setCorners({ ...corners, [key]: Number(event.target.value) })} />
            <span className={styles.limits} aria-hidden><span>8px</span><span>28px</span></span>
          </label>
        ))}
        <button type="button" className={styles.reset} onClick={() => setCorners({ ...DEFAULTS })}>Reset to 8px / 28px</button>
        <p>Preview only · remembered in this browser</p>
      </div>
    </aside>
  );
}
