"use client";

import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsap";

/**
 * A single large sentence that resolves as the reader scrolls through it: the
 * words start at a low tint and come up to full ink one after another, tied to
 * scroll position rather than to a timer.
 *
 * Scrubbed rather than played, because a timed version finishes whether or not
 * anyone is still there — and the whole point is that the reader is setting the
 * pace. It also means the sentence reads correctly backwards, which is how a
 * good proportion of people will meet it.
 */
export default function Statement({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = children.split(" ");

  useEffect(() => {
    if (!ref.current) return;

    let cancelled = false;
    let ctx: { revert: () => void } | undefined;

    loadGsap().then(({ gsap }) => {
      if (cancelled || !ref.current) return;

      ctx = gsap.context(() => {
        // GSAP is outside MotionConfig's reach, so reduced motion is handled
        // here. matchMedia also reverts cleanly if the setting changes
        // mid-visit.
        const mm = gsap.matchMedia();

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            "[data-word]",
            { opacity: 0.15 },
            {
              opacity: 1,
              ease: "none",
              stagger: 0.35,
              scrollTrigger: {
                trigger: ref.current,
                start: "top 78%",
                end: "bottom 58%",
                scrub: 0.6,
              },
            }
          );
        });

        // Nothing to animate — just show the finished sentence.
        mm.add("(prefers-reduced-motion: reduce)", () => {
          gsap.set("[data-word]", { opacity: 1 });
        });
      }, ref);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [children]);

  return (
    <p ref={ref} className={`display-statement ${className}`}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} data-word className="inline-block text-ink">
          {word}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
