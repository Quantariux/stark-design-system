# Stark Design System

Welcome to the Stark Design System. This repository is the source of truth for all visual rules, component patterns, and agent instructions.

## Visual Rules & Tokens

We embrace a **Minimalist and Functional** aesthetic:
- **Contrast**: High contrast, relying primarily on grayscale values.
- **Primary Color**: A single strong primary color (`#18181b` in light mode, `#fafafa` in dark mode).
- **Shapes**: A radius scale in `tokens.json` — `radius-sm` 0.125rem, `radius-md` 0.25rem,
  `radius-lg` 0.375rem (the base), `radius-xl` 0.5rem. Use the Tailwind utilities
  (`rounded-md`, `rounded-lg`) rather than the raw values.
- **Typography**: Geist Sans for UI, Geist Mono for code.

All tokens are defined in `tokens.json`, which is the single source for both
`src/app/globals.css` (via `npm run build:tokens`) and the registry's `theme.json` (via
`npm run build:registry`). **Do not hardcode colors, spacing or radii in CSS.** Always use
the generated Tailwind utilities.

A token added anywhere other than `tokens.json` will be missing from the registry theme,
and any component using it will render unstyled in a consuming project. `npm run
check:registry` fails on exactly that.

## Component Selection

- Use the components in `src/components/ui`. They follow shadcn/ui conventions and are
  distributed through our registry.
- **The primitive layer is [Base UI](https://base-ui.com) (`@base-ui/react`).** If a
  component does not exist, build it on Base UI.
- **Do not add Radix UI, React Aria, HeroUI, or any other primitive or component library.**
  This is the single most damaging thing that can be done to this system: a second
  primitive layer means two focus-management models, two portal implementations and two
  theming approaches living in one codebase, and the seams show up as bugs nobody can
  locate. If a Base UI primitive is genuinely missing, raise it rather than reaching for
  another library.
- Blocks from external registries (blocks.so and similar) may be used as **reference for
  structure and layout only**. Port them onto our components and tokens; never install
  them directly, because they ship Radix.

## Buttons and Links

A button does something; a link goes somewhere. Choose by what happens, not by how it
should look.

- **Navigating?** Use `<Link>` or `<a>` with `className={buttonVariants(...)}`. Middle-click,
  open-in-new-tab and copy-link all work on an anchor and none of them work on a button.
- **Acting?** Use `<Button>`.

Do **not** write `<Button render={<Link />}>`. Base UI's Button assumes a native `<button>`
and warns at runtime that rendering anything else strips button semantics. `buttonVariants`
exists for exactly this case — `pagination.tsx` uses it.

## Layout Patterns

When building new screens, adhere to these structural patterns:
1. **Dashboard**: Use `Card` components to group distinct data visualizations or metric summaries. Use `Table` for list data.
2. **Settings**: Use `Tabs` for categories, vertical or horizontal depending on count. Group related `Input` fields inside a `Card` with a clear title and description.
3. **Detail Page**: Feature a strong typographic hierarchy. Use `Badge` for status indicators near the title.

## For AI Agents

See `agent-instructions.md` for specific retrieval and generation rules.

