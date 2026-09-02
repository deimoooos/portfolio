"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Wraps next-themes so `layout.tsx` can stay a Server Component.
 *
 * `attribute="class"` matches the `@custom-variant dark (&:is(.dark *))` that
 * shadcn wrote into globals.css — the dark palette keys off a `.dark` class on
 * <html>, not a media query.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      // We animate the swap ourselves via the View Transitions API; leaving
      // next-themes' own transition suppression on would fight it.
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
