import {
  siAnthropic,
  siDocker,
  siGit,
  siGithub,
  siGithubactions,
  siGitlab,
  siGo,
  siIntellijidea,
  siJavascript,
  siJira,
  siJsonwebtokens,
  siKeycloak,
  siKubernetes,
  siLangchain,
  siLaravel,
  siMariadb,
  siNextdotjs,
  siNodedotjs,
  siOpenjdk,
  siPhp,
  siPostman,
  siPycharm,
  siPostgresql,
  siPython,
  siReact,
  siSpringboot,
  siSpringsecurity,
  siTailwindcss,
  siTypescript,
  type SimpleIcon,
} from "simple-icons";

import { AWS_MARK, MICROSOFT_MARK, type Mark } from "@/components/icons";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Brand marks for the stacks used in `@/lib/profile`.
 *
 * Keys are lowercased tech names. Simple Icons has dropped the Amazon and
 * Microsoft families over trademark, so those two marks are inlined in
 * `@/components/icons` instead. A name in neither set renders text-only — that
 * is the designed fallback, not a gap to work around. Verified against the
 * installed package rather than assumed; check there before adding a key.
 */
/** Simple Icons are all drawn on a 24x24 canvas, and each carries its hex. */
function si(icon: SimpleIcon): Mark {
  return { path: icon.path, viewBox: "0 0 24 24", hex: icon.hex };
}

const TECH_ICONS: Record<string, Mark> = {
  // Inlined — see `@/components/icons` for why neither is in Simple Icons.
  "amazon web services": AWS_MARK,
  aws: AWS_MARK,
  "microsoft power platform": MICROSOFT_MARK,
  microsoft: MICROSOFT_MARK,

  anthropic: si(siAnthropic),
  docker: si(siDocker),
  git: si(siGit),
  github: si(siGithub),
  "github actions": si(siGithubactions),
  gitlab: si(siGitlab),
  go: si(siGo),
  // Oracle's coffee cup is not in Simple Icons either. OpenJDK is the mark that
  // is licensable, and is the implementation these versions actually name.
  java: si(siOpenjdk),
  "intellij idea": si(siIntellijidea),
  intellij: si(siIntellijidea),
  javascript: si(siJavascript),
  jira: si(siJira),
  "json web tokens": si(siJsonwebtokens),
  jwt: si(siJsonwebtokens),
  keycloak: si(siKeycloak),
  kubernetes: si(siKubernetes),
  k8s: si(siKubernetes),
  langchain: si(siLangchain),
  laravel: si(siLaravel),
  mariadb: si(siMariadb),
  "next.js": si(siNextdotjs),
  nextjs: si(siNextdotjs),
  "node.js": si(siNodedotjs),
  nodejs: si(siNodedotjs),
  php: si(siPhp),
  postman: si(siPostman),
  pycharm: si(siPycharm),
  postgresql: si(siPostgresql),
  postgres: si(siPostgresql),
  python: si(siPython),
  react: si(siReact),
  "spring boot": si(siSpringboot),
  springboot: si(siSpringboot),
  "spring security": si(siSpringsecurity),
  tailwind: si(siTailwindcss),
  "tailwind css": si(siTailwindcss),
  typescript: si(siTypescript),
};

/**
 * Whether a brand colour carries no hue at all.
 *
 * Next.js and OpenJDK are both literally `#000000`, and a black mark is not a
 * colour to relight — it is a mark that should be drawn in whatever the theme
 * calls foreground. Pushed through the lightness band instead it lands on a
 * mid grey, which in dark mode is *dimmer* than the resting `muted-foreground`
 * — a bloom running backwards. Measured: 6.94:1 at rest, 5.33:1 "lit".
 */
function isNeutral(hex: string) {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return Math.max(r, g, b) - Math.min(r, g, b) < 12;
}

export function getTechIcon(tech: string): Mark | undefined {
  const key = tech.toLowerCase();
  // "Java 8", "Java 17" and "Java 21" are one mark. Falling back to the name
  // with a trailing version stripped keeps the map from needing a key per
  // release.
  return TECH_ICONS[key] ?? TECH_ICONS[key.replace(/\s+v?\d+(\.\d+)*$/, "")];
}

/**
 * A stack chip: brand mark + label.
 *
 * At rest the mark is `muted-foreground` — a step back from its label, so the
 * chip reads as artwork plus a name rather than one uniform grey block, and so
 * the bloom below has somewhere to travel from. On hover it lights up in its
 * own brand colour, relit for the theme by the `brand-mark` utility.
 *
 * This is the one place on an otherwise entirely typographic site where drawn
 * artwork appears, and colour is how a reader recognises a stack faster than
 * they can read it. Keeping the palette neutral at rest is what stops that
 * turning the section into logo soup.
 *
 * The mark is `aria-hidden` because the tech name sits right beside it, so
 * announcing it twice would only add noise. A mark with no `hex` (Microsoft's
 * four-square) simply does not bloom.
 */
export function TechBadge({
  tech,
  className,
}: {
  tech: string;
  className?: string;
}) {
  const icon = getTechIcon(tech);
  const brand = icon?.hex;
  const neutral = brand ? isNeutral(brand) : false;

  return (
    <Badge
      variant="outline"
      className={cn(
        // `align-middle` is load-bearing, not cosmetic. The badge is an
        // inline-flex box, so by default it aligns on *its own* baseline —
        // which is its first flex item's: the <svg> for a mapped tech, the
        // text run for an unmapped one like AWS. Those differ by 2px, so a
        // text-only badge sits lower than its neighbours. Middle alignment
        // ignores the box's internal baseline and lines every badge up.
        "align-middle",
        /*
         * Bigger than the shadcn default, and filled rather than outlined.
         *
         * `Badge` is built for a 20px chip beside a heading — at `h-5` with
         * 12px text and a 12px mark, these read as footnotes in a layout whose
         * body copy is 16px. `h-7`, `text-sm` and a `size-4` mark bring them up
         * to the same weight as the prose they sit under.
         *
         * The svg size needs the `!`: `badgeVariants` sets `[&>svg]:size-3!`,
         * which no ordinary utility can outrank. `cn()` drops the losing class
         * rather than shipping both.
         */
        "h-7 rounded-full px-2.5 text-sm [&>svg]:size-4!",
        // `--card` is pure white in light, i.e. identical to `--background`, so
        // a card-filled chip reads as flat as an outlined one. `--surface`
        // exists for exactly this.
        "border-surface-border bg-surface",
        // Named group, so a `TechBadge` dropped inside some other `group`
        // later cannot be lit by that one's hover.
        "group/chip gap-2",
        // No hover on the box itself. `border-primary/40` is the signal every
        // genuinely clickable surface on this page uses, and a chip is content,
        // not a control — the same false affordance the landing page's
        // experience rows carried before they became links. Only the mark
        // responds, and a logo colouring in reads as the mark noticing you
        // rather than as a button.
        className,
      )}
    >
      {icon && (
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox={icon.viewBox}
          fill="currentColor"
          style={
            brand && !neutral
              ? ({ "--brand": `#${brand}` } as React.CSSProperties)
              : undefined
          }
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-colors duration-200",
            brand &&
              (neutral
                ? "group-hover/chip:text-foreground"
                : "group-hover/chip:brand-mark"),
          )}
        >
          <path d={icon.path} />
        </svg>
      )}
      {tech}
    </Badge>
  );
}
