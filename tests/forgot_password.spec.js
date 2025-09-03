import { test, expect } from "@playwright/test";

test("Forgot Password functionality", async ({ page }) => {
  await page.goto("/royalties.html");

  // Wait for the login form to be visible
  await page.waitForSelector("#login-form");

  // Click the "Forgot Password?" link
  await page.click("#forgot-password-link");

  // Wait for the forgot password form to be visible
  await page.waitForSelector("#forgot-password-form", { state: "visible" });

  // Verify that the forgot password form is visible
  const forgotPasswordForm = await page.locator("#forgot-password-form");
  await expect(forgotPasswordForm).toBeVisible();

  // Fill in the email address
  await page.fill("#reset-email", "test@example.com");

  // Click the "Send Reset Link" button
  await page.click('#forgot-password-form button[type="submit"]');

  // Wait for the login form to be visible again
  await page.waitForSelector("#login-form", { state: "visible" });

  // Verify that the user is back on the login page
  const loginForm = await page.locator("#login-form");
  await expect(loginForm).toBeVisible();

  // Also, check for the success notification
  const notification = await page.locator(".notification-success");
  await expect(notification).toBeVisible();
  await expect(notification.locator("span").nth(1)).toHaveText(
    "If an account with that email exists, a password reset link has been sent.",
  );
});

test.afterEach(async ({ page }) => {
  await page.evaluate(() => {
    if (window.app && window.app.leaseManagement) {
      window.app.leaseManagement.stopMonitoring();
    }
  });
});
