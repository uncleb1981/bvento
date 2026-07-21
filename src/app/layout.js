import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata = {
  title: "Bvento – Swipe. Match. Ride.",
  description: "A Tinder-style marketplace for trading bicycles — swipe on bikes, propose a trade with cash to balance the deal, and match with local riders.",
  openGraph: {
    title: "Bvento – Swipe. Match. Ride.",
    description: "Trade bikes with local riders. Swipe, match, and add cash to balance any deal.",
    url: "https://bvento.com",
    siteName: "Bvento",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bvento – Swipe. Match. Ride.",
    description: "Trade bikes with local riders. Swipe, match, and add cash to balance any deal.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
        <AutoResponder />
        <Navbar />
        <main className="flex-1 pb-20 sm:pb-0">{children}</main>
        <BottomNav />
        <footer className="hidden sm:block bg-white border-t border-gray-100 mt-12 py-10">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <div className="font-black text-lg mb-1" style={{ color: 'var(--brand-dark)' }}>Bvento</div>
            <div className="text-sm text-gray-400">Swipe. Match. Ride.</div>
            <div className="text-xs text-gray-300 mt-3">© 2026 Bvento</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
