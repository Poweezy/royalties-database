import { test, expect } from '@playwright/test';

test('Remember Me functionality', async ({ page }) => {
  await page.goto('http://localhost:8000/royalties.html');

  // Wait for the login form to be visible
  await page.waitForSelector('#login-form');

  // Check the "Remember Me" checkbox
  await page.check('#remember-me');

  // Fill in the credentials
  await page.fill('#username', 'admin');
  await page.fill('#password', 'demo123');

  // Click the sign-in button
  await page.click('button[type="submit"]');

  // Wait for the dashboard to be visible, indicating a successful login
  await page.waitForSelector('#dashboard', { state: 'visible' });

  // Verify that the user is logged in
  const dashboard = await page.locator('#dashboard');
  await expect(dashboard).toBeVisible();

  // Get localStorage and sessionStorage after login
  const localStorageData = await page.evaluate(() => window.localStorage);
  const sessionStorageData = await page.evaluate(() => window.sessionStorage);

  // Expect 'user' to be in localStorage, not sessionStorage
  expect(localStorageData.user).not.toBeUndefined();
  expect(sessionStorageData.user).toBeUndefined();

  // Reload the page
  await page.reload();

  // Wait for the dashboard to be visible again, without logging in
  await page.waitForSelector('#dashboard', { state: 'visible' });
  const dashboardAfterReload = await page.locator('#dashboard');
  await expect(dashboardAfterReload).toBeVisible();

  // Now, let's test the opposite: not remembering the user
  // First, log out
  await page.click('a[href="#logout"]');
  await page.click('#confirm-logout-btn');

  // Wait for the login screen
  await page.waitForSelector('#login-section', { state: 'visible' });

  // Log in again, but this time without "Remember Me"
  await page.fill('#username', 'admin');
  await page.fill('#password', 'demo123');
  // Ensure the checkbox is unchecked
  await page.uncheck('#remember-me');
  await page.click('button[type="submit"]');

  // Wait for dashboard
  await page.waitForSelector('#dashboard', { state: 'visible' });

  // Get storage again
  const localStorageAfter = await page.evaluate(() => window.localStorage);
  const sessionStorageAfter = await page.evaluate(() => window.sessionStorage);

  // Expect 'user' to be in sessionStorage, not localStorage
  expect(sessionStorageAfter.user).not.toBeUndefined();
  expect(localStorageAfter.user).toBeUndefined();
});
