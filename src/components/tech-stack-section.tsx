import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Section } from "@/components/section";
import { TechBadge } from "@/components/tech-badge";
import { featuredTech } from "@/lib/profile";

/**
 * The short list: only what you would lead with.
 *
 * Reads `featuredTech`, which is derived from the `featured` flags in
 * `techStacks` — so this list cannot name something the full page does not
 * have. Add or remove entries by moving those flags in `@/lib/profile`, not by
 * editing here. The complete, grouped list is `/tech-stack`.
 */
export function TechStackSection() {
  return (
    <Section
      id="tech"
      label="Tech Stacks"
      title=""
      action={
        <Link
          href="/tech-stack"
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
      {/*
       * The chips are justified, not left-ragged: each row's items share out
       * whatever space is left, so every row ends flush with the "Others" link
       * above it. Left to their natural widths they stopped ~190px short of it
       * on a 1280px screen — a quarter of the column, empty.
       *
       * `grow` goes on the <li> and `w-full` on the badge, because `Badge` is
       * `w-fit`: growing the item without that just leaves the chip floating at
       * the left of a wider box.
       *
       * `last:grow-0` is what keeps that from turning ugly on a phone. The
       * final chip is the one that can end up alone on its own row — at 390px
       * "Jira" did — and a lone growing item stretches the full column into
       * something that reads as a button, not a chip. Held at its natural width
       * it costs nothing anywhere else: flex hands its share of the free space
       * to the other items on the row, so every row that has one still ends
       * flush. Only a row holding nothing but the last chip stays short, which
       * is the case we want short.
       *
       * `max-w-[17rem]` is the ceiling on that growth. A row holding only two
       * chips has too much space to share out, and at 700px it made "Postman"
       * a 530px slab — 5.5x its natural width, reading as a bar rather than a
       * chip. The cap is set just above the widest label there is ("Amazon Web
       * Services", ~224px), so it never squeezes a chip that genuinely needs
       * the room; it only refuses the runaway. A row that cannot be filled
       * without one then stays short, which is the better of the two.
       */}
      <ul className="flex flex-wrap gap-2">
        {featuredTech.map((tech) => (
          <li key={tech} className="max-w-[17rem] grow last:grow-0">
            <TechBadge tech={tech} className="w-full" />
          </li>
        ))}
      </ul>

    </Section>
  );
}
