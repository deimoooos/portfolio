import type { Metadata } from "next";

import { DateRange, Duration } from "@/components/duration";
import { SiteFooter } from "@/components/site-footer";
import { TechBadge } from "@/components/tech-badge";
import {
  companySpan,
  companyTypes,
  experience,
  profile,
} from "@/lib/profile";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: `Experience — ${profile.name}`,
  description: `Detailed career history for ${profile.name}, ${profile.role}.`,
};

/**
 * A current role has no end date, so its duration is computed when the page
 * renders. Without this the value would freeze at build time and quietly go
 * stale — a role would still read "3 years and 4 months" a year later.
 */
export const revalidate = 86400;

/**
 * The long form of the career history, as a timeline.
 *
 * Each company is a node on the rail; its roles nest inside, so a promotion
 * reads as movement within one company rather than a separate stop. The rail
 * is drawn per entry — a dot plus a line that flexes to fill the rest of the
 * entry's height — rather than as one absolutely positioned element, so it
 * needs no knowledge of how tall the entries are. The last entry omits its
 * line: the timeline ends at the dot.
 *
 * The landing page shows the company, its span, role titles and the one-line
 * `summary`; everything else in `Role` is here and only here — `description`,
 * `highlights`, `stack`. Keep that split, or the two views stop earning their
 * separation.
 *
 * Each company gets `id={entry.slug}`, so `/experience#another-company` is a
 * shareable deep link.
 */
export default function ExperiencePage() {
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
        {/* The eyebrow doubles as the page's <h1>. It is the only heading
            left after the title and intro were dropped, and a page with no
            h1 leaves the document outline headless — the company <h2>s would
            hang off nothing. Styled as a label, so it reads as one. */}
        <h1 className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Career
        </h1>

        {/* No gap between entries: the rail has to run unbroken from one dot to
            the next, and a gap would leave gaps in the line. Spacing comes from
            each entry's own bottom padding instead. */}
        <ol data-rise
          className="flex flex-col">
          {experience.map((entry, index) => {
            const span = companySpan(entry);
            const isLast = index === experience.length - 1;

            return (
              <li key={entry.slug} className="flex gap-x-5 sm:gap-x-6">
                <div
                  aria-hidden="true"
                  className="flex flex-col items-center self-stretch"
                >
                  {/* 8px = (28px heading line-height − 12px node) / 2, which
                      lands the node on the heading's first line. It has to be
                      drawn as rail rather than margin: as margin it left an
                      8px break between the previous entry's line and this
                      node. Transparent on the first entry so the timeline
                      starts at the node instead of a stub. Retune if `text-lg`
                      on that heading changes. */}
                  <span
                    className={cn("h-[8px] w-px shrink-0", index > 0 && "bg-border")}
                  />
                  {/* Hollow ring for a role you have left, filled with a soft
                      halo for the one you are in — so the eye lands on where
                      you are now without anything moving. The halo is a `ring`
                      (box-shadow), so it costs no layout width and cannot push
                      the rail off-axis. */}
                  <span
                    className={cn(
                      "size-3 shrink-0 rounded-full border-2",
                      span.end === null
                        ? "border-primary bg-primary ring-4 ring-primary/15"
                        : "border-primary/45 bg-background",
                    )}
                  />
                  {!isLast && <span className="w-px flex-1 bg-border" />}
                </div>

                {/* min-w-0 so long words in the body can wrap instead of
                    forcing the flex row wider than the page. */}
                <div className={cn("min-w-0 flex-1", !isLast && "pb-12")}>
                  <article
                    id={entry.slug}
                    aria-labelledby={`${entry.slug}-heading`}
                    className="flex scroll-mt-28 flex-col gap-6"
                  >
                    {/* The heading stays the first thing in this column: the
                        rail's dot offset is measured against its first line. */}
                    <div className="flex flex-col gap-1">
                      <h2
                        id={`${entry.slug}-heading`}
                        className="text-lg font-medium"
                      >
                        {entry.company}
                      </h2>
                      <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground tabular-nums">
                        <DateRange start={span.start} end={span.end} />
                        <span aria-hidden="true">·</span>
                        <span>
                          <Duration
                            start={span.start}
                            end={span.end}
                            shown="range"
                          />
                        </span>
                        <span aria-hidden="true">·</span>
                        {/* Usually one basis; two means it changed mid-tenure,
                            in which case each role carries its own below. */}
                        <span>{companyTypes(entry).join(", ")}</span>
                      </p>
                    </div>

                    {/* Roles nest under the company: a promotion is a second
                        entry here, not a second stop on the outer timeline. A
                        company with more than one role gets a timeline of its
                        own, on the same rules as the outer one — no `gap` on
                        the list, the dot offset drawn as rail rather than
                        margin, and no trailing line on the last role. A single
                        role has nothing to connect to, so it gets no rail. */}
                    <ol data-rise
          className="flex flex-col">
                      {entry.roles.map((role, roleIndex) => {
                        const nested = entry.roles.length > 1;
                        const isLastRole = roleIndex === entry.roles.length - 1;

                        return (
                          <li
                            key={role.title}
                            className={cn(nested && "flex gap-x-4")}
                          >
                            {nested && (
                              <div
                                aria-hidden="true"
                                className="flex flex-col items-center self-stretch"
                              >
                                {/* 8px = (24px role-title line-height − 8px
                                    node) / 2. Same reasoning as the outer
                                    rail; retune if the title's size changes. */}
                                <span
                                  className={cn(
                                    "h-[8px] w-px shrink-0",
                                    roleIndex > 0 && "bg-border",
                                  )}
                                />
                                {/* Smaller and thinner-walled than the company
                                    node, so the nesting reads at a glance. */}
                                <span
                                  className={cn(
                                    "size-2 shrink-0 rounded-full border",
                                    role.end === null
                                      ? "border-primary bg-primary"
                                      : "border-muted-foreground/50 bg-background",
                                  )}
                                />
                                {!isLastRole && (
                                  <span className="w-px flex-1 bg-border" />
                                )}
                              </div>
                            )}

                            <div
                              className={cn(
                                "flex flex-col gap-4",
                                nested && "min-w-0 flex-1",
                                nested && !isLastRole && "pb-8",
                              )}
                            >
                              {/* Same shape as the company header above: name,
                                  then its dates and duration directly beneath. */}
                              <div className="flex flex-col gap-1">
                                <h3 className="font-medium">{role.title}</h3>
                                {/* Only when the company has more than one
                                    role; with a single role this range is
                                    identical to the company's, right above. No
                                    employment basis here — the company line
                                    already carries it. */}
                                {nested && (
                                  <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground tabular-nums">
                                    <DateRange
                                      start={role.start}
                                      end={role.end}
                                    />
                                    <span aria-hidden="true">·</span>
                                    <span>
                                      <Duration
                                        start={role.start}
                                        end={role.end}
                                        shown="range"
                                      />
                                    </span>
                                  </p>
                                )}
                              </div>

                              <div className="flex flex-col gap-2">
                                {/* Markers are drawn with ::before rather than
                                    list-disc so they pick up the muted token
                                    and stay aligned with the first line of
                                    wrapped text. */}
                                <ul className="flex max-w-prose flex-col gap-2">
                                  {role.highlights.map((highlight) => (
                                    <li
                                      key={highlight}
                                      className="relative pl-5 text-sm leading-relaxed text-muted-foreground before:absolute before:top-[0.6em] before:left-1 before:size-1.5 before:rounded-full before:bg-muted-foreground/60"
                                    >
                                      {highlight}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <ul className="flex flex-wrap gap-2">
                                {role.stack.map((tech) => (
                                  <li key={tech}>
                                    <TechBadge tech={tech} />
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </article>
                </div>
              </li>
            );
          })}
        </ol>
      </main>

      <SiteFooter />
    </div>
  );
}
