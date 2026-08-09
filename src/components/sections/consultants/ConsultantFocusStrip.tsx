"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// The consultant focus strip — ten portraits sharing one band, the one under
// your pointer coming into focus while the rest compress into slivers.
//
// The mechanic is a single animatable property: every panel is flex-basis 0
// and the camera work is flex-grow, which transitions smoothly and keeps the
// row exactly filling its track at every moment. The open panel's card sits
// at a fixed width inside the growing box, so its text never reflows during
// the move — it fades up once the panel has begun to open.
//
// Hover focuses, and so does keyboard focus: every collapsed panel is a
// button carrying the consultant's name, so tabbing along the strip walks
// the partnership exactly as mousing does. One panel starts open — the
// mechanic should be visible before it is touched.
//
// Below lg the same data renders as a vertical accordion: slivers this
// narrow have no room on a phone, and a tap-to-expand row is the honest
// translation.
// ─────────────────────────────────────────────────────────────────────────────

export interface FocusConsultant {
  slug: string;
  name: string;
  shortRole: string;
  photo: string;
  /** Extended-headroom portrait (800×1680) — desktop strip only, where the
      sliver crop must keep the whole face in frame. */
  photoTall: string;
  cancerTypes: string[];
  treatments: string[];
  sites: string[];
}

/** The site's established gold — the pathway waves and tariffs field use it. */
const GOLD = "#c8992f";

function Card({ c }: { c: FocusConsultant }) {
  return (
    <div className="w-[272px] max-w-full xl:w-[320px]">
      <h3 className="font-display text-2xl font-semibold leading-tight text-ink xl:text-[2rem]">
        {c.name}
      </h3>
      <p className="mt-1.5 text-[15px] text-ink-muted">{c.shortRole}</p>
      <div aria-hidden className="mt-3.5 h-px w-10" style={{ backgroundColor: GOLD }} />

      <dl className="mt-4 divide-y divide-ink/10 border-t border-ink/10">
        {c.cancerTypes.length > 0 && (
          <div className="py-2.5">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink">
              Cancer types
            </dt>
            <dd className="mt-1 text-[12.5px] leading-snug text-ink-muted">
              {c.cancerTypes.join(" · ")}
            </dd>
          </div>
        )}
        {c.treatments.length > 0 && (
          <div className="py-2.5">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink">
              Treatments
            </dt>
            <dd className="mt-1 text-[12.5px] leading-snug text-ink-muted">
              {c.treatments.join(" · ")}
            </dd>
          </div>
        )}
        {c.sites.length > 0 && (
          <div className="py-2.5">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink">
              Locations
            </dt>
            <dd className="mt-1 text-[12.5px] leading-snug text-ink-muted">
              {c.sites.join(" · ")}
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          href={`/consultants/${c.slug}`}
          className="rounded-full border border-ink/20 bg-white/70 px-4 py-1.5 text-[13px] font-medium text-ink transition-colors hover:border-ink/45 hover:bg-white focus-visible:border-ink/45 focus-visible:bg-white"
        >
          Read full profile
        </Link>
        <Link
          href="/contact"
          className="group/cta inline-flex items-center gap-2 rounded-full bg-ink px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-accent focus-visible:bg-accent"
        >
          Arrange a consultation
          <span
            aria-hidden
            className="transition-transform group-hover/cta:translate-x-0.5"
          >
            →
          </span>
        </Link>
      </div>
    </div>
  );
}

export default function ConsultantFocusStrip({
  consultants,
}: {
  consultants: FocusConsultant[];
}) {
  const [active, setActive] = useState(3);

  return (
    <div>
      {/* ── Desktop: the horizontal strip, edge to edge. Height is ~half the
          viewport so headline + strip + rail compose one full screen, and
          the slivers stay wide enough that the extended-headroom portraits
          keep the whole face in frame. ─────────────────────────────────── */}
      <div className="hidden lg:block">
        <div className="flex h-[clamp(440px,50svh,560px)] gap-[3px] border-y border-ink/[0.08]">
          {consultants.map((c, i) => {
            const open = i === active;
            return (
              <div
                key={c.slug}
                onMouseEnter={() => setActive(i)}
                className="relative overflow-hidden bg-canvas-soft transition-[flex-grow] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
                style={{ flexGrow: open ? 6.2 : 1, flexBasis: 0 }}
              >
                {/* One persistent portrait per panel — the same element in
                    both states, so opening never swaps or reloads the image.
                    Collapsed it sits centred (the sliver is a window onto its
                    middle); open it slides to the panel's left edge, riding
                    the same easing as the grow. The card hangs off the
                    portrait's right edge and simply fades. */}
                <div
                  className="absolute top-0 h-full transition-[left,transform] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
                  style={{
                    aspectRatio: "800 / 1700",
                    left: open ? "0%" : "50%",
                    transform: open ? "translateX(0%)" : "translateX(-50%)",
                  }}
                >
                  <Image
                    src={c.photoTall}
                    alt={open ? `${c.name}, ${c.shortRole}` : ""}
                    fill
                    sizes="16vw"
                    className="object-cover"
                  />
                  <div
                    aria-hidden={!open}
                    className={`absolute inset-y-0 left-full flex w-[340px] items-center px-6 transition-opacity duration-500 xl:w-[400px] xl:px-9 ${
                      open ? "opacity-100 delay-150" : "pointer-events-none opacity-0"
                    }`}
                  >
                    <Card c={c} />
                  </div>
                </div>

                {/* Keyboard and screen-reader surface for the collapsed
                    state; hover's equivalent for focus. */}
                <button
                  type="button"
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  aria-label={`${c.name}, ${c.shortRole}`}
                  aria-expanded={open}
                  className={`absolute inset-0 h-full w-full focus-visible:shadow-[inset_0_0_0_3px_#c8992f] ${
                    open ? "pointer-events-none" : ""
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* The numbered rail. Cells share the panels' grow values and the
            same easing, so each number rides with its portrait; the open
            cell carries the name and the gold underline. */}
        <div className="mt-4 flex gap-[3px] px-3">
          {consultants.map((c, i) => {
            const open = i === active;
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => setActive(i)}
                aria-label={c.name}
                aria-current={open || undefined}
                className="min-w-0 text-center transition-[flex-grow] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
                style={{ flexGrow: open ? 6.2 : 1, flexBasis: 0 }}
              >
                <span
                  className="text-[11px] tabular-nums tracking-[0.14em]"
                  style={{ color: open ? GOLD : "#5a6884" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`mx-auto block overflow-hidden whitespace-nowrap text-[13px] text-ink transition-opacity duration-300 ${
                    open ? "opacity-100" : "h-0 opacity-0"
                  }`}
                >
                  {c.name}
                  <span
                    aria-hidden
                    className="mx-auto mt-1 block h-px w-16"
                    style={{ backgroundColor: GOLD }}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Below lg: the vertical accordion (inset — a full-bleed accordion
          reads as broken cards on a phone) ────────────────────────────────── */}
      <div className="space-y-2 px-6 lg:hidden">
        {consultants.map((c, i) => {
          const open = i === active;
          return (
            <div key={c.slug} className="overflow-hidden bg-canvas-soft">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-expanded={open}
                className="flex w-full items-center gap-4 p-2.5 text-left"
              >
                <span className="relative h-14 w-14 shrink-0 overflow-hidden">
                  <Image
                    src={c.photo}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover object-[50%_22%]"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-base font-semibold leading-tight text-ink">
                    {c.name}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-ink-muted">
                    {c.shortRole}
                  </span>
                </span>
                <span
                  aria-hidden
                  className={`mr-2 text-lg text-ink-muted transition-transform duration-300 ${
                    open ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>

              <div
                className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={c.photo}
                      alt={`${c.name}, ${c.shortRole}`}
                      fill
                      sizes="100vw"
                      className="object-cover object-[50%_22%]"
                    />
                  </div>
                  <div className="p-5">
                    <Card c={c} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
