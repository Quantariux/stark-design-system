# Stark Design System — Audit & Implementation Plan

Written after reading and running the repository as it stands, not from the brief.
Every claim below was verified by executing the thing it describes; where something was
checked and found working, it says so, and where it was checked and found broken, the
evidence is included.

---

## 1. What state this is actually in

The scaffold is real and further along than a first pass usually is. What is missing is
almost entirely in the **distribution** layer — the part that makes it a *system* other
projects and agents consume, rather than a nice component folder.

### Verified working

| Thing | Evidence |
|---|---|
| Next.js 15 + Tailwind v4 + TypeScript | `npx tsc --noEmit` — clean, zero errors |
| 17 UI components in `src/components/ui` | alert, avatar, badge, breadcrumb, button, card, checkbox, dialog, dropdown-menu, input, label, radio-group, select, skeleton, switch, table, tabs |
| 100% story coverage | 17 components, 17 `*.stories.tsx` — no component lacks a story |
| Token pipeline | `npm run build:tokens` → "Successfully generated globals.css from tokens.json" |
| Registry pipeline | `npm run build:registry` → 17 item JSONs in `public/registry/` |
| Storybook 9 + a11y + Vitest/Playwright | `.storybook/`, `vitest.config.ts` with browser-mode Storybook tests |
| `cn` utility merges correctly | `cn('p-2','p-4')` → `p-4`; `cn@0.2.6`, zero deps |
| 3 pattern pages | `/patterns/dashboard`, `/patterns/settings`, `/patterns/detail` |

### The headline finding

**The registry ships components that cannot compile where they land.** That is the one
defect that makes the system actively worse than no system, because it fails at the
moment of use, in someone else's project, with an error that does not point back here.

---

## 2. Blocking defects

### D1 — Registry items omit their own dependencies · **critical**

`public/registry/button.json` declares:

```json
"dependencies": ["class-variance-authority"],
"registryDependencies": []
```

But `src/components/ui/button.tsx` imports **three** packages:

```ts
import { Button as ButtonPrimitive } from "@base-ui/react/button"   // not declared
import { cva, type VariantProps } from "class-variance-authority"    // declared
import { cn } from "cn"                                             // not declared
```

So `npx shadcn add <url>/button.json` installs a file with two unresolvable imports. This
is true for **every** item, since all 17 use `cn` and all Base-UI-backed ones use
`@base-ui/react`.

**Fix:** `scripts/build-registry.js` must derive `dependencies` by parsing the import
statements of each file rather than being hand-listed, and map internal imports
(`@/components/ui/x`) to `registryDependencies` instead. Deriving it is the point — a
hand-maintained list drifts the first time a component gains an import.

### D2 — DESIGN.md contradicts the code · **high** · fixed

DESIGN.md instructs:

> If a component does not exist, build it using **Radix UI** primitives for accessibility.

The codebase uses **Base UI** (`@base-ui/react`). An agent following DESIGN.md will
install Radix and produce a codebase with two primitive libraries, two focus-management
models, and two portal implementations.

DESIGN.md also states radius `0.375rem`, while `button.tsx` uses `rounded-lg` and
`--radius-md`. The document describes a system that is not the one in `src/`.

**Fixed.** Decision taken: **Base UI stays**; the 17 components are not rewritten.
DESIGN.md and `agent-instructions.md` now name Base UI as the primitive layer and
explicitly forbid adding Radix, React Aria, HeroUI or any other primitive library.
External registries (blocks.so and similar) are allowed as *reference for structure only* —
their blocks ship Radix and must be ported onto our components, never installed.
The radius statement now describes the real four-step scale.

### D3 — No theme is distributed · **high**

The brief calls for the registry to carry "theme variables". No registry item contains a
`cssVars` block; every item ends with `"tailwind": {}` — an empty, deprecated field.

A consumer installing `button.json` gets markup referencing `bg-primary`,
`text-primary-foreground`, `border-ring` and `--radius-md`, **none of which exist in their
project**. The component installs and renders unstyled or wrong.

**Fix:** emit a `registry:theme` item (`theme.json`) carrying `cssVars.light` / `.dark`
generated from `tokens.json`, and add it to every component's `registryDependencies`.

### D4 — Patterns are not distributable · **high**

`/patterns/*` are Next.js app routes. They cannot be installed. The brief asks for "page
blocks" the agent can retrieve — the highest-leverage part of the whole system, since a
whole screen is what removes repeated decisions.

**Fix:** move each pattern to a `registry:block` item with its own files and
`registryDependencies`, keeping the route as a live preview of the block.

### D5 — Accessibility checks never fail · **medium**

`.storybook/preview.tsx`:

```ts
a11y: { test: 'todo' }   // show violations in the test UI only
```

The brief asks for "automated accessibility checks". `todo` reports and passes. Nothing
enforces anything, and no CI runs it.

**Fix:** `test: 'error'` once the current violations are cleared, plus a CI job. Flip it
*after* fixing what it surfaces, not before, or the first run blocks everything.

### D6 — Token colours were emitted in a format Tailwind v4 cannot use · **critical** · fixed

Found while checking the theme item. `build-tokens.js` ran every hex through `hexToHSL()`
and wrote a bare triplet:

```css
:root { --primary: 240 6% 10%; }
@theme inline { --color-primary: var(--primary); }
```

That is the Tailwind **v3** convention, where the config wrapped it as `hsl(var(--primary))`.
Under v4's `@theme inline` the value is used verbatim, so `bg-primary` resolved to
`background-color: 240 6% 10%` — not a colour, so the browser dropped it. The compiled CSS
confirmed it: `bg-primary` appears 11 times with no working declaration behind it. Every
token-driven colour in the app was silently inert.

Fixed by emitting the value as-is (`--primary: #18181b`), which also makes `globals.css`
and the registry theme item agree on format — they previously disagreed (HSL triplets vs
hex).

The radius scale moved into `tokens.json` for the same reason: `--radius-md/lg` were
computed inside the CSS template, so the registry theme could not see them, while
`button.tsx` references `var(--radius-md)` directly.

---

## 3. Gaps against the brief

| Brief asks for | Status |
|---|---|
| Semantic colors | ✅ light + dark, 19 roles each |
| Typography | ⚠️ font families only — no scale, weights, or line-heights |
| **Spacing** | ❌ absent — `space-4` from the brief is not expressible |
| Radii | ⚠️ single `radius` value; components use `--radius-md`/`lg` that it does not define |
| **Shadows** | ❌ absent |
| **Breakpoints** | ❌ absent |
| **Motion** | ❌ absent |
| 15–20 core components | ⚠️ 17, but no textarea, tooltip, popover, separator, sheet, toast, **form**, pagination, progress, command |
| 5 screen patterns | ⚠️ 3 of 5 — **onboarding** and **search** missing |
| DESIGN.md | ⚠️ exists, contradicts code (D2) |
| Agent instructions | ⚠️ exists, contains placeholder `https://[stark-registry-url]/...` |
| **Git versioning / releases** | ❌ **not a git repository** — `git rev-parse` fails. No tags, no CHANGELOG |

Also present and worth removing: the default Storybook scaffold
(`src/stories/Button.tsx`, `Header.tsx`, `Page.tsx`, `Configure.mdx`, `button.css`,
`header.css`). Its `Button.stories.ts` sits beside the real `button.stories.tsx` — two
"Button" entries in the sidebar, one of which is not the design system's.

---

## 4. Implementation plan

Ordered so each phase leaves the system in a *shippable* state. Do not reorder — P0 is
what makes everything after it trustworthy.

### P0 — Make the registry correct — **DONE**

Implemented and verified. `npm run build:ds` now runs tokens → registry → check.

- `build-registry.js` rewritten to **derive** dependencies from each file's imports.
  The old version grepped for `@radix-ui/`, `clsx`, `tailwind-merge` — none of which this
  project uses — which is why every item declared only `class-variance-authority`.
  Deriving also surfaced `dialog`'s real `registryDependencies: [button, theme]`, which the
  whitelist never saw.
- `$schema` added; the empty deprecated `"tailwind": {}` removed.
- `theme.json` (`registry:theme`) emitted from `tokens.json`, carrying 24 light / 23 dark
  CSS variables, and added to every component's `registryDependencies`.
- `registry.json` index emitted.
- `scripts/check-registry.js` added and wired as `npm run check:registry`: verifies every
  npm dependency resolves, every registry dependency exists, every CSS variable a
  component uses is in the theme, and no import is left undeclared. Non-zero exit on
  failure, so this cannot regress silently.

**A second defect surfaced while verifying, and is also fixed — see D6.**

### P1 — Complete the foundations — **DONE**

`tokens.json` now carries seven families: colors, radii, **spacing, shadows, breakpoints,
motion**, and a real typography scale (size, weight, leading). Both generators emit them,
mapped to Tailwind's theme namespaces so they become utilities — `--spacing-4` gives
`p-4`/`gap-4`, `--text-lg` gives `text-lg`. `space-4` from the brief is now a thing that
exists rather than a thing the docs claimed existed.

The registry `theme.json` carries all of it: **70 light variables, 19 dark**. Dark holds
colour overrides only — spacing and type do not change between themes, and emitting them
twice would invite someone to "fix" dark mode by editing a spacing value.

Verified by `npx next build` (clean) and by reading the compiled CSS:
`.bg-primary{background-color:var(--primary)}` with `--primary:#18181b`, and
`.p-4{padding:1rem}`.

### P2 — Close the component gap — **DONE**

**26 components, 26 stories — coverage held at 100%.** Nine added, all on Base UI:

`textarea` · `separator` · `tooltip` · `popover` · `form` · `toast` · `progress` ·
`pagination` · `command`

A correction to what this plan said earlier: **Base UI 1.8 does have a `toast` primitive**,
and `field`/`fieldset`/`form` besides. The claim that toast would need hand-building on a
portal was wrong. That matters, because those are the two components where hand-rolling
loses accessibility silently:

- **form** — Base UI's `Field` wires label, description and error to the control itself,
  so `aria-describedby` and `aria-invalid` follow from the composition. Nothing sets an id
  by hand.
- **toast** — the viewport is a live region, so messages are announced without stealing
  focus, and the timer pauses on hover and focus, so a toast cannot expire while it is
  being read. That last one is invisible to anyone testing with a mouse.
- **command** — built on `Combobox`: roving focus with the caret staying in the input,
  `aria-activedescendant`, and a `Status` region announcing the result count. `Empty` is a
  first-class slot, so the no-results state cannot be forgotten.

Only `textarea` and `pagination` have no primitive behind them, and neither needs one —
there is no behaviour to abstract, only semantics, which they carry (`aria-current="page"`,
a landmark `nav`, an `aria-hidden` ellipsis).

**Stories were written by hand, not generated.** `scripts/generate-stories.js` emits
`<Component />` stubs, which render nothing for compound components like Form and Command.
Since Storybook is where the a11y tests run, a stub story is worse than none: it reports a
pass for a component that never rendered.

Verified: `npx tsc --noEmit` clean, `npx next build` clean, `npm run build:ds` green.

**One fix to the checker itself.** It flagged `--gap` and `--toast-offset-y` in `toast.tsx`
as missing theme tokens. Both were false positives — the first is defined inline on the
same element, the second is set by the primitive at runtime. The check now recognises
locally-defined variables and carries an explicit list of Base-UI-provided ones. It was
re-tested against a deliberately broken token to confirm it still fails on a real miss
rather than having been made toothless.

### P3 — Patterns as blocks (1–2 days)

1. Convert `dashboard`, `settings`, `detail` into `registry:block` items.
2. Build **onboarding** and **search** to complete the five.
3. Each block declares its `registryDependencies` and ships with content guidance
   (what goes in each region) and responsive behaviour, not just markup.
4. **Acceptance:** `npx shadcn add <url>/dashboard.json` produces a working page in a
   fresh app, pulling its components transitively.

### P4 — Enforce quality (½ day)

1. Fix current a11y violations, then set `a11y.test: 'error'`.
2. `git init`, first commit, conventional-commit discipline, `CHANGELOG.md`.
3. CI: typecheck → lint → `vitest` (Storybook a11y) → `build:tokens` → `build:registry` →
   assert registry diff is committed.
4. Tag `v0.1.0`. **Consumers pin a tag, not `main`** — this is the whole reason the brief
   asks for Git.

### P5 — Agent integration (½ day)

1. Replace the placeholder URL in `agent-instructions.md` with the real registry URL.
2. Correct DESIGN.md (D2).
3. Add a **validation checklist the agent must run**, not just read: no raw Tailwind
   palette classes (`bg-blue-500`), no hex literals, every interactive element reachable
   by keyboard, both themes checked.
4. Point `AGENTS.md` / `CLAUDE.md` at DESIGN.md + agent-instructions.md. `CLAUDE.md` is
   currently 11 bytes.

---

## 5. Decisions to make before starting

These are yours, not mine, and P0–P1 depend on the first two.

1. **Base UI or Radix?** The code says Base UI; DESIGN.md says Radix. Base UI is the
   newer library and the components are already written against it — keeping it means
   correcting one document. Switching means rewriting 17 components. Recommendation: keep
   Base UI, fix the doc.
2. **`cn` package or the conventional local util?** `cn@0.2.6` works and has zero deps,
   but every shadcn consumer expects `@/lib/utils` with `clsx` + `tailwind-merge`. Keeping
   the package is fine *provided it is declared* (D1); it will surprise anyone reading the
   installed component. Recommendation: keep it, declare it, note it in DESIGN.md.
3. **Where is the registry hosted?** P0 and P5 both need a real URL. Until one exists,
   items are only installable by file path.
4. **Is dark mode a first-class deliverable?** Tokens define it; nothing tests it. If yes,
   it needs a Storybook theme toggle and dual-theme snapshots.

---

## 6. What I would *not* build

Worth stating, since a plan is also about what to leave out:

- **No new component library, no design-token build tool (Style Dictionary).**
  `build-tokens.js` already works; a token pipeline for one product is over-engineering.
- **No visual regression yet.** Chromatic is installed but the component set is still
  moving; snapshots taken now become churn. Turn it on after P3.
- **No Figma sync.** It is a second source of truth, and the brief is explicitly
  code-first.
- **Do not flip a11y to `error` before P4.** Doing it early blocks work on violations
  nobody has triaged.

---

## 7. First three screens to validate with

The brief's advice — start with three representative screens and review — is right. Use:

1. **Settings** — exercises form, toast, tabs, and the save/error path where most systems
   turn out to be incomplete.
2. **Dashboard** — exercises layout, table, card, skeleton and empty states.
3. **Search** — exercises command/combobox, pagination, and the empty/no-results state,
   which is the single most-skipped screen in any design system.

If those three can be assembled from the registry by an agent, in a fresh project, with no
hand-written CSS, the system works. That is the acceptance test for the whole plan.
