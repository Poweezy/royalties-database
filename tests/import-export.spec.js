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
    await page.fill("#password", "admin123");
    await page.click('button[type="submit"]');
    await page.waitForSelector("#app-container", { state: "visible" });
    await page.click('a[href="#royalty-records"]');
    await page.waitForSelector("#royalty-records-tbody", { state: "visible" });

    // Seed royalty records through the app's own IndexedDB store so the
    // export test has data and the import count math is stable (fresh DBs
    // are honestly empty — see APPLICATION_REVIEW.md §8).
    await page.evaluate(async () => {
      const db = await new Promise((resolve, reject) => {
        const req = indexedDB.open("RoyaltiesDB");
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      const store = db
        .transaction("royalties", "readwrite")
        .objectStore("royalties");
      store.put({
        id: "SEED-R-1",
        entity: "Maloma Colliery",
        mineral: "Coal",
        volume: 1000,
        tariff: 12.5,
        royaltyPayment: 12500,
        paymentDate: "2025-07-15",
        status: "Paid",
      });
      store.put({
        id: "SEED-R-2",
        entity: "Mhlume Sugar Estates",
        mineral: "Sugar",
        volume: 2000,
        tariff: 8,
        royaltyPayment: 16000,
        paymentDate: "2025-07-20",
        status: "Pending",
      });
      await new Promise((resolve) => {
        store.transaction.oncomplete = () => {
          db.close();
          resolve();
        };
      });
      await window.app.royaltyRecords.renderRecords();
    });
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
      // Updated for D1 fix: the property is leaseManager (was leaseManagement).
      window.app?.leaseManager?.stopMonitoring?.();
    });
  });

  test.afterAll(() => {
    // Clean up the fixture file
    if (fs.existsSync(importFilePath)) {
      fs.unlinkSync(importFilePath);
    }
  });
});

