"use client";

import { useEffect } from "react";
import { loadGsap } from "@/lib/gsap";
import { useMotionLevel } from "./Intensity";

// ─────────────────────────────────────────────────────────────────────────────
// The scroll choreography for /resources. One component, no markup: it finds
// the data-fx hooks the sections declare and wires them to the scroll.
//
// Everything is scrubbed — the scroll position is the clock — so every effect
// runs backwards under the reader's thumb and composes with the Lenis lerp.
//
// THE HOOKS
//   data-fx="draw"        SVG wave whose paths draw in across its trigger band
//   data-fx="drift"       panel that travels vertically at its own speed
//                         (data-drift="1.4" data-rot="-3" tune it)
//   data-fx="rise"        sheet/panel that rises, un-rotates and settles
//                         (data-rise-y="60" softens the travel;
//                          data-lock="top 80%" ends the scrub earlier so the
//                          element settles low in the viewport and stays put)
//   data-fx="fly"         card that slides in from its side (data-side;
//                         data-lock as above)
//   data-fx="parallax"    image moving slower than the page inside its frame
//                         (data-parallax="7" softens the amplitude)
//   data-pin-curtain      level 3: pins in place while the next sheet covers it
//   data-pin-shelf        level 3: section pins; data-shelf-track scrubs sideways
//
// ORDER MATTERS. Pins insert spacers that move everything below them, and
// ScrollTrigger resolves each trigger's start/end when it is created — so the
// pins are created FIRST, in document order, and everything else measures
// against the post-pin layout. Getting this wrong is not cosmetic: it is
// exactly the bug that made the M4/M5 demos render as permanently-finished
// static blocks (see the demo page's git history).
// ─────────────────────────────────────────────────────────────────────────────

export default function PageMotion() {
  const level = useMotionLevel();

  useEffect(() => {
    // Calm keeps the page architecture and drops the scroll choreography.
    if (level === 1) return;

    let cancelled = false;
    let ctx: { revert: () => void } | undefined;
    const cleanups: (() => void)[] = [];

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;

      // Layout settles after GSAP arrives — fonts and images all shift the
      // page, and stale measurements silently break short-range triggers.
      const refresh = () => ScrollTrigger.refresh();
      if (document.readyState !== "complete") {
        window.addEventListener("load", refresh, { once: true });
        cleanups.push(() => window.removeEventListener("load", refresh));
      }
      document.fonts?.ready.then(() => !cancelled && refresh()).catch(() => {});
      document.querySelectorAll("main img").forEach((img) => {
        if (!(img as HTMLImageElement).complete) {
          img.addEventListener("load", refresh, { once: true });
          cleanups.push(() => img.removeEventListener("load", refresh));
        }
      });

      const strong = level === 3;

      ctx = gsap.context(() => {
        const mm = gsap.matchMedia();

        // ── pins first: they change the page under everything below ──────
        if (strong) {
          mm.add(
            "(prefers-reduced-motion: no-preference) and (min-width: 768px)",
            () => {
              // The curtain: the statement holds still while the next sheet
              // slides up over it. pinSpacing false, so no spacer — the cover
              // is the next section's own travel.
              const curtain = document.querySelector<HTMLElement>(
                "[data-pin-curtain]",
              );
              if (curtain) {
                ScrollTrigger.create({
                  trigger: curtain,
                  start: "top top",
                  end: "bottom top",
                  pin: true,
                  pinSpacing: false,
                });
              }

              // The shelf: the pathways section pins and its track scrubs
              // sideways exactly as far as the reader scrolls.
              const shelf = document.querySelector<HTMLElement>(
                "[data-pin-shelf]",
              );
              const track = document.querySelector<HTMLElement>(
                "[data-shelf-track]",
              );
              if (shelf && track) {
                const distance = () =>
                  track.scrollWidth - shelf.clientWidth + 180;
                gsap.to(track, {
                  x: () => -distance(),
                  ease: "none",
                  scrollTrigger: {
                    trigger: shelf,
                    start: "top top",
                    end: () => `+=${distance()}`,
                    scrub: 0.5,
                    pin: true,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                  },
                });
              }
            },
          );
        }

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          // ── waves that draw themselves ──────────────────────────────────
          document
            .querySelectorAll<HTMLElement>("[data-fx='draw']")
            .forEach((band) => {
              const paths = band.querySelectorAll<SVGPathElement>(
                "path:not([filter])",
              );
              paths.forEach((p) => {
                const len = p.getTotalLength();
                p.style.strokeDasharray = `${len}`;
                p.style.strokeDashoffset = `${len}`;
              });
              gsap.to(paths, {
                strokeDashoffset: 0,
                ease: "none",
                stagger: 0.04,
                scrollTrigger: {
                  trigger: band,
                  start: "top 95%",
                  end: band.dataset.lock ?? "bottom 55%",
                  scrub: 0.6,
                },
              });
            });

          // ── panels drifting at their own speeds ─────────────────────────
          document
            .querySelectorAll<HTMLElement>("[data-fx='drift']")
            .forEach((el) => {
              const speed = Number(el.dataset.drift ?? 1) * (strong ? 1.5 : 1);
              const rot = Number(el.dataset.rot ?? 0) * (strong ? 1.4 : 1);
              gsap.fromTo(
                el,
                { y: 55 * speed, rotation: rot },
                {
                  y: -55 * speed,
                  rotation: 0,
                  ease: "none",
                  scrollTrigger: {
                    trigger: (el.closest("[data-drift-band]") ??
                      el) as HTMLElement,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 0.6,
                  },
                },
              );
            });

          // Opacity on rise and fly is TIME-based, not scrubbed — travel keeps
          // the scrub, the fade plays once on entry and reverses on exit.
          // Scrubbed opacity had two failure modes with no fix inside a scrub:
          // a reader who stopped mid-band was left reading parked half-opaque
          // text (ink-muted copy composites below the 4.5:1 AA floor under
          // ~0.9), and a hash-landing froze cards at 0.6 indefinitely — two
          // scrubbed triggers on one element also measure each other's
          // transforms. A 0.45s play-on-enter has neither problem, which is
          // exactly why the old time-based <Reveal> never showed either.

          // ── sheets rising and settling as they arrive ───────────────────
          document
            .querySelectorAll<HTMLElement>("[data-fx='rise']")
            .forEach((el) => {
              // A transformed ancestor turns position:fixed into
              // position:relative-to-ancestor — even an identity transform left
              // behind by a finished tween. The pinned shelf lives inside the
              // paper sheet at level 3, so that sheet must never be tweened:
              // its entrance there is the curtain, not the rise.
              if (strong && el.querySelector("[data-pin-shelf]")) return;
              // Optional per-element travel (data-rise-y); scale and rotation
              // soften in proportion so a short rise doesn't over-rotate.
              const yBase = strong ? 160 : 100;
              const yRise = Number(el.dataset.riseY ?? yBase);
              const soften = Math.min(1, yRise / yBase);
              gsap.fromTo(
                el,
                {
                  y: yRise,
                  scale: 1 - (strong ? 0.08 : 0.035) * soften,
                  rotation: (strong ? 1.6 : 0.7) * soften,
                },
                {
                  y: 0,
                  scale: 1,
                  rotation: 0,
                  ease: "none",
                  scrollTrigger: {
                    trigger: el,
                    start: "top bottom",
                    end: el.dataset.lock ?? "top 45%",
                    scrub: 0.5,
                  },
                },
              );
              gsap.fromTo(
                el,
                { opacity: 0.45 },
                {
                  opacity: 1,
                  duration: 0.45,
                  ease: "power2.out",
                  scrollTrigger: {
                    trigger: el,
                    start: "top 96%",
                    toggleActions: "play none none reverse",
                  },
                },
              );
            });

          // ── cards flying in from their sides ────────────────────────────
          document
            .querySelectorAll<HTMLElement>("[data-fx='fly']")
            .forEach((el) => {
              const fromLeft = el.dataset.side !== "right";
              // The travel is tunable (data-fly-x) and capped to 6vw, because
              // a fixed 70px is a third of a stacked mobile card — the words
              // themselves slid off the screen edge during the entrance. And
              // NOTE for authors: alternating sides only works when neighbours
              // are not side-by-side — opposite sides on adjacent grid columns
              // converge across the gutter and overlap mid-flight.
              const base = Number(el.dataset.flyX ?? (strong ? 130 : 70));
              gsap.fromTo(
                el,
                {
                  x: () =>
                    (fromLeft ? -1 : 1) *
                    Math.min(base, window.innerWidth * 0.06),
                  rotation: (fromLeft ? -1 : 1) * (strong ? 2.5 : 1.2),
                },
                {
                  x: 0,
                  rotation: 0,
                  ease: "none",
                  scrollTrigger: {
                    trigger: el,
                    start: "top 96%",
                    end: el.dataset.lock ?? "top 55%",
                    scrub: 0.5,
                    invalidateOnRefresh: true,
                  },
                },
              );
              gsap.fromTo(
                el,
                { opacity: 0.3 },
                {
                  opacity: 1,
                  duration: 0.45,
                  ease: "power2.out",
                  scrollTrigger: {
                    trigger: el,
                    start: "top 94%",
                    toggleActions: "play none none reverse",
                  },
                },
              );
            });

          // ── photography moving slower than the page ─────────────────────
          document
            .querySelectorAll<HTMLElement>("[data-fx='parallax']")
            .forEach((el) => {
              // Optional per-element amplitude (data-parallax, in yPercent).
              const amp = Number(el.dataset.parallax ?? 12);
              gsap.fromTo(
                el,
                { yPercent: -amp },
                {
                  yPercent: amp,
                  ease: "none",
                  scrollTrigger: {
                    trigger: (el.closest("[data-parallax-frame]") ??
                      el) as HTMLElement,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 0.5,
                  },
                },
              );
            });

          // ── level 3 only: the photo band un-crops to full bleed ─────────
          if (strong) {
            document
              .querySelectorAll<HTMLElement>("[data-fx-clip]")
              .forEach((el) => {
                gsap.fromTo(
                  el,
                  { clipPath: "inset(10% 7% 10% 7% round 2.5rem)" },
                  {
                    clipPath: "inset(0% 0% 0% 0% round 0rem)",
                    ease: "none",
                    scrollTrigger: {
                      trigger: el,
                      start: "top 90%",
                      end: "top 25%",
                      scrub: 0.5,
                    },
                  },
                );
              });
          }
        });
      });

      // Everything is wired; measure once more against the finished layout.
      refresh();
    });

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
      ctx?.revert();
    };
  }, [level]);

  return null;
}
