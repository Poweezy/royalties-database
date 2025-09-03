import { test, expect } from "@playwright/test";

test.describe("Expense Tracking", () => {
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
    await page.click('a[href="#expense-tracking"]');
    await page.waitForSelector("#expense-tracking-table-body", { state: "visible" });
  });

  test.afterEach(async ({ page }) => {
    await page.evaluate(() => {
      if (window.app && window.app.leaseManagement) {
        window.app.leaseManagement.stopMonitoring();
      }
    });
  });

  test("should add a new expense", async ({ page }) => {
    await page.click("#add-expense-btn");
    await page.waitForSelector("#add-expense-modal", { state: "visible" });

    await page.fill("#expense-date", "2025-08-10");
    await page.selectOption("#expense-category", "Operational");
    await page.fill("#expense-description", "New Test Expense");
    await page.fill("#expense-amount", "123.45");
    await page.selectOption("#expense-entity", "Kwalini Quarry");

    await page.click("#save-expense-btn");

    await page.waitForSelector('tr:has-text("New Test Expense")');
    const newRow = page.locator('tr:has-text("New Test Expense")');
    await expect(newRow).toBeVisible();
    await expect(newRow).toContainText("Operational");
    await expect(newRow).toContainText("123.45");
  });

  test("should edit an existing expense", async ({ page }) => {
    const rowToEdit = page.locator('#expense-tracking-table-body tr:has-text("Fuel for machinery")');
    await rowToEdit.locator(".edit-btn").click();

    await page.waitForSelector("#add-expense-modal", { state: "visible" });
    await expect(page.locator("#expense-description")).toHaveValue("Fuel for machinery");

    await page.fill("#expense-description", "Updated Fuel Expense");
    await page.fill("#expense-amount", "5500.00");
    await page.click("#save-expense-btn");

    await expect(page.locator('tr:has-text("Updated Fuel Expense")')).toBeVisible();
    await expect(page.locator('tr:has-text("5500.00")')).toBeVisible();
  });

  test("should delete an expense", async ({ page }) => {
    page.on("dialog", dialog => dialog.accept());

    const rowToDelete = page.locator('#expense-tracking-table-body tr:has-text("Office supplies")');
    await rowToDelete.locator(".delete-btn").click();

    await expect(rowToDelete).not.toBeVisible();
  });

  test("should filter expenses by category", async ({ page }) => {
    const initialRowCount = await page.locator("#expense-tracking-table-body tr").count();

    await page.selectOption("#expense-filter-category", "JIB");
    await page.click("#apply-expense-filters");

    await page.waitForFunction((initialCount) => {
        return document.querySelectorAll("#expense-tracking-table-body tr").length < initialCount;
    }, initialRowCount);

    const finalRowCount = await page.locator("#expense-tracking-table-body tr").count();
    expect(finalRowCount).toBeLessThan(initialRowCount);

    const rows = await page.locator("#expense-tracking-table-body tr").all();
    for (const row of rows) {
        await expect(row).toContainText("JIB");
    }
  });

  test("should display the expense visualization chart", async ({ page }) => {
    const chart = page.locator("#expense-category-chart");
    await expect(chart).toBeVisible();

    // Check if the chart has been rendered (it will have a non-zero width and height)
    const boundingBox = await chart.boundingBox();
    expect(boundingBox.width).toBeGreaterThan(0);
    expect(boundingBox.height).toBeGreaterThan(0);
  });
});
