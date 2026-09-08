import fs from 'node:fs';
import path from 'node:path';

import type { StorybookConfig } from '@storybook/nextjs-vite';

/*
 * Which primitive this Storybook is showing.
 *
 * The variants are separate modules, and stories reach them through the
 * `@/components/ui/*` alias -- which Vite resolves at build time, not at render time. So a
 * toolbar switch is not possible: swapping the primitive means swapping module resolution,
 * which means a different build. One Storybook process per variant is the honest shape.
 *
 *   npm run storybook          Base UI   :6006
 *   npm run storybook:radix    Radix     :6007
 *   npm run storybook:aria     React Aria :6008
 */
const VARIANT = process.env.STARK_VARIANT ?? 'base';

// process.cwd(), not __dirname: this config is loaded as ESM, where __dirname does not
// exist -- Storybook fails with "main config ... does not seem to be valid ESM" rather than
// a missing-variable error, which points nowhere near the cause. Storybook dev is invoked
// from the project root, so cwd is that root.
const root = process.cwd();
const uiDir = path.join(root, 'src/components/ui');
const variantDir = VARIANT === 'base' ? null : path.join(root, 'src/variants', VARIANT);

/** A component with no primitive import is identical under every variant. */
function primitiveFree(name: string) {
  return !fs.readFileSync(path.join(uiDir, `${name}.tsx`), 'utf8').includes('@base-ui/react');
}

/*
 * A variant shows a story only where it has ported that component.
 *
 * Falling back to the canonical file for an unported one would put a Base UI component on
 * a page labelled Radix -- someone would review it, approve it, and be looking at the
 * wrong implementation. Better to show fewer stories than the wrong ones.
 */
function storiesForVariant() {
  if (!variantDir) return ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'];

  return fs
    .readdirSync(uiDir)
    .filter((file) => file.endsWith('.tsx'))
    .map((file) => file.replace(/\.tsx$/, ''))
    .filter((name) => fs.existsSync(path.join(variantDir, `${name}.tsx`)) || primitiveFree(name))
    .filter((name) => fs.existsSync(path.join(root, 'src/stories', `${name}.stories.tsx`)))
    .map((name) => `../src/stories/${name}.stories.tsx`);
}

const config: StorybookConfig = {
  stories: storiesForVariant(),

  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-mcp',
  ],

  framework: '@storybook/nextjs-vite',

  staticDirs: ['../public'],

  // Which primitive is on screen, in the browser tab -- three Storybooks open at once are
  // otherwise indistinguishable, and that is exactly when it matters.
  managerHead: (head) =>
    `${head}<title>Stark — ${
      { base: 'Base UI', radix: 'Radix', aria: 'React Aria' }[VARIANT] ?? VARIANT
    }</title>`,

  viteFinal: async (viteConfig) => {
    if (!variantDir) return viteConfig;

    viteConfig.resolve ??= {};
    const existing = viteConfig.resolve.alias;

    // Resolve variant-first, canonical second. Placed ahead of the project's own `@` alias
    // so the more specific pattern wins.
    const variantAlias = {
      find: /^@\/components\/ui\/(.+)$/,
      replacement: '$1',
      customResolver(name: string) {
        const ported = path.join(variantDir, `${name}.tsx`);
        return fs.existsSync(ported) ? ported : path.join(uiDir, `${name}.tsx`);
      },
    };

    viteConfig.resolve.alias = Array.isArray(existing)
      ? [variantAlias, ...existing]
      : [variantAlias, ...Object.entries(existing ?? {}).map(([find, replacement]) => ({
          find,
          replacement: replacement as string,
        }))];

    return viteConfig;
  },
};

export default config;
