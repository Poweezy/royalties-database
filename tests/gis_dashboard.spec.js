import { test, expect } from "@playwright/test";

test.describe("GIS Dashboard", () => {
  let page;
  const consoleErrors = [];

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    await page.goto("http://localhost:5173/royalties.html");

    // Wait for the login form to be visible
    await page.waitForSelector("#login-form");

    // Perform login
    await page.fill("#username", "admin");
    await page.fill("#password", "demo123");
    await page.click('button[type="submit"]');

    // Wait for the main app container to be visible
    await page.waitForSelector("#app-container", { state: "visible" });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test("should load the GIS dashboard without console errors", async () => {
    // Navigate to the GIS Dashboard
    await page.click('a[href="#gis-dashboard"]');

    // Wait for the map to be visible
    await page.waitForSelector("#map", { state: "visible" });

    // Assert that the map element is present
    const map = await page.locator("#map");
    await expect(map).toBeVisible();

    // Check for console errors
    expect(consoleErrors).toEqual([]);
  });

  test("should refresh the dashboard without console errors", async () => {
    // Navigate back to the main dashboard
    await page.click('a[href="#dashboard"]');

    // Wait for the dashboard to be visible
    await page.waitForSelector("#dashboard", { state: "visible" });

    // Click the refresh button
    await page.click("#refresh-dashboard");

    // Wait for a moment to allow for refresh logic to complete
    await page.waitForTimeout(1000);

    // Check for console errors
    expect(consoleErrors).toEqual([]);
  });
});
