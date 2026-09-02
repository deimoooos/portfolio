@AGENTS.md

# Portfolio

Personal developer portfolio — a single-page site. Content is placeholder text;
replace it, don't rebuild around it.

## Stack

| Piece | Version | Notes |
|---|---|---|
| Node | 24.18.0 | Pinned in `.nvmrc`; `nvm use` picks it up |
| Yarn | 1.22.22 | Classic. Installed under the nvm Node 24 bin dir |
| Next.js | 16.3.4 | App Router, Turbopack (the default in 16 — no flag) |
| React | 19.2.8 | |
| TypeScript | 5 | `strict: true` |
| Tailwind CSS | v4 | CSS-first config — **no `tailwind.config.ts`** |
| shadcn/ui | CLI 4.19.1 | style `radix-nova`, base `radix`, lucide icons |
| lucide-react | v1 | UI icons |
| simple-icons | v16 | Brand/tech logos |
| next-themes | 0.4.6 | Dark mode (class strategy) |

## Commands

```bash
nvm use                 # reads .nvmrc → Node 24.18.0
yarn install
yarn dev                # dev server on :3000
yarn build              # production build
yarn start              # serve the build
yarn lint               # eslint
npx tsc --noEmit        # typecheck (no `typecheck` script exists)

npx shadcn@latest add <component>   # Yarn 1 has no `dlx` — use npx

docker build -t portfolio .
docker run --rm -p 3000:3000 portfolio
```

## Layout

```
src/app/                     App Router: layout.tsx, page.tsx, globals.css
src/app/experience/page.tsx  The detailed career history
src/app/tech-stack/page.tsx  The full, grouped tech stack
src/components/              Own components
src/components/ui/           shadcn primitives (generated)
src/lib/profile.ts           ALL site content lives here
src/lib/nav.ts               Navbar items (ids must match landing-page section ids)
src/lib/utils.ts             cn()
```

**Content changes go in `src/lib/profile.ts`.** `profile`, `experience`, and
`projects` drive every section. Edit the values, not the components.

Page composition: `page.tsx` holds the hero; the two data-driven sections are
their own files (`experience-section.tsx`, `projects-section.tsx`), both wrapped
in the shared `Section` component. `site-footer.tsx` is shared by both routes and
carries `id="contact"`. `site-header.tsx` renders from `layout.tsx`, so the
navbar is present on every route.

### Two routes, one nav

`/` is the summary, laid out as a two-column list; `/experience` is the long
form, laid out as a **timeline**.

**The landing page shows four facts per company and nothing else**: the start
*year*, the employment basis, the **latest** role's title, and the company. No
dates beyond the year, no durations, no earlier roles, no summaries, no stacks —
all of that is `/experience`'s job. Adding any of it back erodes the reason the
second route exists.

### Tech stacks

`techStacks` in `src/lib/profile.ts` is the whole list, grouped by
`TechCategory`. **`featuredTech` is derived from it**, by filtering the items
flagged `featured` — so the landing page's short list cannot name something the
full page lacks. Add or drop an entry by moving a flag, never by editing the
landing section. A group with no items is skipped rather than rendered as a bare
heading, so emptying one removes it.

Item `name`s must match a `TECH_ICONS` key to get a logo. **Amazon Web Services
and Microsoft Power Platform use marks inlined in `src/components/icons.tsx`** —
Simple Icons carries no Amazon or Microsoft entry at all, which is a constraint
on redistributing an icon *set*, not on a portfolio naming what it works with.
Because an inlined logo keeps its own proportions (the AWS wordmark is 1.67:1),
`TECH_ICONS` values are a `Mark` — `{ path, viewBox }` — and Simple Icons
entries are wrapped by `si()`, which supplies the 24x24 box. AWS's viewBox is
the path's *measured* bbox, not devicon's 0 0 128 128 canvas; the mark occupies
only the middle band of that, so the full canvas would render it far smaller
than its neighbours. OpenAI and Apidog are in neither set and stay text-only. **The AI and "Security
and IAM" groups, and Kubernetes, are placeholders** — nothing in `experience`
evidences them.

**Employment basis (`Full-time` / `Part-time` / `Project-based`) sits on the
`Role`, not the company** — it can change without the employer changing.

**The outer list is companies, not roles.** `Experience` holds a company and a
non-empty `roles` array, so a promotion is a second `Role` under the same
company rather than a second entry. Roles are newest first; `companySpan()`
relies on that ordering to derive the total span from the last role's start and
the first role's end. Per-role durations are only rendered when
`roles.length > 1` — with a single role they would just repeat the gutter.

**`role.start` / `role.end` are ISO `YYYY-MM`** (`end: null` means current).
`/experience` shows the full range before the duration — "October 2021 — Present
· 5 years" — via `<DateRange>` and `<Duration>` in
`src/components/duration.tsx`. The landing page shows the duration alone. Three
things there are load-bearing:

- Months are parsed by hand rather than with `new Date("2023-06")`, which parses
  as UTC midnight and reads back as *May* anywhere west of Greenwich.
- `<Duration shown>` says which dates are already visible beside it, and it puts
  whatever is missing into an `sr-only` `<time>`. `<time>` cannot carry the
  duration itself — HTML's duration format has no year or month component — so
  without that the real period would be absent from the markup entirely. Get
  `shown` wrong and a screen reader either repeats a date that is already on
  screen or loses one.
- Employment basis is rendered **only on the company line**. It is still on
  `Role`, so a company whose basis changed mid-tenure shows both joined
  ("Part-time, Full-time") without saying which role was which — bring back the
  per-role label if that matters.

**Both routes set `revalidate = 86400`.** A current role's duration is computed
at render, so without it the value freezes at build and a role still reads
"3 years and 4 months" a year later. This is why the build reports them as ISR
rather than static.

Each role's `slug` is its anchor on `/experience`, so
`/experience#another-company` is a shareable deep link. Changing a slug breaks
any link already shared.

`/experience` has **no back link of its own** — the sticky header is on every
route and carries the way back. Its only heading is the "Career" eyebrow, which
is the page's `<h1>`: strip that too and the company `<h2>`s hang off nothing.

**Nav hrefs are rooted (`/#experience`), not bare fragments.** A bare `#id`
resolves against the *current* route, so from `/experience` it would go nowhere.
They are `next/link`, so returning to the landing page is a client-side
navigation rather than a full reload.

`NAV_ITEMS` in `src/lib/nav.ts` drives both the desktop bar and the mobile Sheet;
each `id` must match a section `id` on the **landing page**. Adding a nav item
means adding a section with the same id — otherwise the link goes nowhere and the
scroll spy silently skips it.

**The dock is `fixed`, floating and top-centred.** `top-4` + `h-12` puts its
bottom edge at 64px — the same as the full-width bar it replaced — so
`ACTIVATION_LINE` (120) and the sections' `scroll-mt-28` (112px) are both
derived from that edge — move the dock and both have to move. A bottom dock would mean re-deriving both. Its wrapper spans
the viewport only to centre the pill, so it carries `pointer-events-none` with
`pointer-events-auto` restored on the pill; without that it would eat clicks
across the full width. Being `fixed`, it no longer occupies flow — `body` has
`pt-16` to replace what it used to take.

**Nav items are icon + label, and there is no mobile Sheet any more.** Icons
come from `NAV_ICONS` in `site-header.tsx`, keyed by nav id — kept out of
`nav.ts` so that stays a plain data module with no React imports, the same split
as `TECH_ICONS`. Two things to preserve:

- **The label is `sr-only sm:not-sr-only`, never `hidden`.** On mobile it is the
  link's *only* accessible name; `display: none` would strip it from the
  accessibility tree and leave four unnamed links. Verified against the a11y
  tree, not just the attribute.
- **Both layouts fit inside the dock's `h-12`.** Mobile links are `size-8`
  (matching the toggle beside them, and above the 24px target minimum); desktop
  stacks a `size-4` icon over an 11px label at 43px tall. That keeps the dock's
  bottom edge at 64px, which is what `ACTIVATION_LINE` and the sections'
  scroll margin are derived from.

**A hairline separator splits navigation from the controls.** It is the shadcn
`Separator`, and two of its classes are corrections rather than taste:

- **`my-auto`, not `self-center`.** The primitive ships
  `data-vertical:self-stretch`; that is an attribute selector, so it outranks a
  plain utility on specificity and the rule sat flush against the dock's top
  edge (measured: 1px above, 23px below). Auto cross-axis margins take the free
  space whatever `align-self` says.
- **`bg-foreground/15`, not `bg-border`.** Same reason the dock's edge uses
  `foreground`. Measured against the dock fill: 1.41:1 light and 1.52:1 dark,
  where `bg-border` would have given 1.21 and 1.31 — legible, but fainter than
  the pill's own outline rather than the thing dividing it. The explicit
  `h-5 sm:h-6` matters too: stretched to the full 48px it cuts the dock in half
  instead of separating two groups. It is decorative, so it adds nothing to the
  accessibility tree (`role="none"`; confirmed against the AX tree).

**The dock's border and shadow use `foreground`, not a fixed colour.**
`--foreground` is near-black in light and near-white in dark, so one class casts
a drop shadow on light and a soft halo on dark. A black shadow is invisible
against the dark canvas — that is what made the dock read flat before.

**The scroll spy's `bottomedOut` branch is gated on the page being scrollable.**
On a viewport tall enough to show everything, "bottomed out" is true at rest,
which lit up the last nav item while the reader was at the top.

**Sections clear the dock by more than the anchor's own error.** `scroll-mt-28`
(112px) against a dock whose bottom edge is 64px looks over-generous until you
measure where an anchor jump actually lands: 66, 68, 78, 81 and 83px against an
80px margin, on five phone sizes. The landing sections sit inside a `[data-rise]`
wrapper that is still mid-transform while the smooth scroll runs, so the browser
aims at a position the element then moves away from, and how far depends on the
viewport height the `view()` timeline is measured against. At `scroll-mt-20` that
left **2px** of clearance under the dock on a 360x640 screen and 4px on a
375x667 — the heading sat behind the floating pill and the first thing the reader
saw was the list, which is exactly what "I land in the middle of the section"
looks like. Widening the margin is the fix that survives the error rather than
one that assumes it away; measured clearance is now 31-51px everywhere, and the
sections still activate because 112 stays below `ACTIVATION_LINE`.

**At the page foot the spy follows the reader's request, not the geometry.**
The page is short: on a 1280x800 viewport, jumping to `#tech` scrolls the whole
way to the end, leaving tech's top at 219px — it never reaches
`ACTIVATION_LINE`, and `#contact` is on screen below it. The scroll offset is
then *identical* whichever of the two was clicked (817 of 817 either way), so no
measurement can tell them apart; before this, clicking "Stack" lit "Contact",
and on a 1200px-tall viewport clicking "Experience" did too. `useActiveSection`
keeps the last explicitly requested id in a `requested` ref and uses it in place
of "the last item" when the page bottoms out. Four things hold it up:

- **The request is released by reader input, not by `scroll`.** `html` is
  `scroll-behavior: smooth`, so a click fires scroll events the whole way down;
  clearing on those would drop the request before the page finished arriving.
  It listens for `wheel`, `touchmove` and `keydown` instead. Once the reader
  scrolls for themselves, the foot means the last section again.
- **A hash counts as a request.** A fresh `/#tech`, or arriving from
  `/experience`, has to read the same as a click, so the effect seeds the ref
  from `location.hash`. It only overwrites when the hash names a real nav item,
  so a click whose URL has not landed yet keeps what it just recorded.
- **`request()` re-measures by hand.** Clicking while already at the foot moves
  nothing, so no scroll event follows — without that call the dock would not
  update at all when you go from "Stack" to "Contact".
- The branch is still only consulted at the foot. Everywhere else the reader's
  position is unambiguous and geometry decides, as before.

Testing this over CDP needs care: **a navigation that differs only by hash does
not reload the page**, so `Page.navigate` to `/#tech` from `/#tech` silently
measures the previous document. Go via `about:blank` first. That mistake made a
working deep link look broken here.

**The scroll spy only runs on `/`.** Off the landing page it is passed
`enabled: false` and the active item comes from the pathname instead — a route
whose first segment matches a `NAV_ITEMS` id lights that item up, which is why
`/experience` and the `experience` nav id share a name. Left running elsewhere it
reports nonsense: every `getElementById` misses so it falls back to the first
item, and hitting the page bottom would light up the *last* one.

## Conventions

- **Server Components by default.** Add `"use client"` only for hooks, state, or
  browser APIs. `site-header.tsx` is the only hand-written client component — it
  needs scroll, route and menu state. Keep new work server-side unless it
  genuinely needs the client.
- **Import via `@/*`**, never deep relative paths.
- **Compose classes with `cn()`** from `@/lib/utils`. Don't concatenate strings.
- **Semantic tokens only** — `bg-background`, `text-muted-foreground`,
  `border-border`. Never raw palette colors (`bg-blue-500`), or dark mode breaks.
- **Compound shadcn components**: `<Card><CardHeader><CardTitle>`, not a single
  component with `title`/`content` props.
- **Check `src/components/ui/` first** before hand-rolling a primitive.
- `src/components/ui/` is generated-then-owned: editing is fine, but re-running
  `shadcn add <same component>` overwrites it.
- **`TechBadge` is deliberately larger than shadcn's `Badge`.** The primitive is
  built for a 20px chip beside a heading; at `h-5` with 12px text and a 12px
  mark it read as a footnote in a layout whose body copy is 16px. It is `h-7`
  with `text-sm` and a `size-4` mark, filled with `bg-surface` rather than left
  outlined. **The mark size needs the `!`** — `badgeVariants` carries
  `[&>svg]:size-3!`, which no ordinary utility outranks; `cn()` drops the losing
  class rather than shipping both, so `[&>svg]:size-4!` is what actually sizes
  it. Changing the height alone leaves 12px marks in a 28px chip.
- **The landing page's featured chips are justified, and it takes three
  classes to do it safely.** `grow` on the `<li>` with `w-full` on the badge
  (which is `w-fit`) makes each row share out its leftover space, so rows end
  flush with the section's action link instead of stopping ~190px short of it on
  a 1280px screen. The other two exist because that alone breaks:
  - **`last:grow-0`** — the final chip is the one that can end up alone on a
    row, and a lone growing item stretches the whole column into something that
    reads as a button. Held at natural width it costs nothing elsewhere: flex
    hands its share to the rest of the row, so any row with another chip on it
    still ends flush.
  - **`max-w-[17rem]`** — a row holding two chips has too much space to share,
    and at 700px it made "Postman" a 530px slab, 5.5x its natural width. The cap
    sits just above the widest label that exists ("Amazon Web Services", ~224px)
    so it never squeezes a chip that needs the room. A row that cannot be filled
    without a runaway then stays short, which is the better of the two.

  Measured across 16 widths from 320 to 1440: every row flush except ones that
  hold only the final chip.
- **Tech logos go through `TechBadge`** (`src/components/tech-badge.tsx`), which
  maps a tech name to a Simple Icons mark. Add new entries to `TECH_ICONS`, and
  keep marks in `currentColor` so they stay legible in both themes.
  - **Unmapped names render text-only by design.** Simple Icons has dropped the
    whole Amazon and Microsoft families over trademark, so "Amazon Web Services"
    and "Microsoft Power Platform" have no mark and are not going to get one.
    Java's coffee cup is gone for the same reason — `siOpenjdk` stands in.
    Check the installed package before adding a key rather than guessing at an
    export name; roughly 3,450 icons ship and the misses are not obvious.
  - `getTechIcon` falls back to the name with a trailing version stripped, so
    "Java 8", "Java 17" and "Java 21" all resolve to one entry.
- **`TechBadge` carries `align-middle`, and it is not cosmetic.** `Badge` is
  `inline-flex`, so it aligns on *its own* baseline — which is its first flex
  item's: the `<svg>` for a mapped tech, the text run for an unmapped one. Those
  differ by 2px, so a text-only badge (AWS) sits lower than its neighbours
  wherever badges are laid out inline. Middle alignment ignores the box's
  internal baseline and lines them all up.
- **`Section`'s `title` is optional, and whichever line is visible is the
  `<h2>`.** Passing no title (or `""`) promotes `label` to the heading, styled
  as the eyebrow. Do not render an empty `<h2>` instead: it makes
  `aria-labelledby` point at nothing, so the section announces with a blank
  name, and it has zero height — so an action baseline-aligned to it floats
  ~15px away from the text it belongs beside. That was a real bug, not a
  theoretical one.
- **`Section` takes an optional `action`**, rendered to the right of the heading
  (the "Detailed experience" / "Others" links). It shares a flex row with the
  `<h2>` under `items-baseline`, *not* with the eyebrow — `align-items: baseline`
  uses an element's **first** baseline, so including the label would align the
  action beside the label instead of the title. Bottom-aligning is also wrong:
  the two have different descender depths, which leaves the smaller action text
  about 2.5px low.
- **The landing page's two-column role grid uses `items-baseline`.** The gutter
  is `text-sm` and the heading beside it is larger; grid's default aligns box
  tops, which leaves their text off by ~5px. Baseline alignment survives
  font-size changes, a hard-coded `pt-` offset does not.
- **The `/experience` timeline rail is drawn per entry, not as one absolutely
  positioned line** — a lead segment, a dot, then a line that flexes to fill the
  rest of the entry — so it needs no knowledge of how tall the entries are. Three
  things keep it unbroken:
  - The `<ol>` has **no `gap`**. Spacing comes from each entry's own bottom
    padding; a gap between list items would show as gaps in the rail.
  - The 9px that centres the dot on the heading's first line
    (`(28px line-height − 10px dot) / 2`) is drawn as **rail, not margin**. As
    margin it left a 9px break above every dot but the first. That segment is
    transparent on the first entry so the timeline starts at the dot rather than
    a stub.
  - The last entry omits its trailing line — the timeline ends at the dot.
- **The nodes carry state, not just decoration**: a hollow ring for something
  you have left, a filled node with a soft `ring` halo for the one that is still
  running (`end === null`). The halo is a box-shadow, so it adds no layout width
  and cannot push the rail off-axis.
- **Both rails use plain `bg-border`.** Dimming the nested one to `bg-border/60`
  measured 1.13:1 against the background in dark — invisible. `--border` is
  already `oklch(1 0 0 / 10%)` there; it has no room to be dimmed further, and
  the nesting is carried by node size and indentation anyway.
- **A company with more than one role gets a nested timeline** on exactly those
  same three rules, indented inside the company's content column with a smaller
  muted dot. Its offset is `(24px role-title line-height − 6px dot) / 2`, the
  same arithmetic as the outer rail's `(28 − 10) / 2`. A single-role company
  gets no rail — there is nothing to connect it to — which is also why per-role
  dates only appear when `roles.length > 1`: with one role that range is
  identical to the company's, right above it.

## Design language

Redesigned with `nishchayjain.vercel.app` as a reference. **Deliberately
divergent on the four things that make that site recognisably theirs**: it uses
a fixed top navbar, a photo-led split hero, Inter/Outfit, and a blue→purple
gradient. This uses a floating dock, a typographic hero, Geist, and a
blue→*steel* gradient (the second stop shifted the opposite way round the hue
wheel). Do not drift back toward those four.

- **Tokens** (`globals.css`): `--surface` / `--surface-border` for elevated
  panels — `--card` is pure white in light mode, i.e. identical to
  `--background`, so cards built on it read flat. `--gradient-from` /
  `--gradient-to` for the accent, `--glow` for the soft radial washes. All
  exposed via `@theme inline`, so `bg-surface`, `from-gradient-from` etc. work.
  Semantic tokens only, as everywhere else.
- **The gradient goes on the role line, never the `<h1>`.** `bg-clip-text`
  requires `text-transparent`, which costs real contrast — not something to
  spend on the page's primary heading.
- **Decorative glows must be sized against the narrow viewport.** A 30rem glow
  at `-left-24` inside the `max-w-4xl px-6` column reached x=408 on a 390px
  screen and widened the document by 18px. They are `size-72 sm:size-[30rem]`
  for that reason. Overflow to the *left* costs nothing in LTR; overflow right
  is what creates the scrollbar.
- **Do not "fix" that with `overflow-x` on `<body>`.** Overflow on the body
  propagates to the viewport when `<html>` is `visible`, so it clips nothing and
  merely hides the next such bug. Tried, measured, reverted.

### Filling the side margins

`MarginTexture` (`src/components/margin-texture.tsx`) fills the empty space
either side of the `max-w-4xl` column with a faint dot field. Mounted in
`layout.tsx`, so every route gets it.

- **It is `fixed inset-0 -z-10`, not absolute.** Fixed means it has no
  relationship to document height, cannot lengthen the page, and cannot create
  the horizontal overflow that decorative layers here have caused twice before.
  `-z-10` keeps it behind the content but in front of the body's background.
- **The middle spacer is the column's own `max-w-4xl`**, sitting between two
  `flex-1` margins. No `calc(50% - 28rem)` to keep in step with the layout —
  change the column width and the margins follow. Verified: the spacer's edges
  match the content column to 0px at 1280, 1440 and 1600.
- **No border on that spacer.** It carried a hairline on each edge at first,
  which drew a frame around the content instead of letting it sit in the
  background. The dot field just runs out now, and the mask is centred in each
  margin so it fades toward the column, the screen edge, and the top and bottom
  alike — a field that stayed dense up to the column edge would redraw the same
  vertical line in dots.
- **Hidden below `xl`.** At 1024px the margins are 64px wide, where a dot field
  reads as dirt along the edge rather than as texture.
- **One radial mask, no `mask-composite`.** A single centred
  `radial-gradient` does every fade at once, which avoids the part of masking
  with the patchiest support.

## Hero animations

Two Magic UI components, installed from its registry, and they run **in
sequence**: the name sweeps, then the summary types.

```bash
npx shadcn@latest add @magicui/dia-text-reveal
npx shadcn@latest add @magicui/typing-animation
```

Both pull in `motion` (v13) — the first runtime animation dependency in the
project. Everything else here is CSS.

`NAME_SWEEP_SECONDS` and `SUMMARY_START_MS` in `page.tsx` are the timing, and
the second is **derived from the first** so retiming the sweep cannot leave the
summary typing over it. Mind the units: `DiaTextReveal` takes seconds,
`TypingAnimation` milliseconds. Measured: typed characters stay at 0 until
1478ms, which is the frame the sweep completes.

### The name

`DiaTextReveal` sweeps a gradient band across the `<h1>`.

- **`colors` is the site's own gradient**, `--gradient-from` to `--gradient-to`,
  passed as `var()` so it follows the theme. Magic UI's default is a five-colour
  palette belonging to a different brand.
- **This does not break "the gradient never goes on the `<h1>`".** That rule
  exists because `bg-clip-text` needs `text-transparent`, which costs contrast
  on the primary heading. Here the band is transient and `textColor` leaves the
  resting state at `--foreground` — verified: the settled gradient is a flat
  two-stop of the foreground colour.
- It renders the whole string throughout, so the name is in the server HTML and
  the accessibility tree, and it honours `prefers-reduced-motion` itself.

### The summary

`TypingAnimation` renders a *growing substring*, which would take the summary
out of the HTML and make a screen reader announce it a fragment at a time. So
the paragraph is two stacked layers:

- The `<p>` underneath holds the whole summary. It is what crawlers and
  assistive tech get, and it reserves the paragraph's final height — without it
  the CTAs below are shoved down a line at a time as the text arrives (measured:
  the CTA top holds at 356px for the whole animation). It is `text-transparent`,
  not `hidden`: `display: none` and `visibility: hidden` would take it out of
  the accessibility tree, which is the one job it has.
- The animation on top is `aria-hidden` and absolutely positioned over it.
- **`motion-reduce:` swaps the layers.** Magic UI drives the typing from JS
  timers, so the global reduced-motion CSS cannot reach it; the variant is what
  actually honours the setting. Verified under emulation: with `reduce` the real
  paragraph shows at `muted-foreground` and the animated layer is `display:
  none`; with `no-preference` the reverse.
- `duration={18}` (ms per character). The component's default of 100 would spend
  17 seconds on a 171-character sentence.

### Both generated files needed React 19 fixes

`src/components/ui/` is generated-then-owned, and **re-running either `shadcn
add` overwrites these**:

- `typing-animation.tsx` reset its state from an effect that called `setState`
  synchronously (`react-hooks/set-state-in-effect`). Replaced with React's
  documented "adjusting state when a prop changes" pattern — compare against the
  previous value during render.
- `dia-text-reveal.tsx` assigned two refs during render (`react-hooks/refs`),
  and the function it assigned mutates refs, which a render pass may not even
  declare (`react-hooks/immutability`). Both moved into effects; the play
  function is now defined inside its effect rather than assigned to one.

Neither is a style preference — `yarn lint` fails on all three.

## Entrance animation

`[data-rise]` uses **scroll-driven CSS** (`animation-timeline: view()`), not an
IntersectionObserver, so every section stays a Server Component. Two things are
load-bearing:

- **The hidden from-state lives only inside
  `@supports (animation-timeline: view())`.** Firefox has no support; a bare
  `opacity: 0` outside that block would leave the whole page invisible there,
  and Chrome would never show you. There is a static check for this in the
  verification notes below.
- **`animation-range` ends at `entry 100%`, not at a point in `cover`.** A
  `cover` end needs more scroll travel than a short page has: the last section
  measured stuck at **opacity 0.82** on a 1400px-tall viewport scrolled fully to
  the bottom, with no way for the reader to recover. Anything fully on screen is
  at `entry 100%` by definition, so this always completes.

## Theming

Dark mode is **class-based** (`.dark` on `<html>`), driven by `next-themes` via
`theme-provider.tsx`, which `layout.tsx` wraps around everything. `<html>` needs
`suppressHydrationWarning` — next-themes sets the class before React hydrates,
and without it React reports a mismatch on every load. Default is `system`, and
the user's explicit choice persists to `localStorage` under `theme`.

The toggle is **Magic UI's `AnimatedThemeToggler`**, installed from its registry
into `src/components/ui/animated-theme-toggler.tsx`. It owns the animation
end to end — a `clip-path` circle centred on the button, 400ms `ease-in-out`,
driven on `::view-transition-new(root)`. There is no hand-written wipe any more;
do not add one back.

```bash
npx shadcn@latest add @magicui/animated-theme-toggler   # @magicui is in components.json
```

- **It is wired in *controlled* mode, and that is load-bearing.** Passing `theme`
  makes next-themes the single source of truth; without it the component writes
  `localStorage` and toggles the class itself, and next-themes' state silently
  desyncs. `resolvedTheme` is `undefined` until next-themes resolves, and
  `undefined` counts as uncontrolled — hence `disabled={!hydrated}` in
  `site-header.tsx`, which closes that window. Verified: the theme survives a
  reload and `localStorage.theme` holds next-themes' value.
- `src/components/ui/animated-theme-toggler.tsx` is generated-then-owned like
  every other file in `ui/` — editing it is fine, but re-running the add
  overwrites it.
- The component styles nothing itself. It renders a bare `<button>`, so the
  header passes `buttonVariants({ variant: "ghost", size: "icon" })` to match the
  adjacent LinkedIn and Menu buttons (all three are `size="icon"`). That cva
  also supplies
  `[&_svg:not([class*='size-'])]:size-4`, which is what sizes Magic UI's unsized
  `<Sun />` / `<Moon />`.
- **The header's LinkedIn link is icon-only, so its `aria-label` is the only
  accessible name it has** — drop it and the link announces as its bare URL. It
  carries the "(opens in a new tab)" warning too, since no visible text is left
  to hold it. This is the opposite of the rule below: an `aria-label` is wrong
  when there *is* visible text, and required when there is not.
- **Do not pass `aria-label`** to the theme toggler. The component renders its own
  `<span class="sr-only">Toggle theme</span>`; an `aria-label` would override it.
- `variant` (circle) and `duration` (400ms) are omitted deliberately — those are
  the component's defaults. Other shapes: `square`, `triangle`, `diamond`,
  `hexagon`, `rectangle`, `star`. `fromCenter` moves the origin to the viewport
  centre.
- `globals.css` carries exactly one view-transition rule, the `animation: none;
  mix-blend-mode: normal` that Magic UI's registry item declares. Everything
  else that used to live there is gone on purpose. In particular:
  - **No `::view-transition-group(root)` duration rule is needed.** Magic UI sets
    `--magicui-theme-toggle-vt-duration` but ships nothing consuming it, and the
    UA default group animation is 250ms — so truncation looked likely. Measured:
    the animation reaches `currentTime` 400 of 400ms and `finished` resolves. A
    WAAPI animation on the pseudo-element keeps the transition alive. Don't add
    the rule back on suspicion; re-measure.
  - **The header's `backdrop-blur` does not need a guard.** The old
    `[data-theme-switching] [data-site-header]` rule is deleted. Measured with
    the animation paused at 200ms: a header pixel outside the circle still shows
    the *old* theme, so the header wipes with the body. During a view transition
    the live DOM isn't painted, so `backdrop-filter` has nothing switched to
    sample.
- **Known regression, accepted:** Magic UI has no `prefers-reduced-motion`
  branch, and the site-wide `*` rule does not reach view-transition
  pseudo-elements or WAAPI animations. Confirmed under emulated `reduce`: the
  400ms animation still runs. The deleted implementation fell through to a plain
  `setTheme`.
- **Known cosmetic regression, accepted:** the icon is React state
  (`isDark ? <Sun/> : <Moon/>`), so the server always renders `<Moon />` and it
  corrects after hydration. The button is disabled during that window.
- **The status badge sits with the role line, not above the name.** What you do
  and whether you are available read as one thought. It is `h-7`/`text-sm`,
  matching the tech chips — at shadcn's 20px default it looked like an
  afterthought beside a 24px role line. `items-center` aligns it, not
  `items-baseline`: a pill's box is the visual unit, the same reason
  `TechBadge` carries `align-middle`. Measured centre offset 0px against the
  role, and it wraps to its own line below `sm` rather than squeezing it.
- **Green tints the status frame, never its label.** `border-success/40` and
  `bg-success/10` with the text left on `foreground` — 17.5:1 in light and
  16.5:1 in dark. `--success` as text colour does not clear 4.5:1 on this
  background, and the dot already carries the colour.
- The "Available for work" dot uses a `--success` token (green, hue 148, defined
  per theme in `globals.css`) — not a raw palette class. Its ping is decorative;
  the adjacent text carries the meaning, and the global reduced-motion rule
  stops it.
- The footer carries `id="contact"` because the nav's "Contact us" item points
  there. If you add a dedicated contact section back, move that id to it.
- **The hero's top padding is asymmetric on purpose** (`pt-12 sm:pt-16` against
  `pb-20 sm:pb-28`). The sticky header already separates the hero from the
  viewport edge; a symmetric `py-28` there put a 112px void above the name.
- **Yarn Classic has no `yarn dlx`.** Use `npx` for one-off CLIs.
- Next 16 defaults to Turbopack; `--turbopack` is not a flag to add.
- **The scroll spy is tuned to two numbers that must stay in sync**:
  `ACTIVATION_LINE` (120) in `site-header.tsx` sits just below the sections'
  `scroll-mt-28` (112px). Change the header height or that scroll margin and the
  active nav item goes out of step — the last section is the first to break.
