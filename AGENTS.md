# Stark Design System

This repository **is** the design system. Before writing any UI here or in a project that
consumes it:

- **[agent-instructions.md](./agent-instructions.md)** — how to retrieve components, which
  tokens to use, and the checks to run before claiming done.
- **[DESIGN.md](./DESIGN.md)** — visual rules, component selection, layout patterns.

Two things that are worth knowing before you touch anything:

1. **The primitive layer is Base UI.** Do not add Radix, React Aria or HeroUI.
   `npm run check:usage` fails if you do.
2. **`tokens.json` is the only place a colour, space or radius is defined.** It generates
   both `globals.css` and the registry theme, so a value written anywhere else exists in
   one of them and not the other.

Run `npm run build:ds` and `npx vitest run --project=storybook` before reporting success.

---

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
