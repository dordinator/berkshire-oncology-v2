/* ═══════════════════════════════════════════════════════════════════════════
   TEMPORARY — TYPEFACE COMPARISON DEVICE. DELETE WHEN A PAIRING IS CHOSEN.
   ───────────────────────────────────────────────────────────────────────────
   Ten title/subtitle pairings, switchable from the control in the bottom-right
   corner. The choice is stored in localStorage so it survives navigation, and
   applies to every page — headings use --font-display, everything else
   --font-sans, and both are remapped per pairing in src/app/layout.tsx.

   To retire it once a pairing is chosen:
     1. In src/app/layout.tsx keep only that pairing's two next/font imports,
        set their `variable` to `--font-display` and `--font-sans` directly,
        and delete the generated <style> block and the other eighteen fonts.
     2. Delete <FontToggle /> from the layout, src/components/dev/FontToggle.tsx
        and this file.
   Nothing else in the site references any of it — the rest of the code only
   ever says `font-display` or `font-sans`.

   Note: this loads twenty families. That is deliberate for a comparison tool
   and is precisely why it should not survive the decision.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface FontSet {
  id: string;
  /** Shown in the toggle. */
  name: string;
  /** The two families, for the toggle's second line. */
  note: string;
  /** CSS custom properties declared by next/font in the layout. */
  display: string;
  sans: string;
  /**
   * Weight for headings, when the default is wrong for this face.
   *
   * The serif pairings are fine at the weights already in the markup. A
   * geometric sans is not: at 400–500 a sans title reads as body copy that
   * happens to be large, and the whole point of these pairings is the heavier,
   * more graphic title. 600 is deliberately a step below the ~800 of the
   * Proton International reference, which is heavier than a cancer practice
   * probably wants.
   */
  displayWeight?: number;
}

export const FONT_SETS: FontSet[] = [
  {
    id: "house",
    name: "House",
    note: "Newsreader · Inter",
    display: "--f-newsreader",
    sans: "--f-inter",
  },
  {
    id: "editorial",
    name: "Editorial",
    note: "Instrument Serif · Instrument Sans",
    display: "--f-instrument-serif",
    sans: "--f-instrument-sans",
  },
  {
    id: "couture",
    name: "Couture",
    note: "Bodoni Moda · Manrope",
    display: "--f-bodoni",
    sans: "--f-manrope",
  },
  {
    id: "classical",
    name: "Classical",
    note: "Cormorant Garamond · Jost",
    display: "--f-cormorant",
    sans: "--f-jost",
  },
  {
    id: "journal",
    name: "Journal",
    note: "Playfair Display · Source Sans 3",
    display: "--f-playfair",
    sans: "--f-source-sans",
  },
  {
    id: "humanist",
    name: "Humanist",
    note: "Spectral · IBM Plex Sans",
    display: "--f-spectral",
    sans: "--f-plex-sans",
  },
  {
    id: "contemporary",
    name: "Contemporary",
    note: "Fraunces · Figtree",
    display: "--f-fraunces",
    sans: "--f-figtree",
  },
  {
    id: "academic",
    name: "Academic",
    note: "EB Garamond · Work Sans",
    display: "--f-eb-garamond",
    sans: "--f-work-sans",
  },
  {
    id: "clinical",
    name: "Clinical",
    note: "Source Serif 4 · Public Sans",
    display: "--f-source-serif",
    sans: "--f-public-sans",
  },
  {
    id: "literary",
    name: "Literary",
    note: "Literata · Karla",
    display: "--f-literata",
    sans: "--f-karla",
  },
  // The two below title in a bold geometric sans rather than a serif — the
  // "Cancers we treat" reference. Plus Jakarta Sans is the closest free match
  // to that specimen (double-storey a, angled t, open apertures); Outfit is
  // the more strictly geometric take on the same idea.
  {
    id: "direct",
    name: "Direct",
    note: "Plus Jakarta Sans · Inter",
    display: "--f-jakarta",
    sans: "--f-inter",
    displayWeight: 600,
  },
  {
    id: "geometric",
    name: "Geometric",
    note: "Outfit · Inter",
    display: "--f-outfit",
    sans: "--f-inter",
    displayWeight: 600,
  },
  {
    id: "clinic",
    name: "Clinic",
    note: "Figtree · Inter",
    display: "--f-figtree",
    sans: "--f-inter",
    displayWeight: 700,
  },
  {
    id: "broad",
    name: "Broad",
    note: "Manrope · Inter",
    display: "--f-manrope",
    sans: "--f-inter",
    displayWeight: 700,
  },
];

/** What a visitor sees before touching the toggle — the current site faces. */
export const DEFAULT_FONT_SET = "house";

export const FONT_SET_STORAGE_KEY = "bop:fontset";
