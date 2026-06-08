import { defineConfig, devices } from '@playwright/test';

const PORT = process.env.PORT ?? 3100;

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }], ['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    screenshot: 'on',
    video: 'on',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run start',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
