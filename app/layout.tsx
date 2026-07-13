import type { Metadata, Viewport } from "next";
import { Marcellus, Mulish } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const marcellus = Marcellus({
  variable: "--font-marcellus",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "JoyB Resort · Quiet garden retreat in Zanzibar",
    template: "%s · JoyB Resort",
  },
  description:
    "A peaceful garden retreat in the heart of Zanzibar, minutes from the airport. Calm, comfortable rooms, warm Swahili hospitality, and easy online booking.",
  keywords: [
    "JoyB Resort",
    "Zanzibar hotel",
    "Zanzibar resort",
    "Zanzibar guesthouse",
    "garden retreat Zanzibar",
    "near Zanzibar airport",
    "Tanzania",
  ],
};

export const viewport: Viewport = {
  themeColor: "#3f6f35",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${marcellus.variable} ${mulish.variable} h-full`}
    >
      <body className="min-h-full bg-sand text-ink flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-green focus:px-5 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
