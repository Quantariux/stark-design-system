# Changelog

All notable changes to the Stark Design System are recorded here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the
project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**Consumers should pin a tag, not `main`.** The registry serves whatever is committed, so
tracking `main` means a component can change under a project without anything in that
project having changed.

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
