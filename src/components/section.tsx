import { cn } from "@/lib/utils";

/** Shared section chrome: heading + optional trailing control, one rhythm everywhere. */
export function Section({
  id,
  label,
  title,
  action,
  children,
}: {
  id: string;
  label: string;
  /**
   * The large heading. Omit it (or pass "") to let `label` be the heading —
   * the section then reads as a single small uppercase line.
   */
  title?: string;
  /** Optional trailing control, rendered to the right of the heading. */
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  // Whichever of the two is visible has to be the <h2>. Rendering an empty one
  // would leave `aria-labelledby` pointing at nothing, so every section would
  // announce with a blank name — and an action baseline-aligned to a zero-height
  // heading floats away from the text it belongs beside.
  const hasTitle = Boolean(title?.trim());
  const eyebrow =
    "text-xs font-medium tracking-widest text-muted-foreground uppercase";

  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-32">
      <div className="mb-8 flex flex-col gap-1.5">
        {hasTitle && <p className={eyebrow}>{label}</p>}

        {/* The heading and its action share a row so they baseline-align
            exactly. Bottom-aligning them instead would sit the smaller action
            text a couple of pixels low, because the two have different
            descender depths. When there *is* a title, the eyebrow stays outside
            this row: `align-items: baseline` uses an element's first baseline,
            so including it would pull the action up beside the label. */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2
            id={`${id}-heading`}
            className={cn(
              hasTitle ? "text-2xl font-semibold tracking-tight" : eyebrow,
            )}
          >
            {hasTitle ? title : label}
          </h2>
          {action}
        </div>
      </div>
      {children}
    </section>
  );
}
