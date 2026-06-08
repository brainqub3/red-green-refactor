import { defineConfig } from 'vitest/config';

// Unit tests live in test/ only; the Playwright e2e specs in e2e/ are run by Playwright.
export default defineConfig({
  test: {
    include: ['test/**/*.test.js'],
    exclude: ['e2e/**', 'node_modules/**'],
  },
});
