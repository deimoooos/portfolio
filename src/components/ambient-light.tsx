import { cn } from "@/lib/utils";

/**
 * The room's light, behind every route.
 *
 * Two washes in the site's own gradient stops — blue at the top left, steel at
 * the bottom right — cross-faded against scroll depth, so the page is lit
 * differently where you start reading than where you finish. The colours are
 * not chosen for atmosphere; they are `--gradient-from` and `--gradient-to`,
 * the same two stops the name sweep and the role line are built from.
 *
 * This exists because everything below the hero had no atmosphere at all. The
 * hero carries its own glow (which arrives with the name sweep, and stays), and
 * `/experience` and `/tech-stack` each carried a copy of it "so the routes read
 * as one site" — which is what a single shared layer does properly. Those two
 * copies are gone.
 *
 * Three things about the implementation are load-bearing:
 *
 * - **Radial gradients, not blurred elements.** A `blur-3xl` div has to
 *   re-rasterise its filter whenever anything about it changes; a
 *   `radial-gradient` is painted once and then only composited. Since this
 *   animates on every scroll frame, that difference is the whole performance
 *   budget. Nothing here uses `filter`.
 * - **`fixed` with `overflow-hidden`.** Like `MarginTexture`, being fixed means
 *   it has no relationship to document height, cannot lengthen the page, and
 *   cannot create the horizontal overflow decorative layers here have caused
 *   twice. The clip makes that structural rather than a matter of getting the
 *   sizes right.
 * - **The resting state is the old design.** Warm at full strength, cool at
 *   zero — which is the single blue wash the routes had before. Where scroll
 *   timelines are unsupported (Firefox) or motion is reduced, that is exactly
 *   what you get, so the fallback is a design rather than an absence.
 */
export function AmbientLight() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-20 overflow-hidden"
    >
      {/* Inset outwards so the drift never pulls an edge into view. The
          gradients fade to transparent well before the bounds anyway; this is
          the belt to that braces. */}
      <div
        data-ambient="warm"
        className={cn(
          "absolute -inset-[12vh] opacity-100",
          "[background:radial-gradient(55%_45%_at_18%_8%,var(--glow-from),transparent_70%)]",
        )}
      />
      <div
        data-ambient="cool"
        className={cn(
          "absolute -inset-[12vh] opacity-0",
          "[background:radial-gradient(50%_42%_at_82%_92%,var(--glow-to),transparent_70%)]",
        )}
      />
    </div>
  );
}
