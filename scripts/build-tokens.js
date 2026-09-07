const fs = require('fs');
const path = require('path');

const tokensPath = path.join(__dirname, '../tokens.json');
const cssPath = path.join(__dirname, '../src/app/globals.css');

const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

/*
 * Colours are emitted as-is, not converted.
 *
 * This used to run every hex through hexToHSL() and write a bare triplet --
 * `--primary: 240 6% 10%`. That is the Tailwind v3 convention, where the config wrapped it
 * as `hsl(var(--primary))`. This project is Tailwind v4 and maps tokens with
 * `@theme inline { --color-primary: var(--primary) }`, which uses the value verbatim -- so
 * `bg-primary` resolved to `background-color: 240 6% 10%`, which is not a colour, and the
 * browser dropped the declaration. Every token-driven colour in the app was silently
 * inert.
 *
 * Emitting the hex keeps globals.css and the registry theme item byte-identical in
 * meaning, which is the other half of the problem: they disagreed on format.
 */

function generateCSS() {
  let css = `@import "tailwindcss";\n\n@plugin "tailwindcss-animate";\n\n@custom-variant dark (&:is(.dark *));\n\n`;

  // Base Light Theme
  css += `@theme inline {\n`;
  css += `  --color-background: var(--background);\n`;
  css += `  --color-foreground: var(--foreground);\n`;
  css += `  --font-sans: var(--font-geist-sans);\n`;
  css += `  --font-mono: var(--font-geist-mono);\n`;

  // Theme mappings
  for (const [key] of Object.entries(tokens.colors.light)) {
    if (key !== 'background' && key !== 'foreground') {
      css += `  --color-${key}: var(--${key});\n`;
    }
  }

  /*
   * Radii come from tokens.json rather than being derived here.
   *
   * The scale used to be computed in this template, which meant the registry theme item
   * -- generated from tokens.json -- could not see it. A consumer installing a component
   * got --radius but not --radius-md, and button.tsx references --radius-md. Defining the
   * scale in the token file is what lets both outputs carry the same thing.
   */
  // The literal value, not `var(--radius-md)`: the theme key and the :root variable share
  // a name, so a var() reference here would resolve to itself.
  for (const [key, value] of Object.entries(tokens.radii)) {
    if (key !== 'radius') css += `  --${key}: ${value};\n`;
  }

  /*
   * The rest of the foundations, mapped to Tailwind's theme namespaces so they become
   * real utilities: --spacing-4 gives p-4/gap-4, --text-lg gives text-lg, and so on.
   * Emitting them here is what makes `space-4` in DESIGN.md a thing that exists rather
   * than a thing the documentation claims exists.
   */
  for (const [key, value] of Object.entries(tokens.spacing ?? {})) {
    css += `  --spacing-${key}: ${value};\n`;
  }
  for (const [key, value] of Object.entries(tokens.shadows ?? {})) {
    css += `  --shadow-${key}: ${value};\n`;
  }
  for (const [key, value] of Object.entries(tokens.breakpoints ?? {})) {
    css += `  --breakpoint-${key}: ${value};\n`;
  }
  for (const [key, value] of Object.entries(tokens.typography?.size ?? {})) {
    css += `  --text-${key}: ${value};\n`;
  }
  for (const [key, value] of Object.entries(tokens.typography?.weight ?? {})) {
    css += `  --font-weight-${key}: ${value};\n`;
  }
  for (const [key, value] of Object.entries(tokens.typography?.leading ?? {})) {
    css += `  --leading-${key}: ${value};\n`;
  }
  // Motion is not a Tailwind namespace, so these stay plain variables for components and
  // blocks to reference directly.
  for (const [key, value] of Object.entries(tokens.motion ?? {})) {
    css += `  --${key}: ${value};\n`;
  }
  css += `}\n\n`;

  // CSS Variables Root
  css += `:root {\n`;
  for (const [key, value] of Object.entries(tokens.colors.light)) {
    css += `  --${key}: ${value};\n`;
  }
  for (const [key, value] of Object.entries(tokens.radii)) {
    css += `  --${key}: ${value};\n`;
  }
  css += `}\n\n`;

  // Dark mode
  css += `.dark {\n`;
  for (const [key, value] of Object.entries(tokens.colors.dark)) {
    css += `  --${key}: ${value};\n`;
  }
  css += `}\n\n`;

  // Base Layer Utilities
  css += `@layer base {\n`;
  css += `  * {\n    @apply border-border outline-ring/50;\n  }\n`;
  css += `  body {\n    @apply bg-background text-foreground;\n  }\n`;
  css += `}\n`;

  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('Successfully generated globals.css from tokens.json');
}

generateCSS();

