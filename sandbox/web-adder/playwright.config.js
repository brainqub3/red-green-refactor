import { defineConfig, devices } from '@playwright/test';

const PORT = process.env.PORT ?? 3100;

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',                 // screenshots, videos, traces land here
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }], ['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    screenshot: 'on',                          // capture a screenshot for every test (success evidence too)
    video: 'on',                               // REQUIRED — safe-pr attaches a recording of the passing run
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run start',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
