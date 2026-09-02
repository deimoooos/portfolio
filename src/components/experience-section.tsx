import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { StartYear } from "@/components/duration";
import { Section } from "@/components/section";
import { companySpan, companyTypes, experience } from "@/lib/profile";
import { cn } from "@/lib/utils";

/**
 * Career history at a glance, newest first.
 *
 * Deliberately down to four facts per company: the year it started, the
 * employment basis, the most recent role held there, and the company itself.
 * Everything else — earlier roles, dates, durations, descriptions, highlights,
 * stacks — lives on `/experience`. Anything added back here erodes the reason
 * the second route exists.
 *
 * Content lives in `@/lib/profile` — edit it there, not here.
 */
export function ExperienceSection() {
  return (
    <Section
      id="experience"
      label="Experience"
      title=""
      action={
        <Link
          href="/experience"
          className="group inline-flex w-fit shrink-0 items-center gap-2 rounded-sm text-sm font-medium text-primary underline-offset-4 transition-colors duration-200 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          Full history
          <ArrowRight
            aria-hidden="true"
            className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>
      }
    >
      <ol className="-mx-4 flex flex-col gap-2">
        {experience.map((entry) => {
          // Roles are newest first, so the current one leads.
          const latest = entry.roles[0];

          return (
            <li key={entry.slug}>
              {/*
               * The whole row is the link, and it goes to that company's own
               * anchor on `/experience`. Those anchors already existed — every
               * entry carries `id={entry.slug}` there, documented as a
               * shareable deep link — but nothing in the UI reached them, so
               * the only way in was the section's action at the top.
               *
               * Before this the row was a plain <article> that still styled a
               * hover state: it looked interactive under a mouse, did nothing
               * when clicked, and on touch had no state at all. A recruiter
               * reading "Junior Software Architect" and wanting that one
               * company had to go back to the top of the list, leave for
               * `/experience`, and find it again.
               *
               * Whole row rather than a link around the title alone, so the
               * accessible name carries all four facts: "2023, Full-time,
               * Junior Software Architect, A-Movement Corporation" is exactly
               * what someone needs to know before activating it.
               *
               * Baseline-aligned, not top-aligned: the gutter and the role
               * title have different line-heights, so matching box tops leaves
               * their text off by a few pixels.
               */}
              <Link
                href={`/experience#${entry.slug}`}
                className={cn(
                  "group grid items-baseline gap-x-8 gap-y-1 rounded-xl border px-4 py-3.5 sm:grid-cols-[10rem_1fr]",
                  // `translate`, not `transform`: Tailwind v4 compiles
                  // `-translate-y-0.5` to the standalone `translate` property,
                  // so a transition list naming `transform` animates nothing
                  // and the lift snaps.
                  "border-transparent transition-[background-color,border-color,box-shadow,translate] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  // The lift matches the contact cards, which are this page's
                  // other clickable panel. `primary`, not `surface-border`:
                  // every hoverable surface here picks up the accent.
                  //
                  // The shadow is tinted with `foreground` rather than left at
                  // the default black, for the same reason the dock's is —
                  // `--foreground` flips per theme, so one class casts a drop
                  // shadow on light and a soft halo on dark, where a fixed
                  // black shadow is invisible against the dark canvas.
                  "hover:-translate-y-0.5 hover:border-primary/40 hover:bg-surface hover:shadow-md hover:shadow-foreground/10",
                  "focus-visible:-translate-y-0.5 focus-visible:border-primary/40 focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                )}
              >
                <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground tabular-nums">
                  {/*
                   * The row resolves left to right under the pointer: the year
                   * takes the accent first, the company name comes up to full
                   * strength at 60ms, the arrow at the far edge lands at 120ms.
                   * Small, but it makes the row read as one object answering
                   * rather than three elements changing at once.
                   *
                   * Every step of it *raises* contrast, and nothing dims — not
                   * here and not on the rows you are not pointing at. Receding
                   * the siblings is the usual way to focus a list and it would
                   * have taken the muted secondary text from 4.7:1 to about
                   * 2.6:1 for as long as the pointer was anywhere in it.
                   */}
                  <span className="transition-colors duration-300 group-hover:text-primary group-focus-visible:text-primary">
                    <StartYear start={companySpan(entry).start} />
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{companyTypes(entry).join(", ")}</span>
                </p>

                <div className="flex items-center gap-4">
                  <div className="min-w-0">
                    {/*
                     * The titles are the loudest thing in the section on
                     * purpose. The claim this page makes is a progression —
                     * Engineer to Senior to Architect to Lead to Assistant
                     * Manager — and it is carried by the titles rather than
                     * asserted in copy, so they take the section's largest type
                     * instead of sharing a size with body text.
                     */}
                    <h3 className="text-lg font-medium tracking-tight">
                      {latest.title}
                    </h3>
                    <p className="text-sm text-muted-foreground transition-colors delay-[60ms] duration-300 group-hover:text-foreground group-focus-visible:text-foreground">
                      {entry.company}
                    </p>
                  </div>

                  {/*
                   * Visible at rest, not revealed on hover. A hover-only
                   * affordance does not exist on a phone, and at 390px these
                   * rows were three blocks of plain text with nothing to say
                   * they were tappable. Muted at rest and accented on approach
                   * is the same contract the contact cards use.
                   *
                   * At the row's right edge rather than trailing the title:
                   * the row is full width, so an arrow tucked after the words
                   * leaves ~380px of empty panel to its right once the hover
                   * fill appears. Out here the three arrows line up into a
                   * right-hand column that answers the year column on the left.
                   * Inside the <h3> it also wrapped to a phantom second line on
                   * the longest title at 390px, which made that row 28px taller
                   * than its neighbours.
                   */}
                  <ArrowRight
                    aria-hidden="true"
                    className="ml-auto size-4 shrink-0 text-muted-foreground transition-[color,translate] delay-[120ms] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:text-primary group-focus-visible:translate-x-0.5 group-focus-visible:text-primary"
                  />
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
