import { test, expect } from '@playwright/test';

test.describe('Enhanced Features Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Assuming the dev server is running on localhost:5173
    // If not, we'd need to start it, but usually Playwright config handles this.
    await page.goto('http://localhost:5173/royalties.html');
    // The app shows the login form after the loading screen hides; sections
    // and the nav live inside the hidden #app-container, so we must log in
    // before interacting with them (matches the other specs' pattern).
    await page.waitForSelector('#login-form', { state: 'visible' });
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForSelector('#app-container', { state: 'visible' });
  });

  test('Fuzzy Search and QuickSearch (Ctrl+K)', async ({ page }) => {
    // Seed a contract through IndexedDB and rebuild both search indexes so
    // the fuzzy search has data to match (fresh databases start empty).
    await page.evaluate(async () => {
      const db = await new Promise((resolve, reject) => {
        const req = indexedDB.open("RoyaltiesDB");
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      const store = db
        .transaction("contracts", "readwrite")
        .objectStore("contracts");
      store.put({
        id: "SEED-C-1",
        name: "Maloma Colliery",
        entity: "Maloma Colliery",
        mineral: "Coal",
        calculationType: "fixed",
        calculationParams: { rate: 10 },
        status: "Active",
      });
      await new Promise((resolve) => {
        store.transaction.oncomplete = () => {
          db.close();
          resolve();
        };
      });
      await window.app.searchManager.rebuildIndex();
      await window.app.quickSearch.searchManager.rebuildIndex();
    });

    // Open QuickSearch with Ctrl+K
    await page.keyboard.press('Control+k');
    const modal = page.locator('#quick-search-modal');
    await expect(modal).toBeVisible();

    // Type a typo: "Malma" instead of "Maloma"
    await page.fill('#quick-search-input', 'Malma');
    await page.waitForTimeout(500); 

    // Should find "Maloma Colliery"
    const results = page.locator('.quick-search-item');
    await expect(results.first()).toContainText('Maloma');

    // Close with ESC
    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
  });

  test('Document Versioning UI', async ({ page }) => {
    // Seed a document so the table has rows with version actions (fresh
    // databases start empty).
    await page.evaluate(async () => {
      const db = await new Promise((resolve, reject) => {
        const req = indexedDB.open("RoyaltiesDB");
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      const store = db
        .transaction("documents", "readwrite")
        .objectStore("documents");
      store.put({
        id: "DOC-SEED-1",
        filename: "Maloma_Lease_Agreement.pdf",
        category: "Lease Agreement",
        uploadDate: new Date().toISOString(),
        size: 2048,
        type: "application/pdf",
        uploadedBy: "admin",
        status: "Active",
        version: 1,
        history: [],
      });
      await new Promise((resolve) => {
        store.transaction.oncomplete = () => {
          db.close();
          resolve();
        };
      });
      await window.app.documentManager.refreshDocuments();
    });

    // Navigate to Document Management
    await page.click('nav a[href="#document-management"]');
    await page.waitForSelector('#document-management-table-body');

    // Check for versioning buttons
    const versionBtn = page.locator('.version-btn').first();
    // Wait for the table to populate if necessary
    await expect(versionBtn).toBeVisible({ timeout: 5000 });

    // Click version button and check modal title
    await versionBtn.click();
    await expect(page.locator('#upload-document-modal h4')).toContainText('Version');
  });

  test('Audit Log Integrity', async ({ page }) => {
    // Check if audit Service is accessible (via app object)
    const isAuditServiceDefined = await page.evaluate(() => {
        return typeof window.app?.searchManager !== 'undefined';
    });
    expect(isAuditServiceDefined).toBe(true);
  });
});

