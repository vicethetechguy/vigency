import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { MotionProvider } from "@/components/ui";
import "./globals.css";

/*
 * BRAND FONT — TRIAL
 * Montserrat is used everywhere in the app: body text, headings and buttons.
 * Both CSS variables below point at Montserrat, so every `font-body`,
 * `font-display` and plain text element picks it up.
 *
 * To go back to the previous setup (system font for reading text,
 * Inter Tight for headings), delete the Montserrat block below and
 * uncomment the "OLD SETUP" block. Nothing else needs to change.
 */
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});
const fontVariables = montserrat.variable;

/* OLD SETUP — system font for reading text, Inter Tight for headings
import { Inter_Tight } from "next/font/google";

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});
const fontVariables = interTight.variable;
// …then in globals.css set:
//   --font-body: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
//   --font-display: var(--font-heading), var(--font-body);
*/

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
    <html lang="en" className={fontVariables}>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
