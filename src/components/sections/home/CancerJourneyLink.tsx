"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { getLenis } from "@/components/SmoothScroll";

const RETURN_SCROLL_KEY = "berkshireCancerReturnScrollY";

/**
 * Remember the exact point in the homepage cancer chapter before leaving it.
 * Next's router normally restores this on Back, but Lenis can begin from its
 * own previous value before native restoration finishes. Keeping the value on
 * the homepage history entry makes the return deterministic.
 */
export function CancerReturnRestorer() {
  useEffect(() => {
    const saved = window.history.state?.[RETURN_SCROLL_KEY];
    if (typeof saved !== "number" || !Number.isFinite(saved)) return;

    const frame = window.requestAnimationFrame(() => {
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(saved, { immediate: true });
      else window.scrollTo({ top: saved, behavior: "auto" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return null;
}

export default function CancerJourneyLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  function rememberHomepagePosition() {
    window.history.replaceState(
      {
        ...window.history.state,
        [RETURN_SCROLL_KEY]: window.scrollY,
      },
      "",
      window.location.href,
    );
  }

  return (
    <Link href={href} className={className} onClick={rememberHomepagePosition}>
      {children}
    </Link>
  );
}
