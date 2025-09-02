import { test, expect } from "@playwright/test";

test.describe("GIS Dashboard", () => {
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
    await page.waitForSelector("#login-form", { state: "visible" });
    await page.fill("#username", "admin");
    await page.fill("#password", "demo123");
    await page.click('button[type="submit"]');
    await page.waitForSelector("#app-container", { state: "visible" });
  });

  test("should load the GIS dashboard without console errors", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    await page.click('a[href="#gis-dashboard"]');
    await page.waitForSelector("#map", { state: "visible" });
    const map = await page.locator("#map");
    await expect(map).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("should refresh the dashboard without console errors", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    await page.click('a[href="#dashboard"]');
    await page.waitForSelector("#dashboard", { state: "visible" });
    await page.click("#refresh-dashboard");
    await page.waitForTimeout(1000);
    expect(consoleErrors).toEqual([]);
  });
});
