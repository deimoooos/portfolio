import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { MarginTexture } from "@/components/margin-texture";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rosendo Coquilla Jr — Software Engineer",
  description: "Personal portfolio and selected work.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* pt-20 reserves the 80px the floating dock no longer takes in flow: it
          is `top-4` plus the Dock's own 58px height, rounded up to the spacing
          scale. Derived from the dock like `ACTIVATION_LINE` and the sections'
          `scroll-mt-32` — move the dock and all three move. */}
      <body className="flex min-h-full flex-col pt-20">
        {/* Keyboard users can jump the nav; visible only once focused. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:ring-3 focus:ring-ring/50"
        >
          Skip to content
        </a>
        <ThemeProvider>
          {/* Decorative only, and behind everything — mounted here so both
              routes get the same margins rather than only the landing page. */}
          <MarginTexture />
          <SiteHeader />
          {children}
        </ThemeProvider>

        {/* Vercel Analytics. Renders nothing; it injects the collection script
            and reports route changes. Only active on a Vercel deployment — off
            a Vercel host it no-ops, so local builds are unaffected. */}
        <Analytics />
      </body>
    </html>
  );
}
