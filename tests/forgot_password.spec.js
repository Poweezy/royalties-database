import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/royalties.html", { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
  });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
});

test("Forgot Password functionality", async ({ page }) => {
  await page.waitForSelector("#login-form", { state: "visible" });
  await page.click("#forgot-password-link");
  await page.waitForSelector("#forgot-password-form", { state: "visible" });
  const forgotPasswordForm = await page.locator("#forgot-password-form");
  await expect(forgotPasswordForm).toBeVisible();
  await page.fill("#reset-email", "test@example.com");
  await page.click('#forgot-password-form button[type="submit"]');
  await page.waitForSelector("#login-form", { state: "visible" });
  const loginForm = await page.locator("#login-form");
  await expect(loginForm).toBeVisible();
  const notification = await page.locator(".notification-success");
  await expect(notification).toBeVisible();
  await expect(notification.locator("span").nth(1)).toHaveText(
    "If an account with that email exists, a password reset link has been sent.",
  );
});
