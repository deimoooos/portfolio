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
/** Category name to anchor id. One definition, used by the index and the groups. */
function groupId(category: string) {
  return category.toLowerCase().replace(/\s+/g, "-");
}

export default function TechStackPage() {
  const groups = techStacks.filter((group) => group.items.length > 0);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6">
      <main
        id="main"
        className="relative isolate flex flex-col gap-8 pt-12 pb-20 sm:pt-16 sm:pb-28"
      >
        {/* The eyebrow doubles as the page's <h1>, same as `/experience`: it is
            the only heading above the groups, and a page with no h1 leaves the
            category <h2>s hanging off nothing. */}
        <h1 className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Tech stack
        </h1>

        {/*
         * A jump list, and the reason the group ids exist at all.
         *
         * The group id was being computed only to label the heading
         * (`${id}-heading`) — the `<section>` itself carried none, so
         * `/tech-stack#backend` resolved to nothing despite the `scroll-mt-32`
         * sitting there ready for it. The id is now on the section, and this is
         * what uses it.
         *
         * On a thirty-item page the only way to find out whether Keycloak is
         * here was to read all of it. This gives the shape of the list up front
         * — how many groups, how big each one is — and a way into any of them.
         * Counts come from the data, so a group that grows or empties cannot
         * leave a stale number behind.
         */}
        <nav aria-label="Groups" className="flex flex-wrap gap-x-5 gap-y-2">
          {groups.map((group) => (
            <a
              key={group.category}
              href={`#${groupId(group.category)}`}
              className="group/jump inline-flex items-baseline gap-1.5 rounded-sm text-sm text-muted-foreground transition-colors duration-200 hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              {group.category}
              {/* The bare numeral is visual only. Run together in the
                  accessible name it reads "Frontend5", and a flex `gap` is not
                  a word separator — so the digits are hidden from assistive
                  tech and an `sr-only` phrase says what they count. */}
              <span
                aria-hidden="true"
                className="text-xs tabular-nums opacity-60"
              >
                {group.items.length}
              </span>
              <span className="sr-only">
                , {group.items.length} technolog
                {group.items.length === 1 ? "y" : "ies"}
              </span>
            </a>
          ))}
        </nav>

        <ul data-rise className="flex flex-col">
          {groups.map((group, index) => {
            const id = groupId(group.category);

            return (
              <li key={group.category}>
                {index > 0 && <Separator className="my-6" />}
                {/* Baseline-aligned, not top-aligned: the category heading and
                    the badges have different line-heights, so matching box
                    tops leaves them off by a few pixels. */}
                {/* `data-target-flash`: jumping here from the index above
                    pulses the group once, so the link says where it landed.
                    See `globals.css`. */}
                <section
                  id={id}
                  data-target-flash
                  aria-labelledby={`${id}-heading`}
                  className="grid scroll-mt-32 items-baseline gap-x-8 gap-y-3 sm:grid-cols-[10rem_1fr]"
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
