import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import AutoResponder from "@/components/AutoResponder";

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

export const metadata = {
  title: "Bvento — A Better Way to Trade Up",
  description: "Bvento is a marketplace for trading bicycles — browse listings, propose a trade with cash to balance the deal, and close with local riders.",
  openGraph: {
    title: "Bvento — A Better Way to Trade Up",
    description: "Browse bikes, propose a trade with cash to balance any gap in value, and close with local riders.",
    url: "https://bvento.com",
    siteName: "Bvento",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bvento — A Better Way to Trade Up",
    description: "Browse bikes, propose a trade with cash to balance any gap in value, and close with local riders.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
        <AutoResponder />
        <Navbar />
        <main className="flex-1 pb-20 sm:pb-0">{children}</main>
        <BottomNav />
        <footer className="hidden sm:block border-t mt-12 py-10" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="max-w-6xl mx-auto px-4 text-center">
            <div className="font-serif text-2xl mb-1" style={{ color: 'var(--ink)' }}>Bvento</div>
            <div className="text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--ink-soft)' }}>A Better Way to Trade Up</div>
            <div className="text-xs mt-3" style={{ color: 'var(--ink-soft)', opacity: 0.6 }}>© 2026 Bvento</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
