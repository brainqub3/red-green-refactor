import { test, expect } from '@playwright/test';

test('user adds two numbers and sees the sum', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('First number').fill('4');
  await page.getByLabel('Second number').fill('5');
  await page.getByRole('button', { name: 'Add' }).click();

  await expect(page.getByTestId('result')).toHaveText('9');

  await page.screenshot({ path: 'test-results/evidence/web-adder-success.png', fullPage: true });
});
