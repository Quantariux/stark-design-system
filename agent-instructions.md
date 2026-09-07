# Agent Instructions for Stark Design System

You are building an interface using the Stark Design System. 

## Component Retrieval
This design system provides components via a standard shadcn/ui registry format.
When you need a UI component (e.g. Button, Input, Dialog):
1. **Check local existence**: Look in `src/components/ui`.
2. **If missing**, use the shadcn CLI to add it from our custom registry:
   `npx shadcn@latest add https://[stark-registry-url]/registry/[component-name].json`
   *(For now, while developing locally, you can use standard `npx shadcn@latest add [component]`)*

## Primitive Layer — non-negotiable
This system is built on **Base UI** (`@base-ui/react`). Do **not** install Radix UI,
React Aria, HeroUI, or any other component/primitive library, and do not install blocks
from external registries directly — they ship Radix. Port their structure onto our
components instead.

## Design Tokens
- The source of truth is `tokens.json`. 
- **DO NOT** use raw Tailwind colors like `bg-blue-500` or `text-gray-900`.
- **DO** use semantic colors like `bg-primary`, `text-muted-foreground`, `border-border`, `bg-card`.
- **DO** use semantic radii like `rounded-md`, `rounded-lg`.

## Validation
After generating a screen or component:
1. Ensure it uses standard Next.js App Router conventions.
2. Check that it adapts to both Light and Dark modes seamlessly (semantic colors handle this automatically).
3. Ensure the structure aligns with `DESIGN.md` patterns.

