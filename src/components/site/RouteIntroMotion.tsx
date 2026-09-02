"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

// Keep page changes in the same motion vocabulary as the Fees hero: a short
// stagger, 28px of upward travel, and the site's soft deceleration curve.
const DURATION = 700;
const DELAY = 50;
const STAGGER = 90;
const EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
const MAX_ITEMS = 12;

function findIntroRoot(main: HTMLElement, heading: HTMLElement) {
  let node = heading.parentElement;
  let fallback = node;

  while (node && node !== main) {
    fallback = node;
    if (node.querySelector("p, a, button")) return node;
    node = node.parentElement;
  }

  return fallback ?? main;
}

function hasExistingEntrance(element: HTMLElement, introRoot: HTMLElement) {
  let node: HTMLElement | null = element;

  while (node) {
    const opacity = Number.parseFloat(window.getComputedStyle(node).opacity);
    // Framer Motion's Reveal and the bespoke Fees hero both render their
    // initial opacity before layout effects run. Leaving those nodes alone
    // avoids stacking two entrance animations on the same text.
    if (Number.isFinite(opacity) && opacity < 0.98) return true;
    if (node === introRoot) break;
    node = node.parentElement;
  }

  return false;
}

function getIntroItems(main: HTMLElement) {
  const heading = main.querySelector<HTMLElement>("h1");
  if (!heading) return [];

  const introRoot = findIntroRoot(main, heading);
  const blockHeadingParts = Array.from(
    heading.querySelectorAll<HTMLElement>(":scope > span"),
  ).filter((part) => window.getComputedStyle(part).display === "block");

  const candidates = Array.from(
    introRoot.querySelectorAll<HTMLElement>(
      "h1, p, li, a, button, [data-route-intro-item]",
    ),
  );

  if (blockHeadingParts.length > 0) {
    const headingIndex = candidates.indexOf(heading);
    if (headingIndex >= 0) {
      candidates.splice(headingIndex, 1, ...blockHeadingParts);
    }
  }

  // If a list item or paragraph contains a link, animate the readable block
  // once instead of moving both the parent and its child independently.
  const topLevelCandidates = candidates.filter(
    (candidate) =>
      !candidates.some(
        (possibleParent) =>
          possibleParent !== candidate && possibleParent.contains(candidate),
      ),
  );

  return topLevelCandidates
    .filter((element) => {
      if (element.closest("[aria-hidden='true'], [hidden]")) return false;
      if (hasExistingEntrance(element, introRoot)) return false;

      const style = window.getComputedStyle(element);
      if (style.display === "none" || style.visibility === "hidden") return false;
      // Do not replace a deliberate, static transform on an individual item.
      if (style.transform !== "none") return false;

      const rect = element.getBoundingClientRect();
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom > 0 &&
        rect.top < window.innerHeight * 0.94
      );
    })
    .slice(0, MAX_ITEMS);
}

/**
 * Adds one consistent entrance to the opening copy on every route. It is
 * intentionally DOM-only and wrapper-free: transforming a page wrapper would
 * change the containing block for the site's sticky and fixed experiences.
 */
export default function RouteIntroMotion() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const main = document.getElementById("main-content");
    if (!main) return;

    const animations = getIntroItems(main).map((element, index) =>
      element.animate(
        [
          { opacity: 0, transform: "translate3d(0, 28px, 0)" },
          { opacity: 1, transform: "translate3d(0, 0, 0)" },
        ],
        {
          duration: DURATION,
          delay: DELAY + index * STAGGER,
          easing: EASING,
          fill: "backwards",
        },
      ),
    );

    return () => animations.forEach((animation) => animation.cancel());
  }, [pathname]);

  return null;
}
