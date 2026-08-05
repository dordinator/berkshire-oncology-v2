"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  testimonials,
  PLACEHOLDER,
  IMAGE_SETS,
  DEFAULT_IMAGE_SET,
  imageFor,
  type ImageSetId,
} from "@/content/testimonials";
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
// It carries the same gold on the same trigger, from the same component — the
// colour is imported rather than repeated, so the two chapters cannot drift onto
// different golds. Both fill the page when their own heading comes on screen and
// drain when it leaves.
//
// The card scrim is neutral black, not the site's navy. Navy at this weight
// pulls every photograph towards blue, and these are meant to stay warm.
// ─────────────────────────────────────────────────────────────────────────────

const STORE_KEY = "bop:testimonial-set";

export default function TestimonialCards({ intro }: { intro: React.ReactNode }) {
  const half = Math.ceil(testimonials.length / 2);
  // Index carried alongside the entry so each card can resolve its own file in
  // the chosen set — the split into two columns loses the original position.
  const withIndex = testimonials.map((t, i) => ({ ...t, i }));
  const columns = [withIndex.slice(0, half), withIndex.slice(half)];

  const [set, setSet] = useState<ImageSetId>(DEFAULT_IMAGE_SET);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const q = new URLSearchParams(window.location.search).get("set");
    const pick = q ?? window.localStorage.getItem(STORE_KEY);
    if (pick && IMAGE_SETS.some((s) => s.id === pick)) setSet(pick as ImageSetId);
  }, []);

  const choose = (id: ImageSetId) => {
    setSet(id);
    window.localStorage.setItem(STORE_KEY, id);
  };

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
                          src={imageFor(set, t.i)}
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
                        <span aria-hidden className="absolute inset-0 bg-black/50" />
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
                  is designed. They are not patient feedback and must be replaced
                  before this page goes live.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TEMPORARY: the image-set switcher. Portalled to the body so it clears
          the section's stacking context and adds no height to the sticky
          column, whose centring depends on nothing but the viewport. */}
      {mounted &&
        createPortal(
          <div className="fixed bottom-4 right-4 z-[9999] max-h-[85vh] w-64 overflow-y-auto rounded-2xl border border-ink/10 bg-white/95 p-3 shadow-xl backdrop-blur">
            <p className="px-1 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
              Feedback images · temporary
            </p>
            <div className="flex flex-col gap-1">
              {IMAGE_SETS.map((s) => {
                const on = set === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => choose(s.id)}
                    aria-pressed={on}
                    className={`rounded-xl px-3 py-2 text-left transition-colors ${
                      on ? "bg-ink text-white" : "hover:bg-ink/5"
                    }`}
                  >
                    <span className="block text-[13px] font-medium leading-tight">
                      {s.name}
                    </span>
                    <span
                      className={`mt-0.5 block text-[11px] leading-tight ${
                        on ? "text-white/70" : "text-ink-muted"
                      }`}
                    >
                      {s.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
