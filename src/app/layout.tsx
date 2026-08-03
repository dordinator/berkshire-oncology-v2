import type { Metadata } from "next";
import {
  Bodoni_Moda,
  Cormorant_Garamond,
  EB_Garamond,
  Figtree,
  Fraunces,
  IBM_Plex_Sans,
  Instrument_Sans,
  Instrument_Serif,
  Inter,
  Jost,
  Karla,
  Literata,
  Manrope,
  Newsreader,
  Outfit,
  Playfair_Display,
  Plus_Jakarta_Sans,
  Public_Sans,
  Source_Sans_3,
  Source_Serif_4,
  Spectral,
  Work_Sans,
} from "next/font/google";
import "./globals.css";
import { site } from "@/content/site";
import { FONT_SETS, DEFAULT_FONT_SET } from "@/content/fontsets";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageLoader from "@/components/PageLoader";
import MotionProvider from "@/components/MotionProvider";
import FontToggle from "@/components/dev/FontToggle";

// ── TEMPORARY: twenty families for the typeface comparison toggle ────────────
// Ten title/subtitle pairings, listed in src/content/fontsets.ts, which also
// documents how to strip this back to the single chosen pair. Each font
// declares its own custom property; the <style> block below points
// --font-display / --font-sans at whichever pair is selected. The rest of the
// site only ever refers to `font-display` and `font-sans`, so nothing else is
// aware any of this exists.
// Every option is written out in full: next/font calls are analysed statically
// at build time, so their arguments must be literals — a shared `common` object
// spread into each call fails with "Unexpected spread".
const fNewsreader = Newsreader({ subsets: ["latin"], display: "swap", variable: "--f-newsreader" });
const fInter = Inter({ subsets: ["latin"], display: "swap", variable: "--f-inter" });

const fInstrumentSerif = Instrument_Serif({ subsets: ["latin"], display: "swap", weight: ["400"], variable: "--f-instrument-serif" });
const fInstrumentSans = Instrument_Sans({ subsets: ["latin"], display: "swap", variable: "--f-instrument-sans" });

const fBodoni = Bodoni_Moda({ subsets: ["latin"], display: "swap", variable: "--f-bodoni" });
const fManrope = Manrope({ subsets: ["latin"], display: "swap", variable: "--f-manrope" });

const fCormorant = Cormorant_Garamond({ subsets: ["latin"], display: "swap", weight: ["300", "400", "500", "600", "700"], variable: "--f-cormorant" });
const fJost = Jost({ subsets: ["latin"], display: "swap", variable: "--f-jost" });

const fPlayfair = Playfair_Display({ subsets: ["latin"], display: "swap", variable: "--f-playfair" });
const fSourceSans = Source_Sans_3({ subsets: ["latin"], display: "swap", variable: "--f-source-sans" });

const fSpectral = Spectral({ subsets: ["latin"], display: "swap", weight: ["300", "400", "500", "600"], variable: "--f-spectral" });
const fPlexSans = IBM_Plex_Sans({ subsets: ["latin"], display: "swap", weight: ["300", "400", "500", "600"], variable: "--f-plex-sans" });

const fFraunces = Fraunces({ subsets: ["latin"], display: "swap", variable: "--f-fraunces" });
const fFigtree = Figtree({ subsets: ["latin"], display: "swap", variable: "--f-figtree" });

const fEbGaramond = EB_Garamond({ subsets: ["latin"], display: "swap", variable: "--f-eb-garamond" });
const fWorkSans = Work_Sans({ subsets: ["latin"], display: "swap", variable: "--f-work-sans" });

const fSourceSerif = Source_Serif_4({ subsets: ["latin"], display: "swap", variable: "--f-source-serif" });
const fPublicSans = Public_Sans({ subsets: ["latin"], display: "swap", variable: "--f-public-sans" });

const fLiterata = Literata({ subsets: ["latin"], display: "swap", variable: "--f-literata" });
const fKarla = Karla({ subsets: ["latin"], display: "swap", variable: "--f-karla" });

// Bold geometric sans titles — both pair back to Inter for body copy.
const fJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], display: "swap", variable: "--f-jakarta" });
const fOutfit = Outfit({ subsets: ["latin"], display: "swap", variable: "--f-outfit" });

const fontVariables = [
  fNewsreader, fInter,
  fInstrumentSerif, fInstrumentSans,
  fBodoni, fManrope,
  fCormorant, fJost,
  fPlayfair, fSourceSans,
  fSpectral, fPlexSans,
  fFraunces, fFigtree,
  fEbGaramond, fWorkSans,
  fSourceSerif, fPublicSans,
  fLiterata, fKarla,
  fJakarta, fOutfit,
]
  .map((f) => f.variable)
  .join(" ");

/**
 * Generated from FONT_SETS so the two lists cannot drift apart. The default
 * pairing is emitted on :root as well, so the page renders in the right faces
 * before the toggle's effect has run — no flash of the wrong typeface.
 */
const fontSetCss = (() => {
  const fallbackDisplay = "Georgia, serif";
  const fallbackSans = "system-ui, sans-serif";
  const rule = (set: (typeof FONT_SETS)[number]) =>
    `--font-display: var(${set.display}), ${fallbackDisplay}; --font-sans: var(${set.sans}), ${fallbackSans};`;

  /**
   * Weight override for the sans-titled pairings. It targets the display
   * utility and the headings rather than every element, and only for the
   * pairings that ask for it — the serif options keep the weights already in
   * the markup. Scoped to the temporary toggle so no component has to know.
   */
  const weightRule = (set: (typeof FONT_SETS)[number]) =>
    set.displayWeight
      ? `:root[data-fontset="${set.id}"] .font-display,` +
        `:root[data-fontset="${set.id}"] h1,` +
        `:root[data-fontset="${set.id}"] h2,` +
        `:root[data-fontset="${set.id}"] h3` +
        `{font-weight:${set.displayWeight};}`
      : "";

  const base = FONT_SETS.find((s) => s.id === DEFAULT_FONT_SET) ?? FONT_SETS[0];
  return [
    `:root{${rule(base)}}`,
    ...FONT_SETS.map((s) => `:root[data-fontset="${s.id}"]{${rule(s)}}`),
    ...FONT_SETS.map(weightRule),
  ].join("");
})();

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.strapline}`,
    template: `%s | ${site.name}`,
  },
  description:
    "Berkshire Oncology Partnership is a group of ten consultant oncologists providing private cancer care in Reading, Berkshire and the surrounding area — at Spire Dunedin, GenesisCare and Princess Margaret hospitals.",
  keywords: [
    "private oncology Reading",
    "consultant oncologist Berkshire",
    "private cancer care Reading",
    "clinical oncologist Reading",
    "medical oncologist Berkshire",
    "chemotherapy Reading",
    "radiotherapy Reading",
    "Berkshire Oncology Partnership",
  ],
  authors: [{ name: site.name }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.strapline}`,
    description:
      "Private cancer care in Reading, Berkshire — ten consultant oncologists across Spire Dunedin, GenesisCare and Princess Margaret hospitals.",
    url: site.url,
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.strapline}`,
    description: "Private cancer care in Reading, Berkshire.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB" className={fontVariables}>
      <head>
        {/* TEMPORARY — see src/content/fontsets.ts */}
        <style dangerouslySetInnerHTML={{ __html: fontSetCss }} />
      </head>
      <body className="bg-canvas font-sans text-ink antialiased">
        {/* The mega-menu opens each panel on focus, so tabbing across the bar
            walks a keyboard user through every link in the site before they
            reach the page. This is the way past it. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-white"
        >
          Skip to content
        </a>
        <MotionProvider>
          <PageLoader />
          <SmoothScroll />
          <Navbar />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          {/* TEMPORARY — see src/content/fontsets.ts */}
          <FontToggle />
        </MotionProvider>
      </body>
    </html>
  );
}
