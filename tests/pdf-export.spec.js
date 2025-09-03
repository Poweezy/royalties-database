import { test, expect } from "@playwright/test";

test.describe("Dashboard PDF Export", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/royalties.html", { waitUntil: 'domcontentloaded' });
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

  test.afterEach(async ({ page }) => {
    await page.evaluate(() => {
      if (window.app && window.app.leaseManagement) {
        window.app.leaseManagement.stopMonitoring();
      }
    });
  });

  test("should export dashboard to a PDF file", async ({ page }) => {
    const [ download ] = await Promise.all([
      page.waitForEvent('download'),
      page.click("#export-pdf-btn"),
    ]);

    const fileName = download.suggestedFilename();
    expect(fileName).toBe("dashboard-export.pdf");
  });
});
