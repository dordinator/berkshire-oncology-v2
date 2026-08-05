import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSection } from "@/content/navigation";
import ResourceWave from "@/components/sections/links/ResourceWave";
import MotionDemos from "./MotionDemos";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN DEMOS — not a real page. /resources-demo, reachable by URL only.
//
// Four ingredients for the resources rebuild, labelled A–D, each shown with
// real content from the Resources dropdown so they can be judged honestly.
// Dan replies yes/no per letter; the winners get applied to /resources and this
// file gets deleted.
//
// The benchmark is granola.ai: warm paper and ink bands, huge relaxed display
// type, chunky rounded modules, one quiet accent — never hairline directory
// rows.
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Design demos — resources rebuild",
  robots: { index: false, follow: false },
};

const areas = (getSection("resources")?.groups ?? []).flatMap((g) => g.links);
const byHref = (href: string) => areas.find((a) => a.href === href);

const cancerInfo = byHref("/resources/cancer-information");
const carers = byHref("/resources/carers-and-families");
const sideEffects = byHref("/resources/managing-side-effects");
const emotional = byHref("/resources/emotional-and-practical-support");
const prep = byHref("/resources/treatment-preparation");

function Marker({ id, title }: { id: string; title: string }) {
  return (
    <div className="bg-[#111] px-6 py-3 text-white">
      <span className="font-mono text-[12px] uppercase tracking-[0.2em]">
        Demo {id} — {title}
      </span>
    </div>
  );
}

function PillLink({
  children,
  dark = false,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <Link
      href="/resources"
      className={`group inline-flex min-h-[52px] items-center gap-3 rounded-full border px-6 py-3 text-[15px] font-medium transition-all hover:-translate-y-0.5 ${
        dark
          ? "border-white/20 bg-white/[0.06] text-white hover:border-white/45 hover:bg-white/[0.12]"
          : "border-ink/[0.12] bg-white text-ink shadow-[0_1px_2px_rgba(6,28,70,0.05)] hover:border-ink/25 hover:shadow-[0_6px_20px_-6px_rgba(6,28,70,0.18)]"
      }`}
    >
      {children}
      <span
        aria-hidden
        className="transition-transform duration-300 group-hover:translate-x-1"
      >
        →
      </span>
    </Link>
  );
}

export default function ResourcesDemoPage() {
  return (
    <div className="overflow-x-clip">
      {/* ── how to use this page ─────────────────────────────────────────── */}
      <div className="bg-[#111] px-6 pb-5 pt-28 text-white">
        <p className="font-mono text-[13px] leading-relaxed text-white/80">
          Motion demos M1–M5 first — scroll slowly, everything is driven by the
          scroll itself. Static ingredients A–D below.
          <br />
          Reply per label: &ldquo;M1 yes, M3 no, A yes&hellip;&rdquo;
        </p>
      </div>

      {/* ══ MOTION ═══════════════════════════════════════════════════════ */}
      <MotionDemos />

      {/* ══ DEMO A ═══════════════════════════════════════════════════════ */}
      <Marker id="A" title="Colour bands + chunky modules, no hairline rows" />

      {/* warm paper band */}
      <section className="bg-[#f6f4ee] py-20 md:py-28">
        <div className="container-wide">
          <span className="eyebrow text-[#a9791a]">Cancer information</span>
          <h2 className="display-section mt-6 max-w-3xl text-ink">
            Clear information, from sources you can trust.
          </h2>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink/70">
            {cancerInfo?.description}
          </p>
          <div className="mt-10 flex max-w-3xl flex-wrap gap-3">
            {(cancerInfo?.covers ?? []).map((c) => (
              <PillLink key={c}>{c}</PillLink>
            ))}
          </div>
        </div>
      </section>

      {/* ink band, same module in the dark colourway */}
      <section className="bg-ink py-20 text-white md:py-28">
        <div className="container-wide">
          <span className="eyebrow text-[#c8992f]">
            Support for carers and families
          </span>
          <h2 className="display-section mt-6 max-w-3xl text-white">
            The people around you need support too.
          </h2>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/70">
            {carers?.description}
          </p>
          <div className="mt-10 flex max-w-3xl flex-wrap gap-3">
            {(carers?.covers ?? []).map((c) => (
              <PillLink key={c} dark>
                {c}
              </PillLink>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DEMO B ═══════════════════════════════════════════════════════ */}
      <Marker id="B" title="The wave at full strength, below the hero" />

      <section className="relative overflow-hidden bg-canvas py-24 md:py-36">
        {/* hero-grade wave passing behind the heading */}
        <ResourceWave
          variant={3}
          className="absolute inset-x-0 top-1/2 h-[340px] -translate-y-1/2 md:h-[440px]"
        />
        <div className="container-wide relative z-10">
          <h2 className="display-statement max-w-4xl text-ink">
            Find your way through it.
          </h2>
          <p className="mt-8 max-w-md text-[17px] leading-relaxed text-ink/75">
            The hero&rsquo;s wave used as a full-strength graphic between
            sections — not a 10%-opacity hairline.
          </p>
        </div>
      </section>

      {/* and as a thick divider band between two colour bands */}
      <section className="bg-[#f6f4ee] py-14 md:py-16">
        <div className="container-wide">
          <p className="max-w-md text-[17px] leading-relaxed text-ink/70">
            &hellip;and cropped into a deep divider band below, at the same
            paint strength as the hero:
          </p>
        </div>
      </section>
      <div className="relative h-[180px] overflow-hidden bg-canvas md:h-[240px]">
        <ResourceWave
          variant={2}
          className="absolute inset-x-0 top-1/2 h-[300px] -translate-y-1/2 md:h-[380px]"
        />
      </div>

      {/* ══ DEMO C ═══════════════════════════════════════════════════════ */}
      <Marker id="C" title="Imagery per module — Granola-style cards" />

      <section className="bg-canvas py-20 md:py-28">
        <div className="container-wide">
          <h2 className="display-section max-w-2xl text-ink">
            Guides that feel like a hand on your shoulder.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                img: "/demo/hands.jpg",
                alt: "Two people's hands resting together on a kitchen table",
                area: carers,
              },
              {
                img: "/demo/garden.jpg",
                alt: "A quiet spring garden with a bench under beech trees",
                area: emotional,
              },
              {
                img: "/demo/walk.jpg",
                alt: "Two people walking together down a woodland path",
                area: prep,
              },
            ].map(({ img, alt, area }) => (
              <Link
                key={img}
                href={area?.href ?? "/resources"}
                className="group overflow-hidden rounded-[1.75rem] border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_-12px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(0,0,0,0.04),0_20px_50px_-12px_rgba(6,28,70,0.18)]"
              >
                <div className="overflow-hidden">
                  <Image
                    src={img}
                    alt={alt}
                    width={1600}
                    height={1067}
                    sizes="(min-width: 768px) 30vw, 100vw"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-6 md:p-7">
                  <span className="eyebrow text-[#a9791a]">Guide</span>
                  <h3 className="mt-3 font-display text-[1.4rem] leading-tight text-ink">
                    {area?.label}
                  </h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-ink/65">
                    {area?.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent">
                    Read this
                    <span
                      aria-hidden
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DEMO D ═══════════════════════════════════════════════════════ */}
      <Marker id="D" title="Huge type moments below the fold" />

      <section className="bg-[#f6f4ee] py-24 md:py-36">
        <div className="container-wide">
          <p className="display-hero max-w-5xl text-ink">
            Support for every part of it.
          </p>
        </div>
      </section>

      <section className="bg-canvas py-20 md:py-28">
        <div className="container-wide">
          <p className="mb-14 max-w-md text-[15px] leading-relaxed text-ink-muted">
            &hellip;and section titles at Granola scale — the number small and
            gold, the title enormous, the description staying quiet:
          </p>
          {[
            { n: "01", area: cancerInfo },
            { n: "02", area: sideEffects },
          ].map(({ n, area }) => (
            <div
              key={n}
              className="border-t border-ink/10 py-12 first:border-t-0 md:py-16"
            >
              <div className="grid items-end gap-x-16 gap-y-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                <div>
                  <span className="label-tight tabular-nums text-[#a9791a]">
                    {n}
                  </span>
                  <h3 className="display-statement mt-4 text-ink">
                    {area?.label}
                  </h3>
                </div>
                <p className="max-w-sm pb-3 text-[17px] leading-relaxed text-ink/65">
                  {area?.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-[#111] px-6 py-5 text-white">
        <p className="font-mono text-[13px] text-white/80">
          End of demos. A · B · C · D — yes or no to each.
        </p>
      </div>
    </div>
  );
}
