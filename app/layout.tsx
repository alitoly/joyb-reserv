import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MotionProvider } from "@/components/motion-provider";

// Variable font: no `weight` here, so the whole 100-900 axis is available and
// the display type can actually go bold.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz", "WONK"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.joybresort.com"),
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
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "JoyB Resort",
    title: "JoyB Resort · A garden retreat in Zanzibar",
    description: "Seventeen comfortable rooms, a pool beneath the palms, and warm hospitality in Zanzibar.",
    images: [{ url: "/joyb_images/resort-twilight.jpg", width: 2560, height: 1707, alt: "JoyB Resort at twilight" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "JoyB Resort · A garden retreat in Zanzibar",
    description: "Seventeen comfortable rooms, a pool beneath the palms, and warm hospitality in Zanzibar.",
    images: ["/joyb_images/resort-twilight.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#123f4a",
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
      className={`${fraunces.variable} ${jakarta.variable} h-full`}
    >
      <body className="min-h-full bg-sand text-ink flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-green focus:px-5 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <MotionProvider>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </MotionProvider>
        <Analytics />
      </body>
    </html>
  );
}
