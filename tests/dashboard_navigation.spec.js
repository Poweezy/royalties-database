import { test, expect } from "@playwright/test";

test.describe("Dashboard Navigation", () => {
  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
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

  test('should not navigate when "Total Royalties" card is clicked', async () => {
    // Get the current URL
    const initialUrl = page.url();

    // Click on the "Total Royalties" card
    await page.click("#dashboard .metric-card:nth-child(1)");

    // Wait for a moment to see if navigation happens
    await page.waitForTimeout(500);

    // Assert that the URL has not changed
    expect(page.url()).toBe(initialUrl);

    // Assert that the royalty records section is not visible
    const royaltyRecordsSection = await page.locator("#royalty-records");
    await expect(royaltyRecordsSection).not.toBeVisible();
  });

  test("should switch themes without console errors", async () => {
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Click the "Customize" dropdown
    await page.click("#dashboardCustomize");

    // Click the "Dark Theme" button
    await page.click('button[data-theme="dark"]');

    // Wait for a moment for the theme to apply
    await page.waitForTimeout(500);

    // Check for console errors
    expect(consoleErrors).toEqual([]);

    // Re-open the dropdown
    await page.click("#dashboardCustomize");

    // Click the "Light Theme" button
    await page.click('button[data-theme="light"]');

    // Wait for a moment for the theme to apply
    await page.waitForTimeout(500);

    // Check for console errors
    expect(consoleErrors).toEqual([]);
  });

  test("should display the correct total royalties on the dashboard", async () => {
    // The total from the seed data is 261150
    const expectedTotal = "E 261,150.00";

    // Get the text content of the total royalties element
    const totalRoyaltiesElement = await page.locator("#total-royalties");

    // Wait for the text to be updated, as it might take a moment after login
    await expect(totalRoyaltiesElement).toHaveText(expectedTotal, {
      timeout: 10000,
    });
  });
});
