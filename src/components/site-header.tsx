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
import { Separator } from "@/components/ui/separator";
import { NAV_ITEMS } from "@/lib/nav";
import { profile } from "@/lib/profile";
import { cn } from "@/lib/utils";

/**
 * The y-position a section's top must cross to count as "current".
 *
 * Sections carry `scroll-mt-28` (112px), so an anchor jump parks their top
 * around there. The line has to sit just below that, or a section you jumped
 * straight to would never register as active.
 *
 * "Around" rather than "exactly": the landing sections sit inside a `[data-rise]`
 * wrapper that is still mid-transform while the smooth scroll runs, so the
 * browser aims at a position the element then moves away from. Measured landings
 * ran 66-83px against an 80px margin — the error is why the margin now clears
 * the dock by more than the error is wide.
 */
const ACTIVATION_LINE = 120;

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

function navLinkClass(isActive: boolean) {
  return cn(
    "flex flex-col items-center justify-center gap-1 rounded-full transition-colors duration-200",
    // Icon-only on mobile at the same 32px as the toggle beside it; icon over
    // label from `sm` up. Both stay inside the dock's 48px, so its bottom edge
    // remains at 64px, which is what the sections' scroll margin is derived from.
    "size-8 sm:size-auto sm:px-3 sm:py-1.5",
    "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
    // Filled pill rather than an underline — an underline reads as a stray line
    // inside a rounded dock. Weight changes with it, so colour is never the
    // only signal.
    isActive
      ? "bg-primary/10 font-medium text-primary"
      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
  );
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
     * A floating dock rather than a full-width bar.
     *
     * `top-4` + `h-12` puts its bottom edge at 64px — deliberately the same as
     * the bar it replaced. `ACTIVATION_LINE` (120) and the sections'
     * `scroll-mt-28` (112px) are both derived from that edge, so moving the dock
     * means re-deriving both.
     *
     * The wrapper spans the viewport only to centre the pill, so it must not
     * eat clicks: `pointer-events-none` here, restored on the pill itself.
     */
    <header
      data-site-header
      className="pointer-events-none fixed inset-x-0 top-4 z-40 flex justify-center px-4"
    >
      <div
        className={cn(
          "pointer-events-auto flex h-12 max-w-full items-center gap-0.5 rounded-full border px-2",
          // `border-foreground/…`: a crisper edge than `--surface-border`, and
          // it flips with the theme like the shadow below does.
          "border-foreground/10 backdrop-blur-xl sm:gap-1",
          "transition-[background-color,box-shadow] duration-300",
          /*
           * `shadow-foreground/…` rather than a fixed black: `--foreground` is
           * near-black in light and near-white in dark, so the same class casts
           * a drop shadow on light and a soft halo on dark. A black shadow is
           * invisible against the dark canvas, which is what made this read
           * flat before.
           */
          hasScrolled
            ? "bg-surface/95 shadow-2xl shadow-foreground/20"
            : "bg-surface/90 shadow-xl shadow-foreground/15",
        )}
      >
        {/* Sections */}
        <nav aria-label="Main">
          <ul className="flex items-center gap-0.5 sm:gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = active === item.id;
              const Icon = NAV_ICONS[item.id];
              return (
                <li key={item.id}>
                  {/* Rooted at `/`, not a bare `#id`: from a sub-route a bare
                      fragment would resolve against that route and go nowhere. */}
                  <Link
                    href={`/#${item.id}`}
                    // The dock's own tie-break at the page foot; see
                    // `useActiveSection`. Navigation is the Link's job, not
                    // this handler's.
                    onClick={() => request(item.id)}
                    aria-current={isActive ? "location" : undefined}
                    className={navLinkClass(isActive)}
                  >
                    {Icon && (
                      <Icon aria-hidden="true" className="size-4 shrink-0" />
                    )}
                    {/* `sr-only`, NOT `hidden`: on mobile the label is the
                        link's only accessible name, and `display: none` would
                        remove it from the tree entirely. */}
                    <span className="sr-only text-[0.6875rem] leading-none sm:not-sr-only">
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/*
         * Splits the dock into its two jobs: navigating the page on the left,
         * acting on it on the right.
         *
         * The height is explicit because the primitive ships `self-stretch`,
         * and a rule the full 48px of the dock cuts the pill in half instead of
         * separating two groups.
         *
         * Centred with `my-auto`, not `self-center`: that `self-stretch` is
         * behind an attribute selector, so it outranks a plain utility on
         * specificity and left the rule flush against the top edge. Auto
         * cross-axis margins take the free space whatever `align-self` says.
         *
         * `bg-foreground/…` rather than `bg-border`, for the same reason the
         * dock's own edge uses it. Measured against the dock fill: 1.41:1 in
         * light and 1.52:1 in dark, where `bg-border` would have given 1.21 and
         * 1.31 — legible, but fainter than the pill's own outline.
         */}
        <Separator
          orientation="vertical"
          className="mx-1 my-auto h-5 bg-foreground/15 sm:mx-1.5 sm:h-6"
        />

        {/* Controls */}
        <div className="flex items-center gap-0.5">
          {/* Magic UI owns the transition. Driven in *controlled* mode so
              next-themes stays the single source of truth: passing `theme`
              stops the component writing localStorage itself. `resolvedTheme`
              is undefined until next-themes resolves, and undefined would flip
              it back to uncontrolled — hence the hydration gate. */}
          <AnimatedThemeToggler
            theme={hydrated && resolvedTheme === "dark" ? "dark" : "light"}
            onThemeChange={setTheme}
            disabled={!hydrated}
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          />

          {/* Sits to the right of the theme toggle. Icon-only, so the
              `aria-label` is the *only* accessible name it has — without it the
              link announces as nothing but its URL. It carries the new-tab
              warning too, since there is no visible text left to hold it.
              `size="icon"` matches the toggle beside it. */}
          <Button variant="ghost" size="icon" asChild>
            <a
              href={profile.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile (opens in a new tab)"
              className="text-muted-foreground hover:text-primary"
            >
              <LinkedInIcon className="size-4 shrink-0" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
