# Changelog

All notable changes to the Stark Design System are recorded here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the
project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**Consumers should pin a tag, not `main`.** The registry serves whatever is committed, so
tracking `main` means a component can change under a project without anything in that
project having changed.

## [0.4.0] - 2026-09-07

### Added

- **The registry is hosted.** `@stark` now resolves to
  `https://stark-design-system.vercel.app/registry/{name}.json` instead of
  `http://localhost:3100`, so installing no longer requires the dev server or this checkout.
  All 32 items were fetched over HTTPS and validated after deploying: every one carries a
  `$schema`, non-empty file content, and registry dependencies that resolve.
- **`vercel.json`** sets the headers the registry needs to be consumed from elsewhere:
  `Access-Control-Allow-Origin: *`, an explicit JSON content type, and
  `s-maxage=60, stale-while-revalidate=300` so the CDN serves it without going stale for
  longer than a minute.

### Notes

- **`npx shadcn add` is currently broken upstream, for every registry including this one.**
  The CLI resolves a base style before it fetches anything, and
  `https://ui.shadcn.com/r/styles/*/theme.json` returns 404 for every style
  (`new-york`, `default`, `base-nova`, and the `-v4` variants alike). It fails identically
  by registry name and by direct item URL, in this repository and in a clean project, on
  the current CLI and on the two versions it suggests falling back to. Nothing here fixes
  it and nothing here caused it; the items themselves are served correctly and will install
  as soon as that path returns.

## [0.3.0] - 2026-09-07

A verification pass done in a real browser rather than against the source. Every item below
was measured on the rendered page; several had been passing their tests for the wrong
reason.

### Fixed

- **Storybook never loaded `globals.css`.** No token, font or radius reached any story:
  buttons rendered at 21px with square corners on `rgb(240,240,240)`, and `--primary`
  resolved to nothing. This is the single reason the system looked, in the reviewer's
  words, generic. The a11y suite passed throughout because there were no colours to
  measure -- adding the import took it from 80 passing to 13 failures, all real.
- **`tabs.tsx` matched an orientation attribute Base UI does not emit.** Twelve selectors
  used `data-horizontal:` / `data-vertical:` against Base UI's `data-orientation="..."`,
  so a horizontal tab strip rendered vertically.
- **Four contrast failures at the token level**, not per component: `muted-foreground` on
  `muted` measured 4.39:1, and `destructive` as text on its own 10% tint measured 3.29:1
  -- both just under AA, which is exactly the range that survives review by eye.
  `success` and `warning` then landed at 4.38 and 4.39 and were darkened a further ramp
  step. Every value now clears 4.5:1 on its tint, on white, and as a solid surface.
- **Dark mode had an unreadable error toast.** `destructive` in dark mode was `#7f1d1d`, a
  background colour, so `text-destructive` was near-invisible on a dark surface. Making it
  legible (`#f87171`) then broke the solid `bg-destructive text-destructive-foreground`
  toast at 2.2:1. A role used both as text and as a surface needs its foreground to flip
  per theme; dark's is now `#450a0a`, measured at 5.84:1 in the browser.
- **`CardTitle`'s size could not be overridden on a small card.** `group-data-[size=sm]/card:text-sm`
  is not a font-size conflict tailwind-merge can resolve, so a passed `text-2xl` survived
  the merge and lost on specificity -- silently. Dashboard metrics rendered at 13px, the
  same size as their own labels. The size now comes from `--card-title-size`, which merges.
- **A comment could become an npm dependency.** `build-registry.js` derived dependencies by
  regexing `from "..."` over raw source, so prose containing that shape was published as a
  package name in a registry item -- an uninstallable component in someone else's project,
  with nothing failing here. Comments are stripped before imports are read.
- **`CommandEmpty` reserved 48px of blank space while results were showing.** Its padding
  is now collapsed with `empty:py-0` rather than `display:none`, which would stop the
  `role="status"` live region announcing.
- **The search block's pagination contradicted its own results** -- pages 1, 2, ... 9 with
  Next enabled beside the words "Showing 0 of 8". It is now derived from the results,
  hidden below two pages, and clamped when filtering strands the reader past the end. The
  result count no longer duplicates the empty state, which was announcing it twice.
- **The dashboard shipped shadcn's demo dataset** ($45,231.89 / +20.1% / 2,350 / 12,234 /
  573), which is recognisable on sight and the most direct reason the page read as
  generated. Replaced, and the tiles now separate direction from sentiment: rising failed
  payments is an up arrow in red, not green.
- **`layout.tsx` still carried the create-next-app metadata** -- every page titled "Create
  Next App".
- **`npm run build:ds` failed at random while the dev server was running.** `next dev`
  watches `public/`, and on Windows its handle makes a concurrent open fail with a bare
  `UNKNOWN` -- roughly two runs in three. The generated output was fine; the write had
  simply collided with a reader. Writes now retry for a second on the contention codes
  only. Measured 0 failures in 8 consecutive runs with the dev server up.

### Added

- **`success` and `warning` colour roles**, light and dark, each with a `-foreground`, plus
  matching `Badge` variants and stories that measure them. A palette that could say "this
  failed" but not "this succeeded" pushed every other status into grey.

## [0.2.0] — 2026-09-07

### Added

- **`npm run check:usage`** — enforces the DESIGN.md rules against the source rather than
  asking an agent to remember them: no raw Tailwind palette classes, no hex literals, no
  `<Button render={<Link/>}>`, no second primitive library. Wired into `build:ds` and CI.
- **Named registry** — `@stark` in `components.json`, so `npx shadcn add @stark/button`
  works. One line to change when the registry is hosted; nothing else refers to the URL.
- **Rewritten `agent-instructions.md`** — retrieval, tokens, forms, buttons-vs-links, and
  a list of commands to *run* before claiming done, plus the three things only a person can
  confirm (both themes, keyboard-only, empty and error states).
- **`AGENTS.md` now describes the design system**, above the Next.js block that `next dev`
  regenerates. It previously contained nothing about this repository.

### Fixed

- **`<Button render={<Link/>}>` on the home page.** Base UI warns at runtime that rendering
  a non-`<button>` strips button semantics, and the result loses middle-click,
  open-in-new-tab and copy-link. Both are now anchors styled with `buttonVariants()`, which
  is the pattern `pagination.tsx` already used. The rule is in DESIGN.md and enforced by
  `check:usage`.
- **The last 13 generated story stubs.** Every story is now real; assertions went from 53
  to 80, all passing with accessibility at `error`.

## [0.1.0] — 2026-09-07

First tagged release. The system is installable: `npx shadcn add <registry>/button.json`
produces a component that compiles and is correctly themed in the target project.

### Added

- **26 components** on [Base UI](https://base-ui.com) — alert, avatar, badge, breadcrumb,
  button, card, checkbox, command, dialog, dropdown-menu, form, input, label, pagination,
  popover, progress, radio-group, select, separator, skeleton, switch, table, tabs,
  textarea, toast, tooltip.
- **5 page blocks** — dashboard, settings, detail, onboarding, search. Each is composed
  from the components and ships as a `registry:block`, so an agent can install a whole
  screen rather than reassembling one.
- **Registry** — per-item JSON with `$schema`, a `registry.json` index, and a
  `registry:theme` item carrying 70 CSS variables.
- **Token families** — colors, radii, spacing, shadows, breakpoints, motion, and a
  typography scale (size, weight, leading), all generated from `tokens.json` into both
  `globals.css` and the registry theme.
- **`npm run check:registry`** — fails the build when a dependency does not resolve, a
  registry dependency has no item, a CSS variable is missing from the theme, or an import
  is undeclared.
- **Enforced accessibility** — Storybook's a11y addon runs at `error`, so a violation
  fails the test run rather than being noted in a panel.

### Fixed

- **Registry items declared only a fraction of their dependencies.** The build script
  matched a hard-coded whitelist (`@radix-ui/`, `clsx`, `tailwind-merge`) against a
  codebase that uses none of them, so every item shipped declaring one package while
  importing three. Installed components could not compile. Dependencies are now derived
  from each file's imports.
- **Token colours were emitted in a format Tailwind v4 cannot use.** Hex was converted to
  bare HSL triplets (`--primary: 240 6% 10%`), a Tailwind v3 convention; under v4's
  `@theme inline` the value is used verbatim, so `bg-primary` resolved to an invalid
  colour and was dropped. Every token-driven colour in the app was inert.
- **No theme was distributed.** Components installed referencing `bg-primary` and
  `--radius-md` into projects that had never heard of them.
- **`--radius-md` and `--radius-lg` did not exist in `tokens.json`.** They were computed
  inside the CSS template, so the registry theme could not see them, while `button.tsx`
  referenced them directly.
- **The page patterns did not use the design system.** They were hand-written markup with
  `{/* Card Placeholders */}` comments duplicating component styling inline, importing
  nothing. They are now composed from the components.
- **Every story was a generated stub** (`args: { /* Add default props here */ }`),
  rendering bare components. Coverage was 100% by file count and near-zero in substance —
  and the stubs failed accessibility for reasons that had nothing to do with the
  components. All 26 are now real.
- **`CommandList` had no accessible name**, and `CommandEmpty` (`role="status"`) sat inside
  it, which a `listbox` does not permit.
- **`DESIGN.md` instructed agents to use Radix UI**, which the codebase does not use. It
  now names Base UI and forbids adding a second primitive library.

### Notes

- The primitive layer is **Base UI**. Radix, React Aria and HeroUI must not be added:
  a second primitive layer means two focus-management models and two portal
  implementations in one codebase.
- Blocks from external registries may be used as reference for structure only — they ship
  Radix and must be ported onto these components.
