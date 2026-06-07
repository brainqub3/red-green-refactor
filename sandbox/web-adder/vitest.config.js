import { defineConfig } from 'vitest/config';

// Unit tests live in test/ only; the Playwright e2e specs in e2e/ are run by Playwright,
// not Vitest, so keep them out of the unit include.
export default defineConfig({
  test: {
    include: ['test/**/*.test.js'],
    exclude: ['e2e/**', 'node_modules/**'],
  },
});
