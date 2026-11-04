import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter_Tight, Instrument_Serif } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const sans = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  variable: "--font-inter-tight",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
  display: "swap",
});

// Solo la usa Tarifas: no se precarga en el resto de la web.
const condensed = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas-neue",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s — ${site.name}` },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: site.name,
    title: site.name,
    description: site.description,
    images: [{ url: "/media/brand/og.jpg", width: 1200, height: 630, alt: site.name }],
  },
  twitter: { card: "summary_large_image", images: ["/media/brand/og.jpg"] },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  viewportFit: "cover",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-scroll-behavior="smooth" className={`${sans.variable} ${serif.variable} ${condensed.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
