// Typographic brand lockup for the Berkshire Oncology Partnership.
// A clean wordmark that inherits the display serif — no image dependency.
// Swap in an <Image> here later if the practice supplies a logo asset.

export default function BrandLogo({
  tone = "dark",
  className = "",
  context = "full",
}: {
  tone?: "dark" | "light";
  className?: string;
  /** "nav" drops the sub-wordmark through the widths where the section bar is
   *  competing for the same row. Anywhere else there is room for it. */
  context?: "full" | "nav";
}) {
  const main = tone === "light" ? "text-white" : "text-ink";
  const sub = tone === "light" ? "text-white/55" : "text-ink-muted";
  // In the navbar the sub-wordmark shows only below xl, where the drawer is in
  // use and the row is otherwise empty. From xl up the eight sections need that
  // ~115px: the pill is capped at 1400px, so at 2xl the bar was filling its full
  // width with nothing to spare, and any longer label would have overflowed.
  const suffixVisibility =
    context === "nav" ? "hidden sm:max-xl:inline" : "hidden sm:inline";

  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      {/* Steps down below sm. In the navbar pill the wordmark shares a 320px
          viewport with a 16px gutter, the pill padding and two 44px buttons;
          at 1.6rem it pushed the menu button off the right-hand edge, and
          `body { overflow-x: hidden }` meant it could not be scrolled to. */}
      <span
        className={`font-display text-[1.15rem] leading-none tracking-tight ${main} min-[360px]:text-[1.3rem] sm:text-[1.6rem] md:text-[1.75rem]`}
      >
        Berkshire Oncology
      </span>
      {/* In the navbar this is hidden through the band where the eight-section
          bar competes for the same row — it costs ~115px, which is the
          difference between the sections fitting and the last one sliding under
          the search button. It returns at 2xl. */}
      <span
        className={`text-[0.6rem] font-medium uppercase tracking-[0.28em] ${sub} ${suffixVisibility}`}
      >
        Partnership
      </span>
    </span>
  );
}
