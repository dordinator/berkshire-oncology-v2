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
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] bg-canvas-soft">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 45vw"
          className="object-cover"
        />
      </div>

      {/* On a phone these sit *below* the photograph rather than on it —
          overlaid, the two cards covered about two thirds of a 409px-tall image
          and there was no photograph left to speak of. From sm up they overlay,
          inset inside the frame rather than hanging off it, since an
          overhanging card either clips or forces sideways scroll. */}
      <div className="mt-3 flex flex-col gap-3 sm:pointer-events-none sm:absolute sm:inset-x-6 sm:bottom-6 sm:mt-0">
        <div className="max-w-sm rounded-2xl bg-white/95 p-5 shadow-[0_20px_60px_-20px_rgba(6,28,70,0.45)] backdrop-blur-sm sm:pointer-events-auto">
          <div className="flex items-start gap-3">
            <Tick />
            <div className="min-w-0">
              <p className="font-display text-[17px] leading-snug text-ink">
                {cardTitle}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
                {cardBody}
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-fit items-baseline gap-3 rounded-full bg-white/95 px-5 py-2.5 shadow-[0_20px_60px_-20px_rgba(6,28,70,0.45)] backdrop-blur-sm sm:pointer-events-auto">
          <span className="font-display text-lg leading-none text-ink">
            {statValue}
          </span>
          <span className="text-[13px] leading-none text-ink-muted">
            {statLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
