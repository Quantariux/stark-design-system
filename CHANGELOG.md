# Changelog

All notable changes to the Stark Design System are recorded here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the
project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**Consumers should pin a version, not `main`.** Two paths serve every item:

- `https://stark-design-system.vercel.app/registry/{name}.json` always reflects the latest
  deploy. Convenient, and it means a component can change under a project without anything
  in that project having changed.
- `https://stark-design-system.vercel.app/registry/v0.6.0/{name}.json` is written once per
  release and never rewritten. Point `components.json` at that one.

A git tag pins this repository; it does not pin what `shadcn add` downloads into someone
else's app. The versioned path is what does.

## [Unreleased]

### Added

- **One registry tree per primitive.** The system now emits `/registry/` (Base UI),
  `/registry/radix/` and `/registry/aria/`, each with a pinned twin. A consuming project
  selects its primitive by choosing a URL, which is the only way this can work: the project
  already has a primitive installed, and handing it a second one is how a codebase ends up
  with two focus-management models and two portal implementations. `base` also serves the
  bare `/registry/` path, so existing consumers are unaffected.

- **`check:usage` enforces one primitive per variant, not one per repository.** The rule
  that mattered was never "Base UI everywhere" -- it was that a single *installed* tree must
  not mix primitives. That holds per variant, so the three trees may differ while none of
  them mixes. Verified by testing all three cases: a Radix import fails inside the Base UI
  tree, passes inside the Radix tree, and fails in a block.

### Notes

- **The Radix and React Aria trees are deliberately partial** -- 7 items each, against 32
  for Base UI. They carry the components that touch no primitive and are therefore already
  correct everywhere. Anything that wraps a primitive appears only once ported; serving the
  Base UI file from a `/radix/` path would be a lie the consumer discovers at runtime.

- **Completeness is enforced in both directions, to a fixed point.** A variant missing
  `switch` does not offer the `settings` block, and `pagination` -- which touches no
  primitive at all -- is withheld too, because it composes `button`. Dependencies chain, so
  dropping one component drops whatever composed it. Each skip reports exactly what it
  needs.

- 19 components remain to port, twice over. Blocks need no porting: they compose
  `@/components/ui/*` by alias, so one block source serves every variant.

## [0.6.0] - 2026-09-08

### Added

- **All three primitive trees are complete.** Base UI, Radix and React Aria each ship 32
  items, all five blocks, and pass the same 26 story files and 80 assertions. The stories
  are shared and aliased per project, so the trees are held to being equivalent rather than
  separately correct: a port that changes focus order, drops an aria attribute or breaks
  keyboard operation fails the same assertion that guards Base UI.

- **Storybook can show a variant.** `npm run storybook:radix` (:6007) and
  `npm run storybook:aria` (:6008) alongside `npm run storybook` (:6006). Module resolution
  happens at build time, so a toolbar switch is not possible -- one process per variant is
  the honest shape. A variant shows a story only where it has ported that component.

### Notes

- **React Aria diverges far more than Radix does, and almost all of it is silent.** It uses
  `isSelected` / `defaultSelected` / `isDisabled` where the DOM uses `checked` /
  `defaultChecked` / `disabled`; passing the DOM name is not an error, it is an unknown prop
  that is ignored, so a switch renders off while the caller believes it is on. Tabs are
  addressed by key rather than value, so a `value` prop would leave every tab sharing one
  generated key. It dispatches `onPress` rather than `onClick`, so an onClick handed to a
  RAC Button is dropped and the button looks right while doing nothing. Selection is
  `data-selected`, and because RAC renders a label around a hidden input, focus styling
  reads `data-focus-visible` rather than the `:focus-visible` pseudo-class.

- **Four components have no counterpart in one tree or the other and were built here.**
  Radix has no toast queue, no combobox, and a Form shaped nothing like this API; React Aria
  has no Avatar, and its toast is `UNSTABLE_`-only -- not a dependency to hand a consumer
  under a caret range, so that tree implements its own with the pause-on-hover-and-focus
  behaviour that makes a toast readable.

## [0.5.0] - 2026-09-07

### Added

- **A registry tree per primitive, and the Radix tree is complete.** `/registry/` serves
  Base UI, `/registry/radix/` serves Radix, `/registry/aria/` serves React Aria, each with
  a pinned twin. A project picks its primitive by choosing a URL, because the project
  already has one installed and handing it a second is how a codebase ends up with two
  focus-management models. The bare path still serves Base UI, so existing consumers are
  unaffected.

  This exists because forcing one primitive was wrong about the consumers: of 17 projects
  checked, 5 run Base UI, 3 run Radix and 4 have both installed. Seven would have received
  the wrong primitive.

- **All 19 primitive-backed components ported to Radix** — 32 items, all five blocks, and
  the same 26 story files and 80 assertions that guard Base UI. The variants are held to
  being equivalent rather than separately correct: the stories are shared, aliased per
  project, so a port that changes focus order or drops an aria attribute fails the same
  assertion.

### Changed

- **`check:usage` enforces one primitive per variant, not one per repository.** The real
  constraint was never "Base UI everywhere" — it is that a single *installed* tree must not
  mix primitives, and that holds per variant. A Radix import is correct inside
  `src/variants/radix` and a bug anywhere else, including in a block.

### Notes

- **The React Aria tree is deliberately partial** — 7 items, the components that touch no
  primitive. Anything wrapping a primitive appears only once ported; serving the Base UI
  file from an `/aria/` path would be a lie the consumer discovers at runtime.

- **Three components could not be translated and were rebuilt.** Radix has no toast queue,
  so the manager behind `useToast()` is reimplemented on its declarative primitives. Its
  Form is built on native constraint validation with `match` predicates and has no
  Description part, so adopting it would have changed the public API — the one thing a
  variant may not do. And it has no combobox at all: `command` is implemented directly
  against the ARIA combobox pattern rather than on `cmdk`, which filters internally and
  would filter a second time over a list the caller has already filtered.

## [0.4.1] - 2026-09-07

### Fixed

- **Registry cross-references pointed at shadcn's components, not ours.** Every item
  declared its dependencies as bare names -- `button`, `theme`, `card` -- and shadcn
  resolves a bare name to its own built-in item, by documented design: "`button` means the
  built-in shadcn `button` item." So `@stark/dashboard` would have installed shadcn's
  badge, button, card and table beside our block, and `theme` resolved to a shadcn style
  theme that does not exist, which is what made every install fail outright.

  Nothing in the JSON looked wrong, and `check:registry` passed throughout: it resolved
  bare names the way this repository means them rather than the way the CLI reads them. It
  now rejects any dependency that is not an absolute URL into this registry, and that rule
  was verified by reintroducing the exact bug and watching it fail.

  Dependencies are now absolute URLs, per tier, so the pinned dashboard pulls the pinned
  button rather than whatever is deployed today -- pinning a tree, not just an item.

  Verified end to end: `npx shadcn@latest add @stark/dashboard` into a clean project
  installs the block and our four components, writes our tokens into `globals.css`, and
  pulls `@base-ui/react` with no Radix anywhere.

- **The earlier diagnosis was wrong.** This was reported as an upstream shadcn outage. It
  was not: shadcn's own registry installed correctly in the same project throughout. The
  control that settled it was `npx shadcn add button` with no `registries` entry, which
  worked, against `@stark/button`, which did not.

### Note on 0.4.0

`v0.4.0` was published with the bare cross-references described above and is superseded.
Use `v0.4.1`. Versioned paths are written once; this one is the exception that created the
rule.

## [0.4.0] - 2026-09-07

### Added

- **The registry is hosted.** `@stark` now resolves to
  `https://stark-design-system.vercel.app/registry/{name}.json` instead of
  `http://localhost:3100`, so installing no longer requires the dev server or this checkout.
  All 32 items were fetched over HTTPS and validated after deploying: every one carries a
  `$schema`, non-empty file content, and registry dependencies that resolve.
- **A pinned registry path.** Every item is now written twice: to `/registry/<name>.json`,
  which tracks the latest deploy, and to `/registry/v<version>/<name>.json`, which is
  written once per release and never rewritten. The floating path was the only one that
  existed, which made "pin a tag" advice a consumer could not act on -- a git tag pins this
  repository, not what `shadcn add` downloads into someone else's app. The registry index
  also carries its `version` and a real `homepage`; `homepage` had been an empty string.
- **`vercel.json`** sets the headers the registry needs to be consumed from elsewhere:
  `Access-Control-Allow-Origin: *`, an explicit JSON content type, and two cache policies.
  The floating path gets `s-maxage=60, stale-while-revalidate=300`, so it is served from
  the CDN without going stale for longer than a minute. The versioned path gets
  `max-age=31536000, immutable` -- it is written once and never rewritten, so revalidating
  it would spend a request confirming something that cannot have changed.

### Changed

- **Six devDependencies were pinned from `latest`** -- `vitest`, `vite`, `playwright`,
  `@vitest/coverage-v8`, `@vitest/browser-playwright` and `@chromatic-com/storybook`. A
  project telling its own consumers to pin a version should not float its toolchain: a
  `latest` specifier means a clean install can pick up a major version and fail for reasons
  nothing in the repository changed. Pinned to the versions already installed, so the
  resolved tree is byte-identical today.
- **`package.json` version is 0.4.0**, matching the changelog. It had drifted at 0.1.0
  across three releases, and the versioned registry path is generated from it.

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
