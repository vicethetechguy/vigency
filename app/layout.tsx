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
  title: "Vigency — Buy Spyda Credits | Fund Your AI Wallet",
  description:
    "Buy Spyda Credits instantly. Pick your tier, pay securely, and receive a single-use coupon code to fund your Spyda Wallet for AI-powered generations.",
  metadataBase: new URL("https://vigency.co"),
  openGraph: {
    title: "Buy Spyda Credits — Fund Your AI Wallet",
    description: "Pick your tier. Pay securely. Get a single-use Spyda coupon code. Power your AI generations.",
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
