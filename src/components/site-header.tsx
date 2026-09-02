"use client";

import { Briefcase, House, Layers, Mail, type LucideIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { LinkedInIcon } from "@/components/icons";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dock, DockIcon } from "@/components/ui/dock";
import { Separator } from "@/components/ui/separator";
import { NAV_ITEMS } from "@/lib/nav";
import { profile } from "@/lib/profile";
import { cn } from "@/lib/utils";

/**
 * The y-position a section's top must cross to count as "current".
 *
 * Sections carry `scroll-mt-32` (128px), so an anchor jump parks their top
 * around there. The line has to sit just below that, or a section you jumped
 * straight to would never register as active.
 *
 * "Around" rather than "exactly": the landing sections sit inside a `[data-rise]`
 * wrapper that is still mid-transform while the smooth scroll runs, so the
 * browser aims at a position the element then moves away from. Measured landings
 * ran 66-83px against an 80px margin — the error is why the margin now clears
 * the dock by more than the error is wide.
 */
const ACTIVATION_LINE = 136;

/**
 * One icon per nav id. Kept here rather than on `NAV_ITEMS` so `nav.ts` stays a
 * plain data module with no React imports — same split as `TECH_ICONS`.
 * A missing entry renders the label alone rather than a hole.
 */
const NAV_ICONS: Record<string, LucideIcon> = {
  top: House,
  experience: Briefcase,
  tech: Layers,
  contact: Mail,
};

const noopSubscribe = () => () => {};

/**
 * True only after hydration.
 *
 * The server cannot know the resolved theme, so the two renders would disagree.
 * `useSyncExternalStore` states that difference explicitly — unlike a
 * `useState` + `useEffect` flag, which trips React 19's `set-state-in-effect`
 * rule.
 */
function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/**
 * True once the page has scrolled at all.
 *
 * Separate from `useActiveSection`, which is gated to the landing page — the
 * dock has to firm up on every route.
 */
function useScrolled() {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const compute = () => {
      frame = 0;
      setHasScrolled(window.scrollY > 8);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return hasScrolled;
}

/**
 * Tracks which section the reader is currently in.
 *
 * Deliberately scroll-based rather than an IntersectionObserver: the last
 * section can never reach the middle of the viewport once the page bottom is
 * hit, so an observer band leaves the final nav item permanently unreachable.
 * Instead we take the last section whose top has passed under the header, and
 * fall back to what the reader asked for when scrolling bottoms out. Reads are
 * throttled to one per animation frame to keep the scroll handler cheap.
 *
 * `enabled` is false anywhere but the landing page. The sections it looks for
 * only exist there, and left running on a sub-route it would report nonsense:
 * every `getElementById` misses so it falls back to the first item, and
 * scrolling to the bottom would light up the *last* item instead.
 *
 * Returns the active id and a way to record an explicit request for one.
 */
function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string>(NAV_ITEMS[0].id);

  /**
   * The section the reader last asked for, and the tie-break at the page foot.
   *
   * The page is short enough that jumping to a late section scrolls the whole
   * way to the end: `#tech` stops part-way down the viewport instead of at the
   * activation line, with `#contact` on screen below it. The scroll position is
   * then *identical* whichever of the two was clicked, so no amount of geometry
   * can tell them apart — only the click can. A ref rather than state: it never
   * renders on its own, it only decides the next measurement.
   */
  const requested = useRef<string | null>(null);
  const measure = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // A hash counts as a request too: arriving from `/experience`, or on a
    // shared `/#tech` link, has to read the same as a click. Only overwritten
    // when it names a real item, so a click whose URL has not landed yet keeps
    // whatever it just recorded.
    const hash = window.location.hash.slice(1);
    if (NAV_ITEMS.some((item) => item.id === hash)) requested.current = hash;

    let frame = 0;

    const compute = () => {
      frame = 0;
      const doc = document.documentElement;
      // `scrollable` matters: on a viewport tall enough to show the whole page,
      // "bottomed out" is true at rest, which would light up the last nav item
      // while the reader is looking at the top.
      const scrollable = doc.scrollHeight > window.innerHeight + 4;
      const bottomedOut =
        scrollable && window.innerHeight + window.scrollY >= doc.scrollHeight - 2;

      if (bottomedOut) {
        setActive(requested.current ?? NAV_ITEMS[NAV_ITEMS.length - 1].id);
        return;
      }

      let current = NAV_ITEMS[0].id;
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= ACTIVATION_LINE) {
          current = item.id;
        }
      }
      setActive(current);
    };
    measure.current = compute;

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(compute);
    };

    /*
     * A scroll the reader performs themselves retires the request — from then
     * on the page bottom means the last section again. It listens for the input
     * rather than for `scroll` on purpose: `html` is `scroll-behavior: smooth`,
     * so a click fires scroll events all the way down, and releasing on those
     * would drop the request before the page had finished arriving.
     */
    const release = () => {
      requested.current = null;
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("wheel", release, { passive: true });
    window.addEventListener("touchmove", release, { passive: true });
    window.addEventListener("keydown", release);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      measure.current = null;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchmove", release);
      window.removeEventListener("keydown", release);
    };
  }, [enabled]);

  /**
   * Record what the reader asked for, then re-measure by hand: clicking while
   * the page is already at the bottom moves nothing, so no scroll event follows
   * and the dock would otherwise never update.
   */
  const request = useCallback((id: string) => {
    requested.current = id;
    measure.current?.();
  }, []);

  return [active, request] as const;
}

export function SiteHeader() {
  const pathname = usePathname();
  const onLanding = pathname === "/";
  const [scrolled, request] = useActiveSection(onLanding);

  // On the landing page the scroll position decides; anywhere else the route
  // does. `/experience` lines up with the nav item of the same id — keep that
  // correspondence when adding routes, or the header goes blank on them.
  const active = onLanding
    ? scrolled
    : NAV_ITEMS.find((item) => pathname.startsWith(`/${item.id}`))?.id;

  const hasScrolled = useScrolled();
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useHydrated();

  return (
    /*
     * Magic UI's `Dock` — a magnifying macOS-style dock — in place of the
     * hand-rolled pill.
     *
     * `top-4` + `h-16` puts the bottom edge at **80px**, not the 64px the old
     * pill sat at. `ACTIVATION_LINE` (136), the sections' `scroll-mt-32`
     * (128px) and `body`'s `pt-20` (80px) are all derived from that edge —
     * change the dock's height and all three have to move with it.
     *
     * The wrapper spans the viewport only to centre the dock, so it must not
     * eat clicks: `pointer-events-none` here, restored on the dock itself.
     */
    <header
      data-site-header
      className="pointer-events-none fixed inset-x-0 top-4 z-40 flex justify-center px-4"
    >
      <Dock
        /* `Dock` renders a plain motion.div, so the <nav> landmark the pill had
           has to come from these. Without it the four section links sit in no
           landmark at all, and "skip to navigation" has nothing to find. The
           theme toggle and LinkedIn link live inside it too, which is a slight
           stretch of the role but better than dropping the landmark. */
        role="navigation"
        aria-label="Main"
        direction="middle"
        iconSize={40}
        // 48, not Magic UI's 60: the dock is `h-16` with `p-2`, so 48px is
        // exactly the content box. At their default the magnified tile is 60px
        // in a 42px box and spills through the top and bottom edges — which
        // reads as intended on a macOS dock at the bottom of the screen, and as
        // broken on one pinned to the top.
        iconMagnification={48}
        iconDistance={120}
        className={cn(
          // `mt-0` cancels the component's own `mt-8`, which would drop the
          // dock 32px below where `top-4` puts it.
          // `h-16` over the component's `h-[58px]`: see `iconMagnification`.
          // It also puts the bottom edge on exactly the 80px `body` reserves.
          "pointer-events-auto mt-0 h-16 max-w-full gap-1 rounded-full border p-2",
          /*
           * Magic UI's own fill is `bg-white/10` / `dark:bg-black/10` — raw
           * palette colours, which this project does not use, and nearly
           * invisible in light mode. Same surface, border and shadow treatment
           * as the pill it replaces: `shadow-foreground/…` rather than a fixed
           * black, because `--foreground` flips per theme, so one class casts a
           * drop shadow on light and a soft halo on dark.
           */
          "border-foreground/10 backdrop-blur-xl",
          "transition-[background-color,box-shadow] duration-300",
          hasScrolled
            ? "bg-surface/95 shadow-2xl shadow-foreground/20"
            : "bg-surface/90 shadow-xl shadow-foreground/15",
        )}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          const Icon = NAV_ICONS[item.id];
          return (
            <DockIcon
              key={item.id}
              className={cn(
                // `relative` so the link below can cover the whole circle.
                // `DockIcon` applies its padding as an inline style, which no
                // class can override, and a link confined inside it had a 24px
                // hit area in a 40px target.
                "relative transition-colors duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
              )}
            >
              {/* Rooted at `/`, not a bare `#id`: from a sub-route a bare
                  fragment would resolve against that route and go nowhere. */}
              <Link
                href={`/#${item.id}`}
                // The dock's own tie-break at the page foot; see
                // `useActiveSection`. Navigation is the Link's job, not
                // this handler's.
                onClick={() => request(item.id)}
                aria-current={isActive ? "location" : undefined}
                title={item.label}
                className="absolute inset-0 flex items-center justify-center rounded-full focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                {/* Half the circle, so the glyph grows with the magnification
                    instead of sitting at a fixed size inside a growing tile. */}
                {Icon && <Icon aria-hidden="true" className="size-1/2" />}
                {/* The dock is icon-only, so this is the link's *only*
                    accessible name. `sr-only`, never `hidden`: `display: none`
                    would strip it from the accessibility tree and leave four
                    unnamed links. `title` gives sighted readers the same word
                    on hover. */}
                <span className="sr-only">{item.label}</span>
              </Link>
            </DockIcon>
          );
        })}

        {/*
         * Splits the dock into its two jobs: navigating the page on the left,
         * acting on it on the right. `Dock` passes any child that is not a
         * `DockIcon` straight through, so this does not magnify.
         *
         * Centred with `my-auto`, not `self-center`: the primitive's
         * `data-vertical:self-stretch` is behind an attribute selector, so it
         * outranks a plain utility on specificity and left the rule flush
         * against the top edge.
         *
         * `bg-foreground/…` rather than `bg-border`, for the same reason the
         * dock's own edge uses it: measured against the dock fill, 1.41:1 in
         * light and 1.52:1 in dark, where `bg-border` would have given 1.21 and
         * 1.31 — legible, but fainter than the dock's own outline.
         */}
        <Separator
          orientation="vertical"
          className="mx-1 my-auto h-6 bg-foreground/15"
        />

        <DockIcon className="relative text-muted-foreground transition-colors duration-200 hover:bg-muted/70 hover:text-foreground">
          {/* Magic UI owns the transition. Driven in *controlled* mode so
              next-themes stays the single source of truth: passing `theme`
              stops the component writing localStorage itself. `resolvedTheme`
              is undefined until next-themes resolves, and undefined would flip
              it back to uncontrolled — hence the hydration gate.
              No `aria-label`: the component renders its own sr-only name, and
              an aria-label would override it. */}
          <AnimatedThemeToggler
            theme={hydrated && resolvedTheme === "dark" ? "dark" : "light"}
            onThemeChange={setTheme}
            disabled={!hydrated}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              // Covers and scales with the magnifying box; the cva above sizes
              // to a fixed `size-9`, which would not.
              "absolute inset-0 size-auto rounded-full [&_svg]:size-1/2",
            )}
          />
        </DockIcon>

        <DockIcon className="relative text-muted-foreground transition-colors duration-200 hover:bg-muted/70 hover:text-primary">
          {/* Icon-only, so the `aria-label` is the *only* accessible name it
              has — without it the link announces as nothing but its URL. It
              carries the new-tab warning too, since there is no visible text
              left to hold it. */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="absolute inset-0 size-auto rounded-full"
          >
            <a
              href={profile.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile (opens in a new tab)"
              title="LinkedIn"
            >
              <LinkedInIcon className="size-1/2" />
            </a>
          </Button>
        </DockIcon>
      </Dock>
    </header>
  );
}
