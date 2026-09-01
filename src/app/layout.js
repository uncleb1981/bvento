import { Geist, Geist_Mono, Instrument_Serif, Fraunces } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import SiteFooter from "@/components/SiteFooter";
import MainArea from "@/components/MainArea";

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
  title: "bvento — Bike Trading in Bentonville & Northwest Arkansas",
  description: "Trade bikes with local riders in Bentonville, Rogers, Springdale, and Fayetteville, AR. Browse listings, propose a trade, and add cash to balance the deal.",
  openGraph: {
    title: "bvento — Bike Trading in Bentonville & Northwest Arkansas",
    description: "Trade bikes with local riders across Northwest Arkansas. Browse listings, propose a trade, and add cash to balance any gap in value.",
    url: "https://bvento.com",
    siteName: "bvento",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "bvento — Bike Trading in Bentonville & Northwest Arkansas",
    description: "Trade bikes with local riders across Northwest Arkansas. Browse listings, propose a trade, and add cash to balance any gap in value.",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "bvento",
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
        <Script id="clarity-analytics" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "ybo3jfqop2");`}
        </Script>
        <Navbar />
        <MainArea>{children}</MainArea>
        <BottomNav />
        <Analytics />
        <SiteFooter />
      </body>
    </html>
  );
}
