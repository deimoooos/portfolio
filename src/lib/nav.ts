/**
 * Single-page anchor navigation.
 *
 * Each `id` must match the `id` of a section rendered on the landing page —
 * the header both links to them and highlights whichever one is on screen.
 */
export type NavItem = {
  id: string;
  label: string;
};

/** Document order matters: the scroll spy picks the first visible entry. */
export const NAV_ITEMS: readonly NavItem[] = [
  { id: "top", label: "Home" },
  { id: "experience", label: "Experience" },
  { id: "tech", label: "Stack" },
  { id: "contact", label: "Contact" },
] as const;
