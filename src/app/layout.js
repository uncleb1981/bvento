import { Geist, Geist_Mono, Instrument_Serif, Fraunces } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal"],
});

export const metadata = {
  metadataBase: new URL("https://bvento.com"),
  title: "Bvento — Bike Trading in Bentonville & Northwest Arkansas",
  description: "Trade bikes with local riders in Bentonville, Rogers, Springdale, and Fayetteville, AR. Browse listings, propose a trade, and add cash to balance the deal.",
  openGraph: {
    title: "Bvento — Bike Trading in Bentonville & Northwest Arkansas",
    description: "Trade bikes with local riders across Northwest Arkansas. Browse listings, propose a trade, and add cash to balance any gap in value.",
    url: "https://bvento.com",
    siteName: "Bvento",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bvento — Bike Trading in Bentonville & Northwest Arkansas",
    description: "Trade bikes with local riders across Northwest Arkansas. Browse listings, propose a trade, and add cash to balance any gap in value.",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Bvento",
  url: "https://bvento.com",
  description: "Trade bikes with local riders in Bentonville, Rogers, Springdale, and Fayetteville, AR.",
  areaServed: [
    { "@type": "City", name: "Bentonville, AR" },
    { "@type": "City", name: "Rogers, AR" },
    { "@type": "City", name: "Springdale, AR" },
    { "@type": "City", name: "Fayetteville, AR" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Navbar />
        <main className="flex-1 pb-20 sm:pb-0">{children}</main>
        <BottomNav />
        <footer className="hidden sm:block border-t mt-12 py-10" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="max-w-6xl mx-auto px-4 text-center">
            <div className="font-serif italic text-2xl mb-1" style={{ color: 'var(--ink)' }}>bvento</div>
            <div className="text-xs mt-3" style={{ color: 'var(--ink-soft)', opacity: 0.6 }}>© 2026 Bvento</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
