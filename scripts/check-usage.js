/**
 * Enforce the rules in DESIGN.md against the code, so an agent can be told to *run* a
 * check rather than to remember one.
 *
 * Every rule here exists because breaking it is invisible in review:
 *
 *   raw palette classes   `bg-blue-500` renders fine and looks correct in light mode, then
 *                         stays blue when the theme changes. Nothing errors; the screen is
 *                         simply wrong for half the users.
 *   hex literals          same failure, one step more deliberate.
 *   Button-as-link        Base UI warns at runtime, which nobody sees in CI, and the result
 *                         silently loses middle-click, open-in-new-tab and copy-link.
 *   second primitive      importing Radix/React Aria/HeroUI beside Base UI gives the
 *                         codebase two focus models and two portal implementations.
 *
 * Scoped to source that ships: components, blocks and app routes. Stories are exempt from
 * the palette rules only where they are demonstrating a raw value on purpose -- they are
 * not, currently, so they are checked too.
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const roots = ['src/components', 'src/registry', 'src/app', 'src/stories'];

/** Tailwind's built-in palette. Semantic tokens are the point; these bypass them. */
const PALETTE =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';

const RULES = [
  {
    id: 'raw-palette',
    // bg-blue-500, text-gray-900, border-zinc-200 ... but not bg-primary or text-muted.
    pattern: new RegExp(`\\b(?:bg|text|border|ring|fill|stroke|from|via|to|outline|decoration|shadow|accent|caret|divide|placeholder)-(?:${PALETTE})-\\d{2,3}\\b`, 'g'),
    message: 'raw Tailwind palette class -- use a semantic token (bg-primary, text-muted-foreground)',
  },
  {
    id: 'hex-literal',
    // A hex colour in a class string or style value. tokens.json is the only place for these.
    pattern: /(?:className|style|background|color)\s*[=:][^\n]*#[0-9a-fA-F]{3,8}\b/g,
    message: 'hard-coded hex colour -- define it in tokens.json instead',
  },
  {
    id: 'button-as-link',
    pattern: /render=\{<(?:Link|a)\b/g,
    message: 'Button rendering a link -- use buttonVariants() on the anchor (see DESIGN.md)',
  },
  {
    id: 'second-primitive',
    pattern: /from\s+["'](?:@radix-ui\/|react-aria|@react-aria\/|@heroui\/|@headlessui\/)/g,
    message: 'a second primitive library -- this system is Base UI only (see DESIGN.md)',
  },
];

function walk(dir, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(tsx|ts)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const problems = [];

for (const base of roots) {
  for (const file of walk(path.join(root, base))) {
    const source = fs.readFileSync(file, 'utf8');
    const lines = source.split('\n');
    for (const rule of RULES) {
      lines.forEach((line, index) => {
        // A rule named inside a comment is documentation, not a violation.
        const trimmed = line.trim();
        if (trimmed.startsWith('*') || trimmed.startsWith('//')) return;
        rule.pattern.lastIndex = 0;
        const match = rule.pattern.exec(line);
        if (match) {
          problems.push(
            `${path.relative(root, file)}:${index + 1}  ${rule.message}\n      ${trimmed.slice(0, 100)}`
          );
        }
      });
    }
  }
}

if (problems.length) {
  console.error(`Usage check failed (${problems.length}):\n`);
  for (const problem of problems) console.error('  - ' + problem);
  process.exit(1);
}

console.log('Usage check passed: no raw palette classes, hex literals, or foreign primitives.');
