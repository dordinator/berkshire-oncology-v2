import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";
import { site } from "@/content/site";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageLoader from "@/components/PageLoader";
import MotionProvider from "@/components/MotionProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const displaySerif = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal"],
  variable: "--font-display",
  display: "swap",
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
    <html lang="en-GB" className={`${inter.variable} ${displaySerif.variable}`}>
      <body className="bg-canvas font-sans text-ink antialiased">
        <MotionProvider>
          <PageLoader />
          <SmoothScroll />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}
