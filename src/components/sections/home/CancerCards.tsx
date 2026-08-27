import Image from "next/image";
import Link from "next/link";
import { specialityIcon } from "@/components/site/SpecialityIcons";
import ChapterTint, { CHAPTER_SAGE } from "./ChapterTint";

// ─────────────────────────────────────────────────────────────────────────────
// "Cancers we treat" — the chapter-break section.
//
// Three things happen here, and none of them uses a scroll listener.
//
// 1. The band washes its gold in as it enters the viewport and back out as it
//    leaves, via the `chapter-tint` scroll-progress timeline in globals.css.
// 2. The left column is a viewport-tall `position: sticky` box with its content
//    flex-centred inside, so it settles, holds while the cards stream past,
//    then releases when the section ends.
// 3. Scrolling back up reverses both exactly, because neither is a sequence
//    being played — one is a position on a timeline and the other is layout.
//
// A scroll-linked implementation of any of it would have to be driven off a
// scroll event, which fights Lenis's smoothing, jitters on trackpads, and needs
// its own reduced-motion path. This has none of those problems.
//
// The cards are two columns with the left one dropped by a card's height, so
// the topmost card sits top-right and they interleave rather than marching in
// rows — the asymmetry is what makes it read as editorial rather than a grid.
// ─────────────────────────────────────────────────────────────────────────────

// The chapter's colour lives with the tint itself, so the two chapters cannot
// drift. This one takes the pale sage the patients pages are built on — the
// calmer of the pair, which suits a list of diagnoses; the warm gold goes to
// "Patient feedback" below, where the words are people's own.

/** Which of the sourced image sets is in use. Files live in public/cancers/. */
const IMAGE_SET = "diagnostic";

export interface CancerCard {
  slug: string;
  label: string;
  /** Opens this cancer inside the redesigned, joined-up cancer journey. */
  href: string;
}

export default function CancerCards({
  cards,
  intro,
}: {
  cards: CancerCard[];
  intro: React.ReactNode;
}) {
  const half = Math.ceil(cards.length / 2);
  const columns = [cards.slice(0, half), cards.slice(half)];

  return (
    // Full width by sitting outside the page's container rather than by
    // -mx-[50vw]/w-screen: 100vw includes the scrollbar, so that trick
    // overflows the page by the scrollbar's width. Clipping it with overflow-x
    // on an ancestor would make that ancestor a scroll container and break the
    // sticky column below.
    <section className="relative isolate">
      {/* Renders a marker here and the colour itself as a fixed sheet on the
          body — the chapter's colour fills the whole page while you are in it
          rather than living inside this box. */}
      <ChapterTint colour={CHAPTER_SAGE} />

      {/* Its own container rather than `container-wide`: a wider maximum and a
          tighter right-hand padding pull the card column roughly a third closer
          to the edge of the page, which is where the reference sits it. The
          left padding is unchanged so the text still lines up with the sections
          above and below. */}
      <div className="mx-auto w-full max-w-[1560px] px-6 py-24 md:px-10 md:py-32 lg:pl-16 lg:pr-10">
        {/* Proportions taken from the HCA reference: the text column is a
            little over a third, the cards a little under two thirds, with a
            wide gutter between them rather than the tight one a normal grid
            would give. */}
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.58fr)_minmax(0,1fr)] lg:items-start lg:gap-16 xl:gap-24">
          {/* A viewport-tall sticky box with the text centred inside it, rather
              than a content-height box pinned to top-1/2 and pulled back up by
              a translate. The translate applied at all times, not only while
              stuck, so before the column engaged it drew half its own height
              *above* the section — which is why the heading sat outside the
              gold on white while the paragraph beneath it sat inside. Centring
              by layout keeps every pixel of the column within the band, and it
              no longer depends on the column's height, so adding or removing a
              line below the text cannot knock it off centre. */}
          <div className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center">
            <div>{intro}</div>
          </div>

          {/* Below md this is a horizontal scroller, from md the two-column
              arrangement returns. Six tall cards stacked two-abreast is a very
              long scroll on a phone for something you are meant to skim; sideways
              it is one flick.

              The two <ul>s survive the change rather than being flattened into
              one: as flex rows inside a flex row they abut, so the six cards read
              as a single continuous strip while the markup stays a pair of
              lists. `display: contents` would do the same thing more neatly but
              still costs list semantics in some engines, which is not a trade
              worth making on this site.

              No data-lenis-prevent, deliberately. The consultant list needs it
              because it is a scroller at every width; this is a scroller only
              below md, and the attribute is not something a breakpoint can turn
              off. Left on, it made Lenis stand off the wheel across the whole
              card area on a desktop — where the element is a plain grid with
              nothing to scroll — so the wheel did nothing at all there. Lenis
              runs smoothWheel only and leaves touch native, so the strip still
              swipes properly on a phone without it. */}
          <div
            // Horizontal only. The plain data-lenis-prevent stood off every
            // gesture, so from md — where this is a grid with nothing to scroll
            // — the wheel died over the whole card area. This variant hands
            // sideways gestures to the strip and leaves vertical ones to the
            // page, which is right at every width.
            data-lenis-prevent-horizontal
            // scroll-pl-6, not just px-6. `snap-start` aligns a card to the
            // scrollport edge, which sits inside the padding — so on load the
            // browser scrolled the left padding away and the first card sat
            // flush against the screen. scroll-padding moves the snap line in
            // to match.
            className="-mx-6 flex snap-x snap-mandatory scroll-pl-6 gap-4 overflow-x-auto overscroll-x-contain px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-2 md:gap-7 md:overflow-visible md:px-0 md:pb-0"
          >
            {columns.map((col, i) => (
              // The first column is placed on the *right* and the second drops
              // down the page, so the topmost card is top-right as in the
              // reference. Done with `order` rather than by swapping the arrays
              // so the DOM sequence still begins with the first card — breast
              // is the most common of the six and should stay first for a
              // screen reader and for tab order, wherever it sits visually.
              <ul
                key={i}
                className={`flex shrink-0 gap-4 md:block md:shrink md:space-y-7 ${
                  i === 0 ? "lg:order-2" : "lg:order-1 lg:mt-32"
                }`}
              >
                {col.map((c) => {
                  const Icon = specialityIcon[c.slug];
                  return (
                    <li
                      key={c.slug}
                      className="w-[56vw] shrink-0 snap-start sm:w-[38vw] md:w-auto"
                    >
                      <Link
                        href={c.href}
                        className="group relative block overflow-hidden rounded-2xl bg-ink/5"
                      >
                        <span className="relative block aspect-[3/4] w-full">
                          {/* Falls back to the glyph if an image ever goes
                              missing, rather than showing a broken frame. */}
                          {Icon && (
                            <span className="absolute inset-0 flex items-center justify-center bg-white">
                              <Icon className="h-16 w-16 text-accent/30" />
                            </span>
                          )}
                          <Image
                            src={`/cancers/${IMAGE_SET}-${c.slug}.jpg`}
                            alt=""
                            fill
                            sizes="(max-width: 1024px) 45vw, 30vw"
                            className="relative object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none"
                          />
                          {/* An even scrim rather than a bottom-anchored
                              gradient: the label sits in the middle, so
                              darkening only the foot would leave it unreadable. */}
                          <span
                            aria-hidden
                            className="absolute inset-0 bg-ink/55 transition-colors duration-500 group-hover:bg-ink/45 motion-reduce:transition-none"
                          />
                        </span>

                        {/* Type scale and padding follow the reference: the
                            card title is nearly as large as a section heading,
                            with a generous inset so it never crowds the edge. */}
                        <span className="absolute inset-0 flex flex-col items-center justify-center gap-3.5 p-7 text-center md:p-8">
                          <span className="block font-display text-2xl leading-[1.15] text-white md:text-[1.75rem] lg:text-[2rem]">
                            {c.label}
                          </span>
                          <span className="inline-block border-b border-white/60 pb-1 text-[14px] text-white transition-colors group-hover:border-white">
                            <span data-copy-key="cancers.card.action">
                              View cancer type
                            </span>
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
