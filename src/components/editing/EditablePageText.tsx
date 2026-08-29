"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type SavedTextNode = {
  path: number[];
  text: string;
};

type SaveStatus = "idle" | "dirty" | "saved" | "error";

const STORAGE_PREFIX = "berkshire-oncology:editable-copy:";

function editableTextNodes(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!node.nodeValue?.trim() || !parent) return NodeFilter.FILTER_REJECT;
      if (
        parent.closest(
          'script, style, svg, [aria-hidden="true"], [data-text-editor-exclude]',
        )
      ) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes: Text[] = [];
  let node = walker.nextNode();
  while (node) {
    nodes.push(node as Text);
    node = walker.nextNode();
  }
  return nodes;
}

function pathFromRoot(node: Node, root: HTMLElement) {
  const path: number[] = [];
  let current: Node | null = node;

  while (current && current !== root) {
    const parent: Node | null = current.parentNode;
    if (!parent) return null;
    path.unshift(Array.prototype.indexOf.call(parent.childNodes, current));
    current = parent;
  }

  return current === root ? path : null;
}

function nodeFromPath(root: HTMLElement, path: number[]) {
  let current: Node = root;
  for (const index of path) {
    const next: ChildNode | undefined = current.childNodes[index];
    if (!next) return null;
    current = next;
  }
  return current;
}

function placeCaretAtPoint(root: HTMLElement, x: number, y: number) {
  const editableDocument = document as Document & {
    caretPositionFromPoint?: (
      x: number,
      y: number,
    ) => { offsetNode: Node; offset: number } | null;
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
  };
  const position = editableDocument.caretPositionFromPoint?.(x, y);
  const range = position
    ? document.createRange()
    : editableDocument.caretRangeFromPoint?.(x, y) ?? null;

  if (position && range) {
    range.setStart(position.offsetNode, position.offset);
    range.collapse(true);
  }
  if (!range || !root.contains(range.startContainer)) return;

  root.focus();
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

export default function EditablePageText({
  children,
  storageKey,
}: {
  children: ReactNode;
  storageKey: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const enabled = process.env.NODE_ENV === "development";
  const fullStorageKey = `${STORAGE_PREFIX}${storageKey}`;

  useEffect(() => {
    if (!enabled || !rootRef.current) return;

    try {
      const saved = window.localStorage.getItem(fullStorageKey);
      if (!saved) return;

      const entries = JSON.parse(saved) as SavedTextNode[];
      if (!Array.isArray(entries)) return;

      for (const entry of entries) {
        if (
          !entry ||
          !Array.isArray(entry.path) ||
          !entry.path.every(Number.isInteger) ||
          typeof entry.text !== "string"
        ) {
          continue;
        }

        const node = nodeFromPath(rootRef.current, entry.path);
        if (node?.nodeType === Node.TEXT_NODE) node.nodeValue = entry.text;
      }

      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }, [enabled, fullStorageKey]);

  useEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root) return;

    // Links are copy while this editor is active. Removing href in development
    // lets a click place the caret in the label instead of navigating away.
    const disableLinks = () => {
      root.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((link) => {
        link.dataset.textEditorHref = link.getAttribute("href") ?? "";
        link.removeAttribute("href");
      });
    };

    disableLinks();
    const observer = new MutationObserver(disableLinks);
    observer.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["href"],
    });

    return () => {
      observer.disconnect();
      root
        .querySelectorAll<HTMLAnchorElement>("a[data-text-editor-href]")
        .forEach((link) => {
          link.setAttribute("href", link.dataset.textEditorHref ?? "");
          delete link.dataset.textEditorHref;
        });
    };
  }, [enabled]);

  const save = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    try {
      const entries = editableTextNodes(root).flatMap((node) => {
        const path = pathFromRoot(node, root);
        return path ? [{ path, text: node.nodeValue ?? "" }] : [];
      });
      window.localStorage.setItem(fullStorageKey, JSON.stringify(entries));
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }, [fullStorageKey]);

  if (!enabled) return children;

  const label =
    status === "saved"
      ? "Saved"
      : status === "error"
        ? "Could not save"
        : "Save text";

  return (
    <>
      <button
        type="button"
        onClick={save}
        data-text-editor-exclude
        className={`fixed right-4 top-24 z-[90] rounded-full border px-5 py-3 text-sm font-semibold shadow-[0_12px_35px_-14px_rgba(6,28,70,0.45)] backdrop-blur-md transition-colors sm:right-6 sm:top-28 ${
          status === "saved"
            ? "border-[#5c7767]/25 bg-[#e4eee9]/95 text-[#385044]"
            : status === "error"
              ? "border-red-900/15 bg-red-50/95 text-red-900"
              : "border-white/80 bg-ink/95 text-white hover:bg-accent focus-visible:bg-accent"
        }`}
        title="Save the Patients page text in this browser"
      >
        {label}
      </button>

      <div
        ref={rootRef}
        contentEditable
        suppressContentEditableWarning
        spellCheck
        onInput={() => setStatus("dirty")}
        onPointerDownCapture={(event) => {
          const target = event.target as Element;
          if (!target.closest("a")) return;
          event.preventDefault();
          event.stopPropagation();
          placeCaretAtPoint(rootRef.current!, event.clientX, event.clientY);
        }}
        onClickCapture={(event) => {
          const target = event.target as Element;
          if (!target.closest("a")) return;
          event.preventDefault();
          event.stopPropagation();
        }}
        className="caret-accent"
      >
        {children}
      </div>
    </>
  );
}
