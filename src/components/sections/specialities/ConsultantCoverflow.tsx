"use client";

/*
  ConsultantCoverflow — a true "cover flow" carousel of the consultant profile
  cards on /specialities. The centre card faces front; side cards are rotated in
  3D (rotateY) and pushed back (translateZ) so they recede like classic cover
  flow, dimming with distance. Click a side card to bring it forward; the active
  card links to that consultant's profile. Drag / arrows / keyboard all move it.

  Perspective lives on the stage; each card's transform is computed from its
  offset to the active index. Respects reduced-motion (no tilt, no transitions).
*/

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";

export type CoverflowConsultant = {
  slug: string;
  name: string;
  role?: string;
  shortRole?: string;
  photo?: string;
  hasProfile: boolean;
};

const CARD_W = 276;
const CARD_H = 362;

export default function ConsultantCoverflow({
  items,
}: {
  items: CoverflowConsultant[];
}) {
  const n = items.length;
  const [active, setActive] = useState(() => Math.floor(items.length / 2));
  const reduce = useReducedMotion();

  const go = useCallback(
    (dir: number) => setActive((a) => Math.min(n - 1, Math.max(0, a + dir))),
    [n],
  );

  // keyboard
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [go]);

  // pointer drag / swipe
  const drag = useRef<{ x: number; moved: boolean } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 55) {
      go(dx < 0 ? 1 : -1);
      drag.current = { x: e.clientX, moved: true };
    }
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const activeItem = items[active];

  const cardTransform = (offset: number) => {
    const abs = Math.abs(offset);
    const sign = Math.sign(offset);
    const x = offset * 150;
    const rotate = reduce ? 0 : -sign * 48;
    const z = reduce ? 0 : -abs * 165;
    const scale = Math.max(0.68, 1 - abs * 0.09);
    return `translateX(${x}px) translateZ(${z}px) rotateY(${rotate}deg) scale(${scale})`;
  };

  return (
    <div className="select-none">
      {/* 3D stage */}
      <div
        ref={stageRef}
        tabIndex={0}
        role="listbox"
        aria-label="Consultant profiles"
        className="relative mx-auto flex touch-pan-y items-center justify-center outline-none"
        style={{ height: CARD_H + 70, perspective: 1500 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div
          className="relative"
          style={{ width: CARD_W, height: CARD_H, transformStyle: "preserve-3d" }}
        >
          {items.map((c, i) => {
            const offset = i - active;
            const abs = Math.abs(offset);
            const visible = abs <= 3;
            const isActive = offset === 0;
            return (
              <div
                key={c.slug}
                aria-selected={isActive}
                role="option"
                className="absolute left-0 top-0"
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  transform: cardTransform(offset),
                  transformStyle: "preserve-3d",
                  zIndex: 100 - abs,
                  opacity: visible ? 1 : 0,
                  pointerEvents: visible ? "auto" : "none",
                  transition: reduce
                    ? "none"
                    : "transform 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.45s ease",
                  cursor: isActive ? "pointer" : "default",
                }}
              >
                <Link
                  href={c.hasProfile ? `/consultants/${c.slug}` : "/consultants"}
                  aria-label={`${c.name}${c.shortRole ? `, ${c.shortRole}` : ""}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={(e) => {
                    if (drag.current?.moved) {
                      e.preventDefault();
                      return;
                    }
                    if (!isActive) {
                      e.preventDefault();
                      setActive(i);
                    }
                  }}
                  className="group block h-full w-full"
                  draggable={false}
                >
                  {/* card */}
                  <span
                    className="relative block h-full w-full overflow-hidden rounded-2xl bg-[#e9e2d4] ring-1 ring-black/5"
                    style={{
                      boxShadow: isActive
                        ? "0 30px 60px -24px rgba(20,30,60,0.55), 0 6px 16px -8px rgba(20,30,60,0.4)"
                        : "0 18px 40px -26px rgba(20,30,60,0.45)",
                    }}
                  >
                    {c.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.photo}
                        alt={c.name}
                        draggable={false}
                        className="h-full w-full object-cover object-top"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center font-display text-4xl text-[#a9791a]">
                        {c.name
                          .replace(/^Dr\.?\s+/i, "")
                          .split(/\s+/)
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                    )}
                    {/* dim overlay on side cards for depth */}
                    <span
                      aria-hidden
                      className="absolute inset-0 transition-opacity duration-500"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(10,20,45,0) 40%, rgba(10,20,45,0.5) 100%)",
                        opacity: isActive ? 0 : Math.min(0.75, 0.28 + abs * 0.18),
                      }}
                    />
                  </span>
                </Link>
              </div>
            );
          })}
        </div>

        {/* arrows */}
        <button
          type="button"
          aria-label="Previous consultant"
          onClick={() => go(-1)}
          disabled={active === 0}
          className="absolute left-2 top-1/2 z-[200] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#e4dbc8] bg-white/85 text-ink shadow-md backdrop-blur transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30 md:left-6"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
            <path
              d="M10 3 5 8l5 5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Next consultant"
          onClick={() => go(1)}
          disabled={active === n - 1}
          className="absolute right-2 top-1/2 z-[200] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#e4dbc8] bg-white/85 text-ink shadow-md backdrop-blur transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30 md:right-6"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
            <path
              d="M6 3l5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* active caption */}
      <div className="mt-6 text-center">
        <h2 className="font-display text-2xl leading-tight text-ink">
          {activeItem.name}
        </h2>
        {activeItem.shortRole && (
          <p className="mt-1 text-sm text-ink-muted">{activeItem.shortRole}</p>
        )}
        {activeItem.hasProfile && (
          <Link
            href={`/consultants/${activeItem.slug}`}
            className="group mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#a9791a]"
          >
            View profile
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        )}
      </div>

      {/* dots */}
      <div className="mt-5 flex items-center justify-center gap-2">
        {items.map((c, i) => (
          <button
            key={c.slug}
            type="button"
            aria-label={`Show ${c.name}`}
            onClick={() => setActive(i)}
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: i === active ? 22 : 8,
              background: i === active ? "#a9791a" : "#d8cdb4",
            }}
          />
        ))}
      </div>
    </div>
  );
}
