import Image from "next/image";
import { testimonials, PLACEHOLDER } from "@/content/testimonials";
import ChapterTint, { CHAPTER_GOLD } from "./ChapterTint";

// ─────────────────────────────────────────────────────────────────────────────
// "Patient feedback" — the mirror of the "Cancers we treat" chapter.
//
// Same construction throughout: a viewport-tall sticky text column with its
// content flex-centred, and two interleaved card columns beside it where one is
// dropped by a card's height so they do not march in rows. The only difference
// is the hand it is dealt with. Text sits right and cards left, the container's
// tight padding moves to the left edge, and the offset column swaps, so the
// topmost card is top-left where the other section's is top-right.
//
// It carries the same wash on the same trigger, from the same component, but
// in warm gold against the cancers chapter's sage. Two chapters running the
// identical device in the identical colour read as one long band rather than
// two rooms, and the warmth belongs here: these are people's own words, where
// the clinical chapter above wants calm. Both colours are imported from
// ChapterTint rather than typed in here, so neither can drift. Both fill the
// page when their own heading comes on screen and drain when it leaves.
//
// The card scrim is neutral black, not the site's navy. Navy at this weight
// pulls every photograph towards blue, and these are meant to stay warm.
// ─────────────────────────────────────────────────────────────────────────────

export default function TestimonialCards({
  intro,
}: {
  intro: React.ReactNode;
}) {
  const half = Math.ceil(testimonials.length / 2);
  const columns = [testimonials.slice(0, half), testimonials.slice(half)];

  return (
    // Full width by sitting outside the page's container rather than by
    // -mx-[50vw]/w-screen: 100vw includes the scrollbar, so that trick
    // overflows the page by the scrollbar's width.
    <section className="relative isolate">
      <ChapterTint colour={CHAPTER_GOLD} />

      <div className="mx-auto w-full max-w-[1560px] px-6 py-24 md:px-10 md:py-32 lg:pl-10 lg:pr-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.58fr)] lg:items-start lg:gap-16 xl:gap-24">
          {/* Same horizontal strip as the cancers chapter below md, for the same
              reason and by the same means — see the note there. The two chapters
              mirror each other on a desktop and should not diverge on a phone. */}
          <div
            // Horizontal only, and scroll-pl-6 for the first card's left
            // margin — see the notes in CancerCards, which this mirrors.
            data-lenis-prevent-horizontal
            // Focusable, unlike the cancers strip, which gets keyboard access
            // for free from the links inside its cards. These cards are
            // quotations — <figure>, no link, nothing to tab to — so without a
            // tabindex a keyboard user could not scroll the region at all.
            // Named and grouped so it is announced as something rather than as
            // an unlabelled box, and given a ring because the site switches the
            // default focus outline off globally.
            tabIndex={0}
            role="group"
            aria-label="Patient feedback, scrollable"
            className="-mx-6 flex snap-x snap-mandatory scroll-pl-6 gap-4 overflow-x-auto overscroll-x-contain px-6 pb-2 [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-transparent [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-2 md:gap-7 md:overflow-visible md:px-0 md:pb-0"
          >
            {columns.map((col, i) => (
              // Mirrored from the cancers chapter: there the offset column is
              // pushed left, here it is pushed right, so the topmost card lands
              // on the outer edge in both cases.
              <ul
                key={i}
                className={`flex shrink-0 gap-4 md:block md:shrink md:space-y-7 ${
                  i === 0 ? "lg:order-1" : "lg:order-2 lg:mt-32"
                }`}
              >
                {col.map((t) => (
                  <li
                    key={t.attribution}
                    className="w-[56vw] shrink-0 snap-start sm:w-[38vw] md:w-auto"
                  >
                    {/* A figure, not a link: a quotation is not somewhere to go.
                        That also means no hover state and no focus target, which
                        is correct — there is nothing here to activate. */}
                    <figure className="relative block overflow-hidden rounded-2xl bg-ink/5">
                      <span className="relative block aspect-[3/4] w-full">
                        <Image
                          src={t.image}
                          alt=""
                          fill
                          sizes="(max-width: 1024px) 45vw, 30vw"
                          className="object-cover"
                        />
                        {/* An even scrim rather than a bottom-anchored gradient:
                            the quotation sits in the middle, so darkening only
                            the foot would leave it unreadable. Neutral black
                            rather than the navy the cancer cards use — navy at
                            this weight turns a warm photograph cold, and these
                            are chosen for their warmth. */}
                        <span
                          aria-hidden
                          className="absolute inset-0 bg-black/50"
                        />
                      </span>

                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-7 text-center md:p-8">
                        <blockquote className="font-display text-lg leading-snug text-white md:text-xl lg:text-[1.4rem] lg:leading-snug">
                          &ldquo;{t.quote}&rdquo;
                        </blockquote>
                        <figcaption className="text-[13px] uppercase tracking-[0.14em] text-white/70">
                          {t.attribution}
                        </figcaption>
                      </div>
                    </figure>
                  </li>
                ))}
              </ul>
            ))}
          </div>

          {/* Second in the grid but first in the DOM order that matters least:
              the intro is placed after the cards visually, yet a screen reader
              still meets the section's framing first because this column is
              ordered by the grid, not by source. */}
          <div className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center">
            <div>
              {intro}

              {PLACEHOLDER && (
                // Deliberately not hidden behind NODE_ENV. A notice that
                // disappears in production is exactly backwards — this needs to
                // be loudest on the live site, where shipping invented patient
                // quotations would matter most.
                <p className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-50 px-4 py-3 text-[13px] leading-relaxed text-amber-900">
                  <strong className="font-semibold">Placeholder.</strong> These
                  quotations are invented, to hold the layout while the section
                  is designed. They are not patient feedback and must be
                  replaced before this page goes live.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
