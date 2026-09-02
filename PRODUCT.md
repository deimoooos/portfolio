# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: **technical recruiters and hiring managers, actively evaluating.** The
visitor arrives from a CV, a LinkedIn profile, or a search, usually with several
candidates open at once and a few minutes to decide whether this one is worth a
callback. They need seniority, stack, and a way to make contact without hunting.

The `available` flag in `src/lib/profile.ts` currently reads `false`, which
hides the "Open to work" status. That is a temporary state, not a change of
audience: the site is built to win a callback whether or not the badge is
showing.

## Product Purpose

A personal portfolio for Rosendo Coquilla Jr ("Sen"), a full-stack software
engineer. It exists to convert a recruiter's short evaluation into a
conversation. Success is a contact — an email or a LinkedIn connection — from
someone who arrived cold and left convinced the candidate is worth an interview.

It is not a blog, a résumé mirror, or a personal journal. Everything on it
should be answering "should I contact this person?"

## Positioning

**Architecture-led backend engineering.** The claim is designing systems rather
than delivering features: Java and Spring Boot, PostgreSQL, AWS, and the
security/IAM layer around them. This is the claim to lead with, and it is
supported by the title progression rather than asserted on its own — Software
Engineer to Senior, then Junior Software Architect, Software Development Lead,
and Software Development Assistant Manager, across roughly five years.

Adjacent claims that are **true but not the position**: the logistics and
fulfilment domain depth (two of three employers are in that sector), and the
full-stack breadth from Spring through React and Next.js. Neither should be
allowed to displace the architecture claim.

## Operating Context

The visitor is comparing candidates, not reading in depth. They scan, they open
a second tab, they come back. The site is one page plus two detail routes:

- `/` — hero, experience summary, featured tech, contact.
- `/experience` — the full career history as a timeline.
- `/tech-stack` — the complete stack, grouped by area.

Deployed on Vercel; a Docker image path also exists for self-hosting. Vercel
Analytics is installed, so traffic and route popularity are observable.

## Capabilities and Constraints

- **All content lives in `src/lib/profile.ts`.** `profile`, `experience`,
  `techStacks`, and `projects` drive every section. Content changes are edits to
  that module, not to components.
- **The engineering record is `CLAUDE.md`**, which documents the load-bearing
  decisions and the measurements behind them. It is unusually detailed and is
  meant to be read before changing layout, spacing, or the dock.
- Career history is modelled as companies containing roles, so a promotion is a
  second role under one employer rather than a second entry. Dates are ISO
  `YYYY-MM`; durations are derived at render, which is why every route sets
  `revalidate = 86400`.
- **Undecided:** whether `/experience` still earns its own route. It was built
  to hold per-role summaries, descriptions, and highlights, and those are now
  confirmed as never being filled in (see Evidence). What remains there is the
  timeline, dates, durations, and per-role stacks. This is a real open question,
  not a defect.

## Brand Commitments

- Name **Rosendo Coquilla Jr**; goes by **Sen** in first-person copy.
- The **RC monogram** favicon, in the site's blue-to-steel gradient.
- The redesign took `nishchayjain.vercel.app` as inspiration with an explicit,
  binding instruction: **do not copy it.** The site deliberately diverges on the
  four things that make that one recognisable — its navigation pattern, its
  hero, its typeface, and its palette. Recorded here because the user made it
  binding; the specifics of the resulting visual world are not product truth.

## Evidence on Hand

**Real, and safe to rely on:**

- Employment history with companies, titles, employment basis, and ISO dates:
  Entrego Fulfillment Solutions Inc. (Software Engineer, then Senior Software
  Engineer), A-Movement Corporation (Junior Software Architect), AC Logistics
  (Software Development Lead, then Software Development Assistant Manager).
- The technology list in `techStacks`.
- Contact: `rosendocoquilla@gmail.com` and a real LinkedIn profile URL.

**Absent, and must never be fabricated:**

- **Per-role outcomes, metrics, and highlights do not exist and are not
  coming.** The `summary`, `description`, and `highlights` fields on every
  `Role` still hold template text ("An outcome you are accountable for, with a
  number attached where you have one"). The user has confirmed the public record
  — companies, titles, dates, stack — is the whole story by design. Future work
  should stop treating those fields as unfinished, and must not invent numbers,
  achievements, or project results to fill them.
- **Projects are placeholder.** The `projects` array and `ProjectsSection`
  component exist but hold invented entries, and the section is not rendered.
  Real projects are intended to replace them, and that section is expected to
  return. Until the user supplies them, nothing there is true.
- **Three entries in `techStacks` are unevidenced**: the AI group, the "Security
  and IAM" group, and Kubernetes. Nothing in `experience` supports them. They
  were seeded so the page would render.
- No testimonials, case studies, press, employer logos, benchmarks, or
  photography exist. None should be introduced without the user supplying them.

## Product Principles

1. **Answer "should I contact this person?" first.** Seniority, stack, and a
   contact route are the load-bearing content; anything that delays them is
   working against the page.
2. **Lead with the architecture claim, and let the titles carry it.** The
   progression is the proof. Do not restate the claim in copy that the record
   does not support.
3. **Never fabricate evidence.** The absence of metrics is a confirmed product
   fact, not a gap to fill. Invented outcomes on a portfolio are a
   fireable-offence class of error, not a stylistic slip.
4. **Content is data, not markup.** New content goes in `src/lib/profile.ts` and
   flows to the components; a component that hard-codes a fact has bypassed the
   record.
5. **Accessibility is a floor.** Every interactive element has an accessible
   name, targets clear 24px, contrast is measured rather than assumed, and
   motion respects `prefers-reduced-motion`. This is already true throughout and
   is not to be traded away for a visual effect.

## Accessibility & Inclusion

No user-specific need has been established. The standing bar is the one the
codebase already holds and `CLAUDE.md` documents: accessible names on icon-only
controls, `sr-only` rather than `hidden` where a label is the only name, target
sizes at or above 24px, measured colour contrast in both themes, and a
reduced-motion path for every animation. Treat it as the floor for new work.
