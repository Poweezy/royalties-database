import { test, expect } from "@playwright/test";

test.describe("Add User Form", () => {
  test("should successfully add a new user and handle errors", async ({ page }) => {
    await page.goto("/test-enhanced-features.html");

    // Click the button to run the 'Add User' test
    await page.click("#test-add-user");

    // Wait for the test results to appear
    await page.waitForSelector("#results-content div");

    // Check for success messages
    const resultsContent = await page.locator("#results-content").innerText();
    expect(resultsContent).toContain("✓ User added successfully");
    expect(resultsContent).toContain("✓ Form correctly rejected weak password");
  });
});
