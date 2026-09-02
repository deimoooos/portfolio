import { ArrowUpRight, Mail } from "lucide-react";

import { CopyEmail } from "@/components/copy-email";
import { LinkedInIcon } from "@/components/icons";
import { Section } from "@/components/section";
import { profile } from "@/lib/profile";
import { cn } from "@/lib/utils";

const cardClass = cn(
  "group flex items-center gap-3 rounded-xl border border-surface-border bg-surface px-4 py-3.5",
  "transition-[transform,border-color,box-shadow] duration-200",
  "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
  "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
);

/*
 * The email card is a <li> rather than a bare <a>, because it holds two
 * controls now: the address opens a mail client, and the button beside it puts
 * the address on the clipboard. A <button> inside an <a> is invalid, so the
 * anchor covers the card with `after:absolute after:inset-0` instead and the
 * copy button sits above that overlay on `z-10`.
 *
 * `has-[a:focus-visible]` moves the focus ring back onto the whole card: with
 * the anchor reduced to a line of text, the ring would otherwise wrap the
 * address alone and no longer read as "this card is focused".
 */
const emailCardClass = cn(
  cardClass,
  "relative has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/50",
);

/**
 * Contact, as its own section rather than only in the footer.
 *
 * This owns `id="contact"` — the footer used to, and both carrying it would
 * leave the nav anchor and the scroll spy pointing at whichever came first.
 */
export function ContactSection() {
  return (
    <Section id="contact" label="Contact">
      <div className="flex flex-col gap-6">
        <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
          {profile.available
            ? "Open to new work. The fastest way to reach me is email — I read everything that arrives."
            : "Not looking right now, but always glad to talk about interesting problems."}
        </p>

        <ul className="grid gap-3 sm:grid-cols-2">
          <li className={emailCardClass}>
            <Mail
              aria-hidden="true"
              className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
            />
            <span className="flex min-w-0 flex-col">
              <span className="text-xs text-muted-foreground">Email</span>
              <a
                href={`mailto:${profile.email}`}
                className="truncate text-sm font-medium after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none"
              >
                {profile.email}
              </a>
            </span>
            <CopyEmail email={profile.email} className="ml-auto" />
          </li>

          <li>
            <a
              href={profile.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={cardClass}
            >
              <LinkedInIcon className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
              <span className="flex min-w-0 flex-col">
                <span className="text-xs text-muted-foreground">LinkedIn</span>
                <span className="truncate text-sm font-medium">
                  Connect
                  {/* The visible text is short; the warning belongs to it, not
                      to an aria-label that would replace the whole name. */}
                  <span className="sr-only"> (opens in a new tab)</span>
                </span>
              </span>
              <ArrowUpRight
                aria-hidden="true"
                className="ml-auto size-4 shrink-0 text-muted-foreground transition-[transform,color] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
              />
            </a>
          </li>
        </ul>
      </div>
    </Section>
  );
}
