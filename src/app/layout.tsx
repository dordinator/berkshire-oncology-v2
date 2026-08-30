import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { site } from "@/content/site";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FooterContactCta from "@/components/site/FooterContactCta";
import MotionProvider from "@/components/MotionProvider";
import CopyReviewEditor from "@/components/site/CopyReviewEditor";
import HomepageReturnState from "@/components/site/HomepageReturnState";

// Outfit for titles, Inter for everything else — chosen from the comparison
// toggle that used to live here. Outfit is a geometric sans, so headings are
// set at 600 rather than the 400/500 a serif wanted; that weight is applied in
// globals.css so every heading gets it, not just the ones that ask.
const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

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
    <html lang="en-GB" className={`${outfit.variable} ${inter.variable}`}>
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
          <SmoothScroll />
          <HomepageReturnState />
          <Navbar />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <FooterContactCta />
          <Footer />
        </MotionProvider>
        <CopyReviewEditor />
      </body>
    </html>
  );
}
