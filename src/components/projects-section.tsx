import { ArrowUpRight } from "lucide-react";

import { Section } from "@/components/section";
import { TechBadge } from "@/components/tech-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { projects } from "@/lib/profile";
import { cn } from "@/lib/utils";

/**
 * Project grid. Content lives in `@/lib/profile`.
 *
 * Each card uses a stretched link (`after:inset-0` over the `relative` Card) so
 * the whole card is clickable while only the title is in the tab order.
 */
export function ProjectsSection() {
  return (
    <Section id="projects" label="Projects" title="">
      <ul className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <li key={project.name} className="flex">
            <Card
              className={cn(
                "group relative flex w-full flex-col",
                // Lift on hover; transform+shadow only, so no layout reflow.
                "transition-[transform,box-shadow,border-color] duration-200",
                "hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg",
                // Keyboard parity: the same treatment when the inner link is focused.
                "focus-within:-translate-y-1 focus-within:border-primary/40 focus-within:shadow-lg",
              )}
            >
              <CardHeader>
                <CardTitle className="flex items-start justify-between gap-3">
                  <a
                    href={project.href}
                    className="rounded-sm transition-colors duration-200 after:absolute after:inset-0 group-hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    {project.name}
                  </a>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-foreground transition-[transform,color] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                  />
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-muted-foreground tabular-nums">
                  {project.year}
                </span>
                <span aria-hidden="true" className="text-muted-foreground">
                  ·
                </span>
                {project.tags.map((tag) => (
                  <TechBadge key={tag} tech={tag} />
                ))}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}
