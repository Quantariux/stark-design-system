/**
 * Verify the registry would actually work in someone else's project.
 *
 * `build:registry` succeeding only proves files were written. These are the checks that
 * catch the failures that show up at the far end -- in a consumer's repo, with an error
 * that does not point back here:
 *
 *   1. every declared npm dependency is a real, resolvable package;
 *   2. every registry dependency names an item that exists;
 *   3. every CSS variable a component references is carried by the theme item;
 *   4. every component's imports are declared somewhere.
 *
 * (3) is the one that is invisible without a check like this: the component compiles, and
 * renders unstyled, so it looks like a design problem rather than a packaging one.
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const uiDir = path.join(root, 'src/components/ui');
const registryDir = path.join(root, 'public/registry');

const problems = [];
const note = (message) => problems.push(message);

function items() {
  return fs
    .readdirSync(registryDir)
    .filter((file) => file.endsWith('.json') && file !== 'registry.json')
    .map((file) => JSON.parse(fs.readFileSync(path.join(registryDir, file), 'utf8')));
}

const all = items();
const names = new Set(all.map((item) => item.name));

// 1 + 2 -- dependencies point at things that exist.
for (const item of all) {
  for (const dep of item.dependencies ?? []) {
    try {
      require.resolve(dep + '/package.json', { paths: [root] });
    } catch {
      try {
        require.resolve(dep, { paths: [root] });
      } catch {
        note(`${item.name}: npm dependency "${dep}" does not resolve`);
      }
    }
  }
  for (const dep of item.registryDependencies ?? []) {
    if (!names.has(dep)) note(`${item.name}: registry dependency "${dep}" has no item`);
  }
  if (!item.$schema) note(`${item.name}: missing $schema`);
}

// 3 -- the theme carries every variable the components ask for.
const theme = all.find((item) => item.name === 'theme');
if (!theme) {
  note('no theme item: components would install referencing variables that do not exist');
} else {
  const provided = new Set([
    ...Object.keys(theme.cssVars?.light ?? {}),
    ...Object.keys(theme.cssVars?.dark ?? {}),
  ]);

  /*
   * Variables Base UI sets on its own elements at runtime.
   *
   * These are not theme tokens and never will be: the primitive computes them from
   * position and state, and a component is meant to read them. Listing them explicitly is
   * better than loosening the rule, because the rule is the point — anything not on this
   * list and not defined locally really does have to come from the theme.
   */
  const PRIMITIVE_VARS = new Set([
    'transform-origin',
    'available-width',
    'available-height',
    'anchor-width',
    'anchor-height',
    'positioner-width',
    'positioner-height',
    'toast-index',
    'toast-offset-y',
    'toast-swipe-movement-x',
    'toast-swipe-movement-y',
  ]);

  for (const file of fs.readdirSync(uiDir)) {
    if (!file.endsWith('.tsx')) continue;
    const source = fs.readFileSync(path.join(uiDir, file), 'utf8');

    // Variables the file defines for itself, either as a CSS declaration or as a key in a
    // style object. A component-scoped variable is not the theme's business.
    const local = new Set();
    for (const m of source.matchAll(/--([a-z0-9-]+)\s*:/g)) local.add(m[1]);
    for (const m of source.matchAll(/["']--([a-z0-9-]+)["']/g)) local.add(m[1]);

    for (const match of source.matchAll(/var\(--([a-z0-9-]+)\)/g)) {
      const name = match[1];
      if (provided.has(name) || local.has(name) || PRIMITIVE_VARS.has(name)) continue;
      note(`${file}: uses --${name}, which the theme item does not provide`);
    }
  }
}

// 4 -- nothing a component imports is left undeclared.
const AMBIENT = new Set(['react', 'react-dom', 'next']);
for (const file of fs.readdirSync(uiDir)) {
  if (!file.endsWith('.tsx')) continue;
  const name = file.replace(/\.tsx$/, '');
  const item = all.find((entry) => entry.name === name);
  if (!item) {
    note(`${name}: component has no registry item`);
    continue;
  }
  const declared = new Set([...(item.dependencies ?? []), ...(item.registryDependencies ?? [])]);
  const source = fs.readFileSync(path.join(uiDir, file), 'utf8');
  for (const match of source.matchAll(/from\s+["']([^"']+)["']/g)) {
    const specifier = match[1];
    if (specifier.startsWith('.')) continue;
    if (specifier.startsWith('@/components/ui/')) {
      const dep = specifier.replace('@/components/ui/', '');
      if (!declared.has(dep)) note(`${name}: imports ${specifier} but does not declare it`);
      continue;
    }
    if (specifier.startsWith('@/')) {
      note(`${name}: imports ${specifier}, which a consumer will not have`);
      continue;
    }
    const pkg = specifier.startsWith('@')
      ? specifier.split('/').slice(0, 2).join('/')
      : specifier.split('/')[0];
    if (AMBIENT.has(pkg)) continue;
    if (!declared.has(pkg)) note(`${name}: imports "${pkg}" but does not declare it`);
  }
}

if (problems.length) {
  console.error('Registry check failed:\n');
  for (const problem of problems) console.error('  - ' + problem);
  process.exit(1);
}

console.log(`Registry check passed: ${all.length} items, all dependencies and theme variables resolve.`);
