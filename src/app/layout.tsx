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
            {/* pt-16 reserves the 64px the floating dock no longer takes in flow —
          exactly what the sticky bar used to occupy, so each page's own top
          padding keeps meaning what it meant. */}
      <body className="flex min-h-full flex-col pt-16">
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
