import { profile } from "@/lib/profile";
import { cn } from "@/lib/utils";

const footerLink = cn(
  "rounded-sm text-sm text-muted-foreground underline-offset-4",
  "transition-colors duration-200 hover:text-primary hover:underline",
  "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
);

/**
 * The page's last line, on every route.
 *
 * It used to carry `id="contact"` and the email; `ContactSection` owns both
 * now. Two elements sharing that id would leave the nav anchor and the scroll
 * spy resolving to whichever came first.
 *
 * It carries a contact route again, but as links rather than an id. `/` has
 * `ContactSection` directly above this, so there it is a repeat — but
 * `/experience` and `/tech-stack` have no contact anywhere on the page, and a
 * reader who has just finished reading five roles is exactly the one who might
 * want to write. The dock's mail icon does reach `/#contact` from there; this
 * is one step where that is two, at the point the reading actually ends.
 */
export function SiteFooter() {
  return (
    <footer className="border-t py-8">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {profile.name}
        </p>

        <ul className="flex items-center gap-x-5">
          <li>
            <a href={`mailto:${profile.email}`} className={footerLink}>
              Email
            </a>
          </li>
          <li>
            <a
              href={profile.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={footerLink}
            >
              LinkedIn
              {/* The visible text is the name; the warning belongs to it rather
                  than to an aria-label that would replace the whole thing. */}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
