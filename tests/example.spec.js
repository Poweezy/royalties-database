import { test, expect } from '@playwright/test';

test('has title and login form', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).to_have_title(/Mining Royalties Manager/);

  // Expect the login form to be visible.
  await expect(page.locator('#login-form')).to_be_visible();
});
