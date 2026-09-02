import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { TechBadge } from "@/components/tech-badge";
import { Separator } from "@/components/ui/separator";
import { profile, techStacks } from "@/lib/profile";

export const metadata: Metadata = {
  title: `Tech stack — ${profile.name}`,
  description: `Technologies ${profile.name} works with, grouped by area.`,
};

/**
 * `SiteFooter` prints the current year, which would otherwise freeze at
 * whatever year the build ran in.
 */
export const revalidate = 86400;

/**
 * The full toolkit, grouped.
 *
 * The landing page shows only the handful flagged `featured` in `techStacks`;
 * everything else is here. Groups render in the order they are declared in
 * `@/lib/profile`, and an empty one is skipped rather than left as a bare
 * heading — so deleting a group's items is enough to remove it.
 */
export default function TechStackPage() {
  const groups = techStacks.filter((group) => group.items.length > 0);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6">
      <main
        id="main"
        className="relative isolate flex flex-col gap-8 pt-12 pb-20 sm:pt-16 sm:pb-28"
      >
        {/* Same wash as the landing hero, so the routes read as one site. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 -z-10 size-[26rem] rounded-full bg-glow blur-3xl"
        />
        {/* The eyebrow doubles as the page's <h1>, same as `/experience`: it is
            the only heading above the groups, and a page with no h1 leaves the
            category <h2>s hanging off nothing. */}
        <h1 className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Tech stack
        </h1>

        <ul data-rise
          className="flex flex-col">
          {groups.map((group, index) => {
            const id = group.category.toLowerCase().replace(/\s+/g, "-");

            return (
              <li key={group.category}>
                {index > 0 && <Separator className="my-6" />}
                {/* Baseline-aligned, not top-aligned: the category heading and
                    the badges have different line-heights, so matching box
                    tops leaves them off by a few pixels. */}
                <section
                  aria-labelledby={`${id}-heading`}
                  className="grid scroll-mt-28 items-baseline gap-x-8 gap-y-3 sm:grid-cols-[10rem_1fr]"
                >
                  <h2 id={`${id}-heading`} className="text-sm font-medium">
                    {group.category}
                  </h2>

                  <ul className="flex flex-wrap gap-2">
                    {group.items.map((tech) => (
                      <li key={tech.name}>
                        <TechBadge tech={tech.name} />
                      </li>
                    ))}
                  </ul>
                </section>
              </li>
            );
          })}
        </ul>
      </main>

      <SiteFooter />
    </div>
  );
}
