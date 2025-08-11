const { test, expect } = require('@playwright/test');

test('take screenshot of refactored card component', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForSelector('.metric-card');
  const card = await page.$('.metric-card');
  await card.screenshot({ path: 'tests/screenshots/refactored-card.png' });
});
