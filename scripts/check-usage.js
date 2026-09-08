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
const roots = ['src/components', 'src/variants', 'src/registry', 'src/app', 'src/stories'];

/*
 * One primitive per variant -- not one primitive per repository.
 *
 * The rule that mattered was never "Base UI everywhere". It was that a single installed
 * component tree must not contain two focus-management models and two portal
 * implementations. That holds per variant: a project installs exactly one of these trees,
 * so the trees may differ from each other as long as none of them mixes.
 *
 * Anything outside a variant directory -- blocks, app routes, stories -- may not import a
 * primitive at all. Blocks compose `@/components/ui/*` by alias, which is what lets one
 * block source serve every variant: the alias resolves to whichever tree was installed.
 */
const VARIANTS = [
  { dir: 'src/components/ui', label: 'Base UI', allow: /^@base-ui\// },
  { dir: 'src/variants/radix', label: 'Radix', allow: /^@radix-ui\// },
  {
    dir: 'src/variants/aria',
    label: 'React Aria',
    allow: /^(?:react-aria-components|react-aria|@react-aria\/|@react-stately\/)/,
  },
];

/** Any headless primitive package, whichever variant it belongs to. */
const PRIMITIVE = /^(?:@base-ui\/|@radix-ui\/|react-aria-components|react-aria$|@react-aria\/|@react-stately\/|@heroui\/|@headlessui\/)/;

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

/*
 * Primitives, checked against the variant the file belongs to.
 *
 * A regex list cannot express this: `@radix-ui/react-dialog` is correct inside the Radix
 * tree and a bug anywhere else, and the difference is the path, not the specifier.
 */
for (const base of roots) {
  for (const file of walk(path.join(root, base))) {
    const relative = path.relative(root, file).split(path.sep).join('/');
    const variant = VARIANTS.find((entry) => relative.startsWith(entry.dir + '/'));
    const source = fs.readFileSync(file, 'utf8');
    source.split('\n').forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('*') || trimmed.startsWith('//')) return;
      const match = /from\s+["']([^"']+)["']/.exec(line);
      if (!match || !PRIMITIVE.test(match[1])) return;
      if (variant && variant.allow.test(match[1])) return;
      const message = variant
        ? `imports "${match[1]}" inside the ${variant.label} variant -- one primitive per variant`
        : `imports "${match[1]}" outside any variant -- blocks and routes compose @/components/ui/* by alias`;
      problems.push(`${relative}:${index + 1}  ${message}\n      ${trimmed.slice(0, 100)}`);
    });
  }
}

if (problems.length) {
  console.error(`Usage check failed (${problems.length}):\n`);
  for (const problem of problems) console.error('  - ' + problem);
  process.exit(1);
}

console.log(
  `Usage check passed: no raw palette classes or hex literals, and each of the ` +
    `${VARIANTS.length} variants uses only its own primitive.`
);
