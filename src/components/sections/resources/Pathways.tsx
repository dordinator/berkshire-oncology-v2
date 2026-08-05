"use client";

import Link from "next/link";
import { pathways, isOutline, type Pathway } from "@/content/pathways";
import UrgentCareNotice from "@/components/site/UrgentCareNotice";
import WaveMark from "./WaveMark";
import { useMotionLevel } from "./Intensity";

// ─────────────────────────────────────────────────────────────────────────────
// The five situations, on the paper sheet.
//
// Two renderings of identical content, chosen by motion level:
//
//   Levels 1–2 (and phones at every level): editorial rows. Title and one
//   line on the left, the four destinations as white cards on the right —
//   cards, not hairline rows, so the paper band reads as a surface carrying
//   objects rather than a printed list. At level 2 the cards drift at their
//   own speeds and the row's wave signature draws itself in.
//
//   Level 3 on md+: the shelf. The section pins and the five situations
//   travel sideways under the scroll — the demo M3 move, carrying the page's
//   centre of gravity rather than a demo card set.
//
// The urgent-care notice keeps its place in the reading order either way:
// inside situation 03 in the rows, directly after the shelf on desktop.
// ─────────────────────────────────────────────────────────────────────────────

function OutlineTag({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={`ml-2 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${
        dark ? "bg-white/10 text-white/70" : "bg-ink/[0.06] text-ink/60"
      }`}
    >
      Being written
    </span>
  );
}

function LinkRow({ link }: { link: Pathway["links"][number] }) {
  const outline = isOutline(link.href);
  const body = (
    <>
      <span className="flex-1 text-[15px] leading-snug text-ink transition-colors group-hover:text-accent">
        {link.label}
        {outline && <OutlineTag />}
      </span>
      <span
        aria-hidden
        className="shrink-0 text-ink-muted transition-transform duration-300 group-hover:translate-x-0.5"
      >
        {link.external ? "↗" : "→"}
      </span>
    </>
  );
  const cls =
    "group flex min-h-[52px] items-center gap-4 rounded-2xl border border-black/[0.05] bg-white px-5 py-3 shadow-[0_1px_2px_rgba(6,28,70,0.04),0_10px_28px_-14px_rgba(6,28,70,0.14)] transition-shadow hover:shadow-[0_2px_4px_rgba(6,28,70,0.05),0_16px_36px_-14px_rgba(6,28,70,0.22)]";

  return link.external ? (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className={cls}>
      {body}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  ) : (
    <Link href={link.href} className={cls}>
      {body}
    </Link>
  );
}

function ActionLink({ pathway }: { pathway: Pathway }) {
  return (
    <Link
      href={pathway.action.href}
      className="group inline-flex items-center gap-2.5 text-sm font-medium text-accent transition-colors hover:text-ink"
    >
      {pathway.action.label}
      {isOutline(pathway.action.href) && <OutlineTag />}
      <span
        aria-hidden
        className="transition-transform duration-300 group-hover:translate-x-1"
      >
        →
      </span>
    </Link>
  );
}

/** Card drift settings per link position — the variation is what makes the
 *  stack read as objects on a surface rather than one welded column. */
const CARD_DRIFT = [
  { drift: 0.9, rot: -1.4 },
  { drift: 0.35, rot: 0 },
  { drift: 1.25, rot: 1.6 },
  { drift: 0.6, rot: -0.8 },
];

function Rows({ className = "" }: { className?: string }) {
  return (
    <div className={`container-wide ${className}`}>
      {pathways.map((pathway, i) => (
        <article
          key={pathway.id}
          id={pathway.id}
          data-drift-band
          className="scroll-mt-28 border-t border-ink/10 py-12 first:border-t-0 md:py-16"
        >
          <div className="grid gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
            <div>
              <span className="label-tight tabular-nums text-[#a9791a]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="display-section mt-5 text-ink">{pathway.title}</h3>
              <p className="mt-5 max-w-sm text-[17px] leading-relaxed text-ink/70">
                {pathway.description}
              </p>
              <div className="mt-7">
                <ActionLink pathway={pathway} />
              </div>
            </div>

            <ul className="space-y-3 lg:pt-1">
              {pathway.links.map((link, j) => (
                <li
                  key={link.href + link.label}
                  data-fx="drift"
                  data-drift={CARD_DRIFT[j % CARD_DRIFT.length].drift}
                  data-rot={CARD_DRIFT[j % CARD_DRIFT.length].rot}
                  className="will-change-transform"
                >
                  <LinkRow link={link} />
                </li>
              ))}
            </ul>
          </div>

          {pathway.id === "side-effects" && <UrgentCareNotice className="mt-8" />}

          {/* the row's wave signature — draws itself in at level 2+ */}
          <div data-fx="draw" className="mt-8 hidden lg:block">
            <WaveMark
              idPrefix={`pw-${pathway.id}`}
              viewBox="0 134 1400 84"
              amplitude={[0.2, 0.3, 0.4, 0.3, 0.2][i]}
              count={[9, 11, 13, 11, 9][i]}
              opacityBase={0.14}
              opacitySpan={0.2}
              strokeScale={1.1}
              className="h-[60px] w-full"
            />
          </div>
        </article>
      ))}
    </div>
  );
}

function Shelf({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <section data-pin-shelf className="flex h-screen flex-col justify-center overflow-hidden">
        <div className="container-wide">
          <span className="eyebrow text-[#a9791a]">Keep scrolling — the shelf slides</span>
        </div>
        <div
          data-shelf-track
          className="mt-8 flex items-stretch gap-6 pl-[max(1.5rem,calc((100vw-1400px)/2+4rem))] will-change-transform"
        >
          {pathways.map((pathway, i) => (
            <article
              key={pathway.id}
              className="flex w-[520px] shrink-0 flex-col rounded-[1.75rem] border border-black/[0.05] bg-white p-8 shadow-[0_2px_4px_rgba(6,28,70,0.04),0_24px_60px_-24px_rgba(6,28,70,0.2)]"
            >
              <span className="label-tight tabular-nums text-[#a9791a]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-[2rem] leading-[1.05] tracking-tight text-ink">
                {pathway.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink/70">
                {pathway.description}
              </p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {pathway.links.map((link) => {
                  const outline = isOutline(link.href);
                  const inner = (
                    <>
                      <span className="flex-1 text-[14.5px] leading-snug text-ink transition-colors group-hover:text-accent">
                        {link.label}
                        {outline && <OutlineTag />}
                      </span>
                      <span aria-hidden className="shrink-0 text-ink-muted">
                        {link.external ? "↗" : "→"}
                      </span>
                    </>
                  );
                  const cls =
                    "group flex min-h-[44px] items-center gap-3 rounded-xl bg-canvas-soft/70 px-4 py-2.5 transition-colors hover:bg-canvas-soft";
                  return (
                    <li key={link.href + link.label}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cls}
                        >
                          {inner}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      ) : (
                        <Link href={link.href} className={cls}>
                          {inner}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="mt-6">
                <ActionLink pathway={pathway} />
              </div>
            </article>
          ))}
          {/* breathing room so the last card clears the viewport edge */}
          <div aria-hidden className="w-10 shrink-0" />
        </div>
      </section>

      {/* The urgent-care routing keeps its position in the reading order even
          when situation 03 lives on the shelf. */}
      <div className="container-wide pb-16 pt-4">
        <UrgentCareNotice />
      </div>
    </div>
  );
}

export default function Pathways() {
  const level = useMotionLevel();

  if (level === 3) {
    return (
      <>
        <Shelf className="hidden md:block" />
        {/* phones never pin — the rows carry the same content */}
        <Rows className="md:hidden" />
      </>
    );
  }
  return <Rows />;
}
