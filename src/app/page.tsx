import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";

import { ContactSection } from "@/components/contact-section";
import { ExperienceSection } from "@/components/experience-section";
import { SiteFooter } from "@/components/site-footer";
import { TechStackSection } from "@/components/tech-stack-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DiaTextReveal } from "@/components/ui/dia-text-reveal";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { profile } from "@/lib/profile";
import { cn } from "@/lib/utils";

/**
 * Nothing here is time-dependent any more except `SiteFooter`'s copyright year,
 * which would otherwise freeze at whatever year the build ran in.
 */
export const revalidate = 86400;

/**
 * The hero's two animations run in sequence, not together.
 *
 * The name sweeps first; the summary only starts typing once that has landed.
 * Derived from one another rather than written as two independent numbers, so
 * retiming the sweep cannot leave the summary overlapping it. Note the unit
 * change: `DiaTextReveal` takes seconds, `TypingAnimation` milliseconds.
 */
const NAME_SWEEP_SECONDS = 1.2;
const SUMMARY_START_MS = NAME_SWEEP_SECONDS * 1000 + 200;

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6">
      <main
        id="main"
        // Asymmetric on purpose: the dock and `body`'s pt-16 already provide the
        // top separation, so only the bottom keeps the full section rhythm.
        className="flex flex-col gap-20 pt-12 pb-20 sm:gap-28 sm:pt-16 sm:pb-28"
      >
        {/* ---- Hero: typographic, no photo -------------------------------- */}
        <header
          id="top"
          className="relative isolate flex scroll-mt-32 flex-col gap-7"
        >
          {/* Decorative wash behind the name. `isolate` keeps the negative
              z-index inside this header instead of sliding under the page. */}
          <div
            aria-hidden="true"
            // Sized down on small screens: at 390px the content column is
            // 342px, so a 30rem glow at -left-24 reached x=408 and widened the
            // document by 18px. Overflow to the *left* costs nothing in LTR.
            className="pointer-events-none absolute -top-28 -left-16 -z-10 size-72 rounded-full bg-glow blur-3xl sm:-left-24 sm:size-[30rem]"
          />

          <div className="flex flex-col gap-4">
            {/*
              * The name is swept by a moving gradient band on load.
              *
              * `colors` is the site's own gradient — `--gradient-from` (blue)
              * to `--gradient-to` (steel) — rather than Magic UI's default
              * five-colour palette, which belongs to a different brand. They
              * are passed as `var()`, so the sweep follows the theme instead of
              * being pinned to one set of hex values.
              *
              * CLAUDE.md says the gradient never goes on the <h1>, because
              * `bg-clip-text` needs `text-transparent` and that costs contrast
              * on the page's primary heading. This does not break that rule:
              * the band is transient, and `textColor` leaves the resting state
              * at `--foreground`, the same colour the heading had before.
              *
              * The real text is in the DOM throughout — crawlers and screen
              * readers see the whole name, not a growing fragment — so unlike
              * the summary below this needs no second copy. It also honours
              * `prefers-reduced-motion` itself, jumping straight to the
              * resting state.
              */}
            <h1 className="text-5xl font-semibold tracking-tight text-balance sm:text-7xl">
              <DiaTextReveal
                text={profile.name}
                colors={["var(--gradient-from)", "var(--gradient-to)"]}
                duration={NAME_SWEEP_SECONDS}
              />
            </h1>

            {/* The status sits with the role rather than alone above the name:
                what you do and whether you are available are one thought.
                `flex-wrap` lets it drop to its own line on a narrow screen
                instead of squeezing the role. */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              {/* The gradient lives on this line, not on the <h1>. Gradient text
                  needs `text-transparent`, which costs real contrast — not
                  something to spend on the page's primary heading. */}
              <p className="w-fit bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-xl font-medium text-transparent sm:text-2xl">
                {profile.role}
              </p>

              {profile.available && (
                <Badge
                  variant="outline"
                  className={cn(
                    // Sized to the tech chips rather than shadcn's 20px
                    // default — beside a 24px role line the small one read as
                    // an afterthought.
                    "h-7 gap-2 rounded-full px-3 text-sm",
                    // Green tints the frame, never the label. `--success` at
                    // full strength measures under 4.5:1 as text on this
                    // background in light mode, and the dot already carries the
                    // colour; the words stay on `foreground`.
                    "border-success/40 bg-success/10 text-foreground",
                  )}
                >
                  {/* Solid dot with a pinging halo behind it. Decorative only —
                      the adjacent text carries the meaning, so colour is never
                      the sole signal. The global reduced-motion rule stops the
                      ping. */}
                  <span
                    aria-hidden="true"
                    className="relative flex size-2 shrink-0"
                  >
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-success" />
                  </span>
                  Open to work
                </Badge>
              )}
            </div>
          </div>

          {/*
            * The summary types itself in. Two layers, stacked:
            *
            * The <p> underneath is the real one — it holds the whole summary,
            * so the text is in the server-rendered HTML for crawlers, is what
            * assistive tech reads, and reserves the paragraph's final height.
            * Without it the CTAs below would be shoved down a line at a time as
            * the text arrived. It is `text-transparent` rather than hidden
            * because `visibility: hidden` and `display: none` would take it out
            * of the accessibility tree, which is the one thing it is there for.
            *
            * The animation on top is decorative and `aria-hidden`: it renders a
            * growing substring, and a screen reader following that would
            * announce the sentence a fragment at a time.
            *
            * Under `prefers-reduced-motion` the layers swap — the animation is
            * dropped and the real paragraph simply shows. Magic UI drives this
            * from JS timers, so the global reduced-motion CSS cannot reach it;
            * this variant is what actually honours the setting.
            */}
          <div className="relative max-w-prose">
            <p className="text-base leading-relaxed text-transparent motion-reduce:text-muted-foreground">
              {profile.summary}
            </p>

            <TypingAnimation
              as="p"
              aria-hidden="true"
              // ~170 characters, so the component's default 100ms per character
              // would take 17 seconds to say one sentence.
              duration={18}
              // Waits out the name's sweep — see `SUMMARY_START_MS`.
              delay={SUMMARY_START_MS}
              className="absolute inset-0 text-base leading-relaxed tracking-normal text-muted-foreground motion-reduce:hidden"
            >
              {profile.summary}
            </TypingAnimation>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" asChild>
              <Link href="#contact">
                <Mail aria-hidden="true" />
                Get in touch
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/experience">
                View experience
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </header>

        <div data-rise>
          <ExperienceSection />
        </div>

        <div data-rise>
          <TechStackSection />
        </div>

        <div data-rise>
          <ContactSection />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
