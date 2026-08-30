"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Overrides = Record<string, string>;

const TEXT_SELECTOR = [
  "h1",
  "h2",
  "h3",
  "h4",
  "p",
  "blockquote",
  "figcaption",
  "summary",
  "button",
  "a",
  "label",
  "dt",
  "dd",
  "li",
  "span",
].join(",");

function matchingElements(key: string) {
  return Array.from(
    document.querySelectorAll<HTMLElement>("[data-copy-key]"),
  ).filter((element) => element.dataset.copyKey === key);
}

function applyValue(key: string, value: string, source?: HTMLElement) {
  matchingElements(key).forEach((element) => {
    if (element !== source) element.textContent = value;
  });
}

function hash(value: string) {
  let result = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    result ^= value.charCodeAt(i);
    result = Math.imul(result, 16777619);
  }
  return (result >>> 0).toString(36);
}

function generatedKey(
  element: HTMLElement,
  root: HTMLElement,
  pathname: string,
) {
  const segments: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== root) {
    const parent: HTMLElement | null = current.parentElement;
    if (!parent) break;
    const siblings = Array.from(parent.children).filter(
      (sibling) => sibling.tagName === current?.tagName,
    );
    segments.unshift(
      `${current.tagName.toLowerCase()}${siblings.indexOf(current) + 1}`,
    );
    current = parent;
  }

  const page = pathname
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.|\.$/g, "") || "home";

  return `page.${page}.${hash(segments.join("."))}`;
}

function collectCopyFields(root: HTMLElement, pathname: string) {
  const explicit = Array.from(
    root.querySelectorAll<HTMLElement>("[data-copy-key]"),
  );

  const automatic = Array.from(
    root.querySelectorAll<HTMLElement>(TEXT_SELECTOR),
  ).filter((element) => {
    if (element.dataset.copyKey) return false;
    if (!element.textContent?.trim()) return false;
    if (element.getAttribute("aria-hidden") === "true") return false;
    if (element.classList.contains("sr-only")) return false;
    if (element.closest("[data-copy-editor-ignore]")) return false;

    // Editing a parent that contains icons, links or other text containers can
    // destroy their markup. Only add automatic editing to leaf text elements;
    // important compound homepage fields have explicit stable keys above.
    return Array.from(element.children).every(
      (child) => child.tagName === "BR",
    );
  });

  automatic.forEach((element) => {
    element.dataset.copyKey = generatedKey(element, root, pathname);
    element.dataset.copyAutoKey = "true";
  });

  return [...explicit, ...automatic];
}

export default function CopyReviewEditor() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState("Loading saved copy…");

  useEffect(() => {
    const enabled =
      new URLSearchParams(window.location.search).get("copy-review") === "1";
    setActive(enabled);

    let cancelled = false;
    const cleanups: Array<() => void> = [];

    async function save(element: HTMLElement) {
      const key = element.dataset.copyKey;
      const value = element.textContent?.replace(/\s+/g, " ").trim();
      if (!key || !value || element.dataset.copyDirty !== "true") return;

      setStatus("Saving…");

      try {
        const response = await fetch("/api/copy-review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value }),
        });
        const result = (await response.json()) as {
          saved?: boolean;
          error?: string;
        };

        if (!response.ok || !result.saved) {
          throw new Error(result.error ?? "The change could not be saved.");
        }

        element.dataset.copyDirty = "false";
        applyValue(key, value, element);
        setStatus(`Saved “${value.slice(0, 48)}${value.length > 48 ? "…" : ""}”`);
      } catch (error) {
        setStatus(
          error instanceof Error ? error.message : "The change could not be saved.",
        );
      }
    }

    async function start() {
      const root = document.getElementById("main-content");
      if (!root) return;

      const elements = collectCopyFields(root, pathname);

      try {
        const response = await fetch("/api/copy-review", { cache: "no-store" });
        const result = (await response.json()) as { overrides?: Overrides };
        if (cancelled) return;

        Object.entries(result.overrides ?? {}).forEach(([key, value]) => {
          applyValue(key, value);
        });

        if (!enabled) return;

        elements.forEach((element) => {
          element.contentEditable = "plaintext-only";
          element.spellcheck = true;
          element.dataset.copyDirty = "false";
          element.setAttribute(
            "aria-label",
            `Editable page copy: ${element.dataset.copyKey}`,
          );

          const onInput = () => {
            element.dataset.copyDirty = "true";
            setStatus("Unsaved change: click away or press Cmd/Ctrl+Enter");
          };
          const onBlur = () => void save(element);
          const onClick = (event: Event) => event.stopPropagation();
          const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              element.blur();
            }
          };
          const onPaste = (event: ClipboardEvent) => {
            event.preventDefault();
            document.execCommand(
              "insertText",
              false,
              event.clipboardData?.getData("text/plain") ?? "",
            );
          };

          element.addEventListener("input", onInput);
          element.addEventListener("blur", onBlur);
          element.addEventListener("click", onClick);
          element.addEventListener("keydown", onKeyDown);
          element.addEventListener("paste", onPaste);

          cleanups.push(() => {
            element.contentEditable = "false";
            element.removeAttribute("aria-label");
            delete element.dataset.copyDirty;
            element.removeEventListener("input", onInput);
            element.removeEventListener("blur", onBlur);
            element.removeEventListener("click", onClick);
            element.removeEventListener("keydown", onKeyDown);
            element.removeEventListener("paste", onPaste);
          });
        });

        setStatus(`${elements.length} editable fields ready on this page`);
      } catch {
        if (enabled) {
          setStatus("Saved copy could not be loaded. Refresh to try again.");
        }
      }
    }

    void start();

    return () => {
      cancelled = true;
      cleanups.forEach((cleanup) => cleanup());
      document
        .querySelectorAll<HTMLElement>("[data-copy-auto-key='true']")
        .forEach((element) => {
          delete element.dataset.copyKey;
          delete element.dataset.copyAutoKey;
        });
    };
  }, [pathname]);

  if (!active) return null;

  return (
    <div
      data-copy-editor-ignore
      className="fixed bottom-4 right-4 z-[100] max-w-sm rounded-2xl border border-violet-300 bg-violet-950 px-4 py-3 text-white shadow-2xl"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-violet-100">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Local copy editor
        </p>
        <a
          href={pathname}
          className="rounded-full border border-white/25 px-3 py-1 text-[11px] font-semibold text-white hover:bg-white/10"
        >
          Exit editor
        </a>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-white/80">
        Click dashed text to edit. Click away or press Cmd/Ctrl+Enter to save
        that field.
      </p>
      <p className="mt-2 border-t border-white/15 pt-2 text-xs text-violet-200">
        {status}
      </p>
    </div>
  );
}
