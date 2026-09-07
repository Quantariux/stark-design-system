# Agent Instructions — Stark Design System

You are building an interface with the Stark Design System. Read this before writing any
UI, and run the checks at the bottom before saying you are done.

## Primitive layer — non-negotiable

This system is built on **Base UI** (`@base-ui/react`).

Do **not** install Radix UI, React Aria, HeroUI, Headless UI, or any other component or
primitive library. A second primitive layer means two focus-management models and two
portal implementations in one codebase, and the seams surface as bugs nobody can locate.
`npm run check:usage` fails if one is imported.

Blocks from external registries (blocks.so and similar) may be used as **reference for
structure only** — they ship Radix. Port their layout onto these components.

## Getting a component

1. **Look in `src/components/ui` first.** There are 26. Most of what you need exists.
2. **If it is missing**, install it from the registry:

   ```
   npx shadcn@latest add @stark/button
   ```

   `@stark` is defined in `components.json` → `registries`. It currently points at
   `http://localhost:3100/registry/{name}.json`, which works while `npm run dev` is
   running. **When the registry is hosted, change that one line** — nothing else refers to
   the URL.

3. **If it does not exist anywhere**, build it on a Base UI primitive. Check
   `node_modules/@base-ui/react` for what is available; it has more than you expect
   (`field`, `form`, `toast`, `combobox`, `popover`, `tooltip`, `progress`, `drawer`).

## Getting a whole screen

Five page blocks ship as `registry:block` items — `dashboard`, `settings`, `detail`,
`onboarding`, `search`:

```
npx shadcn@latest add @stark/settings
```

A block pulls its components with it. Prefer starting from one over assembling a screen
from scratch: the block already carries the decisions — what the empty state says, how the
form reports failure, how it reflows — which are the parts that otherwise get re-decided
differently on every screen.

## Tokens

`tokens.json` is the source for both `globals.css` and the registry theme.

- **Never** use raw Tailwind palette classes — `bg-blue-500`, `text-gray-900`,
  `border-zinc-200`. They render fine and then stay that colour when the theme changes.
- **Never** hard-code a hex colour. Add it to `tokens.json`.
- **Do** use semantic roles: `bg-primary`, `text-muted-foreground`, `border-border`,
  `bg-card`, `bg-destructive`.
- **Do** reach for the outcome roles rather than grey: `success`, `warning`, `destructive`.
  A `<Badge variant="success">` is the difference between a status column that reads at a
  glance and four identical pills. Never use colour as the only signal.
- **Do** use the scales: `p-4`/`gap-6` (spacing), `rounded-md`/`rounded-lg` (radius),
  `text-sm`/`text-lg` (type), `shadow-sm` (elevation).
- Motion uses `var(--duration-base)` and `var(--ease-out)`.

## Buttons and links

A button does something; a link goes somewhere. Choose by what happens, not by appearance.

- Navigating → `<Link>` or `<a>` with `className={buttonVariants(...)}`.
- Acting → `<Button>`.

Never write `<Button render={<Link />}>`. Base UI warns at runtime that it strips button
semantics, and the result loses middle-click and open-in-new-tab. `check:usage` fails on it.

## Forms

Use the `Form` components. They wire label, description and error to the control through
Base UI's `Field`, so `aria-describedby` and `aria-invalid` follow from the composition.
Do not set ids by hand, and do not build a form out of bare `Input` and `Label` —
that is how the wiring gets lost.

Every form that changes something must report the outcome. Use `toast` for success and
`FormError` beside the field that failed.

## Before you say it is done

Run these. Do not report success without them — a claim that something works is only worth
the command that proved it.

```bash
npx tsc --noEmit                        # types
npm run lint                            # lint
npm run build:ds                        # tokens, registry, registry check, usage check
npx vitest run --project=storybook      # stories + accessibility (fails on violations)
```

Then confirm by hand what the tools cannot:

- **Both themes.** Toggle light and dark. Semantic tokens handle this — if something only
  looks right in one, you used a raw colour.
- **Keyboard only.** Tab to every interactive element, operate it, and get out of it. Any
  overlay must be closable with Escape and must return focus where it came from.
- **The empty and error states**, not just the happy path. A list with nothing in it and a
  form that failed are the screens that ship broken.

## Adding to the system

New component → `src/components/ui/`, plus a real story in `src/stories/` showing its
variants and its disabled/invalid/empty states. Not a stub: Storybook is where the
accessibility tests run, so a story that renders a bare component reports a pass for
something that never rendered.

New token → `tokens.json` only. Then `npm run build:ds`, and commit the regenerated
`globals.css` and `public/registry` — CI fails if they are stale.
