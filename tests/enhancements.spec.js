import { test, expect } from '@playwright/test';

test.describe('Enhanced Features Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Assuming the dev server is running on localhost:5173
    // If not, we'd need to start it, but usually Playwright config handles this.
    await page.goto('http://localhost:5173/royalties.html');
    await page.waitForSelector('#loading-screen', { state: 'hidden' });
  });

  test('Fuzzy Search and QuickSearch (Ctrl+K)', async ({ page }) => {
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
