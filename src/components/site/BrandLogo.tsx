// Typographic brand lockup for the Berkshire Oncology Partnership.
// A clean wordmark that inherits the display serif — no image dependency.
// Swap in an <Image> here later if the practice supplies a logo asset.

export default function BrandLogo({
  tone = "dark",
  className = "",
}: {
  tone?: "dark" | "light";
  className?: string;
}) {
  const main = tone === "light" ? "text-white" : "text-ink";
  const sub = tone === "light" ? "text-white/55" : "text-ink-muted";

  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span
        className={`font-display text-[1.6rem] leading-none tracking-tight ${main} md:text-[1.75rem]`}
      >
        Berkshire Oncology
      </span>
      <span
        className={`hidden text-[0.6rem] font-medium uppercase tracking-[0.28em] ${sub} sm:inline`}
      >
        Partnership
      </span>
    </span>
  );
}
