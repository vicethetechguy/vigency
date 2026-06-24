import type { Metadata, Viewport } from "next";
import { Montserrat, Space_Grotesk } from "next/font/google";
import "./globals.css";

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vigency AI Prompt System — Create Any Graphic Design",
  description:
    "Create professional flyers, social creatives, promo banners and more with one prompt and a reference.",
  metadataBase: new URL("https://vigency.co"),
  openGraph: {
    title: "Create Any Graphic Design With One Prompt",
    description: "The premium AI prompt system for production-ready visuals.",
    images: ["/assets/design-collage.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${space.variable} ${montserrat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
