import { test, expect } from "@playwright/test";
import path from "path";
import XLSX from "xlsx";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe("Royalty Record Import/Export", () => {

  const testData = [
    { Entity: "Test Mine", Mineral: "Gold", Volume: 100, Tariff: 50, Date: "2025-08-01", Status: "Pending" },
    { Entity: "Test Quarry", Mineral: "Marble", Volume: 200, Tariff: 25, Date: "2025-08-02", Status: "Paid" },
  ];
  const importFilePath = path.join(__dirname, "fixtures", "import_data.xlsx");

  test.beforeAll(() => {
    // Create a fixture file for import
    const worksheet = XLSX.utils.json_to_sheet(testData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    if (!fs.existsSync(path.dirname(importFilePath))) {
      fs.mkdirSync(path.dirname(importFilePath), { recursive: true });
    }
    XLSX.writeFile(workbook, importFilePath);
  });

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
    await page.click('a[href="#royalty-records"]');
    await page.waitForSelector("#royalty-records-tbody", { state: "visible" });
  });

  test("should export royalty records to an Excel file", async ({ page }) => {
    const [ download ] = await Promise.all([
      page.waitForEvent('download'),
      page.click("#export-records-btn"),
    ]);

    const downloadPath = await download.path();
    expect(fs.existsSync(downloadPath)).toBeTruthy();

    const workbook = XLSX.readFile(downloadPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty("Entity");
    expect(data[0]).toHaveProperty("Mineral");
  });

  test("should import royalty records from an Excel file", async ({ page }) => {
    const initialRowCount = await page.locator("#royalty-records-tbody tr").count();

    await page.setInputFiles("#import-input", importFilePath);

    await page.waitForFunction((initialCount) => {
        return document.querySelectorAll("#royalty-records-tbody tr").length > initialCount;
    }, initialRowCount);

    const finalRowCount = await page.locator("#royalty-records-tbody tr").count();
    expect(finalRowCount).toBe(initialRowCount + testData.length);

    // Verify the imported data is in the table
    const firstImportedRecord = page.locator('tr:has-text("Test Mine")');
    await expect(firstImportedRecord).toBeVisible();
    await expect(firstImportedRecord).toContainText("Gold");
    await expect(firstImportedRecord).toContainText("Pending");
  });

  test.afterEach(async ({ page }) => {
    await page.evaluate(() => {
      if (window.app && window.app.leaseManagement) {
        window.app.leaseManagement.stopMonitoring();
      }
    });
  });

  test.afterAll(() => {
    // Clean up the fixture file
    if (fs.existsSync(importFilePath)) {
      fs.unlinkSync(importFilePath);
    }
  });
});
