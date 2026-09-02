import { cn } from "@/lib/utils";

/**
 * The margins either side of the content column, given something to do.
 *
 * The column is `max-w-4xl` (896px), so from about 1280px up there are a couple
 * of hundred pixels of empty background on each side. This fills them with a
 * faint dot field that fades out on every side, so the texture dissolves into
 * the background rather than framing the content.
 *
 * Deliberately restrained, and deliberately static. It sits behind everything,
 * takes no clicks, and carries no meaning, so it is `aria-hidden`.
 */
export function MarginTexture() {
  return (
    <div
      aria-hidden="true"
      /*
       * `fixed` rather than absolute: the panel then has no relationship to
       * document height, cannot lengthen the page, and cannot create the
       * horizontal overflow that decorative layers here have caused before.
       * `-z-10` keeps it behind the content but in front of the body's own
       * background.
       *
       * Hidden below `xl`. At 1024px the margins are only 64px wide, where a
       * dot field reads as dirt along the edge rather than as texture.
       */
      className="pointer-events-none fixed inset-0 -z-10 hidden justify-center xl:flex"
    >
      <Margin />

      {/*
       * An empty spacer, and the only thing here that knows the layout: it is
       * the same `max-w-4xl` the pages use, so the two `flex-1` margins land
       * exactly where the content column ends. No `calc(50% - 28rem)` to keep
       * in step — change the column width and these follow.
       *
       * It draws nothing. It used to carry a hairline on each edge, which read
       * as a frame around the content; without it the texture just runs out.
       */}
      <div className="w-full max-w-4xl" />

      <Margin />
    </div>
  );
}

/**
 * One margin's worth of dot field.
 *
 * The dots are `currentColor` at low alpha, so they follow the theme the way
 * the dock's border and shadow do rather than being pinned to one palette.
 *
 * The mask is a single radial gradient centred in the margin, so the field
 * fades out toward the content, toward the screen edge, and toward the top and
 * bottom all at once. One `mask-image` and no `mask-composite` — that being the
 * part of masking with the patchiest support. Centring it also means neither
 * end of the field lines up with anything: a field that stayed dense right up
 * to the column edge would draw the same vertical line the border did, only in
 * dots.
 */
function Margin() {
  return (
    <div
      className={cn(
        "flex-1 text-foreground/20",
        "[background-image:radial-gradient(currentColor_1px,transparent_1px)]",
        "[background-size:22px_22px]",
        "[mask-image:radial-gradient(75%_60%_at_50%_50%,black_0%,transparent_75%)]",
      )}
    />
  );
}
