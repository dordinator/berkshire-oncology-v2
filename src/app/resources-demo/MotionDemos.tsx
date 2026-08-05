"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsap";
import { getSection } from "@/content/navigation";
import ResourceWave from "@/components/sections/links/ResourceWave";

// ─────────────────────────────────────────────────────────────────────────────
// MOTION DEMOS — the moving half of /resources-demo.
//
// Everything here is scroll-SCRUBBED, not played once: the animation's clock is
// the scroll position itself, so it runs forwards and backwards under the
// reader's thumb and composes with the floaty Lenis lerp instead of fighting
// it. GSAP ScrollTrigger drives all five; Lenis is already wired to
// ScrollTrigger.update in src/lib/gsap.ts. No new dependencies.
//
// M1  Panels drifting at different speeds as the page scrolls
// M2  Parallax photography inside a full-bleed band
// M3  A pinned chapter: the page scrolls, the card track translates sideways
// M4  The wave drawing itself in, over slower parallax wave layers
// M5  A panel that rises, un-rotates and settles as it enters (Granola's move)
//
// Reduced motion: every effect sits inside a prefers-reduced-motion:
// no-preference matchMedia block — with it set, the page is simply static.
// ─────────────────────────────────────────────────────────────────────────────

const areas = (getSection("resources")?.groups ?? []).flatMap((g) => g.links);

function Marker({ id, title }: { id: string; title: string }) {
  return (
    <div className="bg-[#111] px-6 py-3 text-white">
      <span className="font-mono text-[12px] uppercase tracking-[0.2em]">
        Demo {id} — {title}
      </span>
    </div>
  );
}

export default function MotionDemos() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!root.current) return;
    let cancelled = false;
    let ctx: { revert: () => void } | undefined;

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled || !root.current) return;

      // ── THE PIN CHANGES THE PAGE UNDER EVERYTHING BELOW IT ───────────────
      // M3 pins a section and scrolls it sideways. Pinning inserts a spacer —
      // here 2,912px of it — so every section after M3 really sits ~2,912px
      // further down the document than it did a moment earlier.
      //
      // ScrollTrigger resolves each trigger's start/end once, when the tween is
      // created. Create M4 and M5 before the pin exists and their numbers are
      // computed against the pre-spacer layout: M4's "top 90%" resolved to a
      // scroll position ~2,900px too early, so by the time the wave band was
      // genuinely on screen the tween had long since hit progress 1. That is
      // why M4 rendered as an already-drawn static wave and M5 as an
      // already-settled static panel — not "no animation", but an animation
      // that finished off-screen before you ever reached it.
      //
      // Two things fix it, and both are worth having:
      //   1. Create the pin FIRST, so the spacer exists before anything below
      //      it measures itself. (See the mm.add ordering below.)
      //   2. Re-measure after layout settles anyway — fonts and images still
      //      land after the dynamic GSAP import and shift everything again.
      const refresh = () => ScrollTrigger.refresh();
      if (document.readyState !== "complete") {
        window.addEventListener("load", refresh, { once: true });
      }
      document.fonts?.ready.then(refresh).catch(() => {});
      root.current.querySelectorAll("img").forEach((img) => {
        if (!img.complete) img.addEventListener("load", refresh, { once: true });
      });

      ctx = gsap.context(() => {
        const mm = gsap.matchMedia();

        // ── M3: pinned horizontal track — desktop only ────────────────────
        // The section pins while the track translates sideways exactly as far
        // as the reader scrolls, then releases. Phones get a native snap
        // scroller instead: pinning steals the thumb's vertical gesture.
        mm.add(
          "(prefers-reduced-motion: no-preference) and (min-width: 768px)",
          () => {
            const pin = root.current!.querySelector<HTMLElement>("[data-pin]");
            const track = root.current!.querySelector<HTMLElement>("[data-track]");
            if (!pin || !track) return;
            const distance = () => track.scrollWidth - pin.clientWidth + 160;
            gsap.to(track, {
              x: () => -distance(),
              ease: "none",
              scrollTrigger: {
                trigger: pin,
                start: "top top",
                end: () => `+=${distance()}`,
                scrub: 0.5,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            });
          },
        );
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          // ── M1: cards drifting at their own speeds ──────────────────────
          // Each card's translate is proportional to its data-drift while its
          // band crosses the viewport, so the three move relative to each
          // other — the page stops being one rigid sheet.
          gsap.utils.toArray<HTMLElement>("[data-drift]").forEach((el) => {
            const speed = Number(el.dataset.drift ?? 1);
            const rot = Number(el.dataset.rot ?? 0);
            gsap.fromTo(
              el,
              { y: 90 * speed, rotation: rot },
              {
                y: -90 * speed,
                rotation: 0,
                ease: "none",
                scrollTrigger: {
                  trigger: el.closest("[data-drift-band]") as HTMLElement,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 0.6,
                },
              },
            );
          });

          // ── M2: parallax photograph ─────────────────────────────────────
          gsap.utils.toArray<HTMLElement>("[data-parallax-img]").forEach((el) => {
            gsap.fromTo(
              el,
              { yPercent: -14 },
              {
                yPercent: 14,
                ease: "none",
                scrollTrigger: {
                  trigger: el.closest("[data-parallax-frame]") as HTMLElement,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 0.5,
                },
              },
            );
          });

          // ── M4: the wave draws itself in ────────────────────────────────
          // Real dash lengths per path, scrubbed to zero as the band crosses
          // the middle of the screen. The two layers behind move sideways at
          // different rates for depth.
          const drawPaths = root.current!.querySelectorAll<SVGPathElement>(
            "[data-draw] path:not([filter])",
          );
          drawPaths.forEach((p) => {
            const len = p.getTotalLength();
            p.style.strokeDasharray = `${len}`;
            p.style.strokeDashoffset = `${len}`;
          });
          // A long range on purpose: the draw is the whole point of M4, so it
          // should occupy most of the band's travel rather than finishing in
          // the first 80px.
          gsap.to(drawPaths, {
            strokeDashoffset: 0,
            ease: "none",
            stagger: 0.04,
            scrollTrigger: {
              trigger: "[data-wave-band]",
              start: "top 90%",
              end: "bottom 55%",
              scrub: 0.6,
            },
          });
          gsap.fromTo(
            "[data-wave-back]",
            { xPercent: -7 },
            {
              xPercent: 5,
              ease: "none",
              scrollTrigger: {
                trigger: "[data-wave-band]",
                start: "top bottom",
                end: "bottom top",
                scrub: 0.9,
              },
            },
          );

          // ── M5: the rising panel ────────────────────────────────────────
          gsap.utils.toArray<HTMLElement>("[data-rise]").forEach((el) => {
            gsap.fromTo(
              el,
              { y: 190, scale: 0.88, rotation: 2.6, opacity: 0.3 },
              {
                y: 0,
                scale: 1,
                rotation: 0,
                opacity: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: el,
                  // Starts below the fold and finishes near the middle of the
                  // screen, so the settle happens where the reader is looking.
                  start: "top bottom",
                  end: "top 40%",
                  scrub: 0.5,
                },
              },
            );
          });
        });

      }, root);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  const trackAreas = areas.filter((a) => a.href.startsWith("/resources/"));

  return (
    <div ref={root}>
      {/* ══ M1 ═══════════════════════════════════════════════════════════ */}
      <Marker id="M1" title="Panels drifting at different speeds" />
      <section
        data-drift-band
        className="overflow-hidden bg-[#f6f4ee] py-28 md:py-40"
      >
        <div className="container-wide">
          <p className="max-w-md text-[15px] leading-relaxed text-ink-muted">
            Scroll through this band — the three panels travel at different
            speeds and the tilted ones settle level as they pass the middle.
          </p>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              { area: areas[0], drift: 1.4, rot: -3 },
              { area: areas[2], drift: 0.6, rot: 0 },
              { area: areas[4], drift: 1.9, rot: 3 },
            ].map(({ area, drift, rot }) => (
              <div
                key={area?.href}
                data-drift={drift}
                data-rot={rot}
                className="card-soft rounded-[1.75rem] p-7 will-change-transform md:p-8"
              >
                <span className="eyebrow text-[#a9791a]">Resource</span>
                <h3 className="mt-4 font-display text-[1.5rem] leading-tight text-ink">
                  {area?.label}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/65">
                  {area?.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ M2 ═══════════════════════════════════════════════════════════ */}
      <Marker id="M2" title="Parallax photography in a full-bleed band" />
      <section data-parallax-frame className="relative overflow-hidden">
        <div className="relative h-[380px] md:h-[480px]">
          <Image
            data-parallax-img
            src="/demo/garden.jpg"
            alt="A quiet spring garden with a bench under beech trees"
            fill
            sizes="100vw"
            className="scale-[1.3] object-cover will-change-transform"
          />
          <div className="absolute inset-0 bg-ink/35" />
          <div className="container-wide absolute inset-x-0 bottom-0 pb-14 md:pb-20">
            <span className="eyebrow text-[#e8c983]">
              Emotional and practical support
            </span>
            <h2 className="display-section mt-4 max-w-2xl text-white">
              The photograph moves slower than the page.
            </h2>
          </div>
        </div>
      </section>

      {/* ══ M3 ═══════════════════════════════════════════════════════════ */}
      <Marker id="M3" title="Pinned chapter — the page scrolls sideways" />
      {/* Desktop: pinned + scrubbed. */}
      <section data-pin className="hidden overflow-hidden bg-ink md:block">
        <div className="flex h-screen flex-col justify-center overflow-hidden">
          <div className="container-wide">
            <span className="eyebrow text-[#c8992f]">All eight areas</span>
            <h2 className="display-section mt-4 max-w-xl text-white">
              Keep scrolling — the shelf slides.
            </h2>
          </div>
          <div
            data-track
            className="mt-14 flex gap-6 pl-[max(1.5rem,calc((100vw-1400px)/2+4rem))] will-change-transform"
          >
            {trackAreas.map((area, i) => (
              <div
                key={area.href}
                className="w-[380px] shrink-0 rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-8 backdrop-blur-sm"
              >
                <span className="label-tight tabular-nums text-[#c8992f]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-[1.6rem] leading-tight text-white">
                  {area.label}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-white/60">
                  {area.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Phones: the same shelf as a native snap scroller. */}
      <section className="bg-ink py-16 md:hidden">
        <div className="px-6">
          <span className="eyebrow text-[#c8992f]">All eight areas</span>
          <h2 className="display-section mt-4 text-white">
            Swipe the shelf.
          </h2>
        </div>
        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4">
          {trackAreas.map((area, i) => (
            <div
              key={area.href}
              className="w-[290px] shrink-0 snap-start rounded-3xl border border-white/10 bg-white/[0.06] p-6"
            >
              <span className="label-tight tabular-nums text-[#c8992f]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-xl leading-tight text-white">
                {area.label}
              </h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-white/60">
                {area.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ M4 ═══════════════════════════════════════════════════════════ */}
      <Marker id="M4" title="The wave draws itself in as you reach it" />
      <section data-wave-band className="relative overflow-hidden bg-canvas">
        {/* slower layer behind, moving sideways for depth */}
        <div data-wave-back className="absolute inset-0 will-change-transform">
          <ResourceWave
            variant={1}
            className="absolute inset-x-[-10%] top-1/2 h-[300px] -translate-y-1/2 opacity-60 md:h-[380px]"
          />
        </div>
        <div data-draw className="relative">
          <ResourceWave
            variant={2}
            className="mx-auto h-[300px] w-full md:h-[420px]"
          />
        </div>
        <div className="container-wide pb-16 md:pb-20">
          <p className="max-w-md text-[15px] leading-relaxed text-ink-muted">
            The strands draw from left to right under your scroll — reverse it
            and they un-draw. The faint layer behind travels sideways at a
            different rate.
          </p>
        </div>
      </section>

      {/* ══ M5 ═══════════════════════════════════════════════════════════ */}
      <Marker id="M5" title="A panel that rises and settles as it enters" />
      <section className="overflow-hidden bg-[#f6f4ee] py-24 md:py-36">
        <div className="container-wide">
          <p className="max-w-md text-[15px] leading-relaxed text-ink-muted">
            Granola&rsquo;s signature move: the panel comes up from below,
            slightly rotated and small, and settles flat as it arrives.
          </p>
          <div
            data-rise
            className="mx-auto mt-14 max-w-3xl overflow-hidden rounded-[1.75rem] border border-black/[0.06] bg-white shadow-[0_2px_4px_rgba(0,0,0,0.04),0_28px_70px_-20px_rgba(6,28,70,0.25)] will-change-transform"
          >
            <div className="flex items-center gap-2 border-b border-black/[0.06] px-6 py-4">
              <span className="h-3 w-3 rounded-full bg-[#f0b8b0]" />
              <span className="h-3 w-3 rounded-full bg-[#f2d9a4]" />
              <span className="h-3 w-3 rounded-full bg-[#b5d4b0]" />
              <span className="ml-3 text-[13px] font-medium text-ink-muted">
                Preparing for your first appointment
              </span>
            </div>
            <div className="grid gap-8 p-8 md:grid-cols-[1fr_auto] md:p-10">
              <div>
                <span className="eyebrow text-[#a9791a]">Patient guide</span>
                <h3 className="mt-4 font-display text-[1.7rem] leading-tight text-ink">
                  What to bring, what to ask, what to expect.
                </h3>
                <ul className="mt-6 space-y-3">
                  {[
                    "Bring your referral letter and any scans you have",
                    "Bring someone with you — a second person hears more",
                    "Write your questions down before you arrive",
                  ].map((line) => (
                    <li
                      key={line}
                      className="flex gap-3 text-[15px] leading-relaxed text-ink/70"
                    >
                      <span aria-hidden className="mt-0.5 text-[#a9791a]">
                        —
                      </span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
              <Image
                src="/demo/hands.jpg"
                alt=""
                width={640}
                height={427}
                sizes="(min-width: 768px) 220px, 100vw"
                className="hidden aspect-square w-[220px] rounded-2xl object-cover md:block"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
