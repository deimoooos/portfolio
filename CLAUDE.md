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

BUILD_STANDALONE=1 yarn build   # what the Dockerfile runs; adds .next/standalone

docker build -t portfolio .
docker run --rm -p 3000:3000 portfolio
```

## Icons

The favicon is the initials "RC" in white on the site's own blue-to-steel
gradient. Three PNGs in `src/app/`, which Next turns into `<link>` tags on its
own — there is no `metadata.icons` entry to keep in step:

| File | Size | Emitted as |
|---|---|---|
| `icon.png` | 32 | `rel="icon" sizes="32x32"` |
| `icon1.png` | 192 | `rel="icon" sizes="192x192"` (numbered files sort lexically) |
| `apple-icon.png` | 180 | `rel="apple-touch-icon"` |

- **The master is `src/assets/icon-source.svg`**, deliberately outside
  `src/app/` — any `icon.*` in that directory becomes another emitted icon.
  Edit the SVG and re-render; do not hand-edit the PNGs.
- **The two favicons are RGBA with transparent corners; `apple-icon.png` is
  opaque and full-bleed** (`rx="0"`). iOS masks its own squircle and renders
  transparency as black, so a rounded, transparent Apple icon shows black
  corners inside the mask.
- **Rasterising needs a transparent backdrop.** Rendering through headless
  Chrome without `Emulation.setDefaultBackgroundColorOverride({color:{r:0,g:0,b:0,a:0}})`
  composites onto the browser's opaque white canvas: that is where white corners
  come from, and it also strips the alpha channel. A `favicon.ico` built from
  those RGB frames **failed the build** — Turbopack rejects it with "The PNG is
  not in RGBA format!".
- **There is no `favicon.ico`.** create-next-app's default (the Next logo) was
  removed, since browsers request `/favicon.ico` in preference to a declared
  icon and it would have won. That path now 404s; every modern browser uses the
  declared PNGs instead.
- The gradient stops are the sRGB values of `--gradient-from` / `--gradient-to`
  (`#1b3a6b`, `#006687`). Change the tokens and these do not follow — an icon
  file cannot read custom properties.

## Analytics

`@vercel/analytics` is mounted as `<Analytics />` at the end of `<body>` in
`layout.tsx`. It renders nothing and only collects on a Vercel deployment; off
that host it no-ops, so local and Docker builds are unaffected. Confirmed live
in the DOM — in development it loads `va.vercel-scripts.com/v1/script.debug.js`,
in production `/_vercel/insights/script.js`.

**Install it with `yarn add`, not `npm i`.** This project is Yarn 1 with a
`yarn.lock`; an `npm install` writes a `package-lock.json` beside it and the two
drift.

## Deployment

**`output: "standalone"` is opt-in, gated on `BUILD_STANDALONE=1`, and the
Dockerfile is the only thing that sets it.** It used to be unconditional, which
broke deploying to Vercel: that option makes `next build` run an extra step that
assembles `.next/standalone` from `.next/next-server.js.nft.json`, and on Vercel
the build died *inside* `next build` with `ENOENT` on that manifest. Vercel
traces and packages the output itself and has no use for the directory. The
Dockerfile's runner stage does, so it sets the variable in its builder stage —
move the build elsewhere and the variable has to move with it. Verified both
ways: the default build produces the manifest and no `standalone/`; with the
variable set, `.next/standalone/server.js` exists and the image serves all three
routes.

**Vercel does not read `.nvmrc`.** It takes the Node version from Project
Settings, so the 24.18.0 pin is a local convenience only.

**`shadcn` belongs in `devDependencies`.** It is a CLI invoked through `npx`
(which fetches its own copy) and nothing imports it; in `dependencies` it shipped
to production for no reason.

## Layout

```
src/app/                     App Router: layout.tsx, page.tsx, globals.css
src/app/icon*.png            Favicons; apple-icon.png for iOS
src/assets/                  Source artwork, not routes (icon-source.svg)
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

**Each landing row is a link to that company's own anchor** —
`/experience#a-movement`, not the top of the page. Those anchors already
existed and nothing reached them; the row was a plain `<article>` that still
carried `hover:` styling, so it looked interactive under a mouse, did nothing
when clicked, and had no state at all on touch. Four things about the row are
load-bearing:

- **The whole row is the link, not the title.** The accessible name then
  carries all four facts — "2023, Full-time, Junior Software Architect,
  A-Movement Corporation" — which is exactly what someone needs before
  activating it. A link around the title alone would announce a job title with
  no employer.
- **The arrow is visible at rest, not revealed on hover.** A hover-only
  affordance does not exist on a phone: at 390px these rows were three blocks
  of plain text with nothing saying they were tappable. It is
  `text-muted-foreground`, which measures 4.74:1 light and 7.66:1 dark — a
  control conveying meaning needs 3:1, and `/50` gave 1.96 and 2.7.
- **It sits at the row's right edge, not after the title.** The row is full
  width, so an arrow tucked after the words leaves ~380px of empty panel to its
  right the moment the hover fill appears; out at the edge the three arrows line
  up into a right-hand column answering the year column on the left. Inside the
  `<h3>` it also wrapped to a phantom second line on the longest title at 390px,
  making that row 28px taller than its neighbours.
- **`transition-[…,translate]`, not `transform`.** Tailwind v4 compiles
  `-translate-y-0.5` to the standalone `translate` property, so a transition
  list naming `transform` animates nothing and the lift snaps.

**Hover and focus raise contrast; nothing dims.** The year takes the accent, the
company name comes to full `foreground` at 60ms, the arrow at the far edge lands
at 120ms — the row resolves left to right rather than changing all at once.
Receding the *other* rows is the usual way to focus a list, and it was measured
and rejected: it takes the muted secondary text from 4.7:1 to about 2.6:1 for as
long as the pointer is anywhere in the list. Measured on the hovered row, both
themes: title 19.0/17.2, company 19.0/17.2, year 10.8/8.5, basis 4.5/6.9.

**The role titles carry the section**, so they are `text-lg` rather than sharing
a size with body text. The claim the page makes is a progression — Engineer to
Senior to Architect to Lead to Assistant Manager — and it is carried by the
titles rather than asserted in copy.

### Arriving at an anchor says so

`[data-target-flash]:target` gives the thing you asked for one soft pulse —
`box-shadow` plus a `--glow` tint, fading over 2.2s after a 0.35s delay that
lets the smooth scroll land. It is on `/experience`'s company `<article>`s and
`/tech-stack`'s group `<section>`s.

- **`box-shadow`, not padding or margin.** It adds no layout at all, so it
  cannot disturb the timeline rail's dot arithmetic, which is measured against
  the heading's first line.
- It is motion, so it lives inside the reduced-motion guard. Without it there is
  no pulse and `scroll-mt-32` parking the entry at the top is the
  acknowledgement.

**`/tech-stack`'s group `<section>`s had no `id` at all.** The id was computed
only to label the heading (`${id}-heading`), so `/tech-stack#backend` resolved
to nothing despite the `scroll-mt-32` sitting there ready for it. The id is now
on the section, and the group index above the list is what uses it. `groupId()`
is the single definition both share.

**The index's counts are hidden from assistive tech.** A flex `gap` is not a
word separator, so the bare numeral ran into the label as "Frontend5"; the
digits are `aria-hidden` and an `sr-only` phrase carries the count. Verified
against the AX tree: "Frontend , 5 technologies".

`/experience`'s "Career" eyebrow now carries the whole span beside it, derived
through the same `companySpan` the entries use.

### Tech stacks

`techStacks` in `src/lib/profile.ts` is the whole list, grouped by
`TechCategory`. **`featuredTech` is derived from it**, by filtering the items
flagged `featured` — so the landing page's short list cannot name something the
full page lacks. Add or drop an entry by moving a flag, never by editing the
landing section. A group with no items is skipped rather than rendered as a bare
heading, so emptying one removes it. **`techCount` is derived the same way** and
is what the landing section's link says ("All 30 technologies") — the one thing
a reader cannot tell from the short list is that it continues, and by how much.
Deriving it means the link cannot quote a number the page it points at does not
have.

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

**The dock is Magic UI's `Dock`** (`src/components/ui/dock.tsx`), installed from
its registry and wired up in `site-header.tsx`:

```bash
npx shadcn@latest add @magicui/dock
```

It is `fixed`, floating and top-centred. `top-4` + `h-16` puts its bottom edge
at **80px**, and `ACTIVATION_LINE` (136), the sections' `scroll-mt-32` (128px)
and `body`'s `pt-20` (80px) are all derived from that edge — move the dock and
all three have to move. Its wrapper spans the viewport only to centre the dock,
so it carries `pointer-events-none` with `pointer-events-auto` restored on the
dock; without that it would eat clicks across the full width.

Five things about the wiring are load-bearing:

- **`iconMagnification` is 48, not Magic UI's 60.** The dock is `h-16` with
  `p-2`, so 48px is exactly the content box. At the default, a magnified tile is
  60px inside a 42px box and spills through the top and bottom edges — which
  reads as intended on a macOS dock at the bottom of the screen and as broken on
  one pinned to the top. Measured: vertical spill is 0px at rest *and* hovered.
- **`mt-0` and `h-16` override the component.** `dockVariants` carries `mt-8`,
  which would drop the dock 32px below where `top-4` puts it, and `h-[58px]`,
  which does not fit the magnification.
- **The fill, border and shadow are ours, not Magic UI's.** Theirs is
  `bg-white/10` / `dark:bg-black/10` — raw palette colours this project does not
  use, and nearly invisible in light mode. `shadow-foreground/…` rather than a
  fixed black, because `--foreground` flips per theme, so one class casts a drop
  shadow on light and a soft halo on dark.
- **`role="navigation"` + `aria-label="Main"` go on the `Dock`.** It renders a
  plain `motion.div`, so the `<nav>` landmark the old pill had has to come from
  those props, or the section links sit in no landmark at all.
- **Every target covers its whole circle.** `DockIcon` applies its padding as an
  inline style that no class can override, so a link confined inside it had a
  24px hit area in a 40px tile. The `DockIcon` gets `relative` and each link or
  button `absolute inset-0`. Measured: all six targets are 40x40, and the glyphs
  are `size-1/2` so they scale with the magnification instead of sitting at a
  fixed size in a growing tile.

**Two edits to the generated file**, which re-running `shadcn add @magicui/dock`
would overwrite:

- `DockIcon` wrapped its children in a bare `<div>` that collapses to its
  content; it now carries `flex size-full items-center justify-center` so the
  child can fill the magnifying box.
- `DockProps` typed none of the props it spreads onto the `motion.div`, so the
  component rejected the ARIA attributes it happily forwards. It now extends the
  same `Omit<MotionProps & React.HTMLAttributes<HTMLDivElement>, "children">`
  that `DockIconProps` already used.

**The dock is icon-only, and the labels are `sr-only`.** Icons come from
`NAV_ICONS` in `site-header.tsx`, keyed by nav id — kept out of `nav.ts` so that
stays a plain data module with no React imports, the same split as `TECH_ICONS`.
`DockIcon` is a fixed square that scales, so the visible icon-over-label layout
the pill had does not survive the swap; `title` gives sighted readers the word on
hover. **The `sr-only` span is never `hidden`** — it is each link's *only*
accessible name, and `display: none` would strip it from the accessibility tree
and leave four unnamed links. Verified against the a11y tree: "Home",
"Experience", "Stack", "Contact".

**The active item is not identified by colour alone.** It was a `primary/10`
tint plus a `primary` glyph — hue and nothing else, which is the one thing a
navigation indicator may not rely on. It now carries an inset ring as well, so
it has a shape: `inset-ring-1 inset-ring-primary/40`. **Tailwind v4 replaced the
inset modifier with its own utility** — `ring-1 ring-inset` is not a class in
v4, and it rendered as `box-shadow: none`. Inset rather than outset because the
tiles sit `gap-1` apart and grow under magnification.

**All six targets answer the press.** None of them had an `:active` state, so on
a phone a tap gave nothing back until the page started moving — and tapping the
section you were already on did nothing at all. `active:scale-90` with a 150ms
ease-out; `:active` is the one press affordance that fires on touch. Measured:
all six targets 40x40 with a transform transition.

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

**Sections clear the dock by more than the anchor's own error.** `scroll-mt-32`
(128px) against a dock whose bottom edge is 80px looks over-generous until you
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
sections still activate because 128 stays below `ACTIVATION_LINE`.

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
  maps a tech name to a Simple Icons mark. Add new entries to `TECH_ICONS`.
  - **The mark rests at `muted-foreground` and blooms to its brand colour on
    hover.** A step back from its own label at rest, so a chip reads as artwork
    plus a name rather than one uniform grey block — and so the bloom has
    somewhere to travel from. This is the only drawn artwork on an otherwise
    entirely typographic site, and colour is how a reader recognises a stack
    faster than they can read it; the neutral resting palette is what stops that
    becoming logo soup.
  - **The brand hex is re-lit, not used raw.** `Mark.hex` feeds `--brand`, and
    the `brand-mark` utility in `globals.css` rewrites it as
    `oklch(from var(--brand) clamp(var(--brand-l-min), l, var(--brand-l-max)) c h)`
    — hue and chroma kept, lightness clamped into a per-theme band
    (`0–0.62` light, `0.64–1` dark). A brand hex is fixed while the surface
    under it flips: without the band, React's `#61DAFB` washes out on white and
    anything dark vanishes on the dark canvas. Relative colour syntax is the
    whole mechanism; where it is unsupported the declaration is invalid and the
    mark stays in `currentColor`, which is its resting appearance anyway.
    Measured lit: 3.29–18.97 light, 4.80–17.18 dark.
  - **An achromatic brand goes to `foreground`, not through the band.**
    Next.js and OpenJDK are both literally `#000000`; clamped they land on a mid
    grey that in dark mode is *dimmer* than the resting `muted-foreground` — a
    bloom running backwards (measured 6.94:1 at rest, 5.33:1 "lit"). `isNeutral`
    catches those by channel spread and swaps in `text-foreground`, which
    measures 18.97 light and 17.18 dark.
  - **The chip box itself has no hover state.** `border-primary/40` is the
    signal every genuinely clickable surface on this page uses, and a chip is
    content, not a control — the same false affordance the landing page's
    experience rows carried before they became links. Only the mark responds,
    and a logo colouring in reads as the mark noticing you rather than as a
    button. Nothing is gated behind it, so touch and keyboard lose no function.
  - **Unmapped names render text-only by design.** Simple Icons has dropped the
    whole Amazon and Microsoft families over trademark, so "Amazon Web Services"
    and "Microsoft Power Platform" have no Simple Icons entry — both are inlined
    in `src/components/icons.tsx` instead. Microsoft's carries no `hex`: its
    four-square is four colours, and flattening it to any one of them would be
    wrong rather than merely plain, so it does not bloom. OpenAI and Apidog have
    no mark at all.
    Java's coffee cup is gone for the same reason — `siOpenjdk` stands in.
    Check the installed package before adding a key rather than guessing at an
    export name; roughly 3,450 icons ship and the misses are not obvious.
  - `getTechIcon` falls back to the name with a trailing version stripped, so
    "Java 8", "Java 17" and "Java 21" all resolve to one entry.
- **`TechBadge` carries `align-middle`, and it is not cosmetic.** `Badge` is
  `inline-flex`, so it aligns on *its own* baseline — which is its first flex
  item's: the `<svg>` for a mapped tech, the text run for an unmapped one. Those
  differ by 2px, so a text-only badge (OpenAI) sits lower than its neighbours
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
- **Hoverable surfaces all pick up `primary`, never a neutral.** The contact
  cards hover to `border-primary/40`, and the landing page's experience rows do
  too — they were the only ones going to `border-surface-border`, which read as
  a different interaction from every other card on the page. The rule is about
  *which* colour a control uses, not about what may hover: the tech chips used
  to take `border-primary/40` and no longer do, because they are not controls. Measured: the hovered row border composites to
  `#3d4e69` in dark and `#a4b0c4` in light. Note that every *blue* on the page
  is already one colour — `--primary` and `--gradient-from` are the same value
  in both themes, so the section links, the hero CTA and the dock's active item
  all resolve to the same hex.
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

### The room's light

`AmbientLight` (`src/components/ambient-light.tsx`) is one fixed layer behind
every route: two washes in the site's own gradient stops, cross-faded against
scroll depth, so the page is lit blue where you start reading and steel where
you finish. Mounted in `layout.tsx` at `-z-20`, behind `MarginTexture`'s
`-z-10`.

It exists because **everything below the hero had no atmosphere at all**.
`/experience` and `/tech-stack` each carried a copy of the hero's wash "so the
routes read as one site" — which is what a shared layer does properly. Those two
copies are gone; the hero keeps its own glow, which is the focal moment and
arrives with the name sweep.

- **Radial gradients, not blurred elements.** A `blur-3xl` div re-rasterises its
  filter whenever anything about it changes; a `radial-gradient` is painted once
  and then only composited. This animates on every scroll frame, so that is the
  whole performance budget. Verified: `filter: none` on both layers, and the
  only animated properties are `opacity` and `translate`.
- **Scroll-driven, so nothing runs at rest.** There is no loop to pause when the
  tab is hidden and no frame is spent until the reader moves. Measured
  0 → 0.5 → 1: warm 1 → 0.6 → 0.2, cool 0 → 0.5 → 1.
- **`fixed` with `overflow-hidden`.** Same reasoning as `MarginTexture`: no
  relationship to document height, cannot lengthen the page, cannot create the
  horizontal overflow decorative layers here have caused twice. Verified across
  scroll on desktop and mobile — document height unchanged, `scrollWidth` equal
  to `clientWidth` throughout.
- **Guarded twice, in opposite directions.** `@supports (animation-timeline:
  scroll())` keeps Firefox on the resting state rather than a half-applied one;
  the reduced-motion guard drops the traverse. Both land on warm at full and
  cool at zero — the single blue wash the routes had before — so neither
  failure mode is an absence of design. Verified under emulated `reduce`: both
  layers pinned at rest across all scroll positions.

**Light mode's wash is far weaker than dark's, and that is measured rather than
taste.** A wash over a white canvas only subtracts luminance, and
`--muted-foreground` starts at 4.74:1 there — about a quarter of a point above
AA. Swept: at 18% (what `--glow` is) muted text over the wash measures 3.74:1;
at 8% it is 4.30; even a tint pale enough to be invisible (`#ecf7ff`) only
reaches 4.36. **There is no alpha at which a perceptible light-mode wash clears
4.5 behind that token.**

So 8%/7% is a compromise, not a solution — it is visible, and it is better than
the 18% wash the hero glow and both route washes were already putting behind
muted text before this existed. **The durable fix is to give
`--muted-foreground` headroom in light mode**, which would re-baseline every
contrast figure in these notes and is not a change to make in passing. Dark has
no such problem: a wash on a near-black canvas adds light rather than removing
it, and muted measures 5.88:1 and 5.63:1 over these.

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

### The hero arrives as one gesture

Three overlapping beats, all derived from `--sweep`, which `page.tsx` sets on
the `<header>` from `NAME_SWEEP_SECONDS`:

| Beat | Runs | Driven by |
|---|---|---|
| Name sweeps | 0 → 1.2s | `DiaTextReveal` (JS) |
| Glow arrives | 0 → 1.2s | `[data-hero-glow]`, CSS |
| Role line wipes in | 0.78 → 1.33s | `[data-hero-role]`, CSS |
| Summary types | 1.4s → | `TypingAnimation` (JS) |

Measured on the production build, both themes: role clip holds at `inset(0 100%
0 0)` until ~780ms and reaches 0% by 1.5s; the first typed character lands
between 1500 and 1800ms. The name-then-summary order is intact.

- **The glow moves only LEFT of where it rests, and rests where it always did.**
  It travels `-45% → 0` with the band, so the sweep reads as a light passing
  over the name rather than a gradient trick. Overflow to the left is free in
  LTR; overflow right is what creates a horizontal scrollbar, and this glow has
  caused that before. Verified 1280/1280 and 390/390 throughout the animation.
- **The role wipe overlaps the sweep's tail rather than queueing behind it**
  (`calc(var(--sweep) * 0.65)` delay, `* 0.46` duration), so the two read as one
  motion travelling down the page without lengthening the load.
- **Their from-states live only inside `@media (prefers-reduced-motion:
  no-preference)`**, for the same reason `[data-rise]` has its `@supports`
  guard: a bare `clip-path: inset(0 100% 0 0)` would hide the role line outright
  wherever the animation does not apply. The global reduced-motion rule
  collapses `animation-duration` but **not** `animation-delay`, so an unguarded
  version would leave the role line clipped for 780ms and then snap in.

### The name must not depend on JavaScript

**`sweepPos` is seeded at `SWEEP_END`, not `SWEEP_START`.** `buildGradient`
returns a flat two-stop of `textColor` once the band has passed and a fully
transparent fill before it arrives — and this is `background-clip: text` over
`color: transparent`, so the start value renders the `<h1>` **invisible**.

That was shipping: the server HTML carried
`linear-gradient(90deg, … transparent 0.00%, transparent 100%)`, so the name did
not exist until React hydrated and motion ran. Seeding the end state makes the
sweep a pure enhancement — the built HTML now carries
`linear-gradient(90deg, var(--foreground), var(--foreground))` — and `play()`
sets `SWEEP_START` itself before animating, so the animation is unchanged.

This is a **fourth owned edit** to `dia-text-reveal.tsx`; re-running
`shadcn add @magicui/dia-text-reveal` overwrites it along with the other three.

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
- **The email card holds two controls, so it is a `<li>`, not an `<a>`.** The
  address opens a mail client; the button beside it puts the address on the
  clipboard, which is what a recruiter on a machine with no mail client actually
  wants. A `<button>` inside an `<a>` is invalid, so the anchor covers the card
  with `after:absolute after:inset-0` and the copy button sits above that
  overlay on `z-10` — verified by hit-testing the button's centre. The focus
  ring moves back onto the card with `has-[a:focus-visible]`, or it would wrap
  the address alone.
- **`CopyEmail` is the only client component outside `site-header.tsx`**, and it
  earns it: `navigator.clipboard` is a browser API. Its confirmation is
  announced, not just drawn — the icon swap is invisible to a screen reader, so
  a `role="status"` region says it. If the write rejects (it needs a secure
  context) nothing is claimed and the label stays "Copy". Verified end to end:
  the clipboard really holds the address.
- **The footer carries contact links again, but as links, not an id.** `/` has
  `ContactSection` directly above it, so there it repeats — but `/experience`
  and `/tech-stack` have no contact anywhere on the page, and a reader who has
  just finished five roles is exactly the one who might write. The dock's mail
  icon does reach `/#contact` from there; this is one step where that is two.
- The footer carries `id="contact"` because the nav's "Contact us" item points
  there. If you add a dedicated contact section back, move that id to it.
- **The hero's top padding is asymmetric on purpose** (`pt-12 sm:pt-16` against
  `pb-20 sm:pb-28`). The sticky header already separates the hero from the
  viewport edge; a symmetric `py-28` there put a 112px void above the name.
- **Yarn Classic has no `yarn dlx`.** Use `npx` for one-off CLIs.
- Next 16 defaults to Turbopack; `--turbopack` is not a flag to add.
- **The scroll spy is tuned to two numbers that must stay in sync**:
  `ACTIVATION_LINE` (136) in `site-header.tsx` sits just below the sections'
  `scroll-mt-32` (128px). Change the header height or that scroll margin and the
  active nav item goes out of step — the last section is the first to break.
