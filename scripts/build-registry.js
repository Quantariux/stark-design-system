/**
 * Build the shadcn-compatible registry from the components in src/components/ui.
 *
 * Dependencies are DERIVED from each file's imports, never hand-listed. The previous
 * version matched a fixed whitelist -- '@radix-ui/', 'clsx', 'tailwind-merge' -- against a
 * codebase that uses none of them, so every item shipped declaring only
 * 'class-variance-authority' while importing '@base-ui/react' and 'cn' as well. The
 * component installed into a consumer's project and failed to compile there, which is the
 * worst place for it to fail: in someone else's repo, with an error that does not point
 * back here.
 *
 * A hand-maintained list drifts the first time a component gains an import. Reading the
 * imports cannot drift, which is the whole point.
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const uiDir = path.join(root, 'src/components/ui');
const blocksDir = path.join(root, 'src/registry/blocks');
const registryDir = path.join(root, 'public/registry');
const tokensPath = path.join(root, 'tokens.json');

const SCHEMA = 'https://ui.shadcn.com/schema/registry-item.json';

/**
 * Specifiers a consumer already has, so declaring them would make `shadcn add` install
 * packages the target project provides itself.
 */
const AMBIENT = new Set(['react', 'react-dom', 'next']);

/** Every `from "..."` specifier in a source file, including type-only imports. */
function importsOf(source) {
  const found = new Set();
  const pattern = /from\s+["']([^"']+)["']/g;
  let match;
  while ((match = pattern.exec(source)) !== null) found.add(match[1]);
  return [...found];
}

/**
 * A specifier reduced to the package a consumer must install.
 *
 * '@base-ui/react/button' and '@base-ui/react/dialog' are one package, not two, so the
 * subpath is dropped -- keeping it would tell npm to install something that does not
 * exist. Scoped names keep two segments, unscoped keep one.
 */
function packageOf(specifier) {
  const parts = specifier.split('/');
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

/** Classify one specifier into what the registry item should say about it. */
function classify(specifier) {
  // Another component in this system: a registry dependency, resolved by name.
  if (specifier.startsWith('@/components/ui/')) {
    return { kind: 'registry', value: specifier.replace('@/components/ui/', '') };
  }
  // Anything else internal is a file the consumer will not have; flag rather than emit a
  // silently broken item.
  if (specifier.startsWith('@/') || specifier.startsWith('.')) {
    return { kind: 'internal', value: specifier };
  }
  const pkg = packageOf(specifier);
  if (AMBIENT.has(pkg)) return { kind: 'ambient', value: pkg };
  return { kind: 'npm', value: pkg };
}

/**
 * Read a source file and work out everything the registry needs to say about it.
 *
 * Blocks and components differ only in where they live and what `type` they carry, so the
 * dependency derivation is shared: a block that composes six components declares six
 * registry dependencies, worked out the same way a component declares one.
 */
function describe(file, dir = uiDir) {
  const name = file.replace(/\.tsx$/, '');
  const content = fs.readFileSync(path.join(dir, file), 'utf8');

  const dependencies = new Set();
  const registryDependencies = new Set();
  const unresolved = [];

  for (const specifier of importsOf(content)) {
    const { kind, value } = classify(specifier);
    if (kind === 'npm') dependencies.add(value);
    else if (kind === 'registry') registryDependencies.add(value);
    else if (kind === 'internal') unresolved.push(specifier);
  }

  // Every component renders with the system's CSS variables, so each one depends on the
  // theme. Without it a consumer installs markup referencing tokens their project has
  // never heard of, and it renders unstyled.
  registryDependencies.add('theme');

  return { name, content, dependencies, registryDependencies, unresolved };
}

function registryItem(component, type = 'registry:ui') {
  const target =
    type === 'registry:block'
      ? `blocks/${component.name}.tsx`
      : `components/ui/${component.name}.tsx`;
  return {
    $schema: SCHEMA,
    name: component.name,
    type,
    dependencies: [...component.dependencies].sort(),
    registryDependencies: [...component.registryDependencies].sort(),
    files: [{ path: target, content: component.content, type }],
  };
}

/**
 * The theme item: the tokens, as the CSS variables the components actually reference.
 *
 * Generated from tokens.json so it cannot disagree with what build-tokens.js writes into
 * globals.css. This is what makes an installed component look right rather than merely
 * compile.
 */
function themeItem() {
  const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
  const vars = (theme) => {
    const out = {};
    for (const [key, value] of Object.entries(tokens.colors?.[theme] ?? {})) out[key] = value;
    return out;
  };

  const light = vars('light');
  const dark = vars('dark');

  /*
   * Everything that is not colour goes on `light` only.
   *
   * cssVars.dark exists to override what changes between themes, and spacing, radii,
   * shadows, breakpoints, type and motion do not change. Emitting them twice would tell a
   * consumer these are theme-dependent, and invite someone to "fix" dark mode by editing
   * a spacing value.
   */
  for (const [key, value] of Object.entries(tokens.radii ?? {})) light[key] = value;
  for (const [key, value] of Object.entries(tokens.spacing ?? {})) light[`spacing-${key}`] = value;
  for (const [key, value] of Object.entries(tokens.shadows ?? {})) light[`shadow-${key}`] = value;
  for (const [key, value] of Object.entries(tokens.breakpoints ?? {})) light[`breakpoint-${key}`] = value;
  for (const [key, value] of Object.entries(tokens.typography?.size ?? {})) light[`text-${key}`] = value;
  for (const [key, value] of Object.entries(tokens.typography?.weight ?? {})) light[`font-weight-${key}`] = value;
  for (const [key, value] of Object.entries(tokens.typography?.leading ?? {})) light[`leading-${key}`] = value;
  for (const [key, value] of Object.entries(tokens.motion ?? {})) light[key] = value;

  return {
    $schema: SCHEMA,
    name: 'theme',
    type: 'registry:theme',
    dependencies: [],
    registryDependencies: [],
    files: [],
    cssVars: { light, dark },
  };
}

function build() {
  if (!fs.existsSync(uiDir)) {
    console.warn('No components found in src/components/ui yet.');
    return;
  }
  fs.mkdirSync(registryDir, { recursive: true });

  const components = fs
    .readdirSync(uiDir)
    .filter((file) => file.endsWith('.tsx'))
    // Wrapped, not passed bare: map supplies (value, index, array), and the index would
    // arrive as the directory argument.
    .map((file) => describe(file));

  const problems = [];
  const index = [];

  fs.writeFileSync(path.join(registryDir, 'theme.json'), JSON.stringify(themeItem(), null, 2));
  index.push({ name: 'theme', type: 'registry:theme' });

  for (const component of components) {
    const item = registryItem(component);
    fs.writeFileSync(
      path.join(registryDir, `${component.name}.json`),
      JSON.stringify(item, null, 2)
    );
    index.push({
      name: component.name,
      type: 'registry:ui',
      dependencies: item.dependencies,
      registryDependencies: item.registryDependencies,
    });
    if (component.unresolved.length) {
      problems.push(`${component.name}: unresolvable import ${component.unresolved.join(', ')}`);
    }
    console.log(
      `  ${component.name}  deps: ${item.dependencies.join(', ') || 'none'}` +
        `  registry: ${item.registryDependencies.join(', ')}`
    );
  }

  /*
   * Blocks: whole screens, assembled from the components above.
   *
   * These are the reason the registry exists. A component saves someone a few minutes; a
   * block saves them the decisions -- what goes where, what the empty state says, how the
   * form reports failure -- which is the part that otherwise gets re-decided, differently,
   * on every screen.
   */
  if (fs.existsSync(blocksDir)) {
    for (const file of fs.readdirSync(blocksDir).filter((f) => f.endsWith('.tsx'))) {
      const block = describe(file, blocksDir);
      // A block depends on components, not on the theme directly -- they carry it.
      block.registryDependencies.delete('theme');
      const item = registryItem(block, 'registry:block');
      fs.writeFileSync(
        path.join(registryDir, `${block.name}.json`),
        JSON.stringify(item, null, 2)
      );
      index.push({
        name: block.name,
        type: 'registry:block',
        dependencies: item.dependencies,
        registryDependencies: item.registryDependencies,
      });
      if (block.unresolved.length) {
        problems.push(`${block.name}: unresolvable import ${block.unresolved.join(', ')}`);
      }
      console.log(
        `  ${block.name}  [block]  uses: ${item.registryDependencies.join(', ') || 'none'}`
      );
    }
  }

  // Every registry dependency must be an item that exists, or `shadcn add` fails partway
  // through with half a component tree installed.
  const names = new Set(index.map((entry) => entry.name));
  for (const entry of index) {
    for (const dep of entry.registryDependencies ?? []) {
      if (!names.has(dep)) problems.push(`${entry.name}: registry dependency "${dep}" has no item`);
    }
  }

  fs.writeFileSync(
    path.join(registryDir, 'registry.json'),
    JSON.stringify(
      { $schema: 'https://ui.shadcn.com/schema/registry.json', name: 'stark', homepage: '', items: index },
      null,
      2
    )
  );

  console.log(`\nRegistry: ${index.length} items (components, blocks, theme) at /registry/registry.json`);

  if (problems.length) {
    // Loud and non-zero: a registry that builds but ships a broken install is the exact
    // failure this script exists to prevent.
    console.error('\nRegistry problems:');
    for (const problem of problems) console.error('  - ' + problem);
    process.exit(1);
  }
}

build();
