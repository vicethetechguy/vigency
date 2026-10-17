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
  title: "Vigency — Digital Skills for Students & Graduates",
  description:
    "Discover practical digital skills with Vigency. Explore design, web development, data, marketing, and AI learning pathways for college, polytechnic, university students, graduates, and postgraduates.",
  metadataBase: new URL("https://vigency.co"),
  openGraph: {
    title: "Vigency — Your Future. Your Skills. Your Advantage.",
    description: "Build practical digital skills, create real projects, and grow with a community of ambitious students and graduates.",
    images: ["/assets/students-campus.jpg"],
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

