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

/**
 * Write a file, retrying briefly when the OS says it is busy.
 *
 * `next dev` watches public/, and on Windows a watcher holding a handle makes a concurrent
 * open fail with EBUSY, EPERM or a bare UNKNOWN. The build is correct and the input has not
 * changed -- the write simply collided with a reader -- so failing the whole run means
 * `npm run build:ds` breaks at random for anyone who has the dev server up, which is
 * everyone working on the system. CI never sees it, which is what makes it worth handling
 * here rather than leaving as folklore.
 *
 * A genuine error (bad path, no permission, full disk) still throws: only the contention
 * codes are retried, and only for about a second.
 */
const BUSY = new Set(['EBUSY', 'EPERM', 'UNKNOWN', 'EACCES']);

function writeFileRetrying(file, contents) {
  const deadline = Date.now() + 1000;
  for (;;) {
    try {
      fs.writeFileSync(file, contents, 'utf8');
      return;
    } catch (error) {
      if (!BUSY.has(error.code) || Date.now() > deadline) throw error;
      // Synchronous: the build script is a straight line and has nothing else to do.
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 25);
    }
  }
}

const root = path.join(__dirname, '..');
const uiDir = path.join(root, 'src/components/ui');
const blocksDir = path.join(root, 'src/registry/blocks');
const registryDir = path.join(root, 'public/registry');
const tokensPath = path.join(root, 'tokens.json');

const SCHEMA = 'https://ui.shadcn.com/schema/registry-item.json';

/*
 * One tree per primitive.
 *
 * A consuming project picks its primitive by choosing a URL, which is the only way this
 * can work: the project already has a primitive installed, and handing it a second one is
 * how a codebase ends up with two focus-management models. `base` also serves the bare
 * /registry/ path, so anything already pointing there keeps working.
 *
 * A component that touches a primitive only appears under a variant once it has been
 * ported. Serving the Base UI file from a /radix/ path would be a lie the consumer
 * discovers at runtime, so the variant registry is deliberately partial until then.
 */
const VARIANTS = [
  { id: 'base', label: 'Base UI', dir: null },
  { id: 'radix', label: 'Radix', dir: path.join(root, 'src/variants/radix') },
  { id: 'aria', label: 'React Aria', dir: path.join(root, 'src/variants/aria') },
];

/**
 * Specifiers a consumer already has, so declaring them would make `shadcn add` install
 * packages the target project provides itself.
 */
const AMBIENT = new Set(['react', 'react-dom', 'next']);

const pkg = require('../package.json');
const VERSION = pkg.version;
const HOMEPAGE = 'https://stark-design-system.vercel.app';

/**
 * Comments, removed before imports are read.
 *
 * Dependencies are derived by scanning for `from "..."`, and prose is full of that shape --
 * a comment distinguishing `"failed"` from everything else yields a dependency on a package
 * named after the sentence. Nothing in the build fails: the phantom is written into the
 * published registry item and surfaces as an uninstallable component in someone else's
 * project. Stripping comments first is what stops a sentence becoming a dependency.
 *
 * String and template literals are preserved, so a URL containing `//` inside a quote does
 * not swallow the rest of the line.
 */
function stripComments(source) {
  const tokens = /("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g;
  return source.replace(tokens, (match, quoted) => quoted || ' ');
}

/** Every `from "..."` specifier in a source file, including type-only imports. */
function importsOf(source) {
  const found = new Set();
  const pattern = /from\s+["']([^"']+)["']/g;
  let match;
  const code = stripComments(source);
  while ((match = pattern.exec(code)) !== null) found.add(match[1]);
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

function buildVariant(variant) {
  if (!fs.existsSync(uiDir)) {
    console.warn('No components found in src/components/ui yet.');
    return;
  }
  const suffix = variant.id === 'base' ? '' : `/${variant.id}`;
  const floatingDir = path.join(registryDir, ...(variant.id === 'base' ? [] : [variant.id]));
  const pinnedDir = path.join(
    registryDir,
    `v${VERSION}`,
    ...(variant.id === 'base' ? [] : [variant.id])
  );
  fs.mkdirSync(floatingDir, { recursive: true });
  fs.mkdirSync(pinnedDir, { recursive: true });

  /*
   * Every item is written twice: to /registry/<name>.json, which always reflects the latest
   * deploy, and to /registry/v<version>/<name>.json, which never changes again.
   *
   * Without the second path, "pin a tag" is advice a consumer cannot act on. A git tag pins
   * this repository; it does not pin what `shadcn add` downloads into someone else's app,
   * because that comes from a URL serving whatever was deployed last. The versioned path is
   * the only thing here a project can depend on and expect to stay put.
   */

  /*
   * Registry dependencies are emitted as absolute URLs, per tier.
   *
   * A BARE name does not mean "the item next to this one". shadcn resolves `button` to the
   * built-in shadcn button, so a bare cross-reference silently installs someone else's
   * component instead of ours -- and `theme` resolves to a style theme that does not exist,
   * which fails the install outright. Neither is visible in the JSON: the file looks
   * correct and does the wrong thing.
   *
   * Each tier points at itself, so the pinned dashboard pulls the pinned button rather than
   * whatever is deployed today. That is the difference between pinning an item and pinning
   * a tree.
   */
  const tiers = [
    { dir: floatingDir, base: `${HOMEPAGE}/registry${suffix}` },
    { dir: pinnedDir, base: `${HOMEPAGE}/registry/v${VERSION}${suffix}` },
  ];

  const absolutise = (deps, base) => (deps ?? []).map((dep) => `${base}/${dep}.json`);

  const written = new Set();

  const emit = (file, item) => {
    written.add(file);
    for (const { dir, base } of tiers) {
      const resolved = {
        ...item,
        ...(item.registryDependencies
          ? { registryDependencies: absolutise(item.registryDependencies, base) }
          : {}),
        ...(item.items
          ? {
              items: item.items.map((entry) => ({
                ...entry,
                ...(entry.registryDependencies
                  ? { registryDependencies: absolutise(entry.registryDependencies, base) }
                  : {}),
              })),
            }
          : {}),
      };
      writeFileRetrying(path.join(dir, file), JSON.stringify(resolved, null, 2));
    }
  };

  const ported = (file) => variant.dir && fs.existsSync(path.join(variant.dir, file));
  const primitiveFree = (file) =>
    !fs.readFileSync(path.join(uiDir, file), 'utf8').includes('@base-ui/react');

  const components = fs
    .readdirSync(uiDir)
    .filter((file) => file.endsWith('.tsx'))
    // A variant ships a component when it has been ported, or when the canonical file
    // touches no primitive at all and is therefore already correct for every variant.
    .filter((file) => variant.id === 'base' || ported(file) || primitiveFree(file))
    // Wrapped, not passed bare: map supplies (value, index, array), and the index would
    // arrive as the directory argument.
    .map((file) => describe(file, ported(file) ? variant.dir : uiDir));

  /*
   * A component ships only when everything it references also ships in this variant.
   *
   * Touching no primitive is not sufficient. `pagination` is identical under every
   * primitive -- and it composes `button`, so a Radix tree without a ported button cannot
   * offer it either. Dependencies chain, so this runs to a fixed point: dropping `button`
   * drops `pagination`, and whatever composed `pagination` goes with it.
   */
  let shippable = components;
  for (;;) {
    const present = new Set(shippable.map((entry) => entry.name));
    present.add('theme');
    const next = shippable.filter((entry) =>
      [...entry.registryDependencies].every((dep) => present.has(dep))
    );
    if (next.length === shippable.length) break;
    for (const dropped of shippable.filter((entry) => !next.includes(entry))) {
      const missing = [...dropped.registryDependencies].filter((dep) => !present.has(dep));
      console.log(
        `  ${dropped.name}  skipped for ${variant.label}: composes ${missing.join(', ')}`
      );
    }
    shippable = next;
  }

  const problems = [];
  const index = [];

  emit('theme.json', themeItem());
  index.push({ name: 'theme', type: 'registry:theme' });

  for (const component of shippable) {
    const item = registryItem(component);
    emit(`${component.name}.json`, item);
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
  const available = new Set(index.map((entry) => entry.name));

  if (fs.existsSync(blocksDir)) {
    for (const file of fs.readdirSync(blocksDir).filter((f) => f.endsWith('.tsx'))) {
      const block = describe(file, blocksDir);
      // A block depends on components, not on the theme directly -- they carry it.
      block.registryDependencies.delete('theme');

      /*
       * A block ships only where its whole tree exists.
       *
       * Block sources are shared across variants -- they compose `@/components/ui/*` by
       * alias, so the same file works whichever tree got installed. But a variant that has
       * not ported `switch` yet cannot offer `settings`: the install would resolve four of
       * five components and leave the project with a screen that does not compile.
       */
      const missing = [...block.registryDependencies].filter((dep) => !available.has(dep));
      if (missing.length) {
        console.log(
          `  ${block.name}  [block]  skipped for ${variant.label}: needs ${missing.join(', ')}`
        );
        continue;
      }

      const item = registryItem(block, 'registry:block');
      emit(`${block.name}.json`, item);
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

  emit('registry.json', {
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    name: 'stark',
    homepage: HOMEPAGE,
    version: VERSION,
    items: index,
  });

  /*
   * Remove items this build did not write.
   *
   * A component that stops qualifying for a variant -- because a dependency was withdrawn,
   * or it was renamed -- leaves its old file behind, and the file stays fetchable at a URL
   * that is not listed in any index. Nothing here fails: a consumer who installed it once
   * and pinned the URL keeps resolving a component whose dependencies no longer exist.
   * Only .json is removed, so the nested variant and version directories survive.
   */
  for (const { dir } of tiers) {
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.json') || written.has(file)) continue;
      fs.unlinkSync(path.join(dir, file));
      console.log(`  ${path.basename(file, '.json')}  removed from ${variant.label}: no longer shipped`);
    }
  }

  console.log(
    `  ${variant.label.padEnd(11)} ${String(index.length).padStart(2)} items -> ` +
      `/registry${suffix}/ and /registry/v${VERSION}${suffix}/`
  );

  if (problems.length) {
    // Loud and non-zero: a registry that builds but ships a broken install is the exact
    // failure this script exists to prevent.
    console.error('\nRegistry problems:');
    for (const problem of problems) console.error('  - ' + problem);
    process.exit(1);
  }
}

function build() {
  for (const variant of VARIANTS) buildVariant(variant);
}

build();
