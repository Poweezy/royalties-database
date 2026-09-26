import { test, expect } from "@playwright/test";

test.describe("Dashboard Navigation", () => {
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
    await page.fill("#password", "admin123");
    await page.click('button[type="submit"]');

    await page.waitForSelector("#app-container", { state: "visible" });
  });

  test.afterEach(async ({ page }) => {
    await page.evaluate(() => {
      // Updated for D1 fix: the property is leaseManager (was leaseManagement).
      window.app.leaseManager?.stopMonitoring?.();
    });
  });

  test('should not navigate when "Total Royalties" card is clicked', async ({ page }) => {
    const initialUrl = page.url();
    await page.click("#dashboard .metric-card:nth-child(1)");
    await page.waitForTimeout(500);
    expect(page.url()).toBe(initialUrl);
    const royaltyRecordsSection = await page.locator("#royalty-records");
    await expect(royaltyRecordsSection).not.toBeVisible();
  });

  test("should switch themes without console errors", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    await page.click("#dashboardCustomize");
    await page.click('button[data-theme="dark"]');
    await page.waitForTimeout(500);
    expect(consoleErrors).toEqual([]);
    await page.click("#dashboardCustomize");
    await page.click('button[data-theme="light"]');
    await page.waitForTimeout(500);
    expect(consoleErrors).toEqual([]);
  });

  test("should display the correct total royalties on the dashboard", async ({ page }) => {
    // The dashboard is data-driven: with an empty IndexedDB the honest total is E 0.00.
    const expectedTotal = "E 0.00";
    const totalRoyaltiesElement = await page.locator("#total-royalties");
    await expect(totalRoyaltiesElement).toHaveText(expectedTotal, {
      timeout: 10000,
    });
  });
});

