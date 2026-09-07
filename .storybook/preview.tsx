/*
 * The design system's stylesheet, loaded into every story.
 *
 * Without this line Storybook renders the components with no Tailwind and no tokens at
 * all: the class names are present in the markup and do nothing, so a Button shows as a
 * 21px browser-default box with no fill and no radius. Everything looked generic because
 * nothing was styled -- and the accessibility checks were measuring contrast against
 * colours that were never applied.
 *
 * It is the first import on purpose: the tokens have to exist before any story mounts.
 */
import '../src/app/globals.css'

import type { Preview } from '@storybook/nextjs-vite'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'error'
    }
  },
};

export default preview;