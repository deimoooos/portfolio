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
          View more
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
              {/* Baseline-aligned, not top-aligned: the gutter and the role
                  title have different line-heights, so matching box tops
                  leaves their text off by a few pixels. */}
              <article
                className={cn(
                  "grid items-baseline gap-x-8 gap-y-1 rounded-xl border px-4 py-3.5 sm:grid-cols-[10rem_1fr]",
                  "border-transparent transition-[background-color,border-color] duration-200",
                  "hover:border-surface-border hover:bg-surface",
                )}
              >
                <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground tabular-nums">
                  <StartYear start={companySpan(entry).start} />
                  <span aria-hidden="true">·</span>
                  <span>{companyTypes(entry).join(", ")}</span>
                </p>

                <div>
                  <h3 className="font-medium">{latest.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {entry.company}
                  </p>
                </div>
              </article>
            </li>
          );
        })}
      </ol>

    </Section>
  );
}
