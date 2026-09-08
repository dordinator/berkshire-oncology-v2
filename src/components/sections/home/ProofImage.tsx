import Image from "next/image";

// ─────────────────────────────────────────────────────────────────────────────
// A photograph with two claims laid over it — the HCA pattern, with one
// deliberate difference.
//
// HCA's version carries the CQC mark and a Doctify review count. Both are
// theirs to carry: HCA is the registered provider and does hold those reviews.
// Neither is true of this partnership — the CQC registers the hospitals it
// practises in, not the partnership, and there is no review count at all. So
// this takes the composition and puts only checkable statements in it, with no
// third-party logos: a badge lifted from someone else's accreditation is a
// claim, not a decoration.
// ─────────────────────────────────────────────────────────────────────────────

function Tick() {
  return (
    <span
      aria-hidden
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/[0.07] text-accent"
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
        <path
          d="M3.5 8.5 6.5 11.5 12.5 5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function ProofImage({
  src,
  alt,
  cardTitle,
  cardBody,
  statValue,
  statLabel,
}: {
  src: string;
  alt: string;
  cardTitle: string;
  cardBody: string;
  statValue: string;
  statLabel: string;
}) {
  return (
    <div className="relative">
      {/* Taller on a phone than from sm up. The cards overlay at every width
          now, and a 4:5 frame did not leave enough photograph above them once
          they did — 3:4 buys ~60px of height at 375px, which is the difference
          between a picture with cards on it and two cards with a strip of
          picture behind them. */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[1.75rem] bg-canvas-soft sm:aspect-[4/5]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 45vw"
          className="object-cover"
        />
      </div>

      {/* Overlaid at every width, inset inside the frame rather than hanging off
          it — an overhanging card either clips or forces sideways scroll.

          These used to drop below the photograph on a phone, because at 4:5 the
          two of them swallowed most of it. They are back on the image, paid for
          by the taller mobile frame above and by tighter type and padding here:
          the card is the same object, just not shouting at 375px. */}
      <div className="pointer-events-none absolute inset-x-4 bottom-4 flex flex-col gap-2.5 sm:inset-x-6 sm:bottom-6 sm:gap-3">
        <div className="pointer-events-auto max-w-sm rounded-2xl bg-white/95 p-4 shadow-[0_20px_60px_-20px_rgba(6,28,70,0.45)] backdrop-blur-sm sm:p-5">
          <div className="flex items-start gap-3">
            <Tick />
            <div className="min-w-0">
              <p
                data-copy-key="approach.gmc.title"
                className="font-display text-[15px] leading-snug text-ink sm:text-[17px]"
              >
                {cardTitle}
              </p>
              <p
                data-copy-key="approach.gmc.body"
                className="mt-1.5 text-[12px] leading-relaxed text-ink-muted sm:text-[13px]"
              >
                {cardBody}
              </p>
            </div>
          </div>
        </div>

        <div className="pointer-events-auto flex w-fit items-baseline gap-2.5 rounded-full bg-white/95 px-4 py-2 shadow-[0_20px_60px_-20px_rgba(6,28,70,0.45)] backdrop-blur-sm sm:gap-3 sm:px-5 sm:py-2.5">
          <span className="font-display text-base leading-none text-ink sm:text-lg">
            {statValue}
          </span>
          <span
            data-copy-key="approach.stat.label"
            className="text-[12px] leading-none text-ink-muted sm:text-[13px]"
          >
            {statLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
