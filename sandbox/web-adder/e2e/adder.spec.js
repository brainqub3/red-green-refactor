import { test, expect } from '@playwright/test';

// Acceptance test (outer loop): drive the real page through the browser only.
test('user adds two numbers and sees the sum', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('First number').fill('4');
  await page.getByLabel('Second number').fill('5');
  await page.getByRole('button', { name: 'Add' }).click();

  await expect(page.getByTestId('result')).toHaveText('9');

  // Decisive-moment screenshot as positive evidence for the PR.
  await page.screenshot({ path: 'test-results/evidence/web-adder-success.png', fullPage: true });
});
