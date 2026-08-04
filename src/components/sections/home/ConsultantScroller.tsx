import Image from "next/image";
import Link from "next/link";
import type { Consultant } from "@/content/types";

// ─────────────────────────────────────────────────────────────────────────────
// The consultants, as a column you scroll rather than a grid you scan.
//
// Height is set so three and a half rows show: the half row is the whole point,
// since a clean edge at the bottom of a scroll area reads as the end of the
// list. Ten names, and the cut-off tells you so without a label.
//
// data-lenis-prevent is not optional. Lenis preventDefaults the wheel event and
// scrolls the document itself, so without it the page scrolls past this panel
// and the inner list never moves. globals.css already pairs that attribute with
// overscroll-behavior: contain, which stops the scroll chaining to the page
// when you reach the end.
//
// No JavaScript here — native scrolling, CSS snap and a masked edge. Smooth on
// a trackpad, flick-scrollable on a phone, and it works before hydration.
// ─────────────────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
}

export default function ConsultantScroller({
  consultants,
  specialities,
}: {
  consultants: Consultant[];
  specialities: Record<string, string[]>;
}) {
  return (
    <div className="relative min-w-0 lg:absolute lg:inset-0">
      {/* Two different scrollers, because the trap only exists in one axis.
          From md this is a nested *vertical* list, three and a half rows deep.
          On a phone that is unusable — a short vertical scroll area inside a
          scrolling page eats the swipe you meant for the page, and getting past
          the section takes several attempts. The old answer was to drop the
          scroller entirely below md and let all ten rows run in normal flow,
          which is not a trap but is a very long section and reads as no scroller
          at all.

          Sideways has neither problem: a horizontal swipe is unambiguous, it
          cannot fight the page's vertical scroll, and ten names become one
          flick. It also matches the two chapters above.

          overscroll-contain is set here rather than left to Lenis — its rule in
          globals.css keys off `.lenis.lenis-smooth`, and only `lenis` is on the
          html element, so that rule never matches. */}
      <div
        data-lenis-prevent
        // md gets a fixed height; from lg the column stretches to match the
        // text beside it, so the list starts level with the heading and ends
        // level with the buttons. min-height keeps at least three rows in view
        // if that text column is ever short.
        // scroll-pl-6 so the first card keeps its left margin: snap-start aligns
        // to the scrollport edge, which sits inside the padding, so without it
        // the browser scrolls the padding away on load.
        className="-mx-6 snap-x snap-mandatory scroll-pl-6 overflow-x-auto overscroll-contain px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:h-[29rem] md:snap-y md:snap-proximity md:scroll-pl-0 md:overflow-x-visible md:overflow-y-auto md:scroll-smooth md:px-0 md:pb-0 md:pr-1 md:[scrollbar-color:rgba(6,28,70,0.18)_transparent] md:[scrollbar-width:thin] lg:h-full lg:min-h-[24rem]"
      >
        <ul className="flex gap-3 md:flex-col">
          {consultants.map((c) => (
            <li
              key={c.slug}
              className="w-[80vw] shrink-0 snap-start sm:w-[55vw] md:w-auto md:shrink"
            >
              <Link
                href={`/consultants/${c.slug}`}
                className="group flex h-[7rem] items-center gap-4 rounded-2xl border border-ink/[0.07] bg-white px-4 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-accent/25 hover:shadow-[0_18px_44px_-22px_rgba(6,28,70,0.35)] motion-reduce:transition-none sm:gap-5 sm:px-5 md:h-[7.5rem]"
              >
                <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-canvas-soft sm:h-[4.5rem] sm:w-[4.5rem]">
                  {c.photo ? (
                    <Image
                      src={c.photo}
                      alt={`${c.name}, ${c.role}`}
                      fill
                      sizes="72px"
                      className="object-cover object-top"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center font-display text-lg text-accent/50">
                      {initials(c.name)}
                    </span>
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[17px] leading-tight text-ink transition-colors group-hover:text-accent sm:text-lg">
                    {c.name}
                  </span>
                  <span className="mt-1 block text-[13px] leading-tight text-ink-muted">
                    {c.shortRole ?? c.role}
                  </span>
                  {specialities[c.slug]?.length > 0 && (
                    <span className="mt-2.5 flex flex-wrap gap-1.5">
                      {specialities[c.slug].slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-ink/10 px-2 py-0.5 text-[11px] leading-normal text-ink-muted"
                        >
                          {s}
                        </span>
                      ))}
                    </span>
                  )}
                </span>

                {/* Full-strength ink-muted, not /80. At 11px this is small text,
                    so WCAG wants 4.5:1 and the faded version measured 3.65:1 —
                    axe flagged every card. Undimmed it is 5.6:1 and still reads
                    as secondary against the name beside it. */}
                <span className="hidden shrink-0 text-right text-[11px] tabular-nums leading-relaxed text-ink-muted sm:block">
                  <span className="block">GMC {c.gmc}</span>
                  {c.consultantInReadingSince && (
                    <span className="block">
                      Since {c.consultantInReadingSince}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Softens the top and bottom edge so rows fade rather than being sliced
          off. pointer-events-none so it never eats a click on the row beneath. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-canvas to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-canvas via-canvas/80 to-transparent"
      />
    </div>
  );
}
