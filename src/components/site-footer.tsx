import { profile } from "@/lib/profile";

/**
 * Copyright line, on every page.
 *
 * It used to carry `id="contact"` and the email; `ContactSection` owns both
 * now. Two elements sharing that id would leave the nav anchor and the scroll
 * spy resolving to whichever came first.
 */
export function SiteFooter() {
  return (
    <footer className="border-t py-8">
      <p className="text-sm text-muted-foreground">
        © {new Date().getFullYear()} {profile.name}
      </p>
    </footer>
  );
}
